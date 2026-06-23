import { useState } from 'react';
import type { Application, ApplicationStatus } from '../../types';
import {
  SELECTABLE_STATUSES,
  STATUS_LABELS,
} from '../../utils/applications';

// 신청 상태 변경 + 담당자 의견 저장
export function ApplicationStatusEditor({
  application,
  onSave,
}: {
  application: Application;
  onSave: (status: ApplicationStatus, comment: string) => void;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [comment, setComment] = useState(application.staffComment);

  return (
    <div className="card status-editor">
      <h4>상태 변경 / 담당자 처리</h4>
      <label className="field">
        <span className="field-label">처리 상태</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
        >
          {SELECTABLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      {(status === 'payment_ready' || status === 'payment_done') && (
        <p className="form-warning">
          지급 처리는 실제 지급 없이 mock 으로만 표시됩니다. (향후 연계 예정)
        </p>
      )}
      <label className="field">
        <span className="field-label">담당자 의견</span>
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="처리 내용을 입력하세요."
        />
      </label>
      <button className="primary-button" onClick={() => onSave(status, comment)}>
        저장
      </button>
    </div>
  );
}
