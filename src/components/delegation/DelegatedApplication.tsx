import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { CitizenSelector } from '../citizen/CitizenSelector';
import { WelfareSearch } from '../citizen/WelfareSearch';
import { DelegationReasonForm } from './DelegationReasonForm';
import type { RecommendationResult } from '../../types';
import { createDelegatedApplication } from '../../utils/applications';
import { getApplications, setApplications } from '../../utils/storage';
import { addNotification } from '../../utils/notifications';
import { addAuditLog } from '../../utils/audit';

// 주민센터 담당 대리 신청 화면
export function DelegatedApplication() {
  const { residents, selectedCitizenId, currentStaffName, reload } = useApp();
  const [reason, setReason] = useState('');
  const target = residents.find((r) => r.citizenId === selectedCitizenId);
  const hasReason = reason.trim().length > 0;

  // 대리 조회 감사로그
  const logInquiry = () => {
    if (!target || !hasReason) return;
    addAuditLog({
      actorRole: '주민센터 담당',
      actorName: currentStaffName,
      targetCitizenId: target.citizenId,
      targetCitizenName: target.name,
      action: '대리 조회',
      reason: reason.trim(),
      programId: '-',
      programName: '-',
    });
    reload();
  };

  // 대리 신청 처리
  const applyHandler = (result: RecommendationResult, applyReason: string): string => {
    if (!target) return '민원인을 먼저 선택하세요.';
    if (!hasReason) return '대리 사유를 먼저 입력하세요.';

    const app = createDelegatedApplication({
      citizen: target,
      program: result.program,
      reason: applyReason,
      delegatedByName: currentStaffName,
      delegationReason: reason.trim(),
    });
    setApplications([app, ...getApplications()]);

    // 감사로그 (대리 신청)
    addAuditLog({
      actorRole: '주민센터 담당',
      actorName: currentStaffName,
      targetCitizenId: target.citizenId,
      targetCitizenName: target.name,
      action: '대리 신청',
      reason: reason.trim(),
      programId: result.program.programId,
      programName: result.program.name,
    });

    addNotification(
      target.citizenId,
      '대리 신청이 접수되었습니다.',
      `${currentStaffName} 담당자가 ${result.program.name}을(를) 대리 신청했습니다.`
    );
    reload();
    return '조회 및 대리 신청 이력이 저장되었습니다.';
  };

  return (
    <section>
      <h2>주민센터 대리 신청</h2>
      <p className="muted">
        IT 사용이 어려운 국민을 대신해 복지를 검색하고 신청합니다. 모든 대리
        조회/신청은 감사로그에 기록됩니다.
      </p>
      <div className="card">
        <CitizenSelector
          onlyVulnerable
          label="민원인 선택 (고령/장애 우선 노출)"
        />
      </div>
      <DelegationReasonForm value={reason} onChange={setReason} />

      <WelfareSearch
        applyHandler={applyHandler}
        canApply={!!target && hasReason}
        cannotApplyReason="민원인 선택과 대리 사유 입력이 필요합니다."
        submitLabel="대리 신청하기"
        onSearch={logInquiry}
      />
    </section>
  );
}
