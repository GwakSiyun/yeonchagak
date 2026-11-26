import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const TITLE = "연차각 — 2027 연차 계산기 | 황금연휴 연차 붙여쓰기";
const DESCRIPTION =
  "2027 연차 계산기 연차각. 쓸 수 있는 연차 개수만 넣으면 2027년 연휴에 연차를 붙여 가장 길게 쉬는 날짜 조합을 알려줘요. 설·추석·황금연휴 연차 붙여쓰기.";

export const metadata: Metadata = {
  // 미리보기 이미지(app/opengraph-image.png) 등을 절대 주소로 만들 기준
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "연차각",
  keywords: ["연차 계산기", "2027 연휴", "2027 황금연휴", "연차 붙여쓰기", "연차 언제 쓰지", "2027 공휴일"],
  // 검색엔진에 대표 주소 알림 — ?from=instagram 같은 주소가 따로 수집되지 않게
  alternates: { canonical: "/" },
  // TODO(출시 전): 네이버 서치어드바이저 소유 확인 값 — 등록 후 받은 값으로 채우기 (지금은 비워 둠)
  // verification: { other: { "naver-site-verification": "<서치어드바이저에서 받은 값>" } },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "연차각",
    locale: "ko_KR",
    title: "2027년, 내 연차로 며칠 쉴 수 있을까? — 연차각",
    description: "연차 개수만 넣으면 가장 길게 쉬는 날짜를 계산해 줘요. 2027 연차 계산기.",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FBFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">): React.ReactNode {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
