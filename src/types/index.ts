// ============================================================
// 복지루틴 - 공통 타입 정의
// 모든 주요 데이터 구조를 TypeScript 타입으로 명시한다.
// ============================================================

// 사용자 역할 (계층적 권한)
export type UserRole =
  | 'system_admin' // 시스템 관리자
  | 'welfare_super_admin' // 복지 총괄
  | 'agency_admin' // 기관 총괄
  | 'welfare_staff' // 복지 담당
  | 'center_staff' // 주민센터 담당
  | 'citizen'; // 일반 국민

// 소득구간 레벨
export type IncomeLevel = 'L5' | 'L4' | 'L3' | 'L2' | 'L1' | 'LN';

// 신청 상태
export type ApplicationStatus =
  | 'submitted'
  | 'reviewing'
  | 'need_more_info'
  | 'approved'
  | 'rejected'
  | 'auto_candidate'
  | 'auto_connected'
  | 'payment_ready'
  | 'payment_done';

// 신청 유형
export type ApplicantType = 'citizen' | 'delegated' | 'batch';

// 배치 결과 상태
export type BatchResultStatus =
  | 'auto_candidate'
  | 'high_possibility'
  | 'need_review'
  | 'info_only'
  | 'not_matched';

// 조건.json 의 소득구간 한 줄
export interface ConditionLevel {
  level: IncomeLevel;
  name: string;
  minIncome: number;
  maxIncome: number | null;
  thresholdPercent: number | null;
}

// 세대원 수별 조건 규칙
export interface ConditionRule {
  householdSize: number;
  baseIncome100: number;
  levels: ConditionLevel[];
  generated?: boolean; // 프로토타입용 자동생성 여부
}

// 가상 주민(주민등록 데이터)
export interface Resident {
  residentId: string;
  citizenId: string;
  name: string;
  age: number;
  gender: string;
  region: string;
  householdId: string;
  relationshipToHead: string;
  monthlyIncome: number;
  employmentStatus: string;
  disabilityStatus: string;
  needs: string[];
  phoneMasked: string;
}

// 세대정보
export interface Household {
  householdId: string;
  region: string;
  addressMasked: string;
  members: string[]; // residentId 목록
  householdSize: number;
  totalMonthlyIncome: number;
  incomeLevel: IncomeLevel;
  incomeLevelName: string;
  lastCheckedAt: string | null;
  updatedAt: string;
}

// 시연용 국민 (로그인 대체)
export interface Citizen {
  citizenId: string;
  name: string;
  age: number;
  region: string;
  householdId: string;
}

// 복지사업 조건
export interface WelfareCondition {
  ageMin: number | null;
  ageMax: number | null;
  regions: string[];
  incomeLevels: IncomeLevel[];
  householdTypes: string[];
  householdSizes: number[];
  needs: string[];
}

// 복지사업
export interface WelfareProgram {
  programId: string;
  name: string;
  category: string;
  agencyId: string;
  target: string;
  benefit: string;
  conditions: WelfareCondition;
  requiredChecks: string[];
  applyMethod: string;
  status: string;
}

// 신청 데이터
export interface Application {
  applicationId: string;
  citizenId: string;
  householdId: string;
  applicantName: string;
  applicantType: ApplicantType;
  programId: string;
  programName: string;
  reason: string;
  status: ApplicationStatus;
  assignedAgencyId: string;
  assignedTo: string;
  staffComment: string;
  batchId: string | null;
  delegatedByRole?: string;
  delegatedByName?: string;
  delegationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// 감사로그
export interface AuditLog {
  logId: string;
  actorRole: string;
  actorName: string;
  targetCitizenId: string;
  targetCitizenName: string;
  action: string;
  reason: string;
  programId: string;
  programName: string;
  createdAt: string;
}

// 배치 결과(세대별)
export interface BatchResult {
  batchId: string;
  householdId: string;
  householdSize: number;
  totalMonthlyIncome: number;
  incomeLevel: IncomeLevel;
  incomeLevelName: string;
  recommendedPrograms: string[];
  resultStatus: BatchResultStatus;
  createdApplicationIds: string[];
  checkedAt: string;
}

// 배치 실행 요약
export interface BatchRun {
  batchId: string;
  executedBy: string;
  executedAt: string;
  totalHouseholds: number;
  autoCandidateCount: number;
  highPossibilityCount: number;
  needReviewCount: number;
  infoOnlyCount: number;
  notMatchedCount: number;
  createdApplicationCount: number;
}

// 알림
export interface Notification {
  notificationId: string;
  citizenId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 검색 조건
export interface SearchCondition {
  age: number | null;
  region: string;
  householdSize: number | null;
  householdType: string;
  incomeHint: string; // 낮음 / 보통 / 높음
  incomeLevel: IncomeLevel | null;
  needs: string[];
  rawQuery?: string;
}

// 추천 결과
export interface RecommendationResult {
  program: WelfareProgram;
  score: number;
  eligibility: '높음' | '보통' | '낮음';
  reasons: string[];
}

// mock API 확인 결과
export interface MockApiResult {
  incomeCheck: string; // 충족 / 확인 필요 / 초과 가능성
  householdInfo: string; // 1인가구 등
  duplicateBenefit: string; // 없음 / 있음
  addressCheck: string; // 확인
  applicationHistory: string; // 있음 / 없음
}

// 접근성 설정
export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  easyMode: boolean;
  language: 'ko' | 'en' | 'zh' | 'vi';
}
