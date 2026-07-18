"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEvents } from "@/lib/data";
import { filterEvents, type Filters } from "@/lib/filter";
import { filtersToParams, parseFilters } from "@/lib/urlState";
import { todayString } from "@/lib/status";
import { MAP_LOCATIONS, VENUES } from "@/constants/venues";
import { countsByLocation, eventsAtLocation } from "@/lib/mapData";
import type { LibEvent } from "@/lib/types";
import FilterBar from "./FilterBar";
import CardListView from "./CardListView";
import EventDetail from "./EventDetail";
import EventListPanel from "./EventListPanel";

// Leaflet은 window에 의존 → 클라이언트 전용 로드 (Next 16에서도 유효한 패턴)
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-400">
      지도를 불러오는 중…
    </div>
  ),
});

const VIEWS = [
  ["map", "지도"],
  ["calendar", "달력"],
  ["list", "목록"],
] as const;
type View = (typeof VIEWS)[number][0];

// F1 — 지도가 메인 뷰
const DEFAULT_VIEW: View = "map";

export default function App() {
  const { data, error, loading } = useEvents();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const viewParam = searchParams.get("view");
  const view: View = VIEWS.some(([v]) => v === viewParam)
    ? (viewParam as View)
    : DEFAULT_VIEW;

  const navigate = useCallback(
    (nextFilters: Filters, nextView: View) => {
      const p = filtersToParams(nextFilters);
      if (nextView !== DEFAULT_VIEW) p.set("view", nextView);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const [selected, setSelected] = useState<LibEvent | null>(null);
  // F2 — 지도에서 선택된 지점 (null이면 안내 표시)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const today = useMemo(todayString, []);

  const events = useMemo(() => (data ? data.events : []), [data]);
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);

  const years = useMemo(
    () => [...new Set(events.map((e) => e.year))].sort((a, b) => b - a),
    [events],
  );
  // 현재 카테고리에 실제로 등장하는 공간만 필터 옵션으로 제공
  const venues = useMemo(() => {
    const present = new Set(
      events
        .filter((e) =>
          filters.category === "event" ? e.category === "event" : e.category !== "event",
        )
        .map((e) => e.venueId),
    );
    return VENUES.filter((v) => present.has(v.id));
  }, [events, filters.category]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">서울도서관 행사 탐색</h1>
          <p className="text-sm text-slate-500">
            2012–2025 행사·강연·전시 및 야외 독서공간 운영 아카이브
          </p>
        </div>
        <nav role="tablist" aria-label="보기 방식" className="flex rounded-lg border border-slate-200 bg-white p-0.5">
          {VIEWS.map(([v, label]) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => navigate(filters, v)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                view === v ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mb-5">
        <FilterBar
          filters={filters}
          years={years}
          venues={venues}
          onChange={(f) => navigate(f, view)}
        />
      </div>

      {loading && (
        <p className="py-16 text-center text-slate-400">일정 데이터를 불러오는 중…</p>
      )}
      {error && (
        <p className="py-16 text-center text-red-500">오류: {error}</p>
      )}

      {data && view === "list" && (
        <CardListView events={filtered} today={today} onSelect={setSelected} />
      )}
      {data && view === "map" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200 lg:h-[560px]">
            <MapView
              counts={countsByLocation(filtered)}
              selectedId={selectedLocation}
              onSelect={setSelectedLocation}
            />
          </div>
          {selectedLocation ? (
            <EventListPanel
              title={MAP_LOCATIONS.find((l) => l.id === selectedLocation)?.name ?? ""}
              events={eventsAtLocation(filtered, selectedLocation)}
              today={today}
              onSelect={setSelected}
              onClose={() => setSelectedLocation(null)}
            />
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              지도의 핀을 클릭하면
              <br />
              해당 지점의 일정이 여기에 표시됩니다.
            </div>
          )}
        </div>
      )}
      {data && view === "calendar" && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          달력 뷰는 M5에서 구현 예정입니다.
        </p>
      )}

      {selected && (
        <EventDetail event={selected} today={today} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
