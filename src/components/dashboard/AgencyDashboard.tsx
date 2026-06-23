import { useApp } from '../../store/AppContext';
import { SummaryCards } from './SummaryCards';
import { ProgramStatsTable } from './ProgramStatsTable';
import { countByProgram, countByStatus } from '../../utils/stats';

// 기관 총괄 대시보드
export function AgencyDashboard() {
  const { applications, programs, batchRuns, auditLogs } = useApp();
  const status = countByStatus(applications);
  const lastRun = batchRuns[0];

  const householdEdits = auditLogs.filter(
    (l) => l.action === '세대정보 수정'
  ).length;

  const cards = [
    { label: '전체 신청', value: applications.length },
    { label: '접수됨', value: status.submitted, cls: 'level-L4' },
    { label: '심사중', value: status.reviewing, cls: 'level-L3' },
    { label: '승인', value: status.approved, cls: 'level-L5' },
    { label: '반려', value: status.rejected, cls: 'level-LN' },
    { label: '보완요청', value: status.need_more_info, cls: 'level-L3' },
    {
      label: '자동연결 후보',
      value: status.auto_candidate,
      cls: 'level-L5',
    },
    { label: '세대정보 변경', value: householdEdits },
  ];

  return (
    <section>
      <h2>기관 대시보드</h2>
      <SummaryCards cards={cards} />

      <div className="card">
        <h4>배치 실행 현황</h4>
        {lastRun ? (
          <p>
            마지막 배치: {lastRun.batchId} · {lastRun.executedAt} · 자동 생성
            신청 {lastRun.createdApplicationCount}건 (후보{' '}
            {lastRun.autoCandidateCount}세대)
          </p>
        ) : (
          <p className="muted">실행된 배치가 없습니다.</p>
        )}
      </div>

      <h3>복지사업별 신청 현황</h3>
      <ProgramStatsTable stats={countByProgram(applications, programs)} />
    </section>
  );
}
