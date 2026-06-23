// ============================================================
// 주민등록 가상데이터 생성 로직
// ⚠️ 모든 데이터는 가상이며 실제 개인정보가 아니다.
//    주민등록번호/실제주소/실제전화번호/실제계좌는 사용하지 않는다.
// ============================================================

import type { Household, IncomeLevel, Resident } from '../types';
import {
  calculateHouseholdTotalIncome,
  determineIncomeLevel,
  getConditionRuleByHouseholdSize,
  getIncomeLevelLabel,
} from './conditionRules';
import { nowString } from './date';

// 가상 지역 목록 (실제 상세주소 아님, 시연용)
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

// 세대 프로필 유형 (시연용 다양성 확보)
type HouseholdProfile =
  | 'elderly_single' // 고령 1인가구
  | 'youth_single' // 청년 1인가구
  | 'single_parent' // 한부모
  | 'disabled' // 장애 포함
  | 'couple' // 부부
  | 'general'; // 일반

// 목표 소득구간을 순환시켜 모든 구간(L5~LN)이 나오게 한다.
const LEVEL_CYCLE: IncomeLevel[] = ['L5', 'L4', 'L3', 'L2', 'L1', 'LN', 'L5', 'L4', 'L3'];

// 특정 세대원 수/목표 레벨에 해당하는 세대 총소득을 만든다.
function incomeForLevel(size: number, level: IncomeLevel): number {
  const rule = getConditionRuleByHouseholdSize(size);
  const lvl = rule.levels.find((l) => l.level === level)!;
  if (lvl.maxIncome == null) {
    // LN: 최소값보다 약간 높은 값
    return lvl.minIncome + 300000;
  }
  // 구간 중간값 근처
  return Math.round((lvl.minIncome + lvl.maxIncome) / 2);
}

// 전화번호 마스킹 값 (실제 번호 아님)
function maskedPhone(seq: number): string {
  return `010-****-${String(seq).padStart(4, '0')}`;
}

// 세대 구성(프로필별 멤버 나이/관계/욕구) 정의
function membersForProfile(
  profile: HouseholdProfile,
  size: number
): Array<{
  age: number;
  relationship: string;
  needs: string[];
  disability: string;
  employment: string;
  gender: string;
}> {
  const g = (i: number) => (i % 2 === 0 ? '여성' : '남성');
  switch (profile) {
    case 'elderly_single':
      return [
        {
          age: 68 + Math.floor(Math.random() * 20),
          relationship: '본인',
          needs: ['생계', '돌봄', '노인'],
          disability: '없음',
          employment: '무직',
          gender: '여성',
        },
      ];
    case 'youth_single':
      return [
        {
          age: 20 + Math.floor(Math.random() * 14),
          relationship: '본인',
          needs: ['주거', '청년', '일자리'],
          disability: '없음',
          employment: Math.random() < 0.5 ? '무직' : '재직',
          gender: '남성',
        },
      ];
    case 'single_parent': {
      const arr = [
        {
          age: 34 + Math.floor(Math.random() * 12),
          relationship: '본인',
          needs: ['생계', '아동', '주거'],
          disability: '없음',
          employment: Math.random() < 0.5 ? '무직' : '재직',
          gender: '여성',
        },
      ];
      for (let i = 1; i < size; i++) {
        arr.push({
          age: 4 + Math.floor(Math.random() * 12),
          relationship: '자녀',
          needs: ['아동'],
          disability: '없음',
          employment: '해당없음',
          gender: g(i),
        });
      }
      return arr;
    }
    case 'disabled': {
      const arr = [
        {
          age: 40 + Math.floor(Math.random() * 30),
          relationship: '본인',
          needs: ['장애인', '돌봄', '생계'],
          disability: Math.random() < 0.5 ? '지체장애' : '중증',
          employment: '무직',
          gender: g(0),
        },
      ];
      for (let i = 1; i < size; i++) {
        arr.push({
          age: 30 + Math.floor(Math.random() * 30),
          relationship: i === 1 ? '배우자' : '자녀',
          needs: ['돌봄'],
          disability: '없음',
          employment: Math.random() < 0.5 ? '재직' : '무직',
          gender: g(i),
        });
      }
      return arr;
    }
    case 'couple': {
      return [
        {
          age: 60 + Math.floor(Math.random() * 20),
          relationship: '본인',
          needs: ['생계', '노인'],
          disability: '없음',
          employment: '무직',
          gender: '남성',
        },
        {
          age: 58 + Math.floor(Math.random() * 20),
          relationship: '배우자',
          needs: ['돌봄', '노인'],
          disability: '없음',
          employment: '무직',
          gender: '여성',
        },
      ];
    }
    default: {
      const arr = [
        {
          age: 35 + Math.floor(Math.random() * 25),
          relationship: '본인',
          needs: ['생계'],
          disability: '없음',
          employment: Math.random() < 0.6 ? '재직' : '무직',
          gender: g(0),
        },
      ];
      for (let i = 1; i < size; i++) {
        arr.push({
          age: i === 1 ? 33 + Math.floor(Math.random() * 20) : 6 + Math.floor(Math.random() * 14),
          relationship: i === 1 ? '배우자' : '자녀',
          needs: i === 1 ? ['생계'] : ['아동'],
          disability: '없음',
          employment: i === 1 ? '재직' : '해당없음',
          gender: g(i),
        });
      }
      return arr;
    }
  }
}

