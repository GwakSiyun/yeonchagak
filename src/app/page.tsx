import Calculator from "@/components/Calculator";
import FeedbackForm from "@/components/FeedbackForm";
import { CALENDAR, TARGET_YEAR } from "@/lib/calendar2027";
import { HOLIDAY_SOURCE } from "@/lib/holidays";
import { findFreeBreaks } from "@/lib/leave";

export default function Home(): React.ReactNode {
  // 입력과 무관한 값은 서버에서 미리 계산해 넘긴다 (JSON 값만)
  const freeBreaks = findFreeBreaks(CALENDAR, TARGET_YEAR);
  return (
    <main className="mx-auto w-full max-w-[440px] px-4 pt-6 pb-12 lg:max-w-[1120px] lg:px-8 lg:pt-12">
      {/* 서버에서 그린 머리말·안내를 client 계산기에 끼워 넣는다 (import 대신 props) */}
      <Calculator
        freeBreaks={freeBreaks}
        intro={
          <header>
            <h1 className="text-[22px] font-bold">
              연차각 <span className="ml-1 text-[14px] font-normal text-sub">2027 연차 계산기</span>
            </h1>
            <p className="mt-1 text-[14px] text-sub">내 연차로 2027년에 가장 길게 쉬는 날짜를 찾아 줘요.</p>
          </header>
        }
        footer={
          <footer>
            <div className="space-y-1 text-[12px] leading-relaxed text-sub">
              <p>주 5일(월~금) 근무·공휴일에 쉬는 회사 기준이에요. 반차·토요일 근무·회사 자체 휴무는 계산하지 않아요.</p>
              <p>노동절(5/1)·대체공휴일도 공휴일로 계산해요.</p>
              <p>
                공휴일 출처: 한국천문연구원 특일 정보 ({HOLIDAY_SOURCE.fetchedAt} 조회). 임시공휴일은 발표되면
                반영할게요.
              </p>
            </div>
            <div className="mt-5">
              <FeedbackForm />
            </div>
          </footer>
        }
      />
    </main>
  );
}
