// ============================================================
// 자연어 입력 처리 (간단 키워드 분석)
// ⚠️ 실제 ChatGPT API 를 호출하지 않는다. 키워드 매칭만 수행.
// ============================================================

import type { SearchCondition } from '../types';

// 텍스트에서 나이를 추출 ("70세", "65세", "어르신", "노인", "청년")
export function extractAgeFromText(text: string): number | null {
  const m = text.match(/(\d{1,3})\s*세/);
  if (m) return parseInt(m[1], 10);
  if (/어르신|노인|고령/.test(text)) return 70;
  if (/청년/.test(text)) return 24;
  return null;
}

// 텍스트에서 지역을 추출
export function extractRegionFromText(text: string): string {
  const regions = [
    '서울',
    '경기',
    '인천',
    '부산',
    '대구',
    '대전',
    '광주',
    '울산',
    '전북',
    '전남',
    '익산',
    '전주',
    '수원',
    '성남',
    '해운대',
    '유성',
  ];
  for (const r of regions) {
    if (text.includes(r)) return r;
  }
  return '';
}

// 텍스트에서 필요 항목(needs)을 추출
export function extractNeedsFromText(text: string): string[] {
  const needs = new Set<string>();
  if (/생활비|생계|돈이 부족|먹고살|생활이 어렵/.test(text)) needs.add('생계');
  if (/월세|집세|주거|임대|전세|이사/.test(text)) needs.add('주거');
  if (/돌봄|혼자 지내기 어렵|간병|보살핌/.test(text)) needs.add('돌봄');
  if (/노인|어르신|고령/.test(text)) needs.add('노인');
  if (/장애/.test(text)) needs.add('장애인');
  if (/청년/.test(text)) needs.add('청년');
  if (/아동|아이|자녀|육아|양육/.test(text)) needs.add('아동');
  if (/한부모|혼자 키우/.test(text)) needs.add('한부모');
  if (/실직|일자리|취업|구직|직장/.test(text)) needs.add('일자리');
  if (/긴급|갑자기|위기|급하게|화재|사고/.test(text)) needs.add('긴급지원');
  return Array.from(needs);
}

// 가구유형/세대원 수 힌트 추출
function extractHouseholdHints(text: string): {
  householdType: string;
  householdSize: number | null;
} {
  let householdType = '';
  let householdSize: number | null = null;
  if (/혼자|1인가구|독거|홀로/.test(text)) {
    householdType = '1인가구';
    householdSize = 1;
  }
  if (/부부|둘이|배우자/.test(text)) {
    householdType = '부부';
    householdSize = 2;
  }
  if (/한부모|혼자 키우/.test(text)) {
    householdType = '한부모';
  }
  if (/청년/.test(text)) {
    if (!householdType) householdType = '청년';
  }
  return { householdType, householdSize };
}

// 소득 힌트 추출
function extractIncomeHint(text: string): string {
  if (/소득이 낮|생활이 어렵|돈이 부족|저소득|형편이 어렵/.test(text))
    return '낮음';
  if (/소득이 높|여유/.test(text)) return '높음';
  return '';
}

// 자연어 질의를 SearchCondition 으로 변환
export function parseNaturalLanguageQuery(text: string): SearchCondition {
  const { householdType, householdSize } = extractHouseholdHints(text);
  return {
    age: extractAgeFromText(text),
    region: extractRegionFromText(text),
    householdSize,
    householdType,
    incomeHint: extractIncomeHint(text),
    incomeLevel: null,
    needs: extractNeedsFromText(text),
    rawQuery: text,
  };
}

// 조건 선택값(form)과 자연어 분석값(nl)을 병합한다.
// 규칙: 조건 선택값이 있으면 우선한다.
export function mergeSearchConditions(
  form: Partial<SearchCondition>,
  nl: SearchCondition
): SearchCondition {
  const pick = <T>(formVal: T, nlVal: T, empty: T): T =>
    formVal !== undefined && formVal !== null && formVal !== empty
      ? formVal
      : nlVal;

  // needs 는 합집합 (form 우선이지만 둘 다 활용)
  const needs = new Set<string>([...(form.needs ?? []), ...nl.needs]);

  return {
    age: form.age != null ? form.age : nl.age,
    region: pick(form.region ?? '', nl.region, ''),
    householdSize:
      form.householdSize != null ? form.householdSize : nl.householdSize,
    householdType: pick(form.householdType ?? '', nl.householdType, ''),
    incomeHint: pick(form.incomeHint ?? '', nl.incomeHint, ''),
    incomeLevel: form.incomeLevel ?? nl.incomeLevel,
    needs: Array.from(needs),
    rawQuery: nl.rawQuery,
  };
}
