import { describe, expect, it } from "vitest";
import { HOLIDAYS, HOLIDAY_YEARS } from "./holidays";
import {
  buildCalendar,
  buildYearCalendar,
  findFreeBreaks,
  findLeavePlans,
  recommendPlans,
  type RestPlan,
} from "./leave";

// 실제 천문연 데이터(src/data/holidays.json)로 계산한다
const cal = buildYearCalendar(HOLIDAYS, HOLIDAY_YEARS, 2027);

function range(p: RestPlan): string {
  return `${p.start}~${p.end}`;
}

function findPlan(plans: RestPlan[], start: string, end: string): RestPlan | undefined {
  return plans.find((p) => p.start === start && p.end === end);
}

describe("공휴일 데이터", () => {
  it("2027년 공휴일 24건 (대체공휴일 포함)", () => {
    expect([...HOLIDAYS.keys()].filter((d) => d.startsWith("2027-"))).toHaveLength(24);
  });

  it("데이터 없는 연도가 섞이면 달력을 만들지 않는다", () => {
    expect(() => buildCalendar(HOLIDAYS, HOLIDAY_YEARS, "2028-12-01", "2029-01-31")).toThrow();
  });
});

describe("추석", () => {
  it("연차 2개 → 9/11(토)~9/19(일) 9일, 연차 9/13(월)·9/17(금)", () => {
    const [top] = recommendPlans(cal, 2, 2027);
    expect(range(top)).toBe("2027-09-11~2027-09-19");
    expect(top.totalDays).toBe(9);
    expect(top.leaveDates).toEqual(["2027-09-13", "2027-09-17"]);
    expect(top.efficiency).toBe(4.5);
    expect(top.holidayNames).toEqual(["추석"]);
  });

  it("미니 달력용 날짜 구분: 주말·공휴일·연차", () => {
    const [top] = recommendPlans(cal, 2, 2027);
    expect(top.days.map((d) => d.kind)).toEqual([
      "weekend", "weekend", "leave", "holiday", "holiday", "holiday", "leave", "weekend", "weekend",
    ]);
  });
});

describe("설날 + 대체공휴일", () => {
  it("대체공휴일 2/9(화)도 쉬는 날 → 2/6~2/14 9일은 연차 3개(2/10~2/12)", () => {
    const plan = findPlan(findLeavePlans(cal, 3, 2027), "2027-02-06", "2027-02-14");
    expect(plan?.leaveDates).toEqual(["2027-02-10", "2027-02-11", "2027-02-12"]);
    expect(plan?.holidayNames).toEqual(["설날"]);
  });

  it("어린이날 앞뒤: 노동절 대체공휴일 5/3(월) 반영 → 5/1~5/9 9일, 연차 3개", () => {
    const plan = findPlan(findLeavePlans(cal, 3, 2027), "2027-05-01", "2027-05-09");
    expect(plan?.leaveDates).toEqual(["2027-05-04", "2027-05-06", "2027-05-07"]);
  });
});

describe("정렬·중복 제거", () => {
  it("연차 3개 Top 5: 길이 내림차순, 같으면 연차 적은 순", () => {
    const top = recommendPlans(cal, 3, 2027);
    expect(top).toHaveLength(5);
    for (let i = 1; i < top.length; i++) {
      const [a, b] = [top[i - 1], top[i]];
      expect(a.totalDays > b.totalDays || (a.totalDays === b.totalDays && a.leaveCount <= b.leaveCount)).toBe(true);
    }
    expect(top.every((p) => p.leaveCount <= 3)).toBe(true);
  });

  it("Top 5끼리 기간이 겹치지 않는다", () => {
    const top = recommendPlans(cal, 5, 2027);
    for (const a of top) {
      for (const b of top) {
        if (a !== b) expect(a.end < b.start || b.end < a.start).toBe(true);
      }
    }
  });

  it("연차 15개도 계산된다", () => {
    const top = recommendPlans(cal, 15, 2027);
    expect(top.length).toBeGreaterThan(0);
    expect(top[0].leaveCount).toBeLessThanOrEqual(15);
  });
});

