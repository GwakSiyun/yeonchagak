import { MAX_LEAVE, MIN_LEAVE } from "@/lib/leave";

interface LeaveStepperProps {
  value: number;
  onChange: (value: number) => void;
}

/** 쓸 수 있는 연차 개수 입력 (1~15) */
export default function LeaveStepper({ value, onChange }: LeaveStepperProps): React.ReactNode {
  const set = (next: number): void => onChange(Math.min(MAX_LEAVE, Math.max(MIN_LEAVE, next)));
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-line bg-card px-4 py-3">
      <label htmlFor="leave-count" className="text-[15px]">
        쓸 수 있는 연차
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => set(value - 1)}
          disabled={value <= MIN_LEAVE}
          aria-label="연차 하루 줄이기"
          className="flex size-9 items-center justify-center rounded-[8px] border border-line text-lg disabled:opacity-40"
        >
          −
        </button>
        <span className="flex items-baseline">
          <input
            id="leave-count"
            type="number"
            inputMode="numeric"
            min={MIN_LEAVE}
            max={MAX_LEAVE}
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n >= MIN_LEAVE) set(n);
            }}
            className="w-9 bg-transparent text-center text-xl font-bold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[15px]">일</span>
        </span>
        <button
          type="button"
          onClick={() => set(value + 1)}
          disabled={value >= MAX_LEAVE}
          aria-label="연차 하루 늘리기"
          className="flex size-9 items-center justify-center rounded-[8px] bg-btn text-lg text-white disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
