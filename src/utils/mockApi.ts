// ============================================================
// 복지 담당자 신청 상세에서 보여줄 mock API 확인 결과
// ⚠️ 실제 정부 API 를 호출하지 않는다. 로컬 데이터 기반 추정값이다.
// ============================================================

import type {
  Application,
  Household,
  MockApiResult,
  WelfareProgram,
} from '../types';
import { getIncomeLevelLabel } from './conditionRules';

// 소득 기준 확인: 세대 소득구간 기준 충족 여부 추정
export function incomeCheck(
  household: Household | undefined,
  program: WelfareProgram | undefined
): string {
  if (!household) return '확인 필요';
  const level = household.incomeLevel;
  if (level === 'LN') return '초과 가능성';
  if (program && !program.conditions.incomeLevels.includes(level)) {
    return '확인 필요';
  }
  if (level === 'L5' || level === 'L4') return '충족';
  return '확인 필요';
}

// 세대 정보: N인가구 문자열
export function householdCheck(household: Household | undefined): string {
  if (!household) return '확인 필요';
  return `${household.householdSize}인가구 (소득구간 ${
    household.incomeLevel
  } · ${getIncomeLevelLabel(household.incomeLevel)})`;
}

// 중복 수급 확인: 동일 세대의 승인/연결 신청 존재 여부
export function duplicateBenefitCheck(
  household: Household | undefined,
  applications: Application[],
  currentAppId: string
): string {
  if (!household) return '확인 필요';
  const dup = applications.some(
    (a) =>
      a.householdId === household.householdId &&
      a.applicationId !== currentAppId &&
      ['approved', 'auto_connected', 'payment_ready', 'payment_done'].includes(
        a.status
      )
  );
  return dup ? '있음' : '없음';
}

// 주소지 확인 (마스킹 주소 노출)
export function residentAddressCheck(household: Household | undefined): string {
  if (!household) return '확인 필요';
  return `확인 (${household.addressMasked})`;
}

// 신청 이력 확인
function applicationHistoryCheck(
  household: Household | undefined,
  applications: Application[],
  currentAppId: string
): string {
  if (!household) return '없음';
  const has = applications.some(
    (a) =>
      a.householdId === household.householdId && a.applicationId !== currentAppId
  );
  return has ? '있음' : '없음';
}

// 전체 mock API 결과 묶음
export function getMockApiResults(
  application: Application,
  household: Household | undefined,
  program: WelfareProgram | undefined,
  applications: Application[]
): MockApiResult {
  return {
    incomeCheck: incomeCheck(household, program),
    householdInfo: householdCheck(household),
    duplicateBenefit: duplicateBenefitCheck(
      household,
      applications,
      application.applicationId
    ),
    addressCheck: residentAddressCheck(household),
    applicationHistory: applicationHistoryCheck(
      household,
      applications,
      application.applicationId
    ),
  };
}
