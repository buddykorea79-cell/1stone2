// ============================================================
// 앱 최초 실행 시 mock 데이터 초기화
// localStorage 에 데이터가 없으면 생성, 있으면 그대로 사용.
// ============================================================

import { INITIAL_WELFARE_PROGRAMS } from '../data/mockData';
import realServices from '../data/welfareServices.json';
import type { WelfareProgram } from '../types';
import { generateMockResidents } from './residentGenerator';

// 복지로 기반 실데이터(중앙부처 + 서울/경기 표본)를 WelfareProgram 형태로 사용.
// 시연 시나리오용 7개 사업을 앞에 두어 추천 결과가 안정적으로 나오게 한다.
const REAL_SERVICES = realServices as unknown as WelfareProgram[];
const ALL_PROGRAMS: WelfareProgram[] = [
  ...INITIAL_WELFARE_PROGRAMS,
  ...REAL_SERVICES,
];
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
    setWelfarePrograms(ALL_PROGRAMS);
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