// 세대 크기/프로필 시퀀스를 만들어 residents 100명, 세대 40+개 보장
function planHouseholds(targetResidents: number): Array<{
  size: number;
  profile: HouseholdProfile;
}> {
  // 프로필+크기 패턴을 반복 배치 (다양성 확보)
  const pattern: Array<{ size: number; profile: HouseholdProfile }> = [
    { size: 1, profile: 'elderly_single' },
    { size: 1, profile: 'youth_single' },
    { size: 2, profile: 'couple' },
    { size: 1, profile: 'disabled' },
    { size: 2, profile: 'single_parent' },
    { size: 3, profile: 'general' },
    { size: 1, profile: 'elderly_single' },
    { size: 3, profile: 'single_parent' },
    { size: 4, profile: 'general' },
    { size: 1, profile: 'youth_single' },
    { size: 2, profile: 'disabled' },
  ];

  const result: Array<{ size: number; profile: HouseholdProfile }> = [];
  let residents = 0;
  let i = 0;
  while (residents < targetResidents) {
    const p = pattern[i % pattern.length];
    // 남은 인원이 부족하면 1인 세대로 채운다.
    if (residents + p.size > targetResidents) {
      result.push({ size: 1, profile: 'elderly_single' });
      residents += 1;
    } else {
      result.push(p);
      residents += p.size;
    }
    i++;
  }
  return result;
}

// 주민 100명 생성 (세대 배정 포함). 세대는 generateMockHouseholds 로 동시 산출.
export function generateMockResidents(count: number): {
  residents: Resident[];
  households: Household[];
} {
  const plan = planHouseholds(count);
  const residents: Resident[] = [];
  const households: Household[] = [];

  let residentSeq = 1;

  plan.forEach((spec, hIdx) => {
    const householdId = `HH_${String(hIdx + 1).padStart(3, '0')}`;
    // 첫 세대(HH_001)는 시연 고정값: 서울 고령 1인가구 + L5(자동연결 후보).
    // → 시나리오1(가상주민001 고령 1인가구)과 SQL 데모(서울/65세+/1인/저소득)를 동시 충족.
    const region =
      hIdx === 0 ? '서울특별시 강서구' : REGIONS[hIdx % REGIONS.length];
    const targetLevel = LEVEL_CYCLE[hIdx % LEVEL_CYCLE.length];
    const totalIncome = incomeForLevel(spec.size, targetLevel);

    const memberSpecs = membersForProfile(spec.profile, spec.size);
    const memberIds: string[] = [];

    // 세대 총소득을 멤버에게 분배 (본인에게 더 많이)
    memberSpecs.forEach((m, mi) => {
      const residentId = `RES_${String(residentSeq).padStart(3, '0')}`;
      const citizenId = `CITIZEN_${String(residentSeq).padStart(3, '0')}`;
      // 본인이 소득의 대부분, 자녀는 0
      let income = 0;
      if (m.relationship === '자녀') {
        income = 0;
      } else if (mi === 0) {
        income = Math.round(totalIncome * (memberSpecs.length > 1 ? 0.65 : 1));
      } else {
        income = Math.round(totalIncome * 0.35);
      }

      residents.push({
        residentId,
        citizenId,
        name: `가상주민${String(residentSeq).padStart(3, '0')}`,
        age: m.age,
        gender: m.gender,
        region,
        householdId,
        relationshipToHead: m.relationship,
        monthlyIncome: income,
        employmentStatus: m.employment,
        disabilityStatus: m.disability,
        needs: m.needs,
        phoneMasked: maskedPhone(residentSeq),
      });
      memberIds.push(residentId);
      residentSeq++;
    });

    const members = residents.filter((r) => memberIds.includes(r.residentId));
    const total = calculateHouseholdTotalIncome(members);
    const level = determineIncomeLevel(total, spec.size);

    households.push({
      householdId,
      region,
      addressMasked: `${region} ○○동`,
      members: memberIds,
      householdSize: spec.size,
      totalMonthlyIncome: total,
      incomeLevel: level,
      incomeLevelName: getIncomeLevelLabel(level),
      lastCheckedAt: null,
      updatedAt: nowString(),
    });
  });

  return { residents, households };
}

