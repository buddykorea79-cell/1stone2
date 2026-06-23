import { useMemo, useState } from 'react';
import { useApp } from '../../store/AppContext';
import type {
  Resident,
  Household,
  RecommendationResult,
  SearchCondition,
} from '../../types';
import {
  mergeSearchConditions,
  parseNaturalLanguageQuery,
} from '../../utils/naturalLanguage';
import { getRecommendedPrograms } from '../../utils/matching';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { SearchConditionForm } from './SearchConditionForm';
import { RecommendationList } from './RecommendationList';
import { WelfareDetail } from './WelfareDetail';

// 선택된 국민/세대로부터 기본 검색조건을 파생한다.
export function deriveConditionFromCitizen(
  citizenId: string,
  residents: Resident[],
  households: Household[]
): Partial<SearchCondition> {
  const res = residents.find((r) => r.citizenId === citizenId);
  if (!res) return {};
  const hh = households.find((h) => h.householdId === res.householdId);
  return {
    age: res.age,
    region: res.region,
    householdSize: hh?.householdSize ?? null,
    incomeLevel: hh?.incomeLevel ?? null,
    needs: res.needs,
  };
}

// 복지 검색 → 추천 → 상세 → 신청 흐름 컨테이너 (본인/대리 공용)
export function WelfareSearch({
  applyHandler,
  canApply,
  cannotApplyReason,
  submitLabel,
  intro,
  onSearch,
  conditionsFirst = false,
}: {
  // 신청 처리. 성공 메시지 반환. 미지정 시 신청 불가.
  applyHandler?: (result: RecommendationResult, reason: string) => string;
  canApply: boolean;
  cannotApplyReason?: string;
  submitLabel?: string;
  intro?: React.ReactNode;
  // 검색 실행 시 호출 (대리 조회 감사로그 등)
  onSearch?: (queryText: string) => void;
  // true 면 검색조건 폼을 자연어 입력보다 먼저 노출 (일반 국민)
  conditionsFirst?: boolean;
}) {
  const { programs, residents, households, selectedCitizenId, accessibility } =
    useApp();

  const [formCond, setFormCond] = useState<Partial<SearchCondition>>({});
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [selected, setSelected] = useState<RecommendationResult | null>(null);
  const [toast, setToast] = useState('');

  // 선택 국민 기반 자동 조건
  const citizenCond = useMemo(
    () => deriveConditionFromCitizen(selectedCitizenId, residents, households),
    [selectedCitizenId, residents, households]
  );

  const runSearch = (nlText: string) => {
    const nl = parseNaturalLanguageQuery(nlText);
    // 우선순위: 폼 선택값 > 자연어. 국민 파생조건은 비어있는 항목 보강.
    const merged = mergeSearchConditions(formCond, nl);
    const finalCond: SearchCondition = {
      age: merged.age ?? citizenCond.age ?? null,
      region: merged.region || citizenCond.region || '',
      householdSize: merged.householdSize ?? citizenCond.householdSize ?? null,
      householdType: merged.householdType || '',
      incomeHint: merged.incomeHint || '',
      incomeLevel: merged.incomeLevel ?? citizenCond.incomeLevel ?? null,
      needs:
        merged.needs.length > 0 ? merged.needs : citizenCond.needs ?? [],
      rawQuery: nlText,
    };
    // 실데이터 포함 다량 매칭 → 상위 30건만 노출
    setResults(getRecommendedPrograms(programs, finalCond).slice(0, 30));
    setSelected(null);
    setToast('');
    onSearch?.(nlText || JSON.stringify(finalCond.needs));
  };

  const handleApply = (reason: string) => {
    if (!selected || !applyHandler) return;
    const msg = applyHandler(selected, reason);
    setToast(msg);
    setSelected(null);
    setResults(null);
  };

  return (
    <div className="welfare-search">
      {intro}
      {toast && <div className="toast-success">{toast}</div>}

      {selected ? (
        <WelfareDetail
          result={selected}
          canApply={canApply}
          cannotApplyReason={cannotApplyReason}
          onApply={handleApply}
          onBack={() => setSelected(null)}
          submitLabel={submitLabel}
        />
      ) : (
        <>
          {conditionsFirst ? (
            // 일반 국민: 설명 아래 '검색조건'을 먼저 노출
            <>
              <SearchConditionForm value={formCond} onChange={setFormCond} />
              <button
                className="primary-button big"
                onClick={() => runSearch(formCond.rawQuery ?? '')}
              >
                이 조건으로 복지 찾기
              </button>
              <div className="search-divider">
                <span>또는 자연어로 검색</span>
              </div>
              <NaturalLanguageInput
                onSearch={runSearch}
                easyMode={accessibility.easyMode}
              />
            </>
          ) : (
            <>
              <NaturalLanguageInput
                onSearch={runSearch}
                easyMode={accessibility.easyMode}
              />
              <SearchConditionForm value={formCond} onChange={setFormCond} />
              <button
                className="primary-button"
                onClick={() => runSearch(formCond.rawQuery ?? '')}
              >
                선택한 조건으로 검색
              </button>
            </>
          )}

          {results && (
            <RecommendationList results={results} onSelect={setSelected} />
          )}
        </>
      )}
    </div>
  );
}
