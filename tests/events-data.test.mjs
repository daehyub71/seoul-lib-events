/**
 * 데이터 계약 테스트 — 실제 전처리 산출물(public/data/events.json)이
 * SPEC 데이터 프로필과 일치하는지 검증한다. (PLAN §6)
 * 사전 조건: node scripts/preprocess.mjs 실행 (npm test 전에 prebuild/preprocess로 생성됨)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const VALID_VENUES = new Set([
  "saseo", "segye", "seoul-room", "digital", "ilban2", "maru", "gihoek",
  "ilban1", "jangae", "jaryosil", "lib-outdoor", "lib-etc",
  "plaza", "gwanghwamun", "malgeun", "etc",
]);

let data;
beforeAll(async () => {
  data = JSON.parse(await readFile(path.join(ROOT, "public", "data", "events.json"), "utf-8"));
});

describe("events.json 데이터 계약", () => {
  it("총 1,414건 (SPEC §2)", () => {
    expect(data.total).toBe(1414);
    expect(data.events).toHaveLength(1414);
  });

  it("카테고리 합계: 행사 994 / 야외공간 420", () => {
    const byCat = {};
    for (const e of data.events) byCat[e.category] = (byCat[e.category] ?? 0) + 1;
    expect(byCat.event).toBe(994);
    expect(byCat.outdoor + byCat["outdoor-closed"]).toBe(420);
  });

  it("모든 venueId는 정의된 공간이다 (SPEC §2.3)", () => {
    for (const e of data.events) {
      expect(VALID_VENUES.has(e.venueId), `미정의 venueId: ${e.venueId} (id=${e.id})`).toBe(true);
    }
  });

  it("모든 이벤트가 유효한 날짜와 id를 가진다", () => {
    for (const e of data.events) {
      expect(e.id).toBeTruthy();
      expect(e.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.dateTo >= e.dateFrom, `dateTo < dateFrom (id=${e.id})`).toBe(true);
    }
  });

  it("최신순 정렬 (dateFrom 내림차순)", () => {
    for (let i = 1; i < data.events.length; i++) {
      expect(data.events[i - 1].dateFrom >= data.events[i].dateFrom).toBe(true);
    }
  });

  it("주 반복 일정은 요일 정보를 가진다 (F6)", () => {
    const weekly = data.events.filter((e) => e.period === "week");
    expect(weekly.length).toBeGreaterThan(0);
    for (const e of weekly) {
      expect(e.periodValue, `period=week인데 periodValue 없음 (id=${e.id})`).toMatch(/요일/);
    }
  });
});
