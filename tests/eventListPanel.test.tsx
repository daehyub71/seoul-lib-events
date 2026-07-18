import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventListPanel from "@/components/EventListPanel";
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

describe("EventListPanel — F2 공용 목록 패널", () => {
  it("제목·건수·행을 렌더링하고 클릭 시 onSelect 호출", async () => {
    const onSelect = vi.fn();
    const events = [ev({ id: "1", title: "북토크" }), ev({ id: "2", title: "전시" })];
    render(
      <EventListPanel title="서울도서관" events={events} today={TODAY} onSelect={onSelect} />,
    );
    expect(screen.getByText("서울도서관")).toBeInTheDocument();
    expect(screen.getByText("2건")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /북토크/ }));
    expect(onSelect).toHaveBeenCalledWith(events[0]);
  });

  it("미운영 일정은 회색 처리된다 (F10)", () => {
    render(
      <EventListPanel
        title="책읽는 서울광장"
        events={[ev({ id: "1", title: "미운영", category: "outdoor-closed", kind: "책읽는 서울광장 미운영" })]}
        today={TODAY}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /미운영/ }).className).toContain("opacity-60");
  });

  it("닫기 버튼은 onClose가 있을 때만 표시된다", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <EventListPanel title="광화문" events={[]} today={TODAY} onSelect={vi.fn()} onClose={onClose} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "패널 닫기" }));
    expect(onClose).toHaveBeenCalled();

    rerender(
      <EventListPanel title="광화문" events={[]} today={TODAY} onSelect={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: "패널 닫기" })).not.toBeInTheDocument();
  });

  it("빈 목록 안내를 표시한다", () => {
    render(<EventListPanel title="청계천" events={[]} today={TODAY} onSelect={vi.fn()} />);
    expect(screen.getByText(/조건에 맞는 일정이 없습니다/)).toBeInTheDocument();
  });
});
