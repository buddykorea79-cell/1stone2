from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, List

from app.data_store import FACETS, REGION_MAP, SINGLE_TIER_SIDO, filter_services, merge_criteria
from app.llm_parse import parse_free_text
from app import vector_store
from app.embed import embed_query
from app.verify import verify_candidates
from app.income import man_to_pct

VERIFY_K = 30  # 자격심사에 넣을 상위 후보 수

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


class SearchRequest(BaseModel):
    free_text: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    income_man: Optional[float] = None       # 월소득(만원)
    household_size: Optional[int] = None      # 세대원수
    income_max_pct: Optional[int] = None      # (내부 계산용)
    household_types: Optional[List[str]] = None
    life_cycles: Optional[List[str]] = None
    interest_themes: Optional[List[str]] = None
    region_sido: Optional[str] = None
    region_sgg: Optional[str] = None
    min_score: Optional[float] = None
    precision_mode: bool = True  # True면 자격심사 통과(적격)만 노출


@app.get("/", response_class=HTMLResponse)
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/facets")
def get_facets():
    return {
        "region_sido": FACETS.get("region_sido", []),
        "life_cycles": FACETS.get("life_cycles", []),
        "household_types": FACETS.get("household_types", []),
        "interest_themes": FACETS.get("interest_themes", []),
    }


@app.get("/api/regions")
def get_regions():
    """시도 -> 하위 시군구 목록 (연동 셀렉트박스용)."""
    return REGION_MAP


@app.post("/api/search")
def search(req: SearchRequest):
    form = {
        "age": req.age,
        "gender": req.gender,
        "income_max_pct": req.income_max_pct,
        "household_types": req.household_types,
        "life_cycles": req.life_cycles,
        "interest_themes": req.interest_themes,
        "region_sido": req.region_sido,
        "region_sgg": req.region_sgg,
    }

    # 월소득(만원)+세대원수 -> 기준중위소득% 환산 (폼 입력 우선)
    if req.income_man is not None:
        size = req.household_size if req.household_size and req.household_size > 0 else 1
        form["income_max_pct"] = man_to_pct(req.income_man, size)

    parsed = {}
    parse_error = None
    if req.free_text:
        try:
            parsed = parse_free_text(req.free_text)
        except Exception as e:
            parse_error = str(e)

    merged = merge_criteria(form, parsed)
    # 환산 입력값도 함께 보관(심사·디버그용)
    if req.income_man is not None:
        merged["income_man"] = req.income_man
        merged["household_size"] = req.household_size

    # 월소득 미입력 시 0원으로 간주 (소득상 가장 유리하게)
    if merged.get("income_max_pct") is None:
        merged["income_max_pct"] = 0
        merged["income_man"] = 0

    # 단층제 시도(세종 등): 시도만 있고 시군구 없으면 시군구=시도 자동 설정
    if merged.get("region_sido") and not merged.get("region_sgg"):
        if merged["region_sido"] in SINGLE_TIER_SIDO:
            merged["region_sgg"] = merged["region_sido"]

    results = filter_services(merged)

    # --- 벡터 재정렬 (의미 기반) ---
    reranked = False
    rerank_error = None
    query_text = (req.free_text or "").strip()
    if not query_text:
        query_text = _synthesize_query(merged)

    if vector_store.is_ready() and query_text:
        try:
            qvec = embed_query(query_text)
            results = vector_store.rerank(results, qvec, min_score=req.min_score)
            reranked = True
        except Exception as e:
            rerank_error = str(e)

    # --- LLM 자격심사 게이트 (정확도 우선) + 불명확 분리 ---
    filtered_count = len(results)
    verdict_counts = {"적격": 0, "부적격": 0, "불명확": 0}
    verify_error = None
    eligible = results[:VERIFY_K]
    uncertain = []
    suggested_fields = []
    try:
        top = results[:VERIFY_K]
        judged_top = verify_candidates(req.free_text, merged, top)
        for c in judged_top:
            verdict_counts[c.get("_verdict", "불명확")] = verdict_counts.get(c.get("_verdict", "불명확"), 0) + 1
        eligible = [c for c in judged_top if c.get("_verdict") == "적격"]
        uncertain = [c for c in judged_top if c.get("_verdict") == "불명확"]
        suggested_fields = _aggregate_needed_info(uncertain, merged)
    except Exception as e:
        verify_error = str(e)

    return {
        "merged_criteria": merged,
        "parsed_from_text": parsed,
        "parse_error": parse_error,
        "reranked": reranked,
        "rerank_error": rerank_error,
        "query_text": query_text,
        "precision_mode": req.precision_mode,
        "filtered_count": filtered_count,
        "verdict_counts": verdict_counts,
        "verify_error": verify_error,
        "count": len(eligible),
        "results": eligible[:50],
        "uncertain_count": len(uncertain),
        "uncertain_results": uncertain[:20],
        "suggested_fields": suggested_fields,
    }


# needed_info 라벨 -> 사용자가 채울 폼 필드(merged 키). None이면 폼에 없는 항목(자연어로 안내).
_FIELD_MAP = {
    "나이": "age",
    "성별": "gender",
    "소득수준": "income_max_pct",
    "가구유형": "household_types",
    "거주지역": "region_sido",
    "주택소유여부": None,
    "취업상태": None,
}


def _aggregate_needed_info(uncertain, merged):
    """불명확 결과들이 요구한 정보 중, 사용자가 '아직 입력하지 않은' 항목만 집계."""
    counts = {}
    for c in uncertain:
        for label in c.get("_needed_info", []):
            key = _FIELD_MAP.get(label, "MISSING")
            already = key and key != "MISSING" and merged.get(key) not in (None, "", [], {})
            if already:
                continue  # 이미 입력함
            counts[label] = counts.get(label, 0) + 1
    return [
        {"label": k, "form_field": _FIELD_MAP.get(k), "count": v}
        for k, v in sorted(counts.items(), key=lambda x: -x[1])
    ]


def _synthesize_query(c: dict) -> str:
    """폼만 입력된 경우, 선택값으로 의미 검색용 질의문 합성."""
    bits = []
    if c.get("age") is not None:
        bits.append(f"{c['age']}세")
    if c.get("gender") == "F":
        bits.append("여성")
    elif c.get("gender") == "M":
        bits.append("남성")
    for key in ("household_types", "life_cycles", "interest_themes"):
        if c.get(key):
            bits.extend(c[key])
    if c.get("region_sido"):
        bits.append(c["region_sido"])
    return " ".join(bits)
