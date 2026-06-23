import { useApp } from '../../store/AppContext';
import { ALL_ROLES, ROLE_LABELS } from '../../utils/roles';
import type { UserRole } from '../../types';

// 상단 역할 선택 드롭다운
export function RoleSwitcher() {
  const { role, setRole } = useApp();
  return (
    <label className="role-switcher">
      <span className="role-switcher-label">역할 선택</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        aria-label="역할 선택"
      >
        {ALL_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </label>
  );
}
