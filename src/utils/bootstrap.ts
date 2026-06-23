// ============================================================
// 앱 최초 실행 시 mock 데이터 초기화
// localStorage 에 데이터가 없으면 생성, 있으면 그대로 사용.
// ============================================================

import { INITIAL_WELFARE_PROGRAMS } from '../data/mockData';
import realServices from '../data/welfareServices.json';
import type { WelfareProgram } from '../types';
import { generateMockResidents } from './residentGenerator';
import { generateSeedData } from './seed';
import { runMonthlyBatch } from './batch';
import {
  getResidents,
  getWelfarePrograms,
  setApplications,
  setAuditLogs,
  setHouseholds,
  setNotifications,
  setResidents,
  setWelfarePrograms,
  clearAllMockData,
} from './storage';

// 복지로 기반 실데이터(중앙부처 + 서울/경기 표본)를 WelfareProgram 형태로 사용.
// 시연 시나리오용 7개 사업을 앞에 두어 추천 결과가 안정적으로 나오게 한다.
const REAL_SERVICES = realServices as unknown as WelfareProgram[];
const ALL_PROGRAMS: WelfareProgram[] = [
  ...INITIAL_WELFARE_PROGRAMS,
  ...REAL_SERVICES,
];

// 데이터가 없으면 생성한다. (force=true 면 초기화 후 재생성)
export function ensureMockData(force = false): void {
  if (force) {
    clearAllMockData();
  }

  if (getWelfarePrograms().length === 0) {
    setWelfarePrograms(ALL_PROGRAMS);
  }
  const programs = getWelfarePrograms();

  if (getResidents().length === 0) {
    // --- 최초 실행: 주민/세대 + 거래성 데이터 일괄 생성 ---
    const { residents, households } = generateMockResidents(100);

    // 1) 신청·감사로그·알림 시드 (각 역할 화면이 비지 않도록)
    const seed = generateSeedData(residents, households, programs);
    setResidents(residents);
    setAuditLogs(seed.auditLogs);
    setNotifications(seed.notifications);

    // 2) 초기 배치 1회 실행 → 배치 결과/요약/자동연결 후보/세대 판정일 채움
    //    (배치가 시드 신청과 병합하여 applications 를 저장한다)
    const out = runMonthlyBatch(
      households,
      residents,
      programs,
      seed.applications,
      '기관총괄1'
    );
    setHouseholds(out.households);
    // runMonthlyBatch 가 applications/배치결과/배치실행/알림/감사로그를 이미 저장하지만,
    // 시드 신청이 확실히 포함되도록 한 번 더 보장.
    setApplications(out.applications);
  }
}

// 시스템 관리자/개발용: 전체 초기화 후 재생성
export function resetMockData(): void {
  ensureMockData(true);
}
