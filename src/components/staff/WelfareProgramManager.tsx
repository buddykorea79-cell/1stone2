import { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { WelfareProgramJsonEditor } from './WelfareProgramJsonEditor';
import { setWelfarePrograms } from '../../utils/storage';
import type { WelfareProgram } from '../../types';

// 복지사업 관리 화면 (목록 + 검색 + JSON 편집 조합)
export function WelfareProgramManager() {
  const { programs, reload } = useApp();
  const [mode, setMode] = useState<'list' | 'json'>('list');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('전체');

  const editable = useMemo(() => programs.filter((p) => !p.source), [programs]);
  const real = useMemo(() => programs.filter((p) => p.source), [programs]);

  const categories = useMemo(
    () => ['전체', ...Array.from(new Set(programs.map((p) => p.category)))],
    [programs]
  );

  const filtered = useMemo(() => {
    const kw = q.trim();
    return programs.filter(
      (p) =>
        (cat === '전체' || p.category === cat) &&
        (kw === '' ||
          p.name.includes(kw) ||
          p.agencyId.includes(kw) ||
          (p.summary ?? '').includes(kw))
    );
  }, [programs, q, cat]);

  // JSON 편집 저장: 직접등록(편집본) + 실데이터 병합
  const handlePersist = (parsed: WelfareProgram[]) => {
    setWelfarePrograms([...parsed, ...real]);
    reload();
  };

  return (
    <section>
      <h2>복지사업 관리</h2>
      <p className="muted">
        복지로 실데이터 {real.length}건 + 직접 등록 {editable.length}건 = 총{' '}
        {programs.length}건의 복지사업을 조회·관리합니다.
      </p>
      <div className="filter-bar">
        <button
          className={`chip ${mode === 'list' ? 'chip-on' : ''}`}
          onClick={() => setMode('list')}
        >
          목록 보기
        </button>
        <button
          className={`chip ${mode === 'json' ? 'chip-on' : ''}`}
          onClick={() => setMode('json')}
        >
          JSON 편집
        </button>
      </div>

      {mode === 'list' ? (
        <>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">검색 (복지명/기관/요약)</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="예: 돌봄, 청년, 국민연금공단"
              />
            </label>
            <label className="field">
              <span className="field-label">카테고리</span>
              <select value={cat} onChange={(e) => setCat(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="muted">검색 결과 {filtered.length}건 (최대 100건 표시)</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>복지명</th>
                  <th>카테고리</th>
                  <th>담당 기관</th>
                  <th>구분</th>
                  <th>대상 소득구간</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((p) => (
                  <tr key={p.programId}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.agencyId}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          p.source === '지자체' ? 'badge-teal' : 'badge-blue'
                        }`}
                      >
                        {p.source ?? '직접등록'}
                      </span>
                    </td>
                    <td>{p.conditions.incomeLevels.join(', ')}</td>
                    <td>
                      <span className="status-badge badge-green">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <WelfareProgramJsonEditor
          editablePrograms={editable}
          onPersist={handlePersist}
        />
      )}
    </section>
  );
}
