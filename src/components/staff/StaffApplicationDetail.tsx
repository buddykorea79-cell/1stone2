import { useApp } from '../../store/AppContext';
import type { Application, ApplicationStatus } from '../../types';
import { getMockApiResults } from '../../utils/mockApi';
import { getApplications, setApplications } from '../../utils/storage';
import { addNotification } from '../../utils/notifications';
import { STATUS_LABELS, applicantTypeLabel } from '../../utils/applications';
import { IncomeLevelBadge } from '../citizen/IncomeLevelBadge';
import { ApplicationStatusBadge } from '../citizen/ApplicationStatusBadge';
import { MockApiResultBox } from './MockApiResultBox';
import { ApplicationStatusEditor } from './ApplicationStatusEditor';

// 신청 상세 + 상태 변경 화면
export function StaffApplicationDetail({
  application,
  onBack,
  staffName,
}: {
  application: Application;
  onBack: () => void;
  staffName: string;
}) {
  const { residents, households, programs, applications, reload } = useApp();

  const citizen = residents.find((r) => r.citizenId === application.citizenId);
  const household = households.find(
    (h) => h.householdId === application.householdId
  );
  const program = programs.find((p) => p.programId === application.programId);
  const mockApi = getMockApiResults(
    application,
    household,
    program,
    applications
  );

  const handleSave = (status: ApplicationStatus, comment: string) => {
    const all = getApplications();
    const updated = all.map((a) =>
      a.applicationId === application.applicationId
        ? {
            ...a,
            status,
            staffComment: comment,
            assignedTo: staffName,
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          }
        : a
    );
    setApplications(updated);
    addNotification(
      application.citizenId,
      '신청 상태가 변경되었습니다.',
      `${application.programName} 신청이 '${STATUS_LABELS[status]}'(으)로 변경되었습니다.`
    );
    reload();
    onBack();
  };

  return (
    <div className="staff-detail">
      <button className="link-button" onClick={onBack}>
        ← 신청 목록으로
      </button>
      <h2>{application.programName} 신청 상세</h2>
      <div className="detail-cols">
        <div className="card">
          <h4>신청자 기본 정보</h4>
          <dl className="detail-dl">
            <div className="kv-row">
              <dt>신청자</dt>
              <dd>
                {application.applicantName} ({applicantTypeLabel(
                  application.applicantType
                )})
              </dd>
            </div>
            <div className="kv-row">
              <dt>나이/지역</dt>
              <dd>
                {citizen ? `${citizen.age}세 · ${citizen.region}` : '-'}
              </dd>
            </div>
            <div className="kv-row">
              <dt>현재 상태</dt>
              <dd>
                <ApplicationStatusBadge status={application.status} />
              </dd>
            </div>
            {application.applicantType === 'delegated' && (
              <div className="kv-row">
                <dt>대리 정보</dt>
                <dd>
                  {application.delegatedByName} ·{' '}
                  {application.delegationReason}
                </dd>
              </div>
            )}
            <div className="kv-row">
              <dt>신청 사유</dt>
              <dd>{application.reason}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h4>세대정보 / 소득구간 판정</h4>
          {household ? (
            <dl className="detail-dl">
              <div className="kv-row">
                <dt>세대 ID</dt>
                <dd>{household.householdId}</dd>
              </div>
              <div className="kv-row">
                <dt>세대원 수</dt>
                <dd>{household.householdSize}인</dd>
              </div>
              <div className="kv-row">
                <dt>세대 총소득</dt>
                <dd>{household.totalMonthlyIncome.toLocaleString()}원</dd>
              </div>
              <div className="kv-row">
                <dt>소득구간</dt>
                <dd>
                  <IncomeLevelBadge level={household.incomeLevel} />
                </dd>
              </div>
            </dl>
          ) : (
            <p className="muted">세대정보를 찾을 수 없습니다.</p>
          )}
        </div>
      </div>

      <MockApiResultBox result={mockApi} />
      <ApplicationStatusEditor application={application} onSave={handleSave} />
    </div>
  );
}
