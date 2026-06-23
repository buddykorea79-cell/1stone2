// ============================================================
// 초기 거래성(transactional) mock 데이터 시드
// 각 역할(복지 담당/기관 총괄/복지 총괄/주민센터)의 화면이
// 비어 있지 않도록 신청·감사로그·알림을 현실감 있게 생성한다.
// ⚠️ 모두 가상 데이터.
// ============================================================

import type {
  Application,
  ApplicationStatus,
  AuditLog,
  Household,
  Notification,
  Resident,
  WelfareProgram,
} from '../types';
import { STATUS_LABELS } from './applications';

// 욕구(need) → 대표 데모 복지사업 매핑 (표에 깔끔한 사업명이 보이도록)
const NEED_TO_PROGRAM: Record<string, string> = {
  생계: 'BASIC_LIVING_001',
  주거: 'HOUSING_001',
  돌봄: 'SENIOR_CARE_001',
  노인: 'SENIOR_CARE_001',
  긴급지원: 'EMERGENCY_001',
  청년: 'YOUTH_RENT_001',
  한부모: 'SINGLE_PARENT_001',
  아동: 'SINGLE_PARENT_001',
  장애인: 'DISABILITY_001',
};

// 처리 상태 순환(현실적 분포)
const STATUS_CYCLE: ApplicationStatus[] = [
  'reviewing',
  'approved',
  'need_more_info',
  'submitted',
  'approved',
  'reviewing',
  'rejected',
  'payment_ready',
  'approved',
  'submitted',
  'payment_done',
  'reviewing',
];

// 상태별 담당자 의견 문구
const STAFF_COMMENTS: Partial<Record<ApplicationStatus, string>> = {
  reviewing: '소득·세대 정보 확인 중입니다.',
  approved: '자격 요건을 충족하여 승인 처리했습니다.',
  need_more_info: '임대차계약서 등 추가 서류 확인이 필요합니다.',
  rejected: '소득 기준을 초과하여 부득이 반려되었습니다.',
  payment_ready: '지급 대상으로 확정되었습니다. (지급 처리 대기)',
  payment_done: '이번 달 지원금 지급 처리가 완료되었습니다. (mock)',
};

const STAFF_NAMES = ['복지담당자1', '복지담당자2', '김복지', '박담당'];

// 과거 시각 문자열 생성 (2026-06 기준 N일 전)
function pastDate(daysAgo: number, hh = 10, mm = 0): string {
  const base = new Date(2026, 5, 23, hh, mm); // 2026-06-23
  base.setDate(base.getDate() - daysAgo);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${p(base.getMonth() + 1)}-${p(
    base.getDate()
  )} ${p(base.getHours())}:${p(base.getMinutes())}`;
}

// 주민의 욕구로 적절한 프로그램 선택
function pickProgram(
  res: Resident,
  programs: WelfareProgram[]
): WelfareProgram | undefined {
  for (const need of res.needs) {
    const pid = NEED_TO_PROGRAM[need];
    const p = programs.find((x) => x.programId === pid);
    if (p) return p;
  }
  return programs.find((x) => x.programId === 'BASIC_LIVING_001');
}

export interface SeedResult {
  applications: Application[];
  auditLogs: AuditLog[];
  notifications: Notification[];
}

// 신청/감사로그/알림 시드 생성
export function generateSeedData(
  residents: Resident[],
  households: Household[],
  programs: WelfareProgram[]
): SeedResult {
  const heads = residents.filter((r) => r.relationshipToHead === '본인');
  // 다양한 세대를 대상으로 약 30건의 신청 생성
  const targets = heads.slice(0, 32);

  const applications: Application[] = [];
  const auditLogs: AuditLog[] = [];
  const notifications: Notification[] = [];

  targets.forEach((res, i) => {
    const program = pickProgram(res, programs);
    if (!program) return;
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const processed = status !== 'submitted';
    const isDelegated = i % 5 === 2; // 일부는 대리 신청
    const createdDays = 18 - Math.floor(i / 2); // 과거로 분산
    const createdAt = pastDate(Math.max(createdDays, 1), 9 + (i % 8), (i * 7) % 60);
    const updatedAt = processed
      ? pastDate(Math.max(createdDays - 1, 0), 14, (i * 11) % 60)
      : createdAt;
    const staffName = STAFF_NAMES[i % STAFF_NAMES.length];

    const app: Application = {
      applicationId: `APP_SEED_${String(i + 1).padStart(3, '0')}`,
      citizenId: res.citizenId,
      householdId: res.householdId,
      applicantName: res.name,
      applicantType: isDelegated ? 'delegated' : 'citizen',
      programId: program.programId,
      programName: program.name,
      reason: isDelegated
        ? '거동이 불편하여 주민센터를 통해 신청을 요청했습니다.'
        : `${program.category} 관련 지원이 필요하여 신청합니다.`,
      status,
      assignedAgencyId: program.agencyId,
      assignedTo: processed ? staffName : '미배정',
      staffComment: processed ? STAFF_COMMENTS[status] ?? '' : '',
      batchId: null,
      createdAt,
      updatedAt,
    };
    if (isDelegated) {
      app.delegatedByRole = '주민센터 담당';
      app.delegatedByName = '이담당';
      app.delegationReason = '고령·거동불편으로 인한 방문 대리 신청';
    }
    applications.push(app);

    // 알림: 접수 + (처리되었으면) 상태 변경
    notifications.push({
      notificationId: `NOTI_SEED_${i + 1}_a`,
      citizenId: res.citizenId,
      title: isDelegated
        ? '대리 신청이 접수되었습니다.'
        : '복지 신청이 접수되었습니다.',
      message: `${program.name} 신청이 접수되었습니다.`,
      read: i % 3 === 0,
      createdAt,
    });
    if (processed) {
      notifications.push({
        notificationId: `NOTI_SEED_${i + 1}_b`,
        citizenId: res.citizenId,
        title: '신청 상태가 변경되었습니다.',
        message: `${program.name} 신청이 '${STATUS_LABELS[status]}'(으)로 변경되었습니다.`,
        read: false,
        createdAt: updatedAt,
      });
    }

    // 대리 신청 감사로그
    if (isDelegated) {
      auditLogs.push({
        logId: `LOG_SEED_DG_${i + 1}`,
        actorRole: '주민센터 담당',
        actorName: '이담당',
        targetCitizenId: res.citizenId,
        targetCitizenName: res.name,
        action: '대리 신청',
        reason: '고령·거동불편으로 인한 방문 대리 신청',
        programId: program.programId,
        programName: program.name,
        createdAt,
      });
    }
  });

  // 세대정보 수정 감사로그 몇 건 (기관 총괄/복지 담당 활동 흔적)
  households.slice(0, 6).forEach((h, i) => {
    auditLogs.push({
      logId: `LOG_SEED_HH_${i + 1}`,
      actorRole: i % 2 === 0 ? '복지 담당' : '기관 총괄',
      actorName: i % 2 === 0 ? '복지담당자1' : '기관총괄1',
      targetCitizenId: h.householdId,
      targetCitizenName: `세대 ${h.householdId}`,
      action: i % 3 === 0 ? '세대원 소득 수정' : '세대정보 수정',
      reason: '정기 점검 중 세대원 소득/지역 정보 갱신',
      programId: '-',
      programName: '-',
      createdAt: pastDate(20 - i, 11, i * 9),
    });
  });

  // 감사로그는 최신순 정렬
  auditLogs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return { applications, auditLogs, notifications };
}
