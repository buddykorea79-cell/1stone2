import { useState } from 'react';

// 자연어 질의 입력창 (키워드 분석은 상위에서 수행)
export function NaturalLanguageInput({
  onSearch,
  easyMode,
}: {
  onSearch: (text: string) => void;
  easyMode: boolean;
}) {
  const [text, setText] = useState('');

  return (
    <div className="nl-input card">
      <label className="field-label" htmlFor="nl-query">
        {easyMode
          ? '어떤 도움이 필요한지 편하게 적어 주세요.'
          : '자연어로 상황을 입력하세요'}
      </label>
      <textarea
        id="nl-query"
        rows={2}
        value={text}
        placeholder="예: 혼자 사는 70세입니다. 생활비와 돌봄 지원을 받을 수 있나요?"
        onChange={(e) => setText(e.target.value)}
      />
      <button className="primary-button big" onClick={() => onSearch(text)}>
        복지 찾기
      </button>
    </div>
  );
}
