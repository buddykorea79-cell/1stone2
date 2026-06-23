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
      {/* 깔끔한 중앙 정렬 히어로 (설명) */}
      <div className="hero">
        <span className="hero-eyebrow">✦ 대한민국 복지 통합서비스 · 시연용</span>
        <h2>
          내게 맞는 복지를 <span className="grad-text">한곳에서</span>
          <br />
          찾고, 신청하고, 자동으로 연결하세요.
        </h2>
        <p className="hero-desc">
          복지 ONE-GOV 는 중앙부처와 지자체에 흩어져 있는 복지를 한 번에
          검색·신청하고, 주민등록 세대정보를 바탕으로 받을 수 있는 복지를
          자동으로 찾아주는 국가 복지 통합 플랫폼입니다. 복잡한 자격 계산 없이,
          아래 조건만 선택하면 됩니다.
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
      </div>

      {/* 설명 아래 → 검색조건 먼저 (conditionsFirst) */}
      <WelfareSearch
        conditionsFirst
        applyHandler={applyHandler}
        canApply={!!me}
        cannotApplyReason="신청하려면 상단에서 시연용 국민을 먼저 선택하세요. (검색은 로그인 없이 가능)"
        intro={
          accessibility.easyMode ? (
            <p className="easy-hint">
              아래에서 조건을 선택하고 ‘이 조건으로 복지 찾기’를 누르세요.
            </p>
          ) : undefined
        }
      />

      {/* 신청용 시연 국민 선택 (검색조건 아래에 배치) */}
      <div className="card start-card">
        <strong className="start-title">신청까지 체험하기</strong>
        <p className="muted">
          복지 검색은 로그인 없이 가능합니다. 신청하려면 시연용 국민을
          선택하세요.
        </p>
        <CitizenSelector />
      </div>
    </section>
  );
}
