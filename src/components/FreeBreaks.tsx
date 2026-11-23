import { TARGET_YEAR } from "@/lib/calendar2027";
import { formatRange, monthOf } from "@/lib/date";
import type { RestPlan } from "@/lib/leave";
import { planTitle } from "@/lib/plan";

interface FreeBreaksProps {
  /** 연차 없이 쉬는 연휴 (서버에서 계산해 넘김) */
  breaks: readonly RestPlan[];
  /** 고른 달 — 그 달에 걸친 연휴를 강조. null이면 강조 없음 */
  month: number | null;
  /** 한 화면에 두 번 그려질 수 있어 제목 id를 나눈다 */
  headingId: string;
  /** PC 왼쪽 칸용 촘촘한 모양 */
  compact?: boolean;
}

function inMonth(plan: RestPlan, month: number): boolean {
  return monthOf(plan.start) === month || monthOf(plan.end) === month;
}

/** 연차 없이 쉬는 연휴 목록 */
export default function FreeBreaks({ breaks, month, headingId, compact = false }: FreeBreaksProps): React.ReactNode {
  const rowPad = compact ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-[14px]";
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className={compact ? "text-[14px] font-bold" : "text-[15px] font-bold"}>
        연차 없이 쉬는 연휴
      </h2>
      <ul className={`${compact ? "mt-2" : "mt-2.5"} divide-y divide-line overflow-hidden rounded-[10px] border border-line bg-card`}>
        {breaks.map((b) => {
          const on = month !== null && inMonth(b, month);
          return (
            <li
              key={b.start}
              aria-current={on ? "true" : undefined}
              className={`flex items-baseline justify-between gap-3 ${rowPad} ${on ? "bg-leave" : ""}`}
            >
              <span className="min-w-0 truncate">
                <span className={`font-medium ${on ? "text-leave-ink" : ""}`}>{planTitle(b)}</span>
                <span className={`ml-2 ${compact ? "text-[12px]" : "text-[13px]"} ${on ? "text-leave-ink" : "text-sub"}`}>
                  {formatRange(b.start, b.end, TARGET_YEAR)}
                </span>
              </span>
              <span className="shrink-0 font-bold text-holiday tabular-nums">{b.totalDays}일</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
