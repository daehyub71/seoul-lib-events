import { describe, it, expect } from "vitest";
import { occursOnDate, expandWeekly, weekdayOf } from "@/lib/recurrence";
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

describe("weekdayOf", () => {
  it("YYYY-MM-DD의 요일 인덱스(일=0)를 반환한다", () => {
    expect(weekdayOf("2024-11-03")).toBe(0); // 일요일
    expect(weekdayOf("2024-11-08")).toBe(5); // 금요일
    expect(weekdayOf("2024-11-09")).toBe(6); // 토요일
  });
});

describe("occursOnDate — F5/F6", () => {
  it("단일 일정: 해당 날짜만 true", () => {
    const e = ev({ dateFrom: "2024-11-05", dateTo: "2024-11-05" });
    expect(occursOnDate(e, "2024-11-05")).toBe(true);
    expect(occursOnDate(e, "2024-11-06")).toBe(false);
  });

  it("기간 일정: 기간 내 모든 날짜 true (경계 포함, F5)", () => {
    const e = ev({ dateFrom: "2024-11-01", dateTo: "2024-11-10", isMultiDay: true });
    expect(occursOnDate(e, "2024-11-01")).toBe(true);
    expect(occursOnDate(e, "2024-11-10")).toBe(true);
    expect(occursOnDate(e, "2024-10-31")).toBe(false);
    expect(occursOnDate(e, "2024-11-11")).toBe(false);
  });

  it("주 반복: 기간 내 + 해당 요일만 true (F6)", () => {
    // 2024-11-22(금) ~ 2024-11-29(금), 매주 금요일
    const e = ev({
      dateFrom: "2024-11-22",
      dateTo: "2024-11-29",
      period: "week",
      periodValue: "금요일",
      isMultiDay: true,
    });
    expect(occursOnDate(e, "2024-11-22")).toBe(true); // 금
    expect(occursOnDate(e, "2024-11-29")).toBe(true); // 금
    expect(occursOnDate(e, "2024-11-25")).toBe(false); // 월
  });
});

describe("expandWeekly — F6 주 반복 전개", () => {
  it("기간 내 해당 요일 날짜 목록을 반환한다", () => {
    const e = ev({
      dateFrom: "2024-11-01",
      dateTo: "2024-11-30",
      period: "week",
      periodValue: "금요일",
      isMultiDay: true,
    });
    expect(expandWeekly(e)).toEqual([
      "2024-11-01",
      "2024-11-08",
      "2024-11-15",
      "2024-11-22",
      "2024-11-29",
    ]);
  });

  it("주 반복이 아니면 빈 배열", () => {
    expect(expandWeekly(ev({}))).toEqual([]);
  });
});
