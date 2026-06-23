// 복지사업별 신청 현황 표
export function ProgramStatsTable({
  stats,
}: {
  stats: { name: string; count: number }[];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>복지사업</th>
            <th>신청 건수</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.name}>
              <td>{s.name}</td>
              <td>{s.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
