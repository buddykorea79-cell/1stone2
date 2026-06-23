// ============================================================
// 조건.json 기반 소득구간 판정 로직
// 세대원 수별 기준소득과 소득구간(levels)을 다룬다.
// ============================================================

import rawConditions from '../data/조건.json';
import type {
  ConditionLevel,
  ConditionRule,
  IncomeLevel,
  Resident,
} from '../types';

// 프로토타입용 세대원 수별 배수.
// ⚠️ 주의: 이 multiplier 는 실제 정책 기준이 아니라 프로토타입 mock 기준이다.
const HOUSEHOLD_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 1.65,
  3: 2.15,
  4: 2.65,
  5: 3.1,
};

// 조건.json 원본을 ConditionRule[] 로 로드
export function loadConditionRules(): ConditionRule[] {
  return (rawConditions as ConditionRule[]).map((r) => ({ ...r }));
}

// 1인 세대 규칙을 기준으로 특정 세대원 수의 규칙을 생성한다.
function buildRuleForSize(
  baseRule: ConditionRule,
  size: number
): ConditionRule {
  const multiplier = HOUSEHOLD_MULTIPLIER[size] ?? 1.0;
  // generatedBaseIncome100 = 1인 baseIncome100 * multiplier
  const generatedBase = Math.round(baseRule.baseIncome100 * multiplier);

  const levels: ConditionLevel[] = [];
  let prevMax = -1; // 이전 level 의 maxIncome (minIncome 계산용)

  baseRule.levels.forEach((lvl) => {
    if (lvl.thresholdPercent == null) {
      // LN: 마지막 구간 초과
      levels.push({
        ...lvl,
        minIncome: prevMax + 1,
        maxIncome: null,
      });
      return;
    }
    // maxIncome = generatedBase * thresholdPercent / 100
    const maxIncome = Math.round((generatedBase * lvl.thresholdPercent) / 100);
    const minIncome = prevMax + 1;
    levels.push({ ...lvl, minIncome, maxIncome });
    prevMax = maxIncome;
  });

  return {
    householdSize: size,
    baseIncome100: generatedBase,
    levels,
    generated: true,
  };
}

// 조건.json 에 없는 세대원 수(2~5인) 규칙을 자동 생성한다.
export function generateHouseholdRulesIfMissing(
  rules: ConditionRule[]
): ConditionRule[] {
  const base = rules.find((r) => r.householdSize === 1);
  if (!base) return rules;

  const result = [...rules];
  for (let size = 2; size <= 5; size++) {
    if (!result.some((r) => r.householdSize === size)) {
      result.push(buildRuleForSize(base, size));
    }
  }
  return result.sort((a, b) => a.householdSize - b.householdSize);
}

// 캐시: 1인 규칙 + 자동 생성된 2~5인 규칙
let cachedRules: ConditionRule[] | null = null;
export function getAllConditionRules(): ConditionRule[] {
  if (!cachedRules) {
    cachedRules = generateHouseholdRulesIfMissing(loadConditionRules());
  }
  return cachedRules;
}

// 세대원 수에 맞는 조건 규칙 반환 (없으면 최대 크기 규칙으로 대체)
export function getConditionRuleByHouseholdSize(
  size: number
): ConditionRule {
  const rules = getAllConditionRules();
  const exact = rules.find((r) => r.householdSize === size);
  if (exact) return exact;
  // 5인 초과 세대는 5인 규칙을 사용 (프로토타입 단순화)
  return rules[rules.length - 1];
}

// 세대원들의 월소득을 합산한다.
export function calculateHouseholdTotalIncome(members: Resident[]): number {
  return members.reduce((sum, m) => sum + (m.monthlyIncome || 0), 0);
}

// 총소득과 세대원 수로 소득구간을 판정한다.
export function determineIncomeLevel(
  totalIncome: number,
  householdSize: number
): IncomeLevel {
  const rule = getConditionRuleByHouseholdSize(householdSize);
  for (const lvl of rule.levels) {
    const max = lvl.maxIncome;
    if (max == null) {
      // LN 구간
      if (totalIncome >= lvl.minIncome) return lvl.level;
    } else if (totalIncome >= lvl.minIncome && totalIncome <= max) {
      return lvl.level;
    }
  }
  // 어디에도 안 맞으면 가장 마지막(LN)
  return 'LN';
}

// 소득구간 레벨의 한글 이름 반환
export function getIncomeLevelLabel(level: IncomeLevel): string {
  const names: Record<IncomeLevel, string> = {
    L5: '자동연결 후보',
    L4: '수급 가능성 높음',
    L3: '조건 확인 필요',
    L2: '일부 지원 가능',
    L1: '정보 안내 대상',
    LN: '소득 기준 초과 가능성',
  };
  return names[level];
}

// 자동연결 후보 여부 (L5)
export function isAutoConnectCandidate(level: IncomeLevel): boolean {
  return level === 'L5';
}

// 수급 가능성 높음 여부 (L4)
export function isHighPossibility(level: IncomeLevel): boolean {
  return level === 'L4';
}
