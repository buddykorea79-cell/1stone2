// ============================================================
// 앱 최초 실행 시 mock 데이터 초기화
// localStorage 에 데이터가 없으면 생성, 있으면 그대로 사용.
// ============================================================

import { INITIAL_WELFARE_PROGRAMS } from '../data/mockData';
import { generateMockResidents } from './residentGenerator';
import {
  getResidents,
  getWelfarePrograms,
  setHouseholds,
  setResidents,
  setWelfarePrograms,
  clearAllMockData,
} from './storage';

// 데이터가 없으면 생성한다. (force=true 면 초기화 후 재생성)
export function ensureMockData(force = false): void {
  if (force) {
    clearAllMockData();
  }

  if (getWelfarePrograms().length === 0) {
    setWelfarePrograms(INITIAL_WELFARE_PROGRAMS);
  }

  if (getResidents().length === 0) {
    // 주민 100명 + 세대 동시 생성
    const { residents, households } = generateMockResidents(100);
    setResidents(residents);
    setHouseholds(households);
  }
}

// 시스템 관리자/개발용: 전체 초기화 후 재생성
export function resetMockData(): void {
  ensureMockData(true);
}
