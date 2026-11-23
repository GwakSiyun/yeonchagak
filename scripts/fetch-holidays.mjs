// 공휴일 데이터 갱신 스크립트 (서버가 없어서 미리 받아 정적 JSON으로 넣는다)
// 사용: DATA_GO_KR_SERVICE_KEY=... npm run holidays
// 출처: 한국천문연구원 특일 정보 getRestDeInfo (isHoliday === 'Y'만, 대체공휴일 포함)
// 2026·2028은 연말·연초 경계 계산용 (2026-12 / 2028-01만 실제로 쓰임)
// ⚠️ 임시공휴일은 발표 후 다시 실행해야 반영된다.
import { writeFileSync } from "node:fs";

const ENDPOINT = "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo";
const key = process.env.DATA_GO_KR_SERVICE_KEY;
if (!key) throw new Error("DATA_GO_KR_SERVICE_KEY 환경변수가 필요해요.");

const years = process.argv.slice(2).map(Number);
if (years.length === 0 || years.some((y) => !Number.isInteger(y))) {
  throw new Error("연도를 인자로 주세요. 예: node scripts/fetch-holidays.mjs 2026 2027 2028");
}

const all = [];
for (const year of years) {
  const params = new URLSearchParams({ serviceKey: key, solYear: String(year), numOfRows: "100", _type: "json" });
  const res = await fetch(`${ENDPOINT}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} (${year})`);
  const body = await res.json();
  const header = body.response?.header;
  if (header?.resultCode !== "00") throw new Error(`API 오류 (${year}): ${header?.resultMsg}`);
  // 결과 1건이면 item이 객체, 0건이면 items가 "" 로 온다
  const items = body.response?.body?.items;
  const raw = items === "" || !items?.item ? [] : Array.isArray(items.item) ? items.item : [items.item];
  const list = raw.filter((h) => h.isHoliday === "Y");
  if (list.length === 0) throw new Error(`${year}년 공휴일이 0건이에요 (아직 미발표일 수 있음).`);
  for (const h of list) {
    const s = String(h.locdate);
    all.push({ date: `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`, name: h.dateName });
  }
}
all.sort((a, b) => a.date.localeCompare(b.date));

// JSON은 주석을 못 달아서 맨 앞 키(_comment·source·fetchedAt)에 출처·조회 날짜를 둔다
const out = {
  _comment: "자동 생성 파일 — scripts/fetch-holidays.mjs 로 갱신 (직접 수정 금지)",
  source: "한국천문연구원 특일 정보 API getRestDeInfo (isHoliday=Y, 대체공휴일 포함)",
  fetchedAt: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }), // KST 기준 YYYY-MM-DD
  years: [...years].sort((a, b) => a - b),
  holidays: all,
};
writeFileSync(new URL("../src/data/holidays.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`저장: ${all.length}건 (${years.join(", ")})`);
