import { describe, it, expect } from "vitest";
import { filterEvents, DEFAULT_FILTERS, type Filters } from "@/lib/filter";
import type { LibEvent } from "@/lib/types";

function ev(over: Partial<LibEvent>): LibEvent {
  return {
    id: "1",
    title: "행사",
    content: null,
    typeCode: "0001",
    kind: "행사",
    category: "event",
    dateFrom: "2024-11-01",
    dateTo: "2024-11-01",
    timeFrom: null,
    timeTo: null,
    period: "day",
    periodValue: null,
    placeRaw: null,
    venueId: "saseo",
    organizer: null,
    url: null,
    year: 2024,
    isMultiDay: false,
    ...over,
  };
}

const events: LibEvent[] = [
  ev({ id: "1", title: "북토크 저녁", kind: "강연", venueId: "maru", year: 2025, content: "저자와의 만남" }),
  ev({ id: "2", title: "책의 역사전", kind: "전시", venueId: "gihoek", year: 2024 }),
  ev({ id: "3", title: "독서 마라톤", kind: "행사", venueId: "saseo", year: 2024 }),
  ev({ id: "4", title: "광장 운영", kind: "책읽는 서울광장 운영", category: "outdoor", venueId: "plaza", year: 2024 }),
  ev({ id: "5", title: "광장 미운영", kind: "책읽는 서울광장 미운영", category: "outdoor-closed", venueId: "plaza", year: 2024 }),
];

const f = (over: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...over });

describe("filterEvents — F10/F11/F12", () => {
  it("기본 필터는 행사 카테고리만 반환한다 (야외공간 제외, F10)", () => {
    const ids = filterEvents(events, DEFAULT_FILTERS).map((e) => e.id);
    expect(ids).toEqual(["1", "2", "3"]);
  });

  it("야외공간 탭은 운영+미운영을 모두 포함한다 (F10)", () => {
    const ids = filterEvents(events, f({ category: "outdoor" })).map((e) => e.id);
    expect(ids).toEqual(["4", "5"]);
  });

  it("유형 필터 (F11)", () => {
    const ids = filterEvents(events, f({ kind: "강연" })).map((e) => e.id);
    expect(ids).toEqual(["1"]);
  });

  it("공간 필터 (F11)", () => {
    const ids = filterEvents(events, f({ venueId: "gihoek" })).map((e) => e.id);
    expect(ids).toEqual(["2"]);
  });

  it("연도 필터 — dateFrom 연도 기준 (F11)", () => {
    const ids = filterEvents(events, f({ year: 2025 })).map((e) => e.id);
    expect(ids).toEqual(["1"]);
  });

  it("검색은 제목+내용을 대소문자 무시하고 부분 일치한다 (F12)", () => {
    expect(filterEvents(events, f({ query: "북토크" })).map((e) => e.id)).toEqual(["1"]);
    expect(filterEvents(events, f({ query: "저자와의" })).map((e) => e.id)).toEqual(["1"]); // 내용 검색
    expect(filterEvents(events, f({ query: "  " })).map((e) => e.id)).toEqual(["1", "2", "3"]); // 공백은 무시
  });

  it("필터는 AND 조합이다", () => {
    const ids = filterEvents(events, f({ kind: "행사", venueId: "saseo", year: 2024 })).map((e) => e.id);
    expect(ids).toEqual(["3"]);
  });

  it("일치 없음이면 빈 배열", () => {
    expect(filterEvents(events, f({ kind: "전시", year: 2025 }))).toEqual([]);
  });
});
