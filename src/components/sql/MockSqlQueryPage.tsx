import { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import {
  executeMockSqlAgainstResidents,
  generateMockSql,
  parseSqlQueryIntent,
} from '../../utils/mockSql';
import { MockSqlResultTable } from './MockSqlResultTable';
import type { IncomeLevel, Resident } from '../../types';

// AI 조건 조회 SQL 생성 화면 (mock)
export function MockSqlQueryPage() {
  const { residents, households } = useApp();
  const [text, setText] = useState('');
  const [sql, setSql] = useState('');
  const [rows, setRows] = useState<Resident[] | null>(null);

  // 세대 → 소득구간/세대원수 매핑
  const { levelById, sizeById } = useMemo(() => {
    const levelById: Record<string, IncomeLevel> = {};
    const sizeById: Record<string, number> = {};
    households.forEach((h) => {
      levelById[h.householdId] = h.incomeLevel;
      sizeById[h.householdId] = h.householdSize;
    });
    return { levelById, sizeById };
  }, [households]);

  const handleGenerate = () => {
    const intent = parseSqlQueryIntent(text);
    setSql(generateMockSql(intent));
    setRows(
      executeMockSqlAgainstResidents(residents, intent, levelById, sizeById)
    );
  };

  return (
    <section>
      <h2>AI 조건 조회 SQL 생성</h2>
      <div className="card">
        <p className="muted">
          ⚠️ 실제 ChatGPT API / SQL DB 를 사용하지 않습니다. 자연어를 키워드로
          분석해 표시용 mock SQL 을 만들고, mock 데이터 배열을 filter 합니다.
        </p>
        <p className="form-warning">
          실제 서비스에서는 “구조화된 조건 JSON → 서버 검증 → 파라미터 바인딩
          SQL” 로 처리해야 하며, 사용자 입력을 SQL 문자열에 직접 이어붙이면 안
          됩니다. (SQL Injection 방어)
        </p>
        <label className="field-label" htmlFor="sql-nl">
          자연어 입력
        </label>
        <textarea
          id="sql-nl"
          rows={2}
          value={text}
          placeholder="예: 서울에 사는 65세 이상 1인가구 중 소득이 낮은 사람을 찾아줘"
          onChange={(e) => setText(e.target.value)}
        />
        <button className="primary-button" onClick={handleGenerate}>
          SQL 생성
        </button>
      </div>

      {sql && (
        <div className="card">
          <h4>생성된 SQL (표시용 mock)</h4>
          <pre className="sql-block">{sql}</pre>
        </div>
      )}

      {rows && (
        <>
          <h3>조회 결과 ({rows.length}건)</h3>
          <MockSqlResultTable rows={rows} />
        </>
      )}
    </section>
  );
}
