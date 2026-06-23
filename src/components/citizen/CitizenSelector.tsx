import { useApp } from '../../store/AppContext';

// 시연용 국민 선택 (로그인 대체)
// onlyVulnerable: 주민센터 대리신청용 — IT 약자(고령/장애) 위주로 노출
export function CitizenSelector({
  onlyVulnerable = false,
  label = '시연용 국민 선택',
}: {
  onlyVulnerable?: boolean;
  label?: string;
}) {
  const { residents, selectedCitizenId, setSelectedCitizenId } = useApp();

  const heads = residents.filter((r) => r.relationshipToHead === '본인');
  const list = onlyVulnerable
    ? heads.filter((r) => r.age >= 65 || r.disabilityStatus !== '없음')
    : heads;

  return (
    <label className="citizen-selector">
      <span className="field-label">{label}</span>
      <select
        value={selectedCitizenId}
        onChange={(e) => setSelectedCitizenId(e.target.value)}
        aria-label={label}
      >
        <option value="">선택하세요</option>
        {list.map((r) => (
          <option key={r.citizenId} value={r.citizenId}>
            {r.name} ({r.age}세 · {r.region} · {r.householdId})
          </option>
        ))}
      </select>
    </label>
  );
}
