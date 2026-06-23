// ============================================================
// AI 조건 조회 SQL 생성 (mock)
// ⚠️ 실제 ChatGPT API / 실제 SQL DB 를 사용하지 않는다.
//    eval, raw SQL 실행, DB 연결을 절대 하지 않는다.
//
// [SQL Injection 방어 설명]
//  - 아래 generateMockSql 은 "화면 표시용 문자열"일 뿐 실행되지 않는다.
//  - 실제 서비스라면 자연어 → 구조화된 조건 JSON → 서버측 검증 →
//    파라미터 바인딩(Prepared Statement)으로 처리해야 하며,
//    사용자 입력을 SQL 문자열에 직접 이어붙이면 안 된다.
//  - 본 프로토타입은 조건 객체로 mockResidents 배열을 filter 하므로
//    문자열 SQL 이 코드 실행에 관여하지 않는다.
// ============================================================

import type { IncomeLevel, Resident } from '../types';

// 자연어에서 추출한 조회 의도(조건 객체)
export interface SqlQueryIntent {
  region: string | null;
  ageMin: number | null;
  ageMax: number | null;
  householdSize: number | null;
  incomeLevels: IncomeLevel[];
  lowIncome: boolean;
}

// 자연어 → 조건 객체 변환 (간단 키워드 분석)
export function parseSqlQueryIntent(text: string): SqlQueryIntent {
  const intent: SqlQueryIntent = {
    region: null,
    ageMin: null,
    ageMax: null,
    householdSize: null,
    incomeLevels: [],
    lowIncome: false,
  };

  // 지역
  const regions = ['서울', '경기', '인천', '부산', '대전', '전북', '익산', '전주'];
  for (const r of regions) {
    if (text.includes(r)) {
      intent.region = r;
      break;
    }
  }

  // 나이 ("65세 이상", "34세 이하")
  const minM = text.match(/(\d{1,3})\s*세\s*이상/);
  if (minM) intent.ageMin = parseInt(minM[1], 10);
  const maxM = text.match(/(\d{1,3})\s*세\s*이하/);
  if (maxM) intent.ageMax = parseInt(maxM[1], 10);
  if (/노인|어르신|고령/.test(text) && intent.ageMin == null) intent.ageMin = 65;
  if (/청년/.test(text) && intent.ageMax == null) intent.ageMax = 34;

  // 세대원 수 ("1인가구", "2인")
  const sizeM = text.match(/(\d)\s*인\s*가구/) || text.match(/(\d)\s*인/);
  if (sizeM) intent.householdSize = parseInt(sizeM[1], 10);
  if (/혼자|독거|1인/.test(text)) intent.householdSize = 1;

  // 저소득
  if (/소득이 낮|저소득|형편이 어렵|생활이 어렵/.test(text)) {
    intent.lowIncome = true;
    intent.incomeLevels = ['L5', 'L4'];
  }

  return intent;
}

// 조건 객체 → mock SQL 문자열 생성 (표시용)
export function generateMockSql(intent: SqlQueryIntent): string {
  const where: string[] = [];
  if (intent.region) where.push(`region LIKE '%${intent.region}%'`);
  if (intent.ageMin != null) where.push(`age >= ${intent.ageMin}`);
  if (intent.ageMax != null) where.push(`age <= ${intent.ageMax}`);
  if (intent.householdSize != null)
    where.push(`household_size = ${intent.householdSize}`);
  if (intent.incomeLevels.length > 0) {
    const list = intent.incomeLevels.map((l) => `'${l}'`).join(', ');
    where.push(`income_level IN (${list})`);
  }

  const whereClause =
    where.length > 0 ? '\nWHERE ' + where.join('\n  AND ') : '';
  return `SELECT * FROM resident_households${whereClause};`;
}

// residents 배열에서 조건 객체로 filter (실제 SQL 실행 아님)
export function executeMockSqlAgainstResidents(
  residents: Resident[],
  intent: SqlQueryIntent,
  householdLevelById: Record<string, IncomeLevel>,
  householdSizeById: Record<string, number>
): Resident[] {
  return residents.filter((r) => {
    if (intent.region && !r.region.includes(intent.region)) return false;
    if (intent.ageMin != null && r.age < intent.ageMin) return false;
    if (intent.ageMax != null && r.age > intent.ageMax) return false;
    if (
      intent.householdSize != null &&
      householdSizeById[r.householdId] !== intent.householdSize
    )
      return false;
    if (intent.incomeLevels.length > 0) {
      const lvl = householdLevelById[r.householdId];
      if (!intent.incomeLevels.includes(lvl)) return false;
    }
    return true;
  });
}
