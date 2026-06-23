// ============================================================
// 감사로그(auditLogs) 유틸
// 대리 조회/신청, 세대정보 수정, 배치 실행 등을 기록한다.
// ============================================================

import type { AuditLog } from '../types';
import { getAuditLogs, setAuditLogs } from './storage';
import { nowString } from './date';

let auditSeq = 0;

function nextLogId(): string {
  auditSeq++;
  return `LOG_${Date.now()}_${auditSeq}`;
}

// 감사로그 1건 추가 후 전체 목록 반환
export function addAuditLog(
  entry: Omit<AuditLog, 'logId' | 'createdAt'>
): AuditLog[] {
  const logs = getAuditLogs();
  const log: AuditLog = {
    ...entry,
    logId: nextLogId(),
    createdAt: nowString(),
  };
  const updated = [log, ...logs];
  setAuditLogs(updated);
  return updated;
}
