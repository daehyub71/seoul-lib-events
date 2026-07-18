import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FloorPlanView from "@/components/FloorPlanView";
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

const events = [
  ev({ id: "1", venueId: "saseo" }),
  ev({ id: "2", venueId: "saseo" }),
  ev({ id: "3", venueId: "gihoek" }),
  ev({ id: "4", venueId: "jaryosil" }),
];

describe("FloorPlanView — F3 층별 실내 뷰", () => {
  it("4F→1F 층과 공간별 건수를 렌더링한다", () => {
    render(
      <FloorPlanView events={events} selectedVenueId={null} onSelectVenue={vi.fn()} onBack={vi.fn()} />,
    );
    const floors = within(screen.getByRole("list", { name: "층별 공간" }));
    expect(floors.getByText("4F")).toBeInTheDocument();
    expect(floors.getByText("1F")).toBeInTheDocument();
    // 사서교육장(4F) 2건
    const saseo = screen.getByRole("button", { name: /사서교육장/ });
    expect(within(saseo).getByText("2")).toBeInTheDocument();
  });

  it("공간 클릭 시 onSelectVenue 호출", async () => {
    const onSelectVenue = vi.fn();
    render(
      <FloorPlanView events={events} selectedVenueId={null} onSelectVenue={onSelectVenue} onBack={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /기획전시실/ }));
    expect(onSelectVenue).toHaveBeenCalledWith("gihoek");
  });

  it("버킷(자료실 일원 등)도 표시하고 클릭 가능하다 (T4-4)", async () => {
    const onSelectVenue = vi.fn();
    render(
      <FloorPlanView events={events} selectedVenueId={null} onSelectVenue={onSelectVenue} onBack={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /자료실 일원/ }));
    expect(onSelectVenue).toHaveBeenCalledWith("jaryosil");
  });

  it("선택된 공간은 aria-pressed=true", () => {
    render(
      <FloorPlanView events={events} selectedVenueId="saseo" onSelectVenue={vi.fn()} onBack={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /사서교육장/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("지도로 돌아가기 → onBack 호출", async () => {
    const onBack = vi.fn();
    render(
      <FloorPlanView events={events} selectedVenueId={null} onSelectVenue={vi.fn()} onBack={onBack} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /지도로 돌아가기/ }));
    expect(onBack).toHaveBeenCalled();
  });
});
