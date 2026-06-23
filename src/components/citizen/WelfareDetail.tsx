import type { RecommendationResult } from '../../types';
import { ApplicationForm } from './ApplicationForm';

// 복지 상세 + 신청 화면
export function WelfareDetail({
  result,
  canApply,
  cannotApplyReason,
  onApply,
  onBack,
  submitLabel,
}: {
  result: RecommendationResult;
  canApply: boolean;
  cannotApplyReason?: string;
  onApply: (reason: string) => void;
  onBack: () => void;
  submitLabel?: string;
}) {
  const { program, reasons } = result;
  const c = program.conditions;
  return (
    <div className="card welfare-detail">
      <button className="link-button" onClick={onBack}>
        ← 추천 목록으로
      </button>
      <h2>{program.name}</h2>
      <span className="rec-category">{program.category}</span>
      {program.source && (
        <span className="source-badge">
          {program.source === '지자체'
            ? `지자체 · ${program.regionSido || '지역'}`
            : '중앙부처'}{' '}
          · 출처 복지로
        </span>
      )}
      {program.summary && <p className="detail-summary">{program.summary}</p>}

      <dl className="detail-dl">
        <dt>지원 대상</dt>
        <dd>{program.target}</dd>
        <dt>지원 내용</dt>
        <dd>{program.benefit}</dd>
        <dt>신청 방법</dt>
        <dd>{program.applyMethod}</dd>
        <dt>주요 조건</dt>
        <dd>
          나이 {c.ageMin ?? '제한없음'}~{c.ageMax ?? '제한없음'} · 소득구간{' '}
          {c.incomeLevels.join(', ')} · 가구유형 {c.householdTypes.join(', ')}
        </dd>
        <dt>필요 확인 항목</dt>
        <dd>{program.requiredChecks.join(', ')}</dd>
      </dl>

      {program.detailUrl && (
        <a
          className="link-button"
          href={program.detailUrl}
          target="_blank"
          rel="noreferrer"
        >
          복지로에서 상세 보기 ↗
        </a>
      )}

      <div className="why-box">
        <strong>추천 이유</strong>
        <ul>
          {reasons.map((r, i) => (
            <li key={i}>· {r}</li>
          ))}
        </ul>
      </div>

      <ApplicationForm
        disabled={!canApply}
        disabledReason={cannotApplyReason}
        onSubmit={onApply}
        submitLabel={submitLabel}
      />
    </div>
  );
}
