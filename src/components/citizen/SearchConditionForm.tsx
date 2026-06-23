import type { SearchCondition } from '../../types';
import { ALL_CATEGORIES } from '../../utils/matching';

const HOUSEHOLD_TYPES = ['1인가구', '부부', '한부모', '청년', '전체'];
const REGIONS = [
  '',
  '전북 익산시',
  '전북 전주시',
  '서울특별시 강서구',
  '서울특별시 노원구',
  '경기 수원시',
  '경기 성남시',
  '부산 해운대구',
  '대전 유성구',
];

// 주요 조건 선택 폼 (나이/지역/세대원수/가구유형/소득수준/현재상황)
export function SearchConditionForm({
  value,
  onChange,
}: {
  value: Partial<SearchCondition>;
  onChange: (v: Partial<SearchCondition>) => void;
}) {
  const set = (patch: Partial<SearchCondition>) =>
    onChange({ ...value, ...patch });

  const toggleNeed = (need: string) => {
    const cur = new Set(value.needs ?? []);
    if (cur.has(need)) cur.delete(need);
    else cur.add(need);
    set({ needs: Array.from(cur) });
  };

  return (
    <div className="condition-form card">
      <h3>주요 조건 선택</h3>
      <div className="form-grid">
        <label className="field">
          <span className="field-label">나이</span>
          <input
            type="number"
            min={0}
            value={value.age ?? ''}
            placeholder="예: 70"
            onChange={(e) =>
              set({ age: e.target.value ? Number(e.target.value) : null })
            }
          />
        </label>

        <label className="field">
          <span className="field-label">지역</span>
          <select
            value={value.region ?? ''}
            onChange={(e) => set({ region: e.target.value })}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r || '전체'}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">세대원 수</span>
          <select
            value={value.householdSize ?? ''}
            onChange={(e) =>
              set({
                householdSize: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">선택</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}인
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">가구유형</span>
          <select
            value={value.householdType ?? ''}
            onChange={(e) => set({ householdType: e.target.value })}
          >
            <option value="">선택</option>
            {HOUSEHOLD_TYPES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">소득수준</span>
          <select
            value={value.incomeHint ?? ''}
            onChange={(e) => set({ incomeHint: e.target.value })}
          >
            <option value="">선택</option>
            <option value="낮음">낮음</option>
            <option value="보통">보통</option>
            <option value="높음">높음</option>
          </select>
        </label>
      </div>

      <div className="needs-section">
        <span className="field-label">현재상황 / 주요 카테고리</span>
        <div className="chip-group">
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${value.needs?.includes(c) ? 'chip-on' : ''}`}
              onClick={() => toggleNeed(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
