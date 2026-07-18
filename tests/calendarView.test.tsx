import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarView from "@/components/CalendarView";
import type { LibEvent } from "@/lib/types";

const TODAY = "2024-11-09";

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

const events = [
  ev({ id: "1", title: "단일 북토크", dateFrom: "2024-11-05", dateTo: "2024-11-05" }),
  ev({ id: "2", title: "기간 전시", kind: "전시", dateFrom: "2024-11-03", dateTo: "2024-11-20", isMultiDay: true }),
  ev({
    id: "3",
    title: "매주 금요 강좌",
    dateFrom: "2024-11-01",
    dateTo: "2024-11-29",
    period: "week",
    periodValue: "금요일",
    isMultiDay: true,
  }),
];

describe("CalendarView — F4~F7", () => {
  it("초기 월은 데이터 최신 월이다 (F7)", () => {
    render(<CalendarView events={events} today={TODAY} onSelectEvent={vi.fn()} />);
    expect(screen.getByLabelText("연도 이동")).toHaveValue("2024");
    expect(screen.getByLabelText("월 이동")).toHaveValue("11");
  });

  it("기간 행사 바와 단일 행사 칩을 렌더링한다 (F4)", () => {
    render(<CalendarView events={events} today={TODAY} onSelectEvent={vi.fn()} />);
    // 기간 전시는 3주에 걸쳐 여러 바로 나뉨
    expect(screen.getAllByRole("button", { name: /기간 전시/ }).length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: /단일 북토크/ })).toBeInTheDocument();
    // 주 반복은 금요일마다 (11월 금요일 5번, F6)
    expect(screen.getAllByRole("button", { name: /매주 금요 강좌/ })).toHaveLength(5);
  });

  it("바 클릭 → onSelectEvent (상세)", async () => {
    const onSelectEvent = vi.fn();
    render(<CalendarView events={events} today={TODAY} onSelectEvent={onSelectEvent} />);
    await userEvent.click(screen.getByRole("button", { name: /단일 북토크/ }));
    expect(onSelectEvent).toHaveBeenCalledWith(events[0]);
  });

  it("날짜 클릭 → 그날 진행 중 일정 패널 (F5, 기간 포함)", async () => {
    render(<CalendarView events={events} today={TODAY} onSelectEvent={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "2024-11-08 일정 보기" }));
    const panel = screen.getByRole("region", { name: /11월 8일 일정 목록/ });
    // 8일(금): 기간 전시 + 매주 금요 강좌
    expect(within(panel).getByText("기간 전시")).toBeInTheDocument();
    expect(within(panel).getByText("매주 금요 강좌")).toBeInTheDocument();
    expect(within(panel).queryByText("단일 북토크")).not.toBeInTheDocument();
  });

  it("월 이동 후 일정 없는 달 안내 (F7)", async () => {
    render(<CalendarView events={events} today={TODAY} onSelectEvent={vi.fn()} />);
    await userEvent.click(screen.getByLabelText("다음 달"));
    expect(screen.getByText(/이 달에는 일정이 없습니다/)).toBeInTheDocument();
  });
});
