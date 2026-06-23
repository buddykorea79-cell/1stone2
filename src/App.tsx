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
        복지루틴 프로토타입 · 모든 데이터는 가상이며 실제 개인정보가 아닙니다 ·
        실제 인증/정부 API/지급/알림 발송은 mock 처리됩니다.
      </footer>
    </div>
  );
}
