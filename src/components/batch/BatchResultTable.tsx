import type { BatchResult, BatchResultStatus } from '../../types';
import { useApp } from '../../store/AppContext';
import { IncomeLevelBadge } from '../citizen/IncomeLevelBadge';

const RESULT_LABELS: Record<BatchResultStatus, string> = {
  auto_candidate: '자동연결 후보',
  high_possibility: '수급 가능성 높음',
  need_review: '조건 확인 필요',
  info_only: '정보 안내 대상',
  not_matched: '기준 초과/미충족',
};

const RESULT_COLORS: Record<BatchResultStatus, string> = {
  auto_candidate: 'badge-purple',
  high_possibility: 'badge-green',
  need_review: 'badge-amber',
  info_only: 'badge-blue',
  not_matched: 'badge-red',
};

// 배치 결과 표
export function BatchResultTable({ results }: { results: BatchResult[] }) {
  const { programs } = useApp();
  const nameOf = (id: string) =>
    programs.find((p) => p.programId === id)?.name ?? id;

  if (results.length === 0) {
    return <div className="card empty-state">배치 결과가 없습니다.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>세대 ID</th>
            <th>세대원 수</th>
            <th>총소득</th>
            <th>소득구간</th>
            <th>판정 결과</th>
            <th>추천 복지</th>
            <th>자동 신청</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.householdId}>
              <td>{r.householdId}</td>
              <td>{r.householdSize}인</td>
              <td>{r.totalMonthlyIncome.toLocaleString()}원</td>
              <td>
                <IncomeLevelBadge level={r.incomeLevel} />
              </td>
              <td>
                <span className={`status-badge ${RESULT_COLORS[r.resultStatus]}`}>
                  {RESULT_LABELS[r.resultStatus]}
                </span>
              </td>
              <td>
                {r.recommendedPrograms.length
                  ? r.recommendedPrograms.map(nameOf).join(', ')
                  : '-'}
              </td>
              <td>{r.createdApplicationIds.length}건</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
