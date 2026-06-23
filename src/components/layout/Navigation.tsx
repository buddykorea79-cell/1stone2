import { useApp } from '../../store/AppContext';
import { getScreensForRole, SCREEN_LABELS } from '../../utils/roles';

// 역할별 접근 가능 화면 메뉴
export function Navigation() {
  const { role, screen, setScreen } = useApp();
  const screens = getScreensForRole(role);

  return (
    <nav className="main-nav" aria-label="주요 메뉴">
      {screens.map((s) => (
        <button
          key={s}
          className={`nav-btn ${screen === s ? 'active' : ''}`}
          onClick={() => setScreen(s)}
          aria-current={screen === s ? 'page' : undefined}
        >
          {SCREEN_LABELS[s]}
        </button>
      ))}
    </nav>
  );
}
