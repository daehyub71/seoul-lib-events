import { describe, it, expect } from "vitest";
import { countsByLocation, eventsAtLocation } from "@/lib/mapData";
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
  ev({ id: "1", venueId: "saseo" }),      // library
  ev({ id: "2", venueId: "gihoek" }),     // library
  ev({ id: "3", venueId: "etc" }),        // library (기타/미지정)
  ev({ id: "4", venueId: "plaza", category: "outdoor" }),        // seoul-plaza
  ev({ id: "5", venueId: "plaza", category: "outdoor-closed" }), // seoul-plaza
  ev({ id: "6", venueId: "gwanghwamun", category: "outdoor" }),  // gwanghwamun
  ev({ id: "7", venueId: "malgeun", category: "outdoor" }),      // cheonggyecheon
];

describe("countsByLocation — F1/F2 핀 건수 뱃지", () => {
  it("venueId를 지점(locationId)으로 묶어 집계한다", () => {
    expect(countsByLocation(events)).toEqual({
      library: 3,
      "seoul-plaza": 2,
      gwanghwamun: 1,
      cheonggyecheon: 1,
    });
  });

  it("이벤트가 없는 지점은 0이다", () => {
    expect(countsByLocation([])).toEqual({
      library: 0,
      "seoul-plaza": 0,
      gwanghwamun: 0,
      cheonggyecheon: 0,
    });
  });
});

describe("eventsAtLocation — F2 핀 클릭 목록", () => {
  it("해당 지점의 이벤트만 반환한다 (미운영 포함)", () => {
    expect(eventsAtLocation(events, "seoul-plaza").map((e) => e.id)).toEqual(["4", "5"]);
  });

  it("도서관 지점은 관내 모든 공간을 포함한다", () => {
    expect(eventsAtLocation(events, "library").map((e) => e.id)).toEqual(["1", "2", "3"]);
  });

  it("알 수 없는 지점은 빈 배열", () => {
    expect(eventsAtLocation(events, "nowhere")).toEqual([]);
  });
});
