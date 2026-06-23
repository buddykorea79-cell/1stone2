import { useApp } from '../../store/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import { AccessibilityControls } from '../accessibility/AccessibilityControls';
import { t } from '../../utils/i18n';

// 상단 헤더: 서비스명 + 역할선택 + 접근성
export function Header() {
  const { accessibility } = useApp();
  const lang = accessibility.language;
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-logo">복지</span>
          <div>
            <h1 className="brand-name">{t('appName', lang)}</h1>
            <p className="brand-sub">세대정보 기반 복지 자동판정 프로토타입</p>
          </div>
        </div>
        <RoleSwitcher />
      </div>
      <AccessibilityControls />
    </header>
  );
}