describe("연차 개수별 단계 (steps)", () => {
  it("연차 3개 추석: 1개면 6일 · 2개면 9일 · 3개면 10일", () => {
    const chuseok = recommendPlans(cal, 3, 2027).find((p) => p.holidayNames.includes("추석"));
    expect(chuseok?.steps.map((s) => `${s.leaveCount}:${s.totalDays}:${range(s)}`)).toEqual([
      "1:6:2027-09-11~2027-09-16",
      "2:9:2027-09-11~2027-09-19",
      "3:10:2027-09-10~2027-09-19",
    ]);
  });

  it("마지막 단계는 카드 자신, 단계는 연차·일수 모두 늘어나는 순", () => {
    for (const plan of recommendPlans(cal, 7, 2027)) {
      const last = plan.steps[plan.steps.length - 1];
      expect(range(last)).toBe(range(plan));
      for (let i = 1; i < plan.steps.length; i++) {
        expect(plan.steps[i].leaveCount).toBeGreaterThan(plan.steps[i - 1].leaveCount);
        expect(plan.steps[i].totalDays).toBeGreaterThan(plan.steps[i - 1].totalDays);
      }
    }
  });

  it("연차 1개면 단계는 카드 자신 하나", () => {
    for (const plan of recommendPlans(cal, 1, 2027)) expect(plan.steps).toHaveLength(1);
  });
});

describe("월 선택", () => {
  it("9월·연차 3개 → 추석 9/10~9/19 10일", () => {
    const [top] = recommendPlans(cal, 3, 2027, { month: 9 });
    expect(range(top)).toBe("2027-09-10~2027-09-19");
  });

  it("연차 쓰는 날이 모두 그 달 안 (쉬는 기간은 다음 달로 넘어가도 됨)", () => {
    for (let m = 1; m <= 12; m++) {
      const plans = recommendPlans(cal, 3, 2027, { month: m });
      expect(plans.length).toBeGreaterThan(0);
      for (const p of plans) {
        expect(p.leaveDates.every((d) => Number(d.slice(5, 7)) === m && d.startsWith("2027-"))).toBe(true);
        expect(p.steps.every((s) => s.leaveDates.every((d) => Number(d.slice(5, 7)) === m))).toBe(true);
      }
    }
  });

  it("4월·연차 3개 → 4/28~5/3 (연차는 4월, 쉬는 기간은 5월까지)", () => {
    const [top] = recommendPlans(cal, 3, 2027, { month: 4 });
    expect(range(top)).toBe("2027-04-28~2027-05-03");
    expect(top.leaveDates).toEqual(["2027-04-28", "2027-04-29", "2027-04-30"]);
  });

  it("잘못된 월은 막는다", () => {
    expect(() => recommendPlans(cal, 3, 2027, { month: 0 })).toThrow();
    expect(() => recommendPlans(cal, 3, 2027, { month: 13 })).toThrow();
  });
});

describe("연말·연초 경계", () => {
  it("크리스마스~2028 신정: 12/25~2028-01-02 9일, 연차 4개(12/28~12/31)", () => {
    const plan = findPlan(findLeavePlans(cal, 4, 2027), "2027-12-25", "2028-01-02");
    expect(plan?.totalDays).toBe(9);
    expect(plan?.leaveDates).toEqual(["2027-12-28", "2027-12-29", "2027-12-30", "2027-12-31"]);
  });

  it("2026년에 연차를 써야 하는 기간은 넣지 않는다 (2026-12-31 연차 ❌)", () => {
    const plans = findLeavePlans(cal, 15, 2027);
    expect(plans.every((p) => p.leaveDates.every((d) => d.startsWith("2027-")))).toBe(true);
  });
});

describe("연차 0개", () => {
  it("연차 0개면 추천 없음", () => {
    expect(recommendPlans(cal, 0, 2027)).toEqual([]);
  });

  it("범위 밖 연차 개수는 막는다", () => {
    expect(() => recommendPlans(cal, 16, 2027)).toThrow();
    expect(() => recommendPlans(cal, 1.5, 2027)).toThrow();
  });

  it("연차 없이 쉬는 연휴 목록", () => {
    expect(findFreeBreaks(cal, 2027).map((p) => `${range(p)} ${p.totalDays}`)).toEqual([
      "2027-01-01~2027-01-03 3",
      "2027-02-06~2027-02-09 4",
      "2027-02-27~2027-03-01 3",
      "2027-05-01~2027-05-03 3",
      "2027-07-17~2027-07-19 3",
      "2027-08-14~2027-08-16 3",
      "2027-09-14~2027-09-16 3",
      "2027-10-02~2027-10-04 3",
      "2027-10-09~2027-10-11 3",
      "2027-12-25~2027-12-27 3",
    ]);
  });
});
