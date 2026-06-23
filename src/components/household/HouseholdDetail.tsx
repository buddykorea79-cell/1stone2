import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Household } from '../../types';
import { ResidentList } from './ResidentList';
import { IncomeLevelBadge } from '../citizen/IncomeLevelBadge';
import {
  recalculateHouseholdIncome,
  updateHouseholdRegion,
} from '../../utils/residentGenerator';
import { setHouseholds, setResidents } from '../../utils/storage';
import { addAuditLog } from '../../utils/audit';

const REGIONS = [
  '전북 익산시',
  '전북 전주시',
  '서울특별시 강서구',
  '서울특별시 노원구',
  '경기 수원시',
  '경기 성남시',
  '부산 해운대구',
  '대전 유성구',
];

// 세대 상세 + 세대원 소득/세대 지역 수정
export function HouseholdDetail({
  household,
  onBack,
}: {
  household: Household;
  onBack: () => void;
}) {
  const { residents, households, reload, currentStaffName, role } = useApp();
  const members = residents.filter((r) =>
    household.members.includes(r.residentId)
  );

  const [incomeDraft, setIncomeDraft] = useState<Record<string, number>>(
    Object.fromEntries(members.map((m) => [m.residentId, m.monthlyIncome]))
  );
  const [region, setRegion] = useState(household.region);
  const [saved, setSaved] = useState('');

  const actorRole = role === 'agency_admin' ? '기관 총괄' : '복지 담당';

  const handleSave = () => {
    // 1) 세대원 소득 반영
    let newResidents = residents.map((r) =>
      incomeDraft[r.residentId] != null
        ? { ...r, monthlyIncome: incomeDraft[r.residentId] }
        : r
    );

    // 2) 지역 변경 반영
    let newHouseholds = households;
    if (region !== household.region) {
      const res = updateHouseholdRegion(
        newHouseholds,
        newResidents,
        household.householdId,
        region
      );
      newHouseholds = res.households;
      newResidents = res.residents;
    }

    // 3) 세대 소득/구간 재계산
    newHouseholds = newHouseholds.map((h) =>
      h.householdId === household.householdId
        ? recalculateHouseholdIncome(h, newResidents)
        : h
    );

    setResidents(newResidents);
    setHouseholds(newHouseholds);

    // 4) 감사로그
    addAuditLog({
      actorRole,
      actorName: currentStaffName,
      targetCitizenId: household.householdId,
      targetCitizenName: `세대 ${household.householdId}`,
      action: '세대정보 수정',
      reason: `세대원 소득/지역 수정 및 소득구간 재판정`,
      programId: '-',
      programName: '-',
    });

    reload();
    const recalced = newHouseholds.find(
      (h) => h.householdId === household.householdId
    );
    setSaved(
      `저장 완료. 총소득 ${recalced?.totalMonthlyIncome.toLocaleString()}원, 소득구간 ${
        recalced?.incomeLevel
      }(${recalced?.incomeLevelName}).`
    );
  };

  // 현재 세대(재조회로 최신 반영)
  const current =
    households.find((h) => h.householdId === household.householdId) ?? household;

  return (
    <div className="household-detail">
      <button className="link-button" onClick={onBack}>
        ← 세대 목록으로
      </button>
      <h2>세대 상세 · {current.householdId}</h2>

      <div className="card">
        <dl className="detail-dl">
          <div className="kv-row">
            <dt>세대원 수</dt>
            <dd>{current.householdSize}인</dd>
          </div>
          <div className="kv-row">
            <dt>세대 총소득</dt>
            <dd>{current.totalMonthlyIncome.toLocaleString()}원</dd>
          </div>
          <div className="kv-row">
            <dt>소득구간</dt>
            <dd>
              <IncomeLevelBadge level={current.incomeLevel} />
            </dd>
          </div>
          <div className="kv-row">
            <dt>마지막 판정일</dt>
            <dd>{current.lastCheckedAt ?? '미판정'}</dd>
          </div>
        </dl>
        <label className="field">
          <span className="field-label">세대 지역 수정</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3>세대원 목록 (월소득 수정)</h3>
      <ResidentList
        members={members}
        incomeDraft={incomeDraft}
        onIncomeChange={(id, v) =>
          setIncomeDraft((prev) => ({ ...prev, [id]: v }))
        }
      />

      {saved && <div className="toast-success">{saved}</div>}
      <button className="primary-button" onClick={handleSave}>
        저장 (총소득 재계산 · 소득구간 재판정)
      </button>
    </div>
  );
}
