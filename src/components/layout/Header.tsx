import { useApp } from '../../store/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import { AccessibilityControls } from '../accessibility/AccessibilityControls';
import { t } from '../../utils/i18n';

// 상단 네비게이션 바: 브랜드 + 역할선택 + 접근성 (깔끔한 톤)
export function Header() {
  const { accessibility } = useApp();
  const lang = accessibility.language;
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-logo" aria-hidden>
            ◈
          </span>
          <div>
            <h1 className="brand-name">{t('appName', lang)}</h1>
            <p className="brand-sub">복지 통합서비스 · 시연용 프로토타입</p>
          </div>
        </div>
        <div className="header-actions">
          <AccessibilityControls />
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
