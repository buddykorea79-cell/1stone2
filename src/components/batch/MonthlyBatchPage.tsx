import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { runMonthlyBatch } from '../../utils/batch';
import { setHouseholds } from '../../utils/storage';
import { BatchRunButton } from './BatchRunButton';
import { BatchSummaryCards } from './BatchSummaryCards';
import { BatchResultTable } from './BatchResultTable';
import type { BatchResult, BatchRun } from '../../types';

// 월 1회 복지 자동판정 배치 화면
export function MonthlyBatchPage() {
  const {
    households,
    residents,
    programs,
    applications,
    batchRuns,
    currentStaffName,
    reload,
  } = useApp();

  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    run: BatchRun;
    results: BatchResult[];
  } | null>(null);

  const lastRun = batchRuns[0];

  const handleRun = () => {
    setRunning(true);
    // 동기 실행이지만 UI 표시를 위해 약간의 지연
    setTimeout(() => {
      const out = runMonthlyBatch(
        households,
        residents,
        programs,
        applications,
        currentStaffName
      );
      // 세대 소득구간/판정일 갱신 저장
      setHouseholds(out.households);
      reload();
      setLastResult({ run: out.batchRun, results: out.batchResults });
      setRunning(false);
    }, 300);
  };

  const summaryRun = lastResult?.run ?? lastRun;

  return (
    <section>
      <h2>월 1회 복지 자동판정 배치</h2>
      <div className="card">
        <p>
          세대정보 변경사항을 확인하고, 세대 소득을 합산하여 복지 연결
          가능성을 판정합니다. (실제 스케줄러가 아닌 버튼 실행 mock)
        </p>
        <p className="muted">
          마지막 실행일: {lastRun ? lastRun.executedAt : '실행 이력 없음'}
        </p>
        <BatchRunButton onRun={handleRun} running={running} />
      </div>

      {summaryRun && (
        <>
          <h3>실행 결과 요약 ({summaryRun.batchId})</h3>
          <BatchSummaryCards run={summaryRun} />
        </>
      )}

      {lastResult && (
        <>
          <h3>세대별 배치 결과</h3>
          <BatchResultTable results={lastResult.results} />
        </>
      )}
    </section>
  );
}
