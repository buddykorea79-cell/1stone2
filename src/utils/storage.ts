// ============================================================
// localStorage 접근 유틸
// 컴포넌트에서 localStorage 를 직접 반복 호출하지 않고
// 이 모듈의 함수를 통해서만 접근한다.
// ============================================================

import type {
  Application,
  AuditLog,
  BatchResult,
  BatchRun,
  Household,
  Notification,
  Resident,
  WelfareProgram,
  AccessibilitySettings,
} from '../types';

// localStorage 키 모음
export const STORAGE_KEYS = {
  welfarePrograms: 'welfarePrograms',
  residents: 'residents',
  households: 'households',
  applications: 'applications',
  auditLogs: 'auditLogs',
  batchResults: 'batchResults',
  batchRuns: 'batchRuns',
  notifications: 'notifications',
  accessibilitySettings: 'accessibilitySettings',
} as const;

// 제네릭 read/write
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- 복지사업 ---
export const getWelfarePrograms = () =>
  read<WelfareProgram[]>(STORAGE_KEYS.welfarePrograms, []);
export const setWelfarePrograms = (v: WelfareProgram[]) =>
  write(STORAGE_KEYS.welfarePrograms, v);

// --- 주민 ---
export const getResidents = () => read<Resident[]>(STORAGE_KEYS.residents, []);
export const setResidents = (v: Resident[]) =>
  write(STORAGE_KEYS.residents, v);

// --- 세대 ---
export const getHouseholds = () =>
  read<Household[]>(STORAGE_KEYS.households, []);
export const setHouseholds = (v: Household[]) =>
  write(STORAGE_KEYS.households, v);

// --- 신청 ---
export const getApplications = () =>
  read<Application[]>(STORAGE_KEYS.applications, []);
export const setApplications = (v: Application[]) =>
  write(STORAGE_KEYS.applications, v);

// --- 감사로그 ---
export const getAuditLogs = () => read<AuditLog[]>(STORAGE_KEYS.auditLogs, []);
export const setAuditLogs = (v: AuditLog[]) =>
  write(STORAGE_KEYS.auditLogs, v);

// --- 배치 결과 ---
export const getBatchResults = () =>
  read<BatchResult[]>(STORAGE_KEYS.batchResults, []);
export const setBatchResults = (v: BatchResult[]) =>
  write(STORAGE_KEYS.batchResults, v);

// --- 배치 실행 이력 ---
export const getBatchRuns = () => read<BatchRun[]>(STORAGE_KEYS.batchRuns, []);
export const setBatchRuns = (v: BatchRun[]) =>
  write(STORAGE_KEYS.batchRuns, v);

// --- 알림 ---
export const getNotifications = () =>
  read<Notification[]>(STORAGE_KEYS.notifications, []);
export const setNotifications = (v: Notification[]) =>
  write(STORAGE_KEYS.notifications, v);

// --- 접근성 설정 ---
export const getAccessibilitySettings = (): AccessibilitySettings =>
  read<AccessibilitySettings>(STORAGE_KEYS.accessibilitySettings, {
    largeText: false,
    highContrast: false,
    easyMode: false,
    language: 'ko',
  });
export const setAccessibilitySettings = (v: AccessibilitySettings) =>
  write(STORAGE_KEYS.accessibilitySettings, v);

// mock 데이터 전체 초기화 (접근성 설정 제외 가능하나 여기선 전부 삭제)
export function clearAllMockData(): void {
  Object.values(STORAGE_KEYS).forEach((k) => {
    if (k === STORAGE_KEYS.accessibilitySettings) return; // 접근성 설정은 유지
    localStorage.removeItem(k);
  });
}
