import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Application } from '../../types';
import { ApplicationStatusBadge } from '../citizen/ApplicationStatusBadge';
import { applicantTypeLabel } from '../../utils/applications';
import { StaffApplicationDetail } from './StaffApplicationDetail';

// 복지 담당자 신청 관리 화면 (목록 + 상세)
export function StaffApplications() {
  const { applications, currentStaffName } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const selected = applications.find((a) => a.applicationId === selectedId);

  if (selected) {
    return (
      <StaffApplicationDetail
        application={selected}
        staffName={currentStaffName}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const filtered: Application[] =
    filter === 'all'
      ? applications
      : applications.filter((a) => a.applicantType === filter);

  return (
    <section>
      <h2>신청 관리</h2>
      <div className="filter-bar">
        {[
          { k: 'all', label: '전체' },
          { k: 'citizen', label: '본인' },
          { k: 'delegated', label: '대리' },
          { k: 'batch', label: '배치후보' },
        ].map((f) => (
          <button
            key={f.k}
            className={`chip ${filter === f.k ? 'chip-on' : ''}`}
            onClick={() => setFilter(f.k)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="card empty-state">신청 내역이 없습니다.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>신청번호</th>
                <th>신청자</th>
                <th>세대 ID</th>
                <th>복지명</th>
                <th>신청일</th>
                <th>유형</th>
                <th>상태</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.applicationId}>
                  <td>{a.applicationId.slice(0, 12)}</td>
                  <td>{a.applicantName}</td>
                  <td>{a.householdId}</td>
                  <td>{a.programName}</td>
                  <td>{a.createdAt}</td>
                  <td>{applicantTypeLabel(a.applicantType)}</td>
                  <td>
                    <ApplicationStatusBadge status={a.status} />
                  </td>
                  <td>
                    <button
                      className="secondary-button small"
                      onClick={() => setSelectedId(a.applicationId)}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
