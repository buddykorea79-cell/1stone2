import { useApp } from '../../store/AppContext';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { applicantTypeLabel } from '../../utils/applications';

// 내 신청 현황 (선택된 국민 기준)
export function MyApplications() {
  const { applications, selectedCitizenId, residents } = useApp();
  const me = residents.find((r) => r.citizenId === selectedCitizenId);
  const mine = applications.filter((a) => a.citizenId === selectedCitizenId);

  return (
    <section>
      <h2>내 신청 현황</h2>
      {me ? (
        <p className="muted">
          {me.name} ({me.region} · {me.householdId})
        </p>
      ) : (
        <p className="muted">상단에서 시연용 국민을 선택하세요.</p>
      )}
      {mine.length === 0 ? (
        <div className="card empty-state">아직 신청 내역이 없습니다.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>신청번호</th>
                <th>복지명</th>
                <th>신청유형</th>
                <th>상태</th>
                <th>담당자 의견</th>
                <th>신청일</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((a) => (
                <tr key={a.applicationId}>
                  <td>{a.applicationId.slice(0, 12)}</td>
                  <td>{a.programName}</td>
                  <td>{applicantTypeLabel(a.applicantType)}</td>
                  <td>
                    <ApplicationStatusBadge status={a.status} />
                  </td>
                  <td>{a.staffComment || '-'}</td>
                  <td>{a.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
