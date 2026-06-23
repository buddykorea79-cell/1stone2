import { useApp } from '../../store/AppContext';
import { CitizenSelector } from './CitizenSelector';
import { WelfareSearch } from './WelfareSearch';
import type { RecommendationResult } from '../../types';
import { createApplication } from '../../utils/applications';
import { getApplications, setApplications } from '../../utils/storage';
import { addNotification } from '../../utils/notifications';

// 메인/비로그인 복지 검색 + 본인 신청 화면
export function CitizenMain() {
  const { residents, selectedCitizenId, accessibility, reload } = useApp();
  const me = residents.find((r) => r.citizenId === selectedCitizenId);

  // 본인 신청 처리
  const applyHandler = (result: RecommendationResult, reason: string): string => {
    if (!me) return '먼저 시연용 국민을 선택하세요.';
    const app = createApplication({
      citizen: me,
      program: result.program,
      reason,
    });
    setApplications([app, ...getApplications()]);
    addNotification(
      me.citizenId,
      '복지 신청이 접수되었습니다.',
      `${result.program.name} 신청이 접수되었습니다.`
    );
    reload();
    return `${result.program.name} 신청이 접수되었습니다. ‘내 신청 현황’에서 확인하세요.`;
  };

  return (
    <section className="citizen-main">
      <div className="hero card">
        <span className="hero-eyebrow">대한민국 복지 통합서비스 (시연)</span>
        <h2>내 상황에 맞는 복지를 찾고, 신청하고, 처리 상태를 확인하세요.</h2>
        <p className="muted">
          복지 ONE-GOV 는 흩어져 있는 중앙부처·지자체 복지를 한곳에서
          검색·신청하고, 세대정보 기반으로 받을 수 있는 복지를 자동으로
          판정하는 통합 플랫폼입니다. 로그인 없이 검색할 수 있으며, 신청은
          아래에서 시연용 국민을 선택한 뒤 진행합니다.
        </p>
        <div className="hero-points">
          <span>① 한 번에 통합 검색</span>
          <span>② 세대 소득 자동 판정</span>
          <span>③ 자동연결 후보 안내</span>
        </div>
        <CitizenSelector />
      </div>

      <WelfareSearch
        applyHandler={applyHandler}
        canApply={!!me}
        cannotApplyReason="신청하려면 상단에서 시연용 국민을 먼저 선택하세요. (검색은 로그인 없이 가능)"
        intro={
          accessibility.easyMode ? (
            <p className="easy-hint">
              아래 칸에 어떤 도움이 필요한지 적고 ‘복지 찾기’를 누르세요.
            </p>
          ) : undefined
        }
      />
    </section>
  );
}
