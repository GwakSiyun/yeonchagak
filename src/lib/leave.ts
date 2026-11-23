import { addDays, isWeekend, monthOf, yearOf, type IsoDate } from "./date";

// 연차 붙여쓰기 계산 (순수 함수)
// 기준: 주 5일(월~금) 근무, 토·일·공휴일은 쉬는 날, 평일만 연차가 필요하다.
// 반차·회사별 공휴일·토요일 근무는 범위 밖.

export const MIN_LEAVE = 1;
export const MAX_LEAVE = 15;
export const DEFAULT_LEAVE = 3;

export type DayKind = "weekend" | "holiday" | "workday";

export interface CalendarDay {
  date: IsoDate;
  /** 공휴일이 주말과 겹치면 'holiday' */
  kind: DayKind;
  holidayName: string | null;
}

/** 쉬는 기간 안의 하루 — 평일은 연차로 쉰다 */
export type RestKind = "weekend" | "holiday" | "leave";

export interface RestDay {
  date: IsoDate;
  kind: RestKind;
  holidayName: string | null;
}

export interface RestPlan {
  start: IsoDate;
  end: IsoDate;
  totalDays: number;
  leaveDates: IsoDate[];
  leaveCount: number;
  /** 쉬는 날 ÷ 연차. 연차 0개면 null */
  efficiency: number | null;
  /** 기간 안 공휴일 이름 (대체공휴일은 원래 이름으로 합쳐 중복 제거) */
  holidayNames: string[];
  days: RestDay[];
}

/** from~to(포함) 달력. 공휴일 데이터가 없는 연도가 섞이면 계산이 틀리므로 막는다 */
export function buildCalendar(
  holidays: ReadonlyMap<IsoDate, string>,
  holidayYears: readonly number[],
  from: IsoDate,
  to: IsoDate,
): CalendarDay[] {
  if (from > to) throw new Error(`기간이 거꾸로예요: ${from} ~ ${to}`);
  const days: CalendarDay[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (!holidayYears.includes(yearOf(d))) throw new Error(`${yearOf(d)}년 공휴일 데이터가 없어요.`);
    const holidayName = holidays.get(d) ?? null;
    const kind: DayKind = holidayName ? "holiday" : isWeekend(d) ? "weekend" : "workday";
    days.push({ date: d, kind, holidayName });
  }
  return days;
}

/** 'YYYY-MM-DD' 기준 연도 하나를 앞뒤 경계(전년 12월·다음 해 1월)까지 포함해 달력으로 */
export function buildYearCalendar(
  holidays: ReadonlyMap<IsoDate, string>,
  holidayYears: readonly number[],
  year: number,
): CalendarDay[] {
  return buildCalendar(holidays, holidayYears, `${year - 1}-12-01`, `${year + 1}-01-31`);
}

function baseHolidayName(name: string): string {
  const m = /^대체공휴일\((.+)\)$/.exec(name);
  return m ? m[1] : name;
}

function toPlan(calendar: readonly CalendarDay[], s: number, e: number): RestPlan {
  const slice = calendar.slice(s, e + 1);
  const days: RestDay[] = slice.map((d) => ({
    date: d.date,
    kind: d.kind === "workday" ? "leave" : d.kind,
    holidayName: d.holidayName,
  }));
  const leaveDates = days.filter((d) => d.kind === "leave").map((d) => d.date);
  const holidayNames = [
    ...new Set(slice.flatMap((d) => (d.holidayName ? [baseHolidayName(d.holidayName)] : []))),
  ];
  return {
    start: slice[0].date,
    end: slice[slice.length - 1].date,
    totalDays: slice.length,
    leaveDates,
    leaveCount: leaveDates.length,
    efficiency: leaveDates.length > 0 ? slice.length / leaveDates.length : null,
    holidayNames,
    days,
  };
}

function assertLeaveCount(leave: number): void {
  if (!Number.isInteger(leave) || leave < 0 || leave > MAX_LEAVE) {
    throw new Error(`연차는 0~${MAX_LEAVE} 사이 정수여야 해요: ${leave}`);
  }
}

/**
 * 연차 1~maxLeave개로 만들 수 있는 '연속으로 쉬는 기간' 전부.
 * - 기간 앞뒤 날은 출근일이어야 한다 (쉬는 날이 이어지면 더 늘릴 수 있으니 끝까지 늘린 기간만)
 * - 연차를 쓰는 날은 모두 targetYear 안 (쉬는 기간은 앞뒤 해로 넘어가도 됨)
 * - 달력 끝에 닿아 앞뒤를 알 수 없는 기간은 뺀다
 */
