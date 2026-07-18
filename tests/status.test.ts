import { describe, it, expect } from "vitest";
import { eventStatus, STATUS_LABEL } from "@/lib/status";

const e = (dateFrom: string, dateTo: string) => ({ dateFrom, dateTo });

describe("eventStatus — F13 오늘 기준 상태", () => {
  const today = "2024-11-09";

  it("종료: dateTo가 오늘 이전", () => {
    expect(eventStatus(e("2024-11-01", "2024-11-08"), today)).toBe("ended");
  });

  it("진행중: 오늘이 기간에 포함 (경계 포함)", () => {
    expect(eventStatus(e("2024-11-09", "2024-11-09"), today)).toBe("ongoing");
    expect(eventStatus(e("2024-11-01", "2024-11-09"), today)).toBe("ongoing");
    expect(eventStatus(e("2024-11-09", "2024-11-30"), today)).toBe("ongoing");
  });

  it("예정: dateFrom이 오늘 이후", () => {
    expect(eventStatus(e("2024-11-10", "2024-11-10"), today)).toBe("upcoming");
  });

  it("한국어 라벨 매핑", () => {
    expect(STATUS_LABEL.ended).toBe("종료");
    expect(STATUS_LABEL.ongoing).toBe("진행중");
    expect(STATUS_LABEL.upcoming).toBe("예정");
  });
});
