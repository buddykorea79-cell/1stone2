import type { Resident } from '../../types';
import { ResidentEditor } from './ResidentEditor';

// 세대원 목록(소득 편집 가능)
export function ResidentList({
  members,
  incomeDraft,
  onIncomeChange,
}: {
  members: Resident[];
  incomeDraft: Record<string, number>;
  onIncomeChange: (residentId: string, v: number) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>나이</th>
            <th>관계</th>
            <th>욕구(needs)</th>
            <th>장애</th>
            <th>월소득(원)</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <ResidentEditor
              key={m.residentId}
              resident={m}
              income={incomeDraft[m.residentId] ?? m.monthlyIncome}
              onIncomeChange={(v) => onIncomeChange(m.residentId, v)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
