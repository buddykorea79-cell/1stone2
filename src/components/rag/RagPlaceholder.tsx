import { useState } from 'react';

// 복지문서 기반 검색(RAG) 준비 화면
// ⚠️ 실제 RAG 서비스는 구현하지 않는다. UI placeholder 만 제공.
export function RagPlaceholder() {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  return (
    <section>
      <h2>복지문서 기반 검색</h2>
      <div className="card">
        <p className="muted">
          이 영역은 향후 RAG 서비스와 연계될 예정입니다.
        </p>
        <label className="field-label" htmlFor="rag-query">
          검색어
        </label>
        <input
          id="rag-query"
          type="text"
          value={query}
          placeholder="예: 기초생활보장 신청 조건을 알려줘"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="primary-button"
          onClick={() =>
            setMessage(
              '현재 프로토타입에서는 RAG 검색 UI만 제공합니다. 추후 별도 서비스와 연계됩니다.'
            )
          }
        >
          RAG 검색 준비
        </button>
        {message && <div className="toast-info">{message}</div>}
      </div>
    </section>
  );
}
