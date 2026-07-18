"use client";

import type { LibEvent } from "@/lib/types";
import { VENUE_BY_ID } from "@/constants/venues";
import { KindBadge, StatusBadge, formatRange } from "./badges";

interface Props {
  title: string;
  events: LibEvent[];
  today: string;
  onSelect: (e: LibEvent) => void;
  onClose?: () => void;
}

/**
 * F2/F3/F5 공용 — 핀·공간·날짜 클릭 시 우측/하단에 뜨는 목록 패널.
 * 지도(M3)·층별 뷰(M4)·달력(M5)에서 재사용한다.
 */
export default function EventListPanel({ title, events, today, onSelect, onClose }: Props) {
  return (
    <section
      aria-label={`${title} 일정 목록`}
      className="flex max-h-[560px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold">
          {title} <span className="text-sm font-normal text-slate-400">{events.length}건</span>
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="패널 닫기"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </header>

      {events.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          조건에 맞는 일정이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-y-auto">
          {events.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => onSelect(e)}
                className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${
                  e.category === "outdoor-closed" ? "opacity-60" : ""
                }`}
              >
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <KindBadge event={e} />
                  <StatusBadge event={e} today={today} />
                </div>
                <p className="text-sm font-medium leading-snug">{e.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatRange(e)}
                  {e.timeFrom && ` · ${e.timeFrom}`}
                  {" · "}
                  {VENUE_BY_ID[e.venueId]?.name ?? e.placeRaw ?? "장소 미지정"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
