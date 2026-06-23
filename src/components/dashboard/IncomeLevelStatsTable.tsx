import type { IncomeLevel } from '../../types';
import { getIncomeLevelLabel } from '../../utils/conditionRules';

const ORDER: IncomeLevel[] = ['L5', 'L4', 'L3', 'L2', 'L1', 'LN'];

// 소득구간별 세대 수 표
export function IncomeLevelStatsTable({
  counts,
}: {
  counts: Record<IncomeLevel, number>;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>소득구간</th>
            <th>의미</th>
            <th>세대 수</th>
          </tr>
        </thead>
        <tbody>
          {ORDER.map((lv) => (
            <tr key={lv}>
              <td>
                <span className={`income-level-badge level-${lv}`}>{lv}</span>
              </td>
              <td>{getIncomeLevelLabel(lv)}</td>
              <td>{counts[lv]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
