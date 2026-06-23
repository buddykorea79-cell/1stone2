// 날짜/시간 포맷 유틸

// "2026-06-23 10:00" 형식의 현재 시각 문자열 반환
export function nowString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// 현재 연월 기반 배치 ID 생성 (예: BATCH_202606)
export function batchIdForNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `BATCH_${d.getFullYear()}${pad(d.getMonth() + 1)}`;
}
