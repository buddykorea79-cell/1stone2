import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { WelfareProgramJsonEditor } from './WelfareProgramJsonEditor';

// 복지사업 관리 화면 (목록 + JSON 편집 조합)
export function WelfareProgramManager() {
  const { programs, reload } = useApp();
  const [mode, setMode] = useState<'list' | 'json'>('list');

  return (
    <section>
      <h2>복지사업 관리</h2>
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>복지명</th>
                <th>카테고리</th>
                <th>담당 기관</th>
                <th>대상 소득구간</th>
                <th>상태</th>
                <th>수정</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.programId}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.agencyId}</td>
                  <td>{p.conditions.incomeLevels.join(', ')}</td>
                  <td>
                    <span className="status-badge badge-green">{p.status}</span>
                  </td>
                  <td>
                    <button
                      className="secondary-button small"
                      onClick={() => setMode('json')}
                    >
                      JSON 수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <WelfareProgramJsonEditor
          programs={programs}
          onSaved={() => {
            reload();
          }}
        />
      )}
    </section>
  );
}
