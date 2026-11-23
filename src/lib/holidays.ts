import data from "../data/holidays.json";
import type { IsoDate } from "./date";

// 공휴일 원본: src/data/holidays.json (천문연 API에서 받은 값, scripts/fetch-holidays.mjs로 갱신)

interface HolidayEntry {
  date: IsoDate;
  name: string;
}

interface HolidayFile {
  source: string;
  fetchedAt: string;
  years: number[];
  holidays: HolidayEntry[];
}

const file: HolidayFile = data;

/** 데이터가 들어 있는 연도 — 이 밖의 날짜는 공휴일 여부를 모른다 */
export const HOLIDAY_YEARS: readonly number[] = file.years;

/** '2027-09-14' → '추석' */
export const HOLIDAYS: ReadonlyMap<IsoDate, string> = new Map(file.holidays.map((h) => [h.date, h.name]));

export const HOLIDAY_SOURCE: Readonly<Pick<HolidayFile, "source" | "fetchedAt">> = {
  source: file.source,
  fetchedAt: file.fetchedAt,
};
