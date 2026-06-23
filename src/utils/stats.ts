// ============================================================
// 대시보드용 집계 유틸
// ============================================================

import type {
  Application,
  ApplicationStatus,
  Household,
  IncomeLevel,
  WelfareProgram,
} from '../types';

// 상태별 신청 건수
export function countByStatus(
  apps: Application[]
): Record<ApplicationStatus, number> {
  const base: Record<ApplicationStatus, number> = {
    submitted: 0,
    reviewing: 0,
    need_more_info: 0,
    approved: 0,
    rejected: 0,
    auto_candidate: 0,
    auto_connected: 0,
    payment_ready: 0,
    payment_done: 0,
  };
  apps.forEach((a) => {
    base[a.status]++;
  });
  return base;
}

// 복지사업별 신청 건수
export function countByProgram(
  apps: Application[],
  programs: WelfareProgram[]
): { name: string; count: number }[] {
  return programs.map((p) => ({
    name: p.name,
    count: apps.filter((a) => a.programId === p.programId).length,
  }));
}

// 소득구간별 세대 수
export function countByIncomeLevel(
  households: Household[]
): Record<IncomeLevel, number> {
  const base: Record<IncomeLevel, number> = {
    L5: 0,
    L4: 0,
    L3: 0,
    L2: 0,
    L1: 0,
    LN: 0,
  };
  households.forEach((h) => {
    base[h.incomeLevel]++;
  });
  return base;
}

// 지역별 세대 수
export function countByRegion(
  households: Household[]
): { region: string; count: number }[] {
  const map = new Map<string, number>();
  households.forEach((h) => map.set(h.region, (map.get(h.region) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);
}
