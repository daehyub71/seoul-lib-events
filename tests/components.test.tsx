import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "@/components/FilterBar";
import CardListView from "@/components/CardListView";
import EventDetail from "@/components/EventDetail";
import { DEFAULT_FILTERS } from "@/lib/filter";
import type { LibEvent, Venue } from "@/lib/types";

const TODAY = "2024-11-09";

function ev(over: Partial<LibEvent>): LibEvent {
  return {
    id: "1",
    title: "테스트 행사",
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

const venues: Venue[] = [
  { id: "saseo", name: "사서교육장", floor: 4, locationId: "library" },
];

describe("FilterBar", () => {
  it("카테고리 탭 전환 시 kind/venue가 초기화된다 (F10)", async () => {
    const onChange = vi.fn();
    render(
      <FilterBar
        filters={{ ...DEFAULT_FILTERS, kind: "강연", venueId: "saseo" }}
        years={[2024]}
        venues={venues}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("tab", { name: "야외 독서공간 운영" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "outdoor", kind: null, venueId: null }),
    );
  });

  it("야외공간 탭에서는 유형 셀렉트가 숨겨진다", () => {
    render(
      <FilterBar
        filters={{ ...DEFAULT_FILTERS, category: "outdoor" }}
        years={[2024]}
        venues={[]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("유형")).not.toBeInTheDocument();
  });

  it("검색어 입력이 onChange로 전달된다 (F12)", async () => {
    const onChange = vi.fn();
    render(
      <FilterBar filters={DEFAULT_FILTERS} years={[]} venues={[]} onChange={onChange} />,
    );
    await userEvent.type(screen.getByLabelText("검색"), "책");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ query: "책" }));
  });
});

describe("CardListView", () => {
  it("건수와 카드를 렌더링하고 클릭 시 onSelect 호출 (F8)", async () => {
    const onSelect = vi.fn();
    const events = [ev({ id: "1", title: "북토크" }), ev({ id: "2", title: "전시회" })];
    render(<CardListView events={events} today={TODAY} onSelect={onSelect} />);
    expect(screen.getByText("총 2건")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /북토크/ }));
    expect(onSelect).toHaveBeenCalledWith(events[0]);
  });

  it("30건 초과 시 더보기 버튼 표시 (F9)", () => {
    const events = Array.from({ length: 35 }, (_, i) => ev({ id: String(i), title: `행사${i}` }));
    render(<CardListView events={events} today={TODAY} onSelect={vi.fn()} />);
    const list = screen.getAllByRole("listitem");
    expect(list).toHaveLength(30);
    expect(screen.getByRole("button", { name: /더보기/ })).toBeInTheDocument();
  });

  it("빈 목록 안내", () => {
    render(<CardListView events={[]} today={TODAY} onSelect={vi.fn()} />);
    expect(screen.getByText(/조건에 맞는 일정이 없습니다/)).toBeInTheDocument();
  });
});

describe("EventDetail", () => {
  it("상세 정보를 표시한다 (F14)", () => {
    const e = ev({
      title: "방구석 북토크",
      content: "저자와의 만남",
      timeFrom: "19:00",
      timeTo: "20:30",
      placeRaw: "일반자료실 생각마루",
      organizer: "서울도서관",
      url: "https://lib.seoul.go.kr/x",
      dateFrom: "2024-11-08",
      dateTo: "2024-11-08",
    });
    render(<EventDetail event={e} today={TODAY} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("방구석 북토크")).toBeInTheDocument();
    expect(within(dialog).getByText("저자와의 만남")).toBeInTheDocument();
    expect(within(dialog).getByText("19:00–20:30")).toBeInTheDocument();
    expect(within(dialog).getByText(/일반자료실 생각마루/)).toBeInTheDocument();
    expect(within(dialog).getByText("서울도서관")).toBeInTheDocument();
    expect(within(dialog).getByText("종료")).toBeInTheDocument(); // F13
    expect(within(dialog).getByRole("link", { name: /신청·안내/ })).toHaveAttribute(
      "href",
      "https://lib.seoul.go.kr/x",
    );
  });

  it("ESC로 닫힌다", async () => {
    const onClose = vi.fn();
    render(<EventDetail event={ev({})} today={TODAY} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("URL 없는 행사엔 신청 링크가 없다", () => {
    render(<EventDetail event={ev({ url: null })} today={TODAY} onClose={vi.fn()} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
