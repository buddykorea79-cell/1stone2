import { useApp } from '../../store/AppContext';
import { BatchSummaryCards } from './BatchSummaryCards';
import { BatchResultTable } from './BatchResultTable';

// 저장된 배치 결과 조회 화면
export function BatchResultsPage() {
  const { batchResults, batchRuns } = useApp();
  const lastRun = batchRuns[0];
  const latestResults = lastRun
    ? batchResults.filter((r) => r.batchId === lastRun.batchId)
    : batchResults;

  return (
    <section>
      <h2>배치 결과</h2>
      {!lastRun ? (
        <div className="card empty-state">
          아직 실행된 배치가 없습니다. ‘월 1회 배치 처리’에서 먼저 실행하세요.
        </div>
      ) : (
        <>
          <p className="muted">
            최근 배치: {lastRun.batchId} · 실행 {lastRun.executedBy} ·{' '}
            {lastRun.executedAt}
          </p>
          <BatchSummaryCards run={lastRun} />
          <h3>세대별 배치 결과</h3>
          <BatchResultTable results={latestResults} />
        </>
      )}
    </section>
  );
}
