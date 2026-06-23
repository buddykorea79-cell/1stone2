// 정부 서비스 형태의 상단 식별 바 (공신력 있는 디자인 요소)
// ⚠️ 실제 정부 사이트가 아닌 시연용 프로토타입임을 함께 명시한다.
export function GovBanner() {
  return (
    <div className="gov-bar">
      <div className="gov-bar-inner">
        <span className="gov-emblem" aria-hidden>
          ❀
        </span>
        <span className="gov-bar-text">
          이 서비스는 <strong>대한민국 정부</strong> 복지 통합서비스 형태로
          설계된 <strong>시연용 프로토타입</strong>입니다.
        </span>
        <span className="gov-bar-right">복지로 데이터 기반 · 가상 데이터</span>
      </div>
    </div>
  );
}
