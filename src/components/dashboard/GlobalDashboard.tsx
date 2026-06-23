import { useApp } from '../../store/AppContext';
import { SummaryCards } from './SummaryCards';
import { ProgramStatsTable } from './ProgramStatsTable';
import { IncomeLevelStatsTable } from './IncomeLevelStatsTable';
import { AuditLogList } from '../delegation/AuditLogList';
import {
  countByIncomeLevel,
  countByProgram,
  countByRegion,
  countByStatus,
} from '../../utils/stats';

// 복지 총괄 / 시스템 관리자 전체 대시보드
export function GlobalDashboard() {
  const { applications, programs, households, batchRuns } = useApp();
  const status = countByStatus(applications);
  const incomeLevels = countByIncomeLevel(households);
  const regions = countByRegion(households);
  const delegatedCount = applications.filter(
    (a) => a.applicantType === 'delegated'
  ).length;
  const autoCandidate =
    status.auto_candidate +
    applications.filter((a) => a.batchId != null).length;

  const cards = [
    { label: '전체 신청', value: applications.length },
    {
      label: '자동연결 후보',
      value: status.auto_candidate,
      cls: 'level-L5',
    },
    { label: '대리 신청', value: delegatedCount, cls: 'badge-purple' },
    { label: '전체 세대', value: households.length },
    { label: '배치 실행 횟수', value: batchRuns.length },
    {
      label: '자동 생성 신청(누적)',
      value: batchRuns.reduce((s, r) => s + r.createdApplicationCount, 0),
      cls: 'level-L5',
    },
  ];

  return (
    <section>
      <h2>전체 대시보드</h2>
      <SummaryCards cards={cards} />

      <div className="dashboard-2col">
        <div>
          <h3>소득구간별 세대 수</h3>
          <IncomeLevelStatsTable counts={incomeLevels} />
        </div>
        <div>
          <h3>지역별 세대 수</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>지역</th>
                  <th>세대 수</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r) => (
                  <tr key={r.region}>
                    <td>{r.region}</td>
                    <td>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h3>복지사업별 신청 현황</h3>
      <ProgramStatsTable stats={countByProgram(applications, programs)} />

      <h3>최근 감사로그 (10건)</h3>
      <AuditLogList limit={10} />
    </section>
  );
}
