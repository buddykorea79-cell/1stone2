import type { IncomeLevel } from '../../types';
import { getIncomeLevelLabel } from '../../utils/conditionRules';

// 소득구간 표시 배지 (재사용)
export function IncomeLevelBadge({ level }: { level: IncomeLevel }) {
  return (
    <span className={`income-level-badge level-${level}`}>
      {level} · {getIncomeLevelLabel(level)}
    </span>
  );
}
