import { useApp } from '../../store/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import { AccessibilityControls } from '../accessibility/AccessibilityControls';
import { GovBanner } from './GovBanner';
import { t } from '../../utils/i18n';

// 상단 헤더: 정부 식별바 + 서비스명 + 역할선택 + 접근성
export function Header() {
  const { accessibility } = useApp();
  const lang = accessibility.language;
  return (
    <header className="app-header">
      <GovBanner />
      <div className="header-top">
        <div className="brand">
          <span className="brand-logo" aria-hidden>
            ❀
          </span>
          <div>
            <h1 className="brand-name">{t('appName', lang)}</h1>
            <p className="brand-sub">
              세대정보 기반 복지 자동판정 통합 플랫폼
            </p>
          </div>
        </div>
        <RoleSwitcher />
      </div>
      <AccessibilityControls />
    </header>
  );
}
