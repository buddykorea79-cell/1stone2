"""2026년 기준 중위소득(월, 원) 및 만원→중위소득% 환산."""

# 2026년 기준 중위소득 (월 단위, 원). 7인은 정부 산식(6인 + (6인-5인 증가분)).
MEDIAN_INCOME_2026 = {
    1: 2564238,
    2: 4199292,
    3: 5359036,
    4: 6494738,
    5: 7556719,
    6: 8555952,
    7: 9555185,
}

_INCREMENT = MEDIAN_INCOME_2026[6] - MEDIAN_INCOME_2026[5]  # 8인 이상 가산


def median_income(household_size: int) -> int:
    if household_size <= 0:
        household_size = 1
    if household_size in MEDIAN_INCOME_2026:
        return MEDIAN_INCOME_2026[household_size]
    # 7인 초과: 6인값 + 증가분 누적
    return MEDIAN_INCOME_2026[6] + _INCREMENT * (household_size - 6)


def man_to_pct(income_man: float, household_size: int) -> int:
    """월소득(만원) + 세대원수 -> 기준중위소득 대비 %(정수)."""
    won = float(income_man) * 10000.0
    median = median_income(household_size)
    if median <= 0:
        return 0
    return round(won / median * 100)
