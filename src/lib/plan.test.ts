import { describe, expect, it } from "vitest";
import { CALENDAR } from "./calendar2027";
import { recommendPlans, type RecommendedPlan } from "./leave";
import { bridgeIndex } from "./plan";

function find(leave: number, name: string): RecommendedPlan | undefined {
  return recommendPlans(CALENDAR, leave, 2027).find((p) => p.holidayNames.includes(name));
}

function bridgeOf(plan: RecommendedPlan | undefined): string | null {
  if (!plan) return null;
  const i = bridgeIndex(plan.steps);
  return i === null ? "없음" : `${plan.steps[i].leaveCount}→${plan.steps[i].totalDays}`;
}

describe("징검다리 줄 (연휴 사이만 메운 조합 중 가장 긴 것)", () => {
  it("연차 3개 추석: 9/10(금 연차)부터인 3→10은 빼고 2→9 (9/11 토~9/19 일)", () => {
    expect(bridgeOf(find(3, "추석"))).toBe("2→9");
  });

  it("연차 3개 설날: 3→9 (2/6 토~2/14 일)", () => {
    expect(bridgeOf(find(3, "설날"))).toBe("3→9");
  });

  it("연휴 끝에 덧붙이는 조합뿐이면 표시 없음 (연차 3개 1월1일)", () => {
    expect(bridgeOf(find(3, "1월1일"))).toBe("없음");
  });

  it("연차 5개 개천절·한글날: 4→10 (10/2 토~10/11 월 대체공휴일)", () => {
    expect(bridgeOf(find(5, "개천절"))).toBe("4→10");
  });
});
