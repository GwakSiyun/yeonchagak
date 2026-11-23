import { TARGET_YEAR } from "@/lib/calendar2027";
import { formatMonthDay, formatRange, formatShort } from "@/lib/date";
import type { RecommendedPlan } from "@/lib/leave";
import { formatEfficiency, planTitle } from "@/lib/plan";
import MiniCalendar from "./MiniCalendar";

interface PlanCardProps {
  plan: RecommendedPlan;
  rank: number;
}

export default function PlanCard({ plan, rank }: PlanCardProps): React.ReactNode {
  const otherSteps = plan.steps.length > 1;
  return (
    <article className="rounded-[10px] border border-line bg-card px-4 pt-3.5 pb-4">
      <p className="text-[13px] text-sub">
        {rank}위 · {planTitle(plan)}
      </p>
      {/* 결과 숫자가 화면에서 제일 먼저 읽히게 */}
      <p className="mt-0.5 leading-none">
        <span className="text-[44px] font-bold tracking-tight text-holiday tabular-nums">{plan.totalDays}일</span>
        <span className="ml-1.5 text-[15px]">연속으로 쉬어요</span>
      </p>
      <p className="mt-2 text-[15px] font-medium">{formatRange(plan.start, plan.end, TARGET_YEAR)}</p>
      <p className="mt-0.5 text-[13px] text-sub">
        연차 {plan.leaveCount}일 · {plan.leaveDates.map(formatMonthDay).join(", ")}
        {plan.efficiency !== null && <> · 연차 1일당 {formatEfficiency(plan.efficiency)}일</>}
      </p>

      <MiniCalendar plan={plan} />

      {otherSteps && (
        <div className="mt-3 border-t border-line pt-2.5">
          <p className="text-[12px] text-sub">이 연휴, 연차 개수별로</p>
          <ul className="mt-1 space-y-0.5 text-[13px] tabular-nums">
            {plan.steps.map((s) => {
              const isThis = s.start === plan.start && s.end === plan.end;
              return (
                <li key={`${s.start}-${s.end}`} className={isThis ? "font-bold" : "text-sub"}>
                  연차 {s.leaveCount}일 → {s.totalDays}일
                  <span className="ml-1.5 font-normal text-sub">
                    ({formatShort(s.start)}~{formatShort(s.end)})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
