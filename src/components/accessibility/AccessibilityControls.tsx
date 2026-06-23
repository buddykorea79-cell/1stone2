import { useApp } from '../../store/AppContext';
import type { AccessibilitySettings } from '../../types';

const LANGS: { value: AccessibilitySettings['language']; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'vi', label: 'Tiếng Việt' },
];

// 접근성 옵션: 글자 크게 / 고대비 / 쉬운 말 / 다국어
export function AccessibilityControls() {
  const { accessibility, setAccessibility } = useApp();

  const toggle = (key: keyof AccessibilitySettings) => {
    setAccessibility({ ...accessibility, [key]: !accessibility[key] });
  };

  return (
    <div className="accessibility-controls" role="group" aria-label="접근성 설정">
      <button
        className={`a11y-btn ${accessibility.largeText ? 'active' : ''}`}
        onClick={() => toggle('largeText')}
        aria-pressed={accessibility.largeText}
      >
        가 글자 크게
      </button>
      <button
        className={`a11y-btn ${accessibility.highContrast ? 'active' : ''}`}
        onClick={() => toggle('highContrast')}
        aria-pressed={accessibility.highContrast}
      >
        ◐ 고대비
      </button>
      <button
        className={`a11y-btn ${accessibility.easyMode ? 'active' : ''}`}
        onClick={() => toggle('easyMode')}
        aria-pressed={accessibility.easyMode}
      >
        💬 쉬운 말
      </button>
      <select
        className="a11y-lang"
        value={accessibility.language}
        onChange={(e) =>
          setAccessibility({
            ...accessibility,
            language: e.target.value as AccessibilitySettings['language'],
          })
        }
        aria-label="언어 선택"
      >
        {LANGS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
