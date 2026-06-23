// 대리 사유 입력 폼 (필수)
export function DelegationReasonForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="card">
      <label className="field-label" htmlFor="delegation-reason">
        대리 사유 (필수)
      </label>
      <textarea
        id="delegation-reason"
        rows={2}
        value={value}
        placeholder="예: 고령자로 인한 방문 신청 지원"
        onChange={(e) => onChange(e.target.value)}
      />
      {value.trim().length === 0 && (
        <p className="form-warning">대리 사유를 입력해야 대리 신청이 가능합니다.</p>
      )}
    </div>
  );
}
