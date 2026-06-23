// ============================================================
// 월 1회 복지 자동판정 배치 처리
// ⚠️ 실제 스케줄러가 아니라 버튼 클릭으로 1회 실행되는 mock 배치다.
// ============================================================

import type {
  Application,
  BatchResult,
  BatchResultStatus,
  BatchRun,
  Household,
  IncomeLevel,
  Resident,
  SearchCondition,
  WelfareProgram,
} from '../types';
import {
  determineIncomeLevel,
  getIncomeLevelLabel,
} from './conditionRules';
import { getRecommendedPrograms } from './matching';
import { batchIdForNow, nowString } from './date';
import {
  setApplications,
  setBatchResults,
  setBatchRuns,
  getBatchResults,
  getBatchRuns,
} from './storage';
import { addNotification } from './notifications';
import { addAuditLog } from './audit';

// 소득구간 → 배치 결과 상태 매핑
function levelToResultStatus(level: IncomeLevel): BatchResultStatus {
  switch (level) {
    case 'L5':
      return 'auto_candidate';
    case 'L4':
      return 'high_possibility';
    case 'L3':
    case 'L2':
      return 'need_review';
    case 'L1':
      return 'info_only';
    case 'LN':
    default:
      return 'not_matched';
  }
}

// 세대의 세대원 욕구/유형으로 검색조건을 구성한다.
function buildHouseholdCondition(
  household: Household,
  members: Resident[],
  level: IncomeLevel
): SearchCondition {
  const needs = new Set<string>();
  members.forEach((m) => m.needs.forEach((n) => needs.add(n)));
  const head = members.find((m) => m.relationshipToHead === '본인') ?? members[0];

  let householdType = '전체';
  if (household.householdSize === 1) householdType = '1인가구';
  else if (members.some((m) => m.relationshipToHead === '배우자'))
    householdType = '부부';
  if (members.some((m) => m.relationshipToHead === '자녀') && household.householdSize <= 3)
    householdType = '한부모';

  return {
    age: head ? head.age : null,
    region: household.region,
    householdSize: household.householdSize,
    householdType,
    incomeHint: '',
    incomeLevel: level,
    needs: Array.from(needs),
    rawQuery: '',
  };
}

// 한 세대의 복지 연결 가능성을 평가한다.
export function evaluateHouseholdForWelfare(
  household: Household,
  residents: Resident[],
  programs: WelfareProgram[]
): {
  incomeLevel: IncomeLevel;
  incomeLevelName: string;
  recommendedPrograms: string[];
  resultStatus: BatchResultStatus;
} {
  const members = residents.filter((r) =>
    household.members.includes(r.residentId)
  );
  const total = members.reduce((s, m) => s + m.monthlyIncome, 0);
  const level = determineIncomeLevel(total, household.householdSize);
  const cond = buildHouseholdCondition(household, members, level);

  // 추천 사업: 점수 5점 이상(보통/높음) 중 상위 3개
  const recs = getRecommendedPrograms(programs, cond)
    .filter((r) => r.score >= 5)
    .slice(0, 3);

  return {
    incomeLevel: level,
    incomeLevelName: getIncomeLevelLabel(level),
    recommendedPrograms: recs.map((r) => r.program.programId),
    resultStatus: levelToResultStatus(level),
  };
}

// 동일 household + program 으로 auto_candidate/submitted 신청이 이미 있으면 true
export function preventDuplicateAutoApplications(
  applications: Application[],
  householdId: string,
  programId: string
): boolean {
  return applications.some(
    (a) =>
      a.householdId === householdId &&
      a.programId === programId &&
      (a.status === 'auto_candidate' || a.status === 'submitted')
  );
}

let autoAppSeq = 0;
function nextAppId(): string {
  autoAppSeq++;
  return `APP_B${Date.now()}_${autoAppSeq}`;
}

// 자동연결 후보(L5) 세대에 대해 auto_candidate 신청을 생성한다.
export function createAutoCandidateApplications(
  household: Household,
  residents: Resident[],
  programs: WelfareProgram[],
  recommendedProgramIds: string[],
  existingApplications: Application[],
  batchId: string
): Application[] {
  const head =
    residents.find(
      (r) =>
        household.members.includes(r.residentId) &&
        r.relationshipToHead === '본인'
    ) ?? residents.find((r) => household.members.includes(r.residentId));
  if (!head) return [];

  const created: Application[] = [];
  recommendedProgramIds.forEach((programId) => {
    // 중복 방지
    if (
      preventDuplicateAutoApplications(
        [...existingApplications, ...created],
        household.householdId,
        programId
      )
    )
      return;
    const program = programs.find((p) => p.programId === programId);
    if (!program) return;

    created.push({
      applicationId: nextAppId(),
      citizenId: head.citizenId,
      householdId: household.householdId,
      applicantName: head.name,
      applicantType: 'batch',
      programId: program.programId,
      programName: program.name,
      reason: '월 1회 배치 자동판정으로 생성된 자동연결 후보입니다.',
      status: 'auto_candidate',
      assignedAgencyId: program.agencyId,
      assignedTo: '미배정',
      staffComment: '',
      batchId,
      createdAt: nowString(),
      updatedAt: nowString(),
    });
  });
  return created;
}

