import { CALENDAR_BY_DATE } from "@/lib/calendar2027";
import { addDays, weekdayOf, WEEKDAY_KO, type IsoDate } from "@/lib/date";
import type { RestKind, RestPlan } from "@/lib/leave";

interface MiniCalendarProps {
  plan: RestPlan;
}

const REST_STYLE: Record<RestKind, string> = {
  holiday: "bg-holiday text-white",
  leave: "bg-leave text-leave-ink font-bold",
  weekend: "bg-weekend text-weekend-ink",
};

const REST_LABEL: Record<RestKind, string> = { holiday: "공휴일", leave: "연차", weekend: "주말" };

/** 쉬는 기간이 들어간 주(일~토)만 그린 작은 달력 */
export default function MiniCalendar({ plan }: MiniCalendarProps): React.ReactNode {
  const rest = new Map(plan.days.map((d) => [d.date, d]));
  const first = addDays(plan.start, -weekdayOf(plan.start));
  const last = addDays(plan.end, 6 - weekdayOf(plan.end));
  const cells: IsoDate[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) cells.push(d);

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-[3px] text-center text-[11px]">
        {WEEKDAY_KO.map((w) => (
          <div key={w} className="py-0.5 text-sub" aria-hidden="true">
            {w}
          </div>
        ))}
        {cells.map((date) => {
          const day = Number(date.slice(8, 10));
          const label = day === 1 ? `${Number(date.slice(5, 7))}/1` : String(day);
          const restDay = rest.get(date);
          if (restDay) {
            const name = restDay.holidayName ? ` ${restDay.holidayName}` : "";
            return (
              <div
                key={date}
                className={`rounded-[4px] py-1.5 tabular-nums ${REST_STYLE[restDay.kind]}`}
                aria-label={`${date} ${REST_LABEL[restDay.kind]}${name}`}
              >
                {label}
              </div>
            );
          }
          const isHoliday = CALENDAR_BY_DATE.get(date)?.kind === "holiday";
          return (
            <div
              key={date}
              className={`py-1.5 tabular-nums ${isHoliday ? "text-holiday" : "text-sub/70"}`}
              aria-hidden="true"
            >
              {label}
            </div>
          );
        })}
      </div>
      <ul className="mt-2 flex gap-3 text-[11px] text-sub">
        {(["holiday", "leave", "weekend"] as const).map((k) => (
          <li key={k} className="flex items-center gap-1">
            <span className={`inline-block size-2 rounded-[2px] ${REST_STYLE[k]}`} aria-hidden="true" />
            {REST_LABEL[k]}
          </li>
        ))}
      </ul>
    </div>
  );
}
