import json
import os

from openai import OpenAI

from app.data_store import FACETS

_client = None


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    return _client


SCHEMA = {
    "name": "welfare_criteria",
    "schema": {
        "type": "object",
        "properties": {
            "age": {"type": ["integer", "null"], "description": "사용자 나이"},
            "gender": {"type": ["string", "null"], "enum": ["M", "F", None]},
            "income_max_pct": {
                "type": ["integer", "null"],
                "description": "기준 중위소득 대비 사용자 소득 비율(%). 예: 기초수급자=30 이하, 모르면 null",
            },
            "household_types": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["다문화", "다자녀", "보훈", "장애인", "저소득", "조손", "탈북민", "한부모"],
                },
            },
            "life_cycles": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["노년", "아동", "영유아", "임신", "중장년", "청년", "청소년", "출산"],
                },
            },
            "interest_themes": {
                "type": "array",
                "items": {"type": "string"},
            },
            "region_sido": {
                "type": ["string", "null"],
                "enum": FACETS.get("region_sido", []) + [None],
            },
            "region_sgg": {"type": ["string", "null"]},
        },
        "required": [
            "age", "gender", "income_max_pct", "household_types",
            "life_cycles", "interest_themes", "region_sido", "region_sgg",
        ],
        "additionalProperties": False,
    },
    "strict": True,
}

SYSTEM_PROMPT = """너는 복지서비스 매칭을 위해 사용자 문장에서 '명시적으로 진술된' 조건만 추출하는 추출기다.

[최우선 원칙: 추론 금지]
- 문장에 직접 등장한 단어/표현만 근거로 삼는다. 추측·연상·일반화는 절대 금지.
- 근거가 분명하지 않으면 반드시 null(스칼라) 또는 [](배열)로 둔다.
- "있을 법하다"는 추가하지 않는다. 확실하지 않으면 비운다.

[필드별 규칙]
- age: 문장에 나이가 숫자로 있으면 그 값. 없으면 null. ('노인','청년' 같은 단어를 나이 숫자로 바꾸지 마라)
- gender: '여성/여자/엄마/모/딸'→"F", '남성/남자/아빠/부/아들'→"M". 단서 없으면 null.
- income_max_pct: '기초생활수급자/기초수급'→30, '차상위'→50, '중위소득 N%'→N. 그 외(예: '백수','무직','돈이 없다')는 income 단서로 쓰지 말고 null.
- household_types: 아래 '직접 트리거'가 문장에 실제로 나올 때만 해당 값을 넣는다. 그 외에는 절대 넣지 마라.
    · "다문화"   ← 다문화/국제결혼/외국인 배우자
    · "다자녀"   ← 다자녀/자녀가 셋(3명) 이상/아이가 많다
    · "보훈"     ← 국가유공자/보훈/참전/독립유공
    · "장애인"   ← 장애/장애인/장애등급
    · "저소득"   ← 저소득/기초수급/차상위/형편이 어렵다(빈곤 명시)
    · "조손"     ← 조손/할머니(할아버지)가 손주를 키운다
    · "탈북민"   ← 탈북/북한이탈주민
    · "한부모"   ← 한부모/혼자 아이를 키운다/미혼모(부)/이혼 후 양육
  ※ '독거','혼자 산다','백수','무직','노인' 등은 위 어느 것에도 해당하지 않으므로 household_types에 아무것도 넣지 마라.
- life_cycles: 직접 표현만. '영유아/아기'→영유아, '아동'→아동, '청소년'→청소년, '청년'→청년, '중장년'→중장년, '노인/어르신/고령'→노년, '임신/임산부'→임신, '출산'→출산. 나이 숫자만으로 생애주기를 추정하지 마라.
- interest_themes: 문장에 관심사가 명시될 때만(예: '일자리','주거','건강','교육'). 추측 금지.
- region_sido / region_sgg: 문장에 지역이 나오면 정확한 행정구역 정식명칭으로(예: '세종'→"세종특별자치시", '서울'→"서울특별시"). 시군구는 'OO구/OO시/OO군' 형태. 없으면 null.

[예시]
입력: "52세 독거노인이고 세종시에 살고 백수다"
출력: {"age":52,"gender":null,"income_max_pct":null,"household_types":[],"life_cycles":["노년"],"interest_themes":[],"region_sido":"세종특별자치시","region_sgg":null}
(주의: '독거','백수'를 저소득·조손·장애인 등으로 절대 변환하지 않음)

입력: "한부모 가정 엄마인데 기초수급자입니다. 서울 강남구 살아요"
출력: {"age":null,"gender":"F","income_max_pct":30,"household_types":["한부모","저소득"],"life_cycles":[],"interest_themes":[],"region_sido":"서울특별시","region_sgg":"강남구"}
"""


def parse_free_text(text: str) -> dict:
    if not text or not text.strip():
        return {}

    client = get_client()
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        response_format={"type": "json_schema", "json_schema": SCHEMA},
        temperature=0,
    )
    return json.loads(resp.choices[0].message.content)
