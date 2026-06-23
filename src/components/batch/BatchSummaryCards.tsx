import type { BatchRun } from '../../types';

// 배치 실행 요약 카드
export function BatchSummaryCards({ run }: { run: BatchRun }) {
  const cards = [
    { label: '대상 세대', value: run.totalHouseholds, cls: '' },
    { label: '자동연결 후보', value: run.autoCandidateCount, cls: 'level-L5' },
    { label: '수급 가능성 높음', value: run.highPossibilityCount, cls: 'level-L4' },
    { label: '조건 확인 필요', value: run.needReviewCount, cls: 'level-L3' },
    { label: '정보 안내 대상', value: run.infoOnlyCount, cls: 'level-L1' },
    { label: '기준 초과/미충족', value: run.notMatchedCount, cls: 'level-LN' },
    { label: '자동 생성 신청', value: run.createdApplicationCount, cls: 'level-L5' },
  ];
  return (
    <div className="dashboard-grid">
      {cards.map((c) => (
        <div key={c.label} className={`card stat-card ${c.cls}`}>
          <span className="stat-value">{c.value}</span>
          <span className="stat-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
