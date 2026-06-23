import type { Resident } from '../../types';

// 세대원 1명의 소득 편집 행
export function ResidentEditor({
  resident,
  income,
  onIncomeChange,
}: {
  resident: Resident;
  income: number;
  onIncomeChange: (v: number) => void;
}) {
  return (
    <tr>
      <td>{resident.name}</td>
      <td>{resident.age}세</td>
      <td>{resident.relationshipToHead}</td>
      <td>{resident.needs.join(', ') || '-'}</td>
      <td>{resident.disabilityStatus}</td>
      <td>
        <input
          type="number"
          min={0}
          step={10000}
          value={income}
          onChange={(e) => onIncomeChange(Number(e.target.value) || 0)}
          className="income-input"
        />
      </td>
    </tr>
  );
}
