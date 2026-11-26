"use client";

// 의견 보내기 — 공용 의견 테이블에 저장(서버 액션). 입력한 연차 개수·고른 달은 보내지 않는다.
// 모바일: 제목 줄 오른쪽 위 버튼 → 바로 아래에 칸이 펼쳐짐 (FeedbackHeaderButton)
// PC: 결과 맨 아래 펼침 칸 (FeedbackForm)
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { sendFeedbackAction, type FeedbackState } from "@/app/feedbackAction";
import { detectFeedbackSource } from "@/lib/feedbackSource";

const MAX_MESSAGE = 1000;
const MAX_CONTACT = 100;
// 16px 미만이면 아이폰이 화면을 확대함
const fieldClass =
  "mt-1.5 w-full rounded-[8px] border border-line bg-card px-3 text-base text-ink outline-none focus:border-ink";

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  try {
    return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  } catch {
    return nav.standalone === true;
  }
}

function SubmitButton(): React.ReactNode {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 h-11 w-full rounded-[8px] bg-btn text-[15px] font-bold text-white disabled:opacity-60"
    >
      {pending ? "보내는 중…" : "보내기"}
    </button>
  );
}

/** 입력 칸·보내기·완료 문구 (두 자리에서 같이 씀) */
function FeedbackBody(): React.ReactNode {
  const [state, formAction] = useActionState<FeedbackState, FormData>(sendFeedbackAction, { status: "idle" });

  // 들어온 경로는 보낼 때 브라우저에서 계산해 끼워 넣는다
  function submit(formData: FormData): void {
    formData.set(
      "source",
      detectFeedbackSource({ url: window.location.href, referrer: document.referrer, standalone: isStandalone() }),
    );
    formAction(formData);
  }

  if (state.status === "sent") {
    return (
      <p className="text-[14px] leading-6">
        고마워요! 보내 주신 의견은 꼼꼼히 읽고
        <br />
        다음 업데이트에 반영할게요.
      </p>
    );
  }

  return (
    <form action={submit}>
      <label className="block text-[13px] text-sub">
        불편했던 점 · 바라는 기능
        <textarea
          name="message"
          required
          maxLength={MAX_MESSAGE}
          rows={4}
          placeholder="예) 반차도 계산해 주면 좋겠어요"
          className={`${fieldClass} resize-none py-2.5 leading-6`}
        />
      </label>
      <label className="mt-3 block text-[13px] text-sub">
        연락처 <span className="text-sub/70">(선택 · 답장이 필요하면)</span>
        <input name="contact" maxLength={MAX_CONTACT} placeholder="이메일 또는 인스타 아이디" className={`${fieldClass} h-11`} />
      </label>
      {/* 봇 걸러내기용 — 사람에겐 안 보이는 칸 */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {state.status === "error" && (
        <p role="alert" className="mt-2 text-[13px] text-holiday">
          {state.message}
        </p>
      )}
      <SubmitButton />
      <p className="mt-2 text-[11px] leading-5 text-sub">
        이 칸에 적은 글과 연락처만 보내져요. 입력한 연차 개수는 보내지 않아요.
      </p>
    </form>
  );
}

/** PC: 결과 맨 아래 펼침 칸 */
export default function FeedbackForm(): React.ReactNode {
  return (
    <details className="group rounded-[10px] border border-line bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-[10px] px-4 py-3 text-[14px] outline-none focus-visible:outline-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-medium text-sub">의견 보내기</span>
          <span className="ml-2 text-[13px] text-sub/70">불편한 점·바라는 기능</span>
        </span>
        <span aria-hidden="true" className="text-sub transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="border-t border-line px-4 pt-3 pb-4">
        <FeedbackBody />
      </div>
    </details>
  );
}

/**
 * 모바일: 제목 줄 오른쪽 위 작은 버튼 + 누르면 바로 아래 펼쳐지는 칸.
 * 부모(header)에 relative가 있어야 버튼이 오른쪽 위에 붙는다.
 */
export function FeedbackHeaderButton(): React.ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="feedback-panel-mobile"
        className="absolute top-0.5 right-0 rounded-[8px] border border-line bg-card px-2.5 py-1 text-[13px] text-sub"
      >
        {open ? "닫기" : "의견 보내기"}
      </button>
      {open && (
        <div id="feedback-panel-mobile" className="mt-4 rounded-[10px] border border-line bg-card px-4 pt-3 pb-4">
          <p className="mb-2.5 text-[13px] text-sub">써 보면서 불편했던 점이나 바라는 기능을 알려 주세요.</p>
          <FeedbackBody />
        </div>
      )}
    </>
  );
}
