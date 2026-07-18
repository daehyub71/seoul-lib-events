import { describe, it, expect } from "vitest";
import { monthMatrix, weekSegments, assignLanes, latestMonthOf, addMonths } from "@/lib/calendarData";
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

describe("monthMatrix — F4 월 그리드 (일요일 시작)", () => {
  it("2024년 11월: 금요일 시작, 5주", () => {
    const m = monthMatrix(2024, 11);
    expect(m).toHaveLength(5);
    expect(m[0]).toEqual([null, null, null, null, null, "2024-11-01", "2024-11-02"]);
    expect(m[4][6]).toBe("2024-11-30");
  });

  it("2025년 5월: 목요일 시작, 31일", () => {
    const m = monthMatrix(2025, 5);
    expect(m[0][4]).toBe("2025-05-01");
    expect(m.flat().filter(Boolean)).toHaveLength(31);
  });
});

describe("weekSegments — F4 주 단위 세그먼트", () => {
  const week: (string | null)[] = [
    "2024-11-03", "2024-11-04", "2024-11-05", "2024-11-06",
    "2024-11-07", "2024-11-08", "2024-11-09",
  ];

  it("기간 일정은 주 범위로 잘린 연속 세그먼트가 된다", () => {
    const e = ev({ id: "a", dateFrom: "2024-11-01", dateTo: "2024-11-06", isMultiDay: true });
    const segs = weekSegments([e], week);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ startCol: 0, endCol: 3 }); // 일~수
  });

  it("주 밖의 일정은 제외된다", () => {
    const e = ev({ id: "a", dateFrom: "2024-11-10", dateTo: "2024-11-12", isMultiDay: true });
    expect(weekSegments([e], week)).toHaveLength(0);
  });

  it("주 반복 일정은 해당 요일의 단일 칸 세그먼트로 전개된다 (F6)", () => {
    const e = ev({
      id: "w",
      dateFrom: "2024-11-01",
      dateTo: "2024-11-30",
      period: "week",
      periodValue: "금요일",
      isMultiDay: true,
    });
    const segs = weekSegments([e], week);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ startCol: 5, endCol: 5 }); // 금
  });

  it("단일 일정은 한 칸 세그먼트", () => {
    const e = ev({ id: "s", dateFrom: "2024-11-05", dateTo: "2024-11-05" });
    expect(weekSegments([e], week)[0]).toMatchObject({ startCol: 2, endCol: 2 });
  });
});

describe("assignLanes — F4 레인 배치 (3레인 + 오버플로)", () => {
  const seg = (id: string, s: number, e: number) => ({
    event: ev({ id }),
    startCol: s,
    endCol: e,
  });

  it("겹치지 않으면 같은 레인을 재사용한다", () => {
    const { placed, overflow } = assignLanes([seg("a", 0, 1), seg("b", 3, 4)], 3);
    expect(placed.map((s) => s.lane)).toEqual([0, 0]);
    expect(overflow.size).toBe(0);
  });

  it("겹치면 다음 레인으로 내려간다", () => {
    const { placed } = assignLanes([seg("a", 0, 3), seg("b", 1, 2), seg("c", 2, 5)], 3);
    expect(placed.find((s) => s.event.id === "a")!.lane).toBe(0);
    expect(placed.find((s) => s.event.id === "b")!.lane).toBe(1);
    expect(placed.find((s) => s.event.id === "c")!.lane).toBe(2);
  });

  it("3레인 초과분은 날짜별 오버플로 건수로 집계된다", () => {
    const { placed, overflow } = assignLanes(
      [seg("a", 0, 6), seg("b", 0, 6), seg("c", 0, 6), seg("d", 2, 3)],
      3,
    );
    expect(placed).toHaveLength(3);
    expect(overflow.get(2)).toBe(1);
    expect(overflow.get(3)).toBe(1);
    expect(overflow.get(0)).toBeUndefined();
  });
});

describe("월 유틸", () => {
  it("latestMonthOf: 데이터의 최신 월 (F7)", () => {
    const events = [ev({ dateFrom: "2025-05-23" }), ev({ dateFrom: "2024-11-01" })];
    expect(latestMonthOf(events)).toEqual({ year: 2025, month: 5 });
  });

  it("addMonths: 연 경계를 넘는다", () => {
    expect(addMonths({ year: 2025, month: 1 }, -1)).toEqual({ year: 2024, month: 12 });
    expect(addMonths({ year: 2024, month: 12 }, 1)).toEqual({ year: 2025, month: 1 });
  });
});
