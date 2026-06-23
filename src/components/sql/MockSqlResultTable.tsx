import type { Resident } from '../../types';

// mock SQL 조회 결과 표
export function MockSqlResultTable({ rows }: { rows: Resident[] }) {
  if (rows.length === 0) {
    return <div className="card empty-state">조회 결과가 없습니다.</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>주민ID</th>
            <th>이름(가상)</th>
            <th>나이</th>
            <th>지역</th>
            <th>세대 ID</th>
            <th>월소득</th>
            <th>욕구</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.residentId}>
              <td>{r.residentId}</td>
              <td>{r.name}</td>
              <td>{r.age}세</td>
              <td>{r.region}</td>
              <td>{r.householdId}</td>
              <td>{r.monthlyIncome.toLocaleString()}원</td>
              <td>{r.needs.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
