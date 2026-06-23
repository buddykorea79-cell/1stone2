import type { Household } from '../../types';
import { IncomeLevelBadge } from '../citizen/IncomeLevelBadge';

// 세대 목록 표
export function HouseholdList({
  households,
  onSelect,
}: {
  households: Household[];
  onSelect: (h: Household) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>세대 ID</th>
            <th>지역</th>
            <th>세대원 수</th>
            <th>세대 총소득</th>
            <th>소득구간</th>
            <th>마지막 판정일</th>
            <th>상세/수정</th>
          </tr>
        </thead>
        <tbody>
          {households.map((h) => (
            <tr key={h.householdId}>
              <td>{h.householdId}</td>
              <td>{h.region}</td>
              <td>{h.householdSize}인</td>
              <td>{h.totalMonthlyIncome.toLocaleString()}원</td>
              <td>
                <IncomeLevelBadge level={h.incomeLevel} />
              </td>
              <td>{h.lastCheckedAt ?? '미판정'}</td>
              <td>
                <button
                  className="secondary-button small"
                  onClick={() => onSelect(h)}
                >
                  상세/수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
