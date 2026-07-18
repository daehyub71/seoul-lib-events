/**
 * 원본 공공데이터(data/seoul-library-schedule.json)를 앱에서 쓰는
 * public/data/events.json으로 변환한다. (PLAN §3)
 *
 * 실행: node scripts/preprocess.mjs  (npm run build 시 prebuild로 자동 실행)
 * 변환 로직은 scripts/normalize.mjs 참조 (테스트: tests/normalize.test.mjs)
 * 검증 수치(총 건수, 카테고리별 건수) 불일치 시 종료 코드 1
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformRow } from "./normalize.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
// 주의: 한글 파일명은 macOS(NFD)와 Linux(NFC)의 유니코드 정규화 차이로
// Vercel 빌드에서 ENOENT가 나므로 ASCII 파일명을 사용한다 (2026-07-18)
const SRC = path.join(ROOT, "data", "seoul-library-schedule.json");
const OUT = path.join(ROOT, "public", "data", "events.json");

const raw = JSON.parse(await readFile(SRC, "utf-8"));

const unmatched = new Map(); // 장소 원문 → 건수
const events = [];

for (const r of raw.DATA) {
  const { event, error, unmatchedPlace } = transformRow(r);
  if (error) {
    console.error(`${error} (id=${r.schdul_id})`);
    process.exit(1);
  }
  if (unmatchedPlace) unmatched.set(unmatchedPlace, (unmatched.get(unmatchedPlace) ?? 0) + 1);
  events.push(event);
}

events.sort((a, b) => (a.dateFrom < b.dateFrom ? 1 : a.dateFrom > b.dateFrom ? -1 : 0));

// ---- 리포트 ----
const byCat = {};
const byVenue = {};
for (const e of events) {
  byCat[e.category] = (byCat[e.category] ?? 0) + 1;
  byVenue[e.venueId] = (byVenue[e.venueId] ?? 0) + 1;
}
console.log(`총 ${events.length}건`);
console.log("카테고리:", byCat);
console.log("공간별:", Object.fromEntries(Object.entries(byVenue).sort((a, b) => b[1] - a[1])));
if (unmatched.size) {
  console.log(`\n[미매칭 장소 표기 ${unmatched.size}종 → "기타/미지정"]`);
  for (const [p, c] of [...unmatched.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  [${c}] ${p}`);
  }
}

// ---- 검증 (SPEC 데이터 프로필) ----
const outdoorTotal = (byCat["outdoor"] ?? 0) + (byCat["outdoor-closed"] ?? 0);
const checks = [
  [events.length === 1414, `총 건수 1414 != ${events.length}`],
  [byCat["event"] === 994, `행사 994 != ${byCat["event"]}`],
  [outdoorTotal === 420, `야외공간 420 != ${outdoorTotal}`],
];
const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, msg] of failed) console.error("검증 실패:", msg);
  process.exit(1);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ generatedAt: new Date().toISOString(), total: events.length, events }),
);
console.log(`\n✓ 검증 통과 → ${path.relative(ROOT, OUT)}`);
