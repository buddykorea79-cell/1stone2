import json
import os
from openai import OpenAI

_client = None


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return _client


JUDGE_SYSTEM = """너는 복지서비스 '자격 심사관'이다. 주어진 사용자 프로필과 각 복지서비스의 자격요건 원문을 비교해, 사용자가 그 혜택을 실제로 받을 수 있는지 판정한다.

[판정값 — 3분류]
- "적격": 누구나 신청 가능한 일반 서비스이거나, 사용자가 요건을 명백히 충족한다.
- "부적격": 사용자가 '명백히' 대상이 아니다. 아래 중 하나에 해당할 때만 부적격이다.
    · 신분·자격 카테고리 불일치: 서비스가 특정 신분(국가유공자·보훈·참전·독립유공자, 등록장애인, 농어민, 노숙인, 탈북민, 청소년/아동 등)만 대상인데 사용자가 그 신분이 아님이 분명함.
    · 연령이 명시 범위 밖. / 거주지역 불일치. / 제외대상(exclusion)에 사용자가 해당.
    · 사망자·특정 질환자 등 사용자가 명백히 해당하지 않는 대상.
- "불명확": 사용자가 '아직 입력하지 않은 정보'(소득·재산·주택소유·취업상태 등)에 자격이 달려 있어, 그 정보만 확인되면 적격일 수 있다. 이 경우 needed_info에 어떤 정보가 필요한지 적는다.
    · 예: 소득기준(기준중위소득 N% 이하)이 있는데 사용자가 소득을 안 밝힘 → 불명확, needed_info=["소득수준"].
    · 예: 무주택 세대주 요건인데 주택소유 정보 없음 → 불명확, needed_info=["주택소유여부"].

[핵심 원칙]
- 신분/카테고리가 다른 것(유공자·장애인·농어민 등)은 정보를 더 줘도 바뀌지 않으므로 "부적격"이다. 절대 불명확으로 두지 마라.
- 반대로 소득·재산·주택·취업처럼 '입력하면 달라질 수 있는' 조건 때문에 막히는 것은 "부적격"이 아니라 "불명확"이다.
- needed_info는 불명확일 때만 채우고, 적격·부적격이면 빈 배열 []로 둔다.
- needed_info 값은 다음 중에서만 고른다: "나이","성별","소득수준","가구유형","거주지역","주택소유여부","취업상태".

각 후보에 대해 verdict, 한 줄 reason(한국어), needed_info를 제시한다."""

SCHEMA = {
    "name": "eligibility_verdicts",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "verdicts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "index": {"type": "integer"},
                        "verdict": {"type": "string", "enum": ["적격", "부적격", "불명확"]},
                        "reason": {"type": "string"},
                        "needed_info": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": ["나이", "성별", "소득수준", "가구유형", "거주지역", "주택소유여부", "취업상태"],
                            },
                        },
                    },
                    "required": ["index", "verdict", "reason", "needed_info"],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["verdicts"],
        "additionalProperties": False,
    },
}


def _clip(s, n):
    if not s:
        return ""
    return " ".join(str(s).split())[:n]


def build_profile_text(free_text, criteria):
    lines = []
    if free_text:
        lines.append(f"원문: {free_text}")
    if criteria.get("income_man") is not None:
        lines.append(f"월소득: {criteria['income_man']}만원")
    if criteria.get("household_size") is not None:
        lines.append(f"세대원수: {criteria['household_size']}명")
    label = {
        "age": "나이", "gender": "성별", "income_max_pct": "기준중위소득대비(%)",
        "household_types": "가구유형", "life_cycles": "생애주기",
        "interest_themes": "관심주제", "region_sido": "거주시도", "region_sgg": "거주시군구",
    }
    for k, lab in label.items():
        v = criteria.get(k)
        if v not in (None, "", [], {}):
            lines.append(f"{lab}: {v}")
    return "\n".join(lines) if lines else "(프로필 정보 없음)"


def verify_candidates(free_text, criteria, candidates):
    """candidates 각각에 verdict/reason 부여한 dict 리스트 반환."""
    if not candidates:
        return []

    profile = build_profile_text(free_text, criteria)

    lines = []
    for i, s in enumerate(candidates):
        lines.append(
            f"[{i}] 서비스명: {s.get('serv_nm','')}\n"
            f"    대상: {_clip(s.get('target_detail'), 400)}\n"
            f"    선정기준: {_clip(s.get('select_criteria'), 400)}\n"
            f"    제외대상: {_clip(' / '.join(s.get('exclusion_conditions') or []), 200)}\n"
            f"    연령(min/max): {s.get('min_age')}/{s.get('max_age')}  소득상한%: {s.get('income_max_pct')}  지역: {s.get('region_sido')} {s.get('region_sgg')}"
        )
    user_msg = (
        f"[사용자 프로필]\n{profile}\n\n"
        f"[후보 서비스 {len(candidates)}건]\n" + "\n\n".join(lines) +
        "\n\n각 후보의 index에 대해 verdict와 reason을 판정하라."
    )

    client = get_client()
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": JUDGE_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        response_format={"type": "json_schema", "json_schema": SCHEMA},
        temperature=0,
    )
    data = json.loads(resp.choices[0].message.content)

    verdict_map = {v["index"]: v for v in data.get("verdicts", [])}
    out = []
    for i, s in enumerate(candidates):
        v = verdict_map.get(i, {"verdict": "불명확", "reason": "판정 누락", "needed_info": []})
        item = dict(s)
        item["_verdict"] = v["verdict"]
        item["_reason"] = v["reason"]
        item["_needed_info"] = v.get("needed_info", [])
        out.append(item)
    return out
