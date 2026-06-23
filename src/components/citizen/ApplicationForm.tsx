import { useState } from 'react';

// 신청 사유 입력 + 신청 버튼 (본인/대리 공통 사용 가능)
export function ApplicationForm({
  disabled,
  disabledReason,
  onSubmit,
  submitLabel = '신청하기',
}: {
  disabled?: boolean;
  disabledReason?: string;
  onSubmit: (reason: string) => void;
  submitLabel?: string;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="application-form">
      <label className="field-label" htmlFor="apply-reason">
        신청 사유
      </label>
      <textarea
        id="apply-reason"
        rows={3}
        value={reason}
        placeholder="예: 생활비가 부족해서 지원을 받고 싶습니다."
        onChange={(e) => setReason(e.target.value)}
      />
      {disabled && disabledReason && (
        <p className="form-warning">{disabledReason}</p>
      )}
      <button
        className="primary-button"
        disabled={disabled || reason.trim().length === 0}
        onClick={() => onSubmit(reason.trim())}
      >
        {submitLabel}
      </button>
    </div>
  );
}
