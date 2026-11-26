import type { RestPlan } from "./leave";

/** 카드 제목: 공휴일 이름 · 없으면 주말끼리 이어 붙인 기간 */
export function planTitle(plan: RestPlan): string {
  return plan.holidayNames.length > 0 ? plan.holidayNames.join("·") : "주말 이어 붙이기";
}

/** 연차 1일당 쉬는 날 (소수 1자리, 정수면 정수로) */
export function formatEfficiency(efficiency: number): string {
  return String(Math.round(efficiency * 10) / 10);
}

/** 연차를 연휴 끝에 덧붙이지 않고, 쉬는 날 사이 빈 평일에만 쓴 조합 (첫날·마지막 날이 연차가 아님) */
export function isBridge(plan: RestPlan): boolean {
  const first = plan.days[0];
  const last = plan.days[plan.days.length - 1];
  return first.kind !== "leave" && last.kind !== "leave";
}

/**
 * 연차 개수별 단계 중 '징검다리'(연휴 사이만 메운) 조합 가운데 가장 길게 쉬는 줄의 위치.
 * 해당하는 줄이 없으면 null.
 */
export function bridgeIndex(steps: readonly RestPlan[]): number | null {
  let best: number | null = null;
  steps.forEach((s, i) => {
    if (isBridge(s) && (best === null || s.totalDays > steps[best].totalDays)) best = i;
  });
  return best;
}
