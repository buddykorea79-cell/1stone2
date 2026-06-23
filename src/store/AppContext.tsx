// ============================================================
// 앱 전역 상태 컨텍스트
// localStorage 를 단일 소스로 두고, 화면 상태/역할/선택국민을 관리한다.
// 데이터 변경 시 storage 유틸로 저장 후 reload() 로 동기화한다.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AccessibilitySettings,
  Application,
  AuditLog,
  BatchResult,
  BatchRun,
  Household,
  Notification,
  Resident,
  UserRole,
  WelfareProgram,
} from '../types';
import * as storage from '../utils/storage';
import { ensureMockData } from '../utils/bootstrap';
import { defaultScreenForRole, type ScreenKey } from '../utils/roles';

interface AppState {
  // 세션 상태
  role: UserRole;
  setRole: (r: UserRole) => void;
  selectedCitizenId: string;
  setSelectedCitizenId: (id: string) => void;
  screen: ScreenKey;
  setScreen: (s: ScreenKey) => void;

  // 데이터 (localStorage 미러)
  programs: WelfareProgram[];
  residents: Resident[];
  households: Household[];
  applications: Application[];
  auditLogs: AuditLog[];
  batchResults: BatchResult[];
  batchRuns: BatchRun[];
  notifications: Notification[];

  // 접근성
  accessibility: AccessibilitySettings;
  setAccessibility: (a: AccessibilitySettings) => void;

  // 동작
  reload: () => void;
  currentStaffName: string;
}

const AppContext = createContext<AppState | null>(null);

// 역할별 시연용 담당자/총괄 이름
const STAFF_NAMES: Partial<Record<UserRole, string>> = {
  welfare_staff: '복지담당자1',
  agency_admin: '기관총괄1',
  center_staff: '이담당',
  welfare_super_admin: '복지총괄1',
  system_admin: '시스템관리자',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('citizen');
  const [screen, setScreen] = useState<ScreenKey>('main');
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>('');

  const [programs, setPrograms] = useState<WelfareProgram[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchRuns, setBatchRuns] = useState<BatchRun[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [accessibility, setAccessibilityState] = useState<AccessibilitySettings>(
    storage.getAccessibilitySettings()
  );

  // localStorage → state 동기화
  const reload = useCallback(() => {
    setPrograms(storage.getWelfarePrograms());
    setResidents(storage.getResidents());
    setHouseholds(storage.getHouseholds());
    setApplications(storage.getApplications());
    setAuditLogs(storage.getAuditLogs());
    setBatchResults(storage.getBatchResults());
    setBatchRuns(storage.getBatchRuns());
    setNotifications(storage.getNotifications());
  }, []);

  // 최초 1회: mock 데이터 보장 후 로드
  useEffect(() => {
    ensureMockData();
    reload();
    const residentsList = storage.getResidents();
    if (residentsList.length > 0) {
      setSelectedCitizenId(residentsList[0].citizenId);
    }
  }, [reload]);

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    setScreen(defaultScreenForRole(r));
  }, []);

  const setAccessibility = useCallback((a: AccessibilitySettings) => {
    storage.setAccessibilitySettings(a);
    setAccessibilityState(a);
  }, []);

  const currentStaffName = STAFF_NAMES[role] ?? '담당자';

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      selectedCitizenId,
      setSelectedCitizenId,
      screen,
      setScreen,
      programs,
      residents,
      households,
      applications,
      auditLogs,
      batchResults,
      batchRuns,
      notifications,
      accessibility,
      setAccessibility,
      reload,
      currentStaffName,
    }),
    [
      role,
      setRole,
      selectedCitizenId,
      screen,
      programs,
      residents,
      households,
      applications,
      auditLogs,
      batchResults,
      batchRuns,
      notifications,
      accessibility,
      setAccessibility,
      reload,
      currentStaffName,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
