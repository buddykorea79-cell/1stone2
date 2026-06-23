import { useApp } from '../../store/AppContext';

// 감사로그(대리 신청 이력) 화면
export function AuditLogList({ limit }: { limit?: number }) {
  const { auditLogs } = useApp();
  const logs = limit ? auditLogs.slice(0, limit) : auditLogs;

  return (
    <section>
      <h2>대리 신청 / 감사 로그</h2>
      {logs.length === 0 ? (
        <div className="card empty-state">기록된 감사 로그가 없습니다.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>조회자</th>
                <th>대상 국민</th>
                <th>행위</th>
                <th>사유</th>
                <th>복지사업</th>
                <th>시각</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.logId}>
                  <td>
                    {l.actorName}
                    <span className="muted"> ({l.actorRole})</span>
                  </td>
                  <td>{l.targetCitizenName}</td>
                  <td>
                    <span className="status-badge badge-purple">{l.action}</span>
                  </td>
                  <td>{l.reason}</td>
                  <td>{l.programName}</td>
                  <td>{l.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
