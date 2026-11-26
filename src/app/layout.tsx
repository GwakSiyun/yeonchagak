import type { Metadata, Viewport } from "next";
import SiteAnalytics from "@/components/SiteAnalytics";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const TITLE = "며칠쉬지 — 2027 연차 계산기 | 빨간날·황금연휴 연차 붙여쓰기";
const DESCRIPTION =
  "2027 빨간날·공휴일 기준 연차 계산기 며칠쉬지. 연차 개수만 넣으면 설·추석·5월 황금연휴에 연차를 붙여 가장 길게 쉬는 날짜를 알려줘요. 대체공휴일 반영, 월별로도 볼 수 있어요.";

export const metadata: Metadata = {
  // 미리보기 이미지(app/opengraph-image.png) 등을 절대 주소로 만들 기준
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "며칠쉬지",
  keywords: ["2027 빨간날", "2027 공휴일", "2027 연휴", "2027 황금연휴", "2027 추석 연휴", "연차 붙여쓰기", "연차 계산기"],
  // 검색엔진에 대표 주소 알림 — ?from=instagram 같은 주소가 따로 수집되지 않게
  alternates: { canonical: "/" },
  // 네이버 서치어드바이저 소유 확인 (HTML 태그 방식, myeochil.vercel.app 기준)
  verification: { other: { "naver-site-verification": "93930f50409b301f348e0f7edcd795b6e69f60a4" } },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "며칠쉬지",
    locale: "ko_KR",
    title: "2027년, 내 연차로 며칠 쉴 수 있을까? — 며칠쉬지",
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
      <body className="min-h-full">
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
