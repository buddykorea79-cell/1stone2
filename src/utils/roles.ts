// ============================================================
// 역할/화면 접근 제어 정의
// ============================================================

import type { UserRole } from '../types';

export type ScreenKey =
  | 'main'
  | 'myApplications'
  | 'myNotifications'
  | 'delegated'
  | 'auditLog'
  | 'staffApplications'
  | 'welfarePrograms'
  | 'household'
  | 'batch'
  | 'batchResults'
  | 'agencyDashboard'
  | 'globalDashboard'
  | 'rag'
  | 'sql'
  | 'admin';

// 역할 한글 라벨
export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: '시스템 관리자',
  welfare_super_admin: '복지 총괄',
  agency_admin: '기관 총괄',
  welfare_staff: '복지 담당',
  center_staff: '주민센터 담당',
  citizen: '일반 국민',
};

export const ALL_ROLES: UserRole[] = [
  'citizen',
  'center_staff',
  'welfare_staff',
  'agency_admin',
  'welfare_super_admin',
  'system_admin',
];

// 화면 한글 라벨
export const SCREEN_LABELS: Record<ScreenKey, string> = {
  main: '복지 찾기',
  myApplications: '내 신청 현황',
  myNotifications: '내 알림',
  delegated: '대리 신청',
  auditLog: '대리 신청 이력',
  staffApplications: '신청 관리',
  welfarePrograms: '복지사업 관리',
  household: '세대정보 관리',
  batch: '월 1회 배치 처리',
  batchResults: '배치 결과',
  agencyDashboard: '기관 대시보드',
  globalDashboard: '전체 대시보드',
  rag: '복지문서 검색(RAG)',
  sql: 'AI 조건 조회(SQL)',
  admin: '데이터 관리',
};

// 역할별 접근 가능 화면(메뉴)
const SCREENS: Record<UserRole, ScreenKey[]> = {
  citizen: ['main', 'myApplications', 'myNotifications', 'rag'],
  center_staff: ['delegated', 'auditLog', 'main'],
  welfare_staff: ['staffApplications', 'welfarePrograms', 'household', 'sql'],
  agency_admin: [
    'agencyDashboard',
    'household',
    'batch',
    'batchResults',
    'staffApplications',
  ],
  welfare_super_admin: [
    'globalDashboard',
    'staffApplications',
    'batchResults',
    'welfarePrograms',
  ],
  // 시스템 관리자는 전체 메뉴 접근
  system_admin: [
    'globalDashboard',
    'agencyDashboard',
    'main',
    'staffApplications',
    'welfarePrograms',
    'household',
    'batch',
    'batchResults',
    'delegated',
    'auditLog',
    'rag',
    'sql',
    'admin',
  ],
};

export function getScreensForRole(role: UserRole): ScreenKey[] {
  return SCREENS[role];
}

export function canAccess(role: UserRole, screen: ScreenKey): boolean {
  return SCREENS[role].includes(screen);
}

export function defaultScreenForRole(role: UserRole): ScreenKey {
  return SCREENS[role][0];
}
