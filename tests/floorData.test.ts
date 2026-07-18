import { describe, it, expect } from "vitest";
import { countsByVenue, LIBRARY_FLOORS, LIBRARY_BUCKETS } from "@/lib/floorData";
import { VENUES } from "@/constants/venues";
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

describe("countsByVenue — F3 공간별 건수", () => {
  it("venueId별로 집계한다", () => {
    const events = [
      ev({ id: "1", venueId: "saseo" }),
      ev({ id: "2", venueId: "saseo" }),
      ev({ id: "3", venueId: "gihoek" }),
    ];
    const c = countsByVenue(events);
    expect(c.saseo).toBe(2);
    expect(c.gihoek).toBe(1);
    expect(c.maru ?? 0).toBe(0);
  });
});

describe("LIBRARY_FLOORS / LIBRARY_BUCKETS — F3 층 구성", () => {
  it("층은 4F→1F 순서다", () => {
    expect(LIBRARY_FLOORS.map((f) => f.floor)).toEqual([4, 3, 2, 1]);
  });

  it("층이 있는 도서관 공간은 모두 해당 층에 배정된다 (SPEC §2.3)", () => {
    const inFloors = LIBRARY_FLOORS.flatMap((f) => f.venueIds);
    const expected = VENUES.filter((v) => v.locationId === "library" && v.floor !== null);
    for (const v of expected) {
      expect(inFloors, `${v.id}(${v.name})가 층에 없음`).toContain(v.id);
      const floor = LIBRARY_FLOORS.find((f) => f.venueIds.includes(v.id))!.floor;
      expect(floor, `${v.id}의 층 불일치`).toBe(v.floor);
    }
  });

  it("층이 없는 도서관 공간은 모두 버킷에 있다 (T4-4)", () => {
    const expected = VENUES.filter((v) => v.locationId === "library" && v.floor === null);
    for (const v of expected) {
      expect(LIBRARY_BUCKETS, `${v.id}(${v.name})가 버킷에 없음`).toContain(v.id);
    }
  });

  it("층과 버킷에 중복은 없다", () => {
    const all = [...LIBRARY_FLOORS.flatMap((f) => f.venueIds), ...LIBRARY_BUCKETS];
    expect(new Set(all).size).toBe(all.length);
  });
});
