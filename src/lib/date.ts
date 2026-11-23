// 날짜는 전부 'YYYY-MM-DD' 문자열로 다룬다 (타임존 영향 없게 UTC 자정 기준으로만 계산)

/** 'YYYY-MM-DD' */
export type IsoDate = string;

export const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

function toUtc(iso: IsoDate): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0=일 … 6=토 */
export function weekdayOf(iso: IsoDate): number {
  return toUtc(iso).getUTCDay();
}

export function isWeekend(iso: IsoDate): boolean {
  const w = weekdayOf(iso);
  return w === 0 || w === 6;
}

export function yearOf(iso: IsoDate): number {
  return Number(iso.slice(0, 4));
}

/** 1~12 */
export function monthOf(iso: IsoDate): number {
  return Number(iso.slice(5, 7));
}

/** '2027-09-11' → '9/11(토)' */
export function formatMonthDay(iso: IsoDate): string {
  const d = toUtc(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEKDAY_KO[d.getUTCDay()]})`;
}

/** 기준 연도와 다르면 연도까지: '2028-01-02' (기준 2027) → '2028/1/2(일)' */
export function formatDay(iso: IsoDate, baseYear: number): string {
  const md = formatMonthDay(iso);
  return yearOf(iso) === baseYear ? md : `${yearOf(iso)}/${md}`;
}

/** '9/10(금) ~ 9/19(일)' */
export function formatRange(start: IsoDate, end: IsoDate, baseYear: number): string {
  return `${formatDay(start, baseYear)} ~ ${formatDay(end, baseYear)}`;
}

/** 'M/D' (요일 없이, 짧게) */
export function formatShort(iso: IsoDate): string {
  return `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
}
