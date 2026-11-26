import type { MetadataRoute } from "next";

// 안드로이드 '홈 화면에 추가' 아이콘·이름 (Next.js 파일 규칙 → /manifest.webmanifest)
// 서비스 워커(오프라인)는 이번 범위 아님. 아이폰은 app/apple-icon.png 를 쓴다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "연차각 — 2027 연차 계산기",
    short_name: "연차각",
    description: "연차 개수만 넣으면 2027년에 가장 길게 쉬는 날짜를 알려줘요.",
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FBFAF8",
    theme_color: "#FBFAF8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
