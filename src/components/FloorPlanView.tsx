"use client";

import type { LibEvent } from "@/lib/types";
import { VENUE_BY_ID } from "@/constants/venues";
import { countsByVenue, LIBRARY_FLOORS, LIBRARY_BUCKETS } from "@/lib/floorData";

interface Props {
  /** 현재 필터가 적용된 이벤트 (관내 공간만 집계에 사용됨) */
  events: LibEvent[];
  selectedVenueId: string | null;
  onSelectVenue: (venueId: string) => void;
  onBack: () => void;
}

/** F3 — 서울도서관 층별 실내 뷰 (건물 단면 스타일) */
export default function FloorPlanView({
  events,
  selectedVenueId,
  onSelectVenue,
  onBack,
}: Props) {
  const counts = countsByVenue(events);

  const venueButton = (venueId: string, extraClass = "") => {
    const v = VENUE_BY_ID[venueId];
    const count = counts[venueId] ?? 0;
    const selected = selectedVenueId === venueId;
    return (
      <button
        key={venueId}
        onClick={() => onSelectVenue(venueId)}
        aria-pressed={selected}
        className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors ${
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : count > 0
              ? "border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50"
              : "border-slate-200 bg-slate-50 text-slate-400"
        } ${extraClass}`}
      >
        <span className="font-medium">{v?.name ?? venueId}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            selected ? "bg-slate-700" : count > 0 ? "bg-slate-100" : "bg-transparent"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ← 지도로 돌아가기
        </button>
        <h2 className="font-semibold">서울도서관 층별 안내</h2>
      </div>

      {/* 건물 단면: 4F → 1F */}
      <ol aria-label="층별 공간" className="flex flex-col">
        {LIBRARY_FLOORS.map(({ floor, venueIds }) => (
          <li
            key={floor}
            className="flex items-stretch gap-3 border-b border-slate-200 py-3 first:border-t"
          >
            <span className="flex w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-bold text-slate-500">
              {floor}F
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {venueIds.map((id) => venueButton(id, "flex-1 min-w-32"))}
            </div>
          </li>
        ))}
      </ol>

      {/* 층에 못 박을 수 없는 버킷 (T4-4) */}
      <div className="mt-4">
        <h3 className="mb-2 text-xs font-medium text-slate-400">
          여러 공간 · 층 미상 · 기타
        </h3>
        <div className="flex flex-wrap gap-2">
          {LIBRARY_BUCKETS.map((id) => venueButton(id))}
        </div>
      </div>
    </div>
  );
}
