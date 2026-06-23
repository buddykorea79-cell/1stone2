// 통계 요약 카드 그리드 (재사용)
export function SummaryCards({
  cards,
}: {
  cards: { label: string; value: number | string; cls?: string }[];
}) {
  return (
    <div className="dashboard-grid">
      {cards.map((c) => (
        <div key={c.label} className={`card stat-card ${c.cls ?? ''}`}>
          <span className="stat-value">{c.value}</span>
          <span className="stat-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
