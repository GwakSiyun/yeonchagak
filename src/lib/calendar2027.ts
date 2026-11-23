import { HOLIDAYS, HOLIDAY_YEARS } from "./holidays";
import { buildYearCalendar, type CalendarDay } from "./leave";

export const TARGET_YEAR = 2027;

/** 2026-12-01 ~ 2028-01-31 (연말·연초 경계 포함) */
export const CALENDAR: readonly CalendarDay[] = buildYearCalendar(HOLIDAYS, HOLIDAY_YEARS, TARGET_YEAR);

/** 'YYYY-MM-DD' → 달력 하루 */
export const CALENDAR_BY_DATE: ReadonlyMap<string, CalendarDay> = new Map(CALENDAR.map((d) => [d.date, d]));