// residents 로부터 households 를 (재)구성한다.
export function generateMockHouseholds(residents: Resident[]): Household[] {
  const map = new Map<string, Resident[]>();
  residents.forEach((r) => {
    const arr = map.get(r.householdId) ?? [];
    arr.push(r);
    map.set(r.householdId, arr);
  });

  const households: Household[] = [];
  map.forEach((members, householdId) => {
    const total = calculateHouseholdTotalIncome(members);
    const size = members.length;
    const level = determineIncomeLevel(total, size);
    households.push({
      householdId,
      region: members[0].region,
      addressMasked: `${members[0].region} ○○동`,
      members: members.map((m) => m.residentId),
      householdSize: size,
      totalMonthlyIncome: total,
      incomeLevel: level,
      incomeLevelName: getIncomeLevelLabel(level),
      lastCheckedAt: null,
      updatedAt: nowString(),
    });
  });
  return households.sort((a, b) => a.householdId.localeCompare(b.householdId));
}

// residents 를 households 에 (재)배정한다. (단순히 households 재생성)
export function assignResidentsToHouseholds(
  residents: Resident[]
): Household[] {
  return generateMockHouseholds(residents);
}

// 한 세대의 소득/구간을 재계산해 반환한다.
export function recalculateHouseholdIncome(
  household: Household,
  residents: Resident[]
): Household {
  const members = residents.filter((r) =>
    household.members.includes(r.residentId)
  );
  const total = calculateHouseholdTotalIncome(members);
  const size = members.length;
  const level = determineIncomeLevel(total, size);
  return {
    ...household,
    householdSize: size,
    totalMonthlyIncome: total,
    incomeLevel: level,
    incomeLevelName: getIncomeLevelLabel(level),
    updatedAt: nowString(),
  };
}

// 특정 주민의 세대를 변경한다. (residents 반환)
export function updateResidentHousehold(
  residents: Resident[],
  residentId: string,
  newHouseholdId: string
): Resident[] {
  return residents.map((r) =>
    r.residentId === residentId ? { ...r, householdId: newHouseholdId } : r
  );
}

// 특정 주민의 월소득을 변경한다.
export function updateResidentIncome(
  residents: Resident[],
  residentId: string,
  newIncome: number
): Resident[] {
  return residents.map((r) =>
    r.residentId === residentId ? { ...r, monthlyIncome: newIncome } : r
  );
}

// 세대 지역을 변경한다. (세대원 region 도 함께 변경)
export function updateHouseholdRegion(
  households: Household[],
  residents: Resident[],
  householdId: string,
  newRegion: string
): { households: Household[]; residents: Resident[] } {
  const newHouseholds = households.map((h) =>
    h.householdId === householdId
      ? {
          ...h,
          region: newRegion,
          addressMasked: `${newRegion} ○○동`,
          updatedAt: nowString(),
        }
      : h
  );
  const newResidents = residents.map((r) =>
    r.householdId === householdId ? { ...r, region: newRegion } : r
  );
  return { households: newHouseholds, residents: newResidents };
}
