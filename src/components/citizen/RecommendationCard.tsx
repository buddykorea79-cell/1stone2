import type { RecommendationResult } from '../../types';

// 추천 복지사업 카드 (점수/가능성/이유 표시)
export function RecommendationCard({
  result,
  onSelect,
}: {
  result: RecommendationResult;
  onSelect: () => void;
}) {
  const { program, score, eligibility, reasons } = result;
  const cls =
    eligibility === '높음'
      ? 'elig-high'
      : eligibility === '보통'
      ? 'elig-mid'
      : 'elig-low';

  return (
    <div className={`card rec-card ${cls}`}>
      <div className="rec-card-head">
        <div>
          <h4>{program.name}</h4>
          <span className="rec-category">{program.category}</span>
          {program.source && (
            <span className="source-badge">
              {program.source === '지자체'
                ? `지자체 · ${program.regionSido || '지역'}`
                : '중앙부처'}
            </span>
          )}
        </div>
        <div className="rec-elig">
          <span className={`elig-badge ${cls}`}>받을 가능성 {eligibility}</span>
          <span className="rec-score">점수 {score}</span>
        </div>
      </div>
      {program.agencyId && (
        <p className="rec-agency">담당: {program.agencyId}</p>
      )}
      <p className="rec-benefit">{program.summary || program.benefit}</p>
      <ul className="rec-reasons">
        {reasons.map((r, i) => (
          <li key={i}>· {r}</li>
        ))}
      </ul>
      <button className="secondary-button" onClick={onSelect}>
        자세히 보기 / 신청하기
      </button>
    </div>
  );
}
