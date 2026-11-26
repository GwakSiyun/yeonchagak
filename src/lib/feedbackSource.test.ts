import { describe, expect, it } from "vitest";
import { detectFeedbackSource, toFeedbackSource } from "./feedbackSource";

const base = "https://yeonchagak.vercel.app/";

function detect(url: string, referrer = "", standalone = false): string {
  return detectFeedbackSource({ url, referrer, standalone });
}

describe("의견 들어온 경로", () => {
  it("?from= 링크가 가장 먼저", () => {
    expect(detect(`${base}?from=instagram`, "https://www.google.com/", true)).toBe("instagram");
  });

  it("홈 화면 앱이면 app", () => {
    expect(detect(base, "", true)).toBe("app");
  });

  it("referrer로 검색·SNS 판단", () => {
    expect(detect(base, "https://search.naver.com/search.naver?query=연차계산기")).toBe("naver");
    expect(detect(base, "https://www.google.com/")).toBe("google");
    expect(detect(base, "https://m.youtube.com/")).toBe("youtube");
    expect(detect(base, "https://l.instagram.com/")).toBe("instagram");
    expect(detect(base, "https://everytime.kr/")).toBe("other");
  });

  it("referrer 없음·같은 사이트면 direct", () => {
    expect(detect(base)).toBe("direct");
    expect(detect(base, `${base}?from=tiktok`)).toBe("direct");
  });

  it("모르는 값은 other로 저장", () => {
    expect(toFeedbackSource("instagram")).toBe("instagram");
    expect(toFeedbackSource("<script>")).toBe("other");
  });
});