export function findLeavePlans(
  calendar: readonly CalendarDay[],
  maxLeave: number,
  targetYear: number,
): RestPlan[] {
  assertLeaveCount(maxLeave);
  const isWork = (i: number): boolean => calendar[i].kind === "workday";
  const plans: RestPlan[] = [];

  for (let s = 1; s < calendar.length; s++) {
    if (!isWork(s - 1)) continue;
    let leave = 0;
    for (let e = s; e < calendar.length - 1; e++) {
      if (isWork(e)) {
        if (yearOf(calendar[e].date) !== targetYear) break;
        leave++;
        if (leave > maxLeave) break;
      }
      if (leave >= 1 && isWork(e + 1)) plans.push(toPlan(calendar, s, e));
    }
  }
  return plans;
}

/** 길게 쉬는 순 → 같으면 연차 적게(=효율 높게) → 같으면 빠른 날짜 */
export function comparePlans(a: RestPlan, b: RestPlan): number {
  return b.totalDays - a.totalDays || a.leaveCount - b.leaveCount || a.start.localeCompare(b.start);
}

function overlaps(a: RestPlan, b: RestPlan): boolean {
  return a.start <= b.end && b.start <= a.end;
}

export interface RecommendedPlan extends RestPlan {
  /**
   * 같은 연휴를 연차 개수별로 쉬는 방법 ("1개면 6일 · 2개면 9일 · 3개면 10일").
   * 연차 적은 순. 연차를 늘려도 더 길어지지 않는 단계는 뺀다. 마지막은 항상 이 카드 자신.
   */
  steps: RestPlan[];
}

/** plan과 기간이 겹치고 같은 공휴일을 끼는 조합 = 같은 연휴 */
function isSameBreak(plan: RestPlan, other: RestPlan): boolean {
  return overlaps(plan, other) && other.holidayNames.some((n) => plan.holidayNames.includes(n));
}

function buildSteps(plan: RestPlan, candidates: readonly RestPlan[]): RestPlan[] {
  const same = candidates.filter((c) => isSameBreak(plan, c));
  const steps: RestPlan[] = [];
  for (let k = 1; k < plan.leaveCount; k++) {
    const best = same.filter((c) => c.leaveCount <= k).sort(comparePlans)[0];
    const prevDays = steps.length > 0 ? steps[steps.length - 1].totalDays : 0;
    if (best && best.totalDays > prevDays && best.totalDays < plan.totalDays) steps.push(best);
  }
  steps.push(plan);
  return steps;
}

export interface RecommendOptions {
  /** 몇 개까지 (기본 5) */
  limit?: number;
  /** 1~12. null/생략이면 1년 전체 */
  month?: number | null;
}

/**
 * 내 연차 개수로 가장 길게 쉬는 조합 Top N.
 * 같은 연휴를 하루씩 늘린 비슷한 결과가 줄줄이 나오지 않게, 기간이 겹치면 순위 높은 것 하나만 남긴다.
 * 각 결과에는 같은 연휴를 연차 개수별로 쉬는 방법(steps)을 함께 붙인다.
 * month를 주면 연차 쓰는 날이 모두 그 달(1~12) 안인 조합만 본다 (쉬는 기간은 다음 달로 넘어가도 됨).
 */
export function recommendPlans(
  calendar: readonly CalendarDay[],
  leave: number,
  targetYear: number,
  options: RecommendOptions = {},
): RecommendedPlan[] {
  const { limit = 5, month = null } = options;
  assertLeaveCount(leave);
  if (month !== null && (!Number.isInteger(month) || month < 1 || month > 12)) {
    throw new Error(`월은 1~12 사이 정수여야 해요: ${month}`);
  }
  if (leave === 0) return [];
  const all = findLeavePlans(calendar, leave, targetYear).filter(
    (p) => month === null || p.leaveDates.every((d) => monthOf(d) === month),
  );
  const sorted = [...all].sort(comparePlans);
  const picked: RestPlan[] = [];
  for (const plan of sorted) {
    if (picked.length >= limit) break;
    if (picked.some((p) => overlaps(p, plan))) continue;
    picked.push(plan);
  }
  return picked.map((plan) => ({ ...plan, steps: buildSteps(plan, all) }));
}

/** 연차 없이 쉬는 연휴: 공휴일이 하나 이상 낀 3일 이상 연속 휴일 (targetYear에 걸친 것) */
export function findFreeBreaks(calendar: readonly CalendarDay[], targetYear: number): RestPlan[] {
  const breaks: RestPlan[] = [];
  let s = 0;
  while (s < calendar.length) {
    if (calendar[s].kind === "workday") {
      s++;
      continue;
    }
    let e = s;
    while (e + 1 < calendar.length && calendar[e + 1].kind !== "workday") e++;
    // 달력 끝에 닿은 구간은 실제 길이를 모르니 뺀다
    const bounded = s > 0 && e < calendar.length - 1;
    const plan = toPlan(calendar, s, e);
    const inYear = yearOf(plan.start) <= targetYear && yearOf(plan.end) >= targetYear;
    if (bounded && inYear && plan.totalDays >= 3 && plan.holidayNames.length > 0) breaks.push(plan);
    s = e + 1;
  }
  return breaks;
}
