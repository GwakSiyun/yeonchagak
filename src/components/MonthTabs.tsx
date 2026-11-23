interface MonthTabsProps {
  /** null = 1년 전체 */
  value: number | null;
  onChange: (month: number | null) => void;
}

const OPTIONS: readonly { month: number | null; label: string }[] = [
  { month: null, label: "전체" },
  ...Array.from({ length: 12 }, (_, i) => ({ month: i + 1, label: `${i + 1}월` })),
];

/** 연차 쓸 달 고르기 — 모바일은 가로로 밀기, PC는 줄바꿈 */
export default function MonthTabs({ value, onChange }: MonthTabsProps): React.ReactNode {
  return (
    <div role="group" aria-label="연차 쓸 달" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
      <div className="flex w-max gap-1.5 lg:w-auto lg:flex-wrap">
        {OPTIONS.map(({ month, label }) => {
          const selected = value === month;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(month)}
              className={`rounded-[8px] border px-3 py-1.5 text-[14px] tabular-nums ${
                selected ? "border-btn bg-btn font-bold text-white" : "border-line bg-card text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
