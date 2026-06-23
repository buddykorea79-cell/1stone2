import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "welfare_services_llm_final.json"

with open(DATA_PATH, encoding="utf-8") as f:
    _DATA = json.load(f)

SERVICES = _DATA["services"]
FACETS = _DATA["facets"]

_REGION_MAP_PATH = Path(__file__).resolve().parent.parent / "region_map.json"
with open(_REGION_MAP_PATH, encoding="utf-8") as f:
    REGION_MAP = json.load(f)  # {시도: [시군구...]}

# 단층제 시도(세종처럼 하위 시군구가 없는 경우): 시군구=시도 자체로 보강
SINGLE_TIER_SIDO = set()
for _sido in FACETS.get("region_sido", []):
    if not REGION_MAP.get(_sido):
        REGION_MAP[_sido] = [_sido]
        SINGLE_TIER_SIDO.add(_sido)


def _empty(v):
    return v is None or v == "" or v == [] or v == {}


def merge_criteria(form: dict, parsed: dict) -> dict:
    """폼 값이 우선, 비어있는 필드만 LLM 파싱 결과로 보완"""
    merged = dict(parsed or {})
    for k, v in (form or {}).items():
        if not _empty(v):
            merged[k] = v
    return merged


def _age_match(service, user_age):
    if user_age is None:
        return True
    min_age = service.get("min_age")
    max_age = service.get("max_age")
    if min_age is not None and user_age < min_age:
        return False
    if max_age is not None and user_age > max_age:
        return False
    return True


def _gender_match(service, user_gender):
    sg = service.get("gender")
    if sg is None or not user_gender:
        return True
    return sg == user_gender


def _income_match(service, user_income_pct):
    cap = service.get("income_max_pct")
    if cap is None or user_income_pct is None:
        return True
    return user_income_pct <= cap


def _list_overlap_match(service_field, user_values):
    if not user_values:
        return True
    svc_values = service_field or []
    if not svc_values:
        return True  # 조건무관
    return bool(set(svc_values) & set(user_values))


def _region_match(service, user_sido, user_sgg):
    if service.get("is_nationwide"):
        return True
    s_sido = service.get("region_sido")
    s_sgg = service.get("region_sgg")
    if user_sido and s_sido and s_sido != user_sido:
        return False
    if user_sgg and s_sgg and s_sgg != user_sgg:
        return False
    return True


def filter_services(criteria: dict):
    user_age = criteria.get("age")
    user_gender = criteria.get("gender")
    user_income_pct = criteria.get("income_max_pct")
    user_household_types = criteria.get("household_types") or []
    user_life_cycles = criteria.get("life_cycles") or []
    user_interest_themes = criteria.get("interest_themes") or []
    user_sido = criteria.get("region_sido")
    user_sgg = criteria.get("region_sgg")

    results = []
    for s in SERVICES:
        if not _age_match(s, user_age):
            continue
        if not _gender_match(s, user_gender):
            continue
        if not _income_match(s, user_income_pct):
            continue
        if not _list_overlap_match(s.get("household_types"), user_household_types):
            continue
        if not _region_match(s, user_sido, user_sgg):
            continue

        score = 0
        if user_life_cycles and _list_overlap_match(s.get("life_cycles"), user_life_cycles):
            score += 1
        if user_interest_themes and _list_overlap_match(s.get("interest_themes"), user_interest_themes):
            score += 1
        results.append((score, s))

    results.sort(key=lambda x: -x[0])
    return [s for _, s in results]
