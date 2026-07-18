"use client";

import type { Filters } from "@/lib/filter";
import { EVENT_KINDS } from "@/constants/scheduleTypes";
import type { Venue } from "@/lib/types";

interface Props {
  filters: Filters;
  years: number[];
  /** 현재 카테고리에서 선택 가능한 공간 목록 */
  venues: Venue[];
  onChange: (next: Filters) => void;
}

/** F10~F12 — 카테고리 탭 + 유형/공간/연도 필터 + 검색 */
export default function FilterBar({ filters, years, venues, onChange }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="카테고리" className="flex gap-1">
        {(
          [
            ["event", "행사·강연·전시"],
            ["outdoor", "야외 독서공간 운영"],
          ] as const
        ).map(([cat, label]) => (
          <button
            key={cat}
            role="tab"
            aria-selected={filters.category === cat}
            onClick={() => set({ category: cat, kind: null, venueId: null })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filters.category === cat
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.category === "event" && (
          <select
            aria-label="유형"
            value={filters.kind ?? ""}
            onChange={(e) => set({ kind: e.target.value || null })}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">전체 유형</option>
            {EVENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        )}

        <select
          aria-label="공간"
          value={filters.venueId ?? ""}
          onChange={(e) => set({ venueId: e.target.value || null })}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm max-w-48"
        >
          <option value="">전체 공간</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.floor ? `${v.floor}F ${v.name}` : v.name}
            </option>
          ))}
        </select>

        <select
          aria-label="연도"
          value={filters.year ?? ""}
          onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
        >
          <option value="">전체 연도</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>

        <input
          type="search"
          aria-label="검색"
          placeholder="제목·내용 검색"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          className="min-w-40 flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm sm:max-w-64"
        />
      </div>
    </div>
  );
}
