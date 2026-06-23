import { useApp } from '../../store/AppContext';
import { CitizenSelector } from './CitizenSelector';
import { WelfareSearch } from './WelfareSearch';
import type { RecommendationResult } from '../../types';
import { createApplication } from '../../utils/applications';
import { getApplications, setApplications } from '../../utils/storage';
import { addNotification } from '../../utils/notifications';

// 메인/비로그인 복지 검색 + 본인 신청 화면
export function CitizenMain() {
  const { residents, households, programs, selectedCitizenId, accessibility, reload } =
    useApp();
  const me = residents.find((r) => r.citizenId === selectedCitizenId);
  const programCount = programs.length;
  const householdCount = households.length;

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
        <span className="hero-eyebrow">★ 대한민국 복지 통합서비스 (시연)</span>
        <h2>
          흩어진 복지, 이제 한곳에서.
          <br />
          신청은 쉽게, 판정은 자동으로.
        </h2>
        <p className="hero-desc">
          복지 ONE-GOV 는 중앙부처와 지자체에 흩어져 있는 복지를 한 번에
          검색·신청하고, 주민등록 세대정보를 바탕으로 <strong>받을 수 있는
          복지를 자동으로 찾아주는</strong> 국가 복지 통합 플랫폼입니다.
          복잡한 자격 계산 없이, 내 상황만 입력하면 됩니다.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <b>{programCount.toLocaleString()}</b>
            <span>연계 복지서비스</span>
          </div>
          <div className="hero-stat">
            <b>{householdCount.toLocaleString()}</b>
            <span>관리 세대</span>
          </div>
          <div className="hero-stat">
            <b>6단계</b>
            <span>소득구간 자동판정</span>
          </div>
          <div className="hero-stat">
            <b>월 1회</b>
            <span>자동연결 배치</span>
          </div>
        </div>
        <div className="hero-points">
          <span>① 한 번에 통합 검색</span>
          <span>② 세대 소득 자동 판정</span>
          <span>③ 자동연결 후보 안내</span>
        </div>
      </div>

      <div className="card start-card">
        <strong className="start-title">지금 바로 시작하기</strong>
        <p className="muted">
          복지 검색은 로그인 없이 가능합니다. 신청까지 체험하려면 아래에서
          시연용 국민을 선택하세요.
        </p>
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
