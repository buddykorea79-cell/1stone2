import { useState } from 'react';
import type { WelfareProgram } from '../../types';
import { setWelfarePrograms } from '../../utils/storage';

// 복지사업 JSON 편집기 (parse 오류/필수필드 검증)
export function WelfareProgramJsonEditor({
  programs,
  onSaved,
}: {
  programs: WelfareProgram[];
  onSaved: () => void;
}) {
  const [text, setText] = useState(JSON.stringify(programs, null, 2));
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // 필수 필드 검증: programId/program_id, name, category, conditions, benefit/target
  const validate = (arr: any[]): string | null => {
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      const id = p.programId ?? p.program_id;
      if (!id) return `${i + 1}번 항목: programId(또는 program_id)가 없습니다.`;
      if (!p.name) return `${id}: name 이 없습니다.`;
      if (!p.category) return `${id}: category 가 없습니다.`;
      if (!p.conditions) return `${id}: conditions 가 없습니다.`;
      if (!p.benefit && !p.target)
        return `${id}: benefit 또는 target 이 필요합니다.`;
    }
    return null;
  };

  const handleSave = () => {
    setError('');
    setOk('');
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(`JSON 파싱 오류: ${(e as Error).message}`);
      return;
    }
    if (!Array.isArray(parsed)) {
      setError('최상위 구조는 배열이어야 합니다.');
      return;
    }
    const v = validate(parsed);
    if (v) {
      setError(v);
      return;
    }
    setWelfarePrograms(parsed as WelfareProgram[]);
    setOk('복지사업 데이터를 저장했습니다.');
    onSaved();
  };

  return (
    <div className="card">
      <h4>복지사업 JSON 편집</h4>
      <p className="muted">
        welfarePrograms 전체를 JSON 으로 편집합니다. 저장 시 필수 필드를
        검증합니다.
      </p>
      <textarea
        className="json-editor"
        rows={16}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      {error && <p className="form-error">{error}</p>}
      {ok && <p className="toast-success">{ok}</p>}
      <button className="primary-button" onClick={handleSave}>
        저장
      </button>
    </div>
  );
}
