import { useApp } from '../../store/AppContext';
import { SCREEN_INFO } from '../../utils/screenInfo';

// 화면별 안내 패널 (무슨 화면인지 / 어떻게 쓰는지 설명)
export function ScreenInfo() {
  const { screen } = useApp();
  const info = SCREEN_INFO[screen];
  if (!info) return null;

  return (
    <div className="screen-info" role="note">
      <div className="screen-info-icon" aria-hidden>
        ⓘ
      </div>
      <div className="screen-info-body">
        <strong className="screen-info-title">{info.title} 안내</strong>
        <p>{info.desc}</p>
        {info.steps && (
          <ol className="screen-info-steps">
            {info.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
