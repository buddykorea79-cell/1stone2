// ============================================================
// 복지 추천 로직 (단순 점수 방식)
// 복지사업 조건과 사용자 조건을 비교해 점수를 매긴다.
// ============================================================

import type {
  IncomeLevel,
  RecommendationResult,
  SearchCondition,
  WelfareProgram,
} from '../types';
import { getIncomeLevelLabel } from './conditionRules';

// 추천 점수를 계산하고 이유를 함께 반환한다.
export function calculateRecommendationScore(
  program: WelfareProgram,
  cond: SearchCondition
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const c = program.conditions;

  // 나이 조건 충족: +2
  if (cond.age != null) {
    const okMin = c.ageMin == null || cond.age >= c.ageMin;
    const okMax = c.ageMax == null || cond.age <= c.ageMax;
    if (okMin && okMax && (c.ageMin != null || c.ageMax != null)) {
      score += 2;
      reasons.push(`나이(${cond.age}세) 조건을 충족합니다.`);
    } else if (c.ageMin == null && c.ageMax == null) {
      // 나이 제한 없음 — 점수 없음(중립)
    }
  }

  // 지역 조건 충족: +1
  if (cond.region) {
    if (
      c.regions.includes('전체') ||
      c.regions.some((r) => r.includes(cond.region) || cond.region.includes(r))
    ) {
      score += 1;
      reasons.push(`지역(${cond.region}) 조건을 충족합니다.`);
    }
  }

  // 소득수준/incomeLevel 충족: +2
  if (cond.incomeLevel) {
    if (c.incomeLevels.includes(cond.incomeLevel)) {
      score += 2;
      reasons.push(
        `소득구간이 ${cond.incomeLevel}(${getIncomeLevelLabel(
          cond.incomeLevel
        )})라 지원 조건에 부합합니다.`
      );
    }
  } else if (cond.incomeHint === '낮음') {
    // 소득이 낮다는 힌트 — 저소득 대상 사업에 가산
    if (c.incomeLevels.some((l) => l === 'L5' || l === 'L4' || l === 'L3')) {
      score += 2;
      reasons.push('소득이 낮은 편이라 저소득 지원 대상에 해당할 수 있습니다.');
    }
  }

  // 가구유형 충족: +1
  if (cond.householdType) {
    if (
      c.householdTypes.includes('전체') ||
      c.householdTypes.includes(cond.householdType)
    ) {
      score += 1;
      reasons.push(`가구유형(${cond.householdType}) 조건을 충족합니다.`);
    }
  }

  // 세대원 수 조건 충족: +1
  if (cond.householdSize != null) {
    if (c.householdSizes.includes(cond.householdSize)) {
      score += 1;
      reasons.push(`세대원 수(${cond.householdSize}인) 조건을 충족합니다.`);
    }
  }

  // 필요 항목(needs) 충족: +3
  const matchedNeeds = cond.needs.filter((n) => c.needs.includes(n));
  if (matchedNeeds.length > 0) {
    score += 3;
    reasons.push(`필요한 지원(${matchedNeeds.join(', ')})과 맞는 사업입니다.`);
  }

  // 소득구간이 L5/L4 이면 생계/주거/긴급지원에 +2
  if (cond.incomeLevel === 'L5' || cond.incomeLevel === 'L4') {
    if (['생계', '주거', '긴급지원'].includes(program.category)) {
      score += 2;
      if (cond.incomeLevel === 'L5') {
        reasons.push('소득구간이 L5라 자동연결 후보에 해당합니다.');
      } else {
        reasons.push('소득구간이 L4라 수급 가능성이 높습니다.');
      }
    }
  }

  return { score, reasons };
}

// 점수로 받을 가능성 등급 산출
export function getEligibilityLevel(score: number): '높음' | '보통' | '낮음' {
  if (score >= 8) return '높음';
  if (score >= 5) return '보통';
  return '낮음';
}

// 추천 이유 문구를 다듬어 반환 (이유가 없으면 기본 안내)
export function generateRecommendationReason(
  reasons: string[],
  program: WelfareProgram
): string[] {
  if (reasons.length > 0) return reasons;
  return [`${program.category} 분야 사업으로, 조건 확인 후 신청이 가능합니다.`];
}

// 조건에 맞는 추천 복지사업 목록 (점수순 정렬, 0점 제외)
export function getRecommendedPrograms(
  programs: WelfareProgram[],
  cond: SearchCondition
): RecommendationResult[] {
  const results: RecommendationResult[] = programs
    .filter((p) => p.status === 'active')
    .map((program) => {
      const { score, reasons } = calculateRecommendationScore(program, cond);
      // 직접 검증한 대표 복지사업(source 없음)은 우선 안내한다.
      const curatedBonus = program.source ? 0 : 3;
      const finalReasons = generateRecommendationReason(reasons, program);
      if (curatedBonus > 0 && score > 0) {
        finalReasons.unshift('대표 복지사업으로 우선 안내됩니다.');
      }
      return {
        program,
        score: score + curatedBonus,
        eligibility: getEligibilityLevel(score + curatedBonus),
        reasons: finalReasons,
      };
    })
    .filter((r) => r.score > 0)
    // 점수 동률이면 직접 검증 사업(중앙/지자체보다) 우선
    .sort((a, b) => b.score - a.score);

  return results;
}

// 자동연결 후보(L5)에 가산 카테고리인지
export function isAutoBoostCategory(category: string): boolean {
  return ['생계', '주거', '긴급지원'].includes(category);
}

export const ALL_CATEGORIES = [
  '생계',
  '주거',
  '의료',
  '돌봄',
  '노인',
  '장애인',
  '청년',
  '아동',
  '한부모',
  '일자리',
  '긴급지원',
];

export type { IncomeLevel };
