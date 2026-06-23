import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { HouseholdList } from './HouseholdList';
import { HouseholdDetail } from './HouseholdDetail';

// 세대정보 관리 화면 (목록 + 상세/수정)
export function HouseholdManagement() {
  const { households } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = households.find((h) => h.householdId === selectedId);

  if (selected) {
    return (
      <HouseholdDetail household={selected} onBack={() => setSelectedId(null)} />
    );
  }

  return (
    <section>
      <h2>세대정보 관리</h2>
      <p className="muted">
        세대원 월소득과 세대 지역을 수정할 수 있습니다. 저장 시 세대 총소득과
        소득구간이 재계산되고 감사로그에 기록됩니다.
      </p>
      <HouseholdList
        households={households}
        onSelect={(h) => setSelectedId(h.householdId)}
      />
    </section>
  );
}
