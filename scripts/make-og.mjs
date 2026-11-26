// 링크 미리보기 이미지 생성 스크립트 (A안 탁상달력 주홍)
// 사용: node scripts/make-og.mjs   (macOS · Google Chrome · Apple SD Gothic Neo 필요)
// 결과: src/app/opengraph-image.png (Next.js 파일 규칙 → og:image 자동 연결)
// 서버에서 그리면 한글 글꼴이 없어 빠지므로, 미리 PNG로 찍어 넣는다.
//
// 카드 값은 실제 계산과 맞춘다 (leave.test.ts "9월·연차 3개 → 추석 9/10~9/19 10일"):
// 연차 3일 = 9/10(금)·9/13(월)·9/17(금), 공휴일 9/14~16 추석, 주말 9/11·12·18·19
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = new URL("..", import.meta.url).pathname;
const work = mkdtempSync(join(tmpdir(), "yeonchagak-og-"));
const W = 1200;
const H = 630;

// 2027-09-05(일) ~ 09-25(토), 3주
const HOLIDAY = [14, 15, 16];
const LEAVE = [10, 13, 17];
const WEEKEND = [11, 12, 18, 19];
const cells = [];
for (let d = 5; d <= 25; d++) {
  const cls = HOLIDAY.includes(d) ? "h" : LEAVE.includes(d) ? "l" : WEEKEND.includes(d) ? "w" : "";
  cells.push(`<div class="${cls}">${d}</div>`);
}
const head = ["일", "월", "화", "수", "목", "금", "토"].map((w) => `<div class="wd">${w}</div>`).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${W}px;height:${H}px;overflow:hidden;background:#FBFAF8}
body{font-family:"Apple SD Gothic Neo",sans-serif;color:#1A1A1A;display:flex;align-items:center;justify-content:space-between;padding:0 80px;box-sizing:border-box;gap:48px}
.left{display:flex;flex-direction:column;gap:24px;min-width:0}
.brand{display:flex;align-items:baseline;gap:12px}
.name{font-size:36px;font-weight:800}
.tag{font-size:26px;color:#77736B}
h1{margin:0;font-size:60px;line-height:1.24;font-weight:800;letter-spacing:-1.5px}
h1 span{display:block;white-space:nowrap}
h1 em{font-style:normal;color:#C9411F}
.sub{margin:0;font-size:27px;line-height:1.5;color:#77736B}
.card{flex:none;width:440px;background:#fff;border:2px solid #E7E3DC;border-radius:10px;padding:26px 30px;box-sizing:border-box}
.label{font-size:22px;color:#77736B}
.days{margin:6px 0 0;font-size:84px;font-weight:800;letter-spacing:-2px;line-height:1;color:#C9411F}
.days small{font-size:28px;font-weight:500;color:#1A1A1A;margin-left:8px;letter-spacing:0}
.range{margin:12px 0 0;font-size:24px;font-weight:600}
.leave{margin:4px 0 0;font-size:20px;color:#77736B}
.cal{margin-top:16px;display:grid;grid-template-columns:repeat(7,1fr);gap:5px;text-align:center;font-size:18px}
.cal div{padding:6px 0;border-radius:5px;color:#9A968E}
.cal .wd{padding:0 0 2px;color:#77736B;font-size:16px}
.cal .h{background:#C9411F;color:#fff}
.cal .l{background:#F6D3C8;color:#8A2412;font-weight:700}
.cal .w{background:#EEEBE5;color:#5E5A53}
</style></head><body>
<div class="left">
  <div class="brand"><span class="name">연차각</span><span class="tag">· 2027 연차 계산기</span></div>
  <h1><span>2027년, 내 연차로</span><span><em>며칠</em> 쉴 수 있을까?</span></h1>
  <p class="sub">연차 개수만 넣으면<br>가장 길게 쉬는 날짜를 알려줘요</p>
</div>
<div class="card">
  <div class="label">연차 3일 · 1위 추석</div>
  <p class="days">10일<small>연속으로 쉬어요</small></p>
  <p class="range">9/10(금) ~ 9/19(일)</p>
  <p class="leave">연차 9/10 · 9/13 · 9/17</p>
  <div class="cal">${head}${cells.join("")}</div>
</div>
</body></html>`;

const file = join(work, "og.html");
const out = join(work, "og.png");
writeFileSync(file, html);
execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${W},${H}`,
    `--screenshot=${out}`,
    `file://${file}`,
  ],
  { stdio: "ignore" },
);
const png = readFileSync(out);
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
if (w !== W || h !== H) throw new Error(`og: ${w}x${h} (기대 ${W}x${H})`);
writeFileSync(join(root, "src/app/opengraph-image.png"), png);
writeFileSync(
  join(root, "src/app/opengraph-image.alt.txt"),
  "연차각 — 2027년, 내 연차로 며칠 쉴 수 있을까? 연차 3일로 추석 9/10~9/19 10일 연속 쉬는 예시 달력",
);
console.log("미리보기 이미지 생성 완료");
