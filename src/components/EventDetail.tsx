"use client";

import { useEffect } from "react";
import type { LibEvent } from "@/lib/types";
import { VENUE_BY_ID } from "@/constants/venues";
import { KindBadge, StatusBadge, formatRange, formatTime } from "./badges";

interface Props {
  event: LibEvent;
  today: string;
  onClose: () => void;
}

/** F14 — 행사 상세 모달 */
export default function EventDetail({ event, today, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const venue = VENUE_BY_ID[event.venueId];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <KindBadge event={event} />
            <StatusBadge event={event} today={today} />
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <h2 className="mt-3 text-lg font-bold leading-snug">{event.title}</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-14 shrink-0 text-slate-400">기간</dt>
            <dd>
              {formatRange(event)}
              {event.period === "week" && event.periodValue && (
                <span className="text-slate-500"> · 매주 {event.periodValue}</span>
              )}
            </dd>
          </div>
          {formatTime(event) && (
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-slate-400">시간</dt>
              <dd>{formatTime(event)}</dd>
            </div>
          )}
          <div className="flex gap-3">
            <dt className="w-14 shrink-0 text-slate-400">장소</dt>
            <dd>
              {event.placeRaw ?? venue?.name ?? "미지정"}
              {venue && venue.floor && (
                <span className="text-slate-400"> ({venue.floor}층 {venue.name})</span>
              )}
            </dd>
          </div>
          {event.organizer && (
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-slate-400">주최</dt>
              <dd>{event.organizer}</dd>
            </div>
          )}
        </dl>

        {event.content && (
          <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
            {event.content}
          </p>
        )}

        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            신청·안내 페이지 ↗
          </a>
        )}
      </div>
    </div>
  );
}
