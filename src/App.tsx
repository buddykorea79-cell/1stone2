import { useApp } from './store/AppContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { ScreenRouter } from './components/layout/ScreenRouter';

// App: 역할/선택국민/화면 상태는 AppContext 가 관리한다.
// 여기서는 레이아웃 조립과 접근성 클래스 적용만 담당.
export default function App() {
  const { accessibility } = useApp();

  const rootClass = [
    'app-root',
    accessibility.largeText ? 'large-text' : '',
    accessibility.highContrast ? 'high-contrast' : '',
    accessibility.easyMode ? 'easy-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <Header />
      <Navigation />
      <main className="app-main">
        <ScreenRouter />
      </main>
      <footer className="app-footer">
        복지 ONE-GOV 프로토타입 · 복지서비스 데이터는 복지로 공개정보를 가공한
        것이며, 주민·세대 데이터는 모두 가상입니다 · 실제 인증/정부 API/지급/알림
        발송은 mock 처리됩니다.
      </footer>
    </div>
  );
}
