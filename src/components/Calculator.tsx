"use client";

// 연차 개수·달 입력 → Top 5. 입력 상태가 필요한 부분만 client로 둔다
// 모바일: 한 줄로 쌓기 (결과 → 연차 없이 쉬는 연휴 → 안내)
// PC(lg↑): 왼쪽 입력 + 연휴 목록(따라 내려옴) / 오른쪽 결과 2열 + 안내
import { useMemo, useState } from "react";
import { CALENDAR, TARGET_YEAR } from "@/lib/calendar2027";
import { DEFAULT_LEAVE, recommendPlans, type RecommendedPlan, type RestPlan } from "@/lib/leave";
import FreeBreaks from "./FreeBreaks";
import LeaveStepper from "./LeaveStepper";
import MonthTabs from "./MonthTabs";
import PlanCard from "./PlanCard";

interface CalculatorProps {
  /** 제목·소개 (서버에서 그림) */
  intro: React.ReactNode;
  /** 계산 기준·출처 안내 */
  notice: React.ReactNode;
  /** 연차 없이 쉬는 연휴 (서버 계산) */
  freeBreaks: readonly RestPlan[];
}

export default function Calculator({ intro, notice, freeBreaks }: CalculatorProps): React.ReactNode {
  const [leave, setLeave] = useState<number>(DEFAULT_LEAVE);
  const [month, setMonth] = useState<number | null>(null);
  const plans = useMemo<RecommendedPlan[]>(
    () => recommendPlans(CALENDAR, leave, TARGET_YEAR, { month }),
    [leave, month],
  );

  return (
    <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-10">
      {/* 화면이 낮으면 왼쪽 칸만 따로 스크롤 (잘리지 않게) */}
      <aside className="lg:sticky lg:top-12 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pb-4 lg:[scrollbar-width:thin]">
        {intro}
        <div className="mt-5">
          <LeaveStepper value={leave} onChange={setLeave} />
        </div>
        <div className="mt-3">
          <MonthTabs value={month} onChange={setMonth} />
        </div>
        <div className="mt-6 hidden lg:block">
          <FreeBreaks breaks={freeBreaks} month={month} headingId="free-title-side" compact />
        </div>
      </aside>

      <div>
        <section aria-labelledby="result-title" className="mt-6 lg:mt-0">
          <h2 id="result-title" className="text-[15px] font-bold lg:text-[17px]">
            연차 {leave}일로 {month === null ? "" : `${month}월에 `}가장 길게 쉬는 방법
          </h2>
          {month !== null && <p className="mt-0.5 text-[12px] text-sub">연차를 {month}월 안에서 쓰는 조합이에요.</p>}
          {plans.length === 0 ? (
            <p className="mt-2.5 rounded-[10px] border border-line bg-card px-4 py-3 text-[14px] text-sub">
              조건에 맞는 조합이 없어요.
            </p>
          ) : (
            <ol className="mt-2.5 grid gap-3 lg:grid-cols-2 lg:items-start" aria-live="polite">
              {plans.map((plan, i) => (
                <li key={`${plan.start}-${plan.end}`}>
                  <PlanCard plan={plan} rank={i + 1} />
                </li>
              ))}
            </ol>
          )}
        </section>
        <div className="mt-8 lg:hidden">
          <FreeBreaks breaks={freeBreaks} month={month} headingId="free-title" />
        </div>
        <div className="mt-8">{notice}</div>
      </div>
    </div>
  );
}
