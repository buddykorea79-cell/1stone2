import type { RecommendationResult } from '../../types';
import { RecommendationCard } from './RecommendationCard';

// 추천 결과 목록 화면
export function RecommendationList({
  results,
  onSelect,
}: {
  results: RecommendationResult[];
  onSelect: (r: RecommendationResult) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="card empty-state">
        조건에 맞는 복지를 찾지 못했습니다. 조건을 바꾸어 다시 검색해 보세요.
      </div>
    );
  }
  return (
    <div className="rec-list">
      <p className="rec-count">총 {results.length}건의 복지를 추천합니다.</p>
      {results.map((r) => (
        <RecommendationCard
          key={r.program.programId}
          result={r}
          onSelect={() => onSelect(r)}
        />
      ))}
    </div>
  );
}
