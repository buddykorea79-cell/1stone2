// ============================================================
// 신청(applications) 생성/상태표시 유틸
// ============================================================

import type {
  Application,
  ApplicationStatus,
  Resident,
  WelfareProgram,
} from '../types';
import { nowString } from './date';

// 신청 상태 한글 라벨
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: '접수됨',
  reviewing: '심사중',
  need_more_info: '보완요청',
  approved: '승인',
  rejected: '반려',
  auto_candidate: '자동연결 후보',
  auto_connected: '자동연결 완료',
  payment_ready: '지급대상',
  payment_done: '지급처리 완료',
};

// 상태별 색상 클래스 (status-badge 보조)
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted: 'badge-blue',
  reviewing: 'badge-amber',
  need_more_info: 'badge-amber',
  approved: 'badge-green',
  rejected: 'badge-red',
  auto_candidate: 'badge-purple',
  auto_connected: 'badge-green',
  payment_ready: 'badge-teal',
  payment_done: 'badge-green',
};

// 담당자가 선택 가능한 상태 전이 목록
export const SELECTABLE_STATUSES: ApplicationStatus[] = [
  'submitted',
  'reviewing',
  'need_more_info',
  'approved',
  'rejected',
  'auto_connected',
  'payment_ready',
  'payment_done',
];

let appSeq = 0;
function nextAppId(): string {
  appSeq++;
  return `APP_${Date.now()}_${appSeq}`;
}

// 일반 신청 생성
export function createApplication(params: {
  citizen: Resident;
  program: WelfareProgram;
  reason: string;
}): Application {
  const { citizen, program, reason } = params;
  return {
    applicationId: nextAppId(),
    citizenId: citizen.citizenId,
    householdId: citizen.householdId,
    applicantName: citizen.name,
    applicantType: 'citizen',
    programId: program.programId,
    programName: program.name,
    reason,
    status: 'submitted',
    assignedAgencyId: program.agencyId,
    assignedTo: '미배정',
    staffComment: '',
    batchId: null,
    createdAt: nowString(),
    updatedAt: nowString(),
  };
}

// 대리 신청 생성
export function createDelegatedApplication(params: {
  citizen: Resident;
  program: WelfareProgram;
  reason: string;
  delegatedByName: string;
  delegationReason: string;
}): Application {
  const base = createApplication({
    citizen: params.citizen,
    program: params.program,
    reason: params.reason,
  });
  return {
    ...base,
    applicantType: 'delegated',
    delegatedByRole: '주민센터 담당',
    delegatedByName: params.delegatedByName,
    delegationReason: params.delegationReason,
  };
}

// 신청유형 한글
export function applicantTypeLabel(t: Application['applicantType']): string {
  if (t === 'delegated') return '대리';
  if (t === 'batch') return '배치후보';
  return '본인';
}
