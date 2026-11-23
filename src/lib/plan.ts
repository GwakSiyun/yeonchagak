import type { RestPlan } from "./leave";

/** 카드 제목: 공휴일 이름 · 없으면 주말끼리 이어 붙인 기간 */
export function planTitle(plan: RestPlan): string {
  return plan.holidayNames.length > 0 ? plan.holidayNames.join("·") : "주말 이어 붙이기";
}

/** 연차 1일당 쉬는 날 (소수 1자리, 정수면 정수로) */
export function formatEfficiency(efficiency: number): string {
  return String(Math.round(efficiency * 10) / 10);
}
