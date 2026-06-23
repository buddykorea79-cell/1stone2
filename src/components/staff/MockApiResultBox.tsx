import type { MockApiResult } from '../../types';

// 담당자 신청 상세의 mock API 확인 결과 박스
export function MockApiResultBox({ result }: { result: MockApiResult }) {
  const rows: { label: string; value: string }[] = [
    { label: '소득 기준', value: result.incomeCheck },
    { label: '세대 정보', value: result.householdInfo },
    { label: '중복 수급', value: result.duplicateBenefit },
    { label: '주소지', value: result.addressCheck },
    { label: '신청 이력', value: result.applicationHistory },
  ];
  return (
    <div className="card mock-api-box">
      <h4>
        가상 API 확인 결과
        <span className="mock-tag">mock · 향후 정부 API 연계 예정</span>
      </h4>
      <dl className="detail-dl">
        {rows.map((r) => (
          <div className="kv-row" key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