// 배치 결과/실행이력을 localStorage 에 저장한다.
export function saveBatchResults(
  results: BatchResult[],
  run: BatchRun
): void {
  setBatchResults([...getBatchResults().filter((r) => r.batchId !== run.batchId), ...results]);
  setBatchRuns([run, ...getBatchRuns().filter((r) => r.batchId !== run.batchId)]);
}

// 배치 실행 요약 생성
export function getBatchSummary(
  batchId: string,
  executedBy: string,
  results: BatchResult[],
  createdAppCount: number
): BatchRun {
  const count = (s: BatchResultStatus) =>
    results.filter((r) => r.resultStatus === s).length;
  return {
    batchId,
    executedBy,
    executedAt: nowString(),
    totalHouseholds: results.length,
    autoCandidateCount: count('auto_candidate'),
    highPossibilityCount: count('high_possibility'),
    needReviewCount: count('need_review'),
    infoOnlyCount: count('info_only'),
    notMatchedCount: count('not_matched'),
    createdApplicationCount: createdAppCount,
  };
}

// 월 1회 배치 실행 (전체 오케스트레이션)
export function runMonthlyBatch(
  households: Household[],
  residents: Resident[],
  programs: WelfareProgram[],
  applications: Application[],
  executedBy: string
): {
  applications: Application[];
  batchResults: BatchResult[];
  batchRun: BatchRun;
  households: Household[];
} {
  const batchId = batchIdForNow();
  const checkedAt = nowString();

  let currentApps = [...applications];
  const batchResults: BatchResult[] = [];
  let createdAppCount = 0;

  // 세대의 마지막 판정일도 함께 갱신
  const updatedHouseholds = households.map((h) => ({ ...h }));

  updatedHouseholds.forEach((household) => {
    const evalResult = evaluateHouseholdForWelfare(
      household,
      residents,
      programs
    );

    // 세대 소득구간 갱신
    household.incomeLevel = evalResult.incomeLevel;
    household.incomeLevelName = evalResult.incomeLevelName;
    household.lastCheckedAt = checkedAt;

    let createdIds: string[] = [];

    // L5: 자동 신청 후보 생성
    if (evalResult.resultStatus === 'auto_candidate') {
      const created = createAutoCandidateApplications(
        household,
        residents,
        programs,
        evalResult.recommendedPrograms,
        currentApps,
        batchId
      );
      if (created.length > 0) {
        currentApps = [...currentApps, ...created];
        createdIds = created.map((a) => a.applicationId);
        createdAppCount += created.length;
        // 자동연결 후보 알림
        const head = residents.find(
          (r) =>
            household.members.includes(r.residentId) &&
            r.relationshipToHead === '본인'
        );
        if (head) {
          addNotification(
            head.citizenId,
            '자동연결 후보로 선정되었습니다.',
            `배치 자동판정 결과 ${created
              .map((c) => c.programName)
              .join(', ')} 자동연결 후보가 생성되었습니다.`
          );
        }
      }
    }

    batchResults.push({
      batchId,
      householdId: household.householdId,
      householdSize: household.householdSize,
      totalMonthlyIncome: household.totalMonthlyIncome,
      incomeLevel: evalResult.incomeLevel,
      incomeLevelName: evalResult.incomeLevelName,
      recommendedPrograms: evalResult.recommendedPrograms,
      resultStatus: evalResult.resultStatus,
      createdApplicationIds: createdIds,
      checkedAt,
    });
  });

  const batchRun = getBatchSummary(
    batchId,
    executedBy,
    batchResults,
    createdAppCount
  );

  // 저장
  setApplications(currentApps);
  saveBatchResults(batchResults, batchRun);
  addAuditLog({
    actorRole: '기관 총괄',
    actorName: executedBy,
    targetCitizenId: '-',
    targetCitizenName: '전체 세대',
    action: '월 1회 배치 실행',
    reason: `자동판정 배치(${batchId}) 실행 — 후보 ${createdAppCount}건 생성`,
    programId: '-',
    programName: '-',
  });

  return {
    applications: currentApps,
    batchResults,
    batchRun,
    households: updatedHouseholds,
  };
}
