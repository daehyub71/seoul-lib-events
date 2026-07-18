"use client";

import { useEffect, useState } from "react";
import type { LibEvent } from "@/lib/types";
import { VENUE_BY_ID } from "@/constants/venues";
import { KindBadge, StatusBadge, formatRange, formatTime } from "./badges";

const PAGE_SIZE = 30;

interface Props {
  events: LibEvent[];
  today: string;
  onSelect: (e: LibEvent) => void;
}

/** F8/F9 — 카드 목록 + 30건 더보기 */
export default function CardListView({ events, today, onSelect }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  // 필터가 바뀌어 목록이 달라지면 페이지를 처음으로
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [events]);

  if (events.length === 0) {
    return (
      <p className="py-16 text-center text-slate-400">조건에 맞는 일정이 없습니다.</p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">총 {events.length.toLocaleString()}건</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.slice(0, visible).map((e) => {
          const closed = e.category === "outdoor-closed";
          return (
            <li key={e.id}>
              <button
                onClick={() => onSelect(e)}
                className={`flex h-full w-full flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md ${
                  closed ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <KindBadge event={e} />
                  <StatusBadge event={e} today={today} />
                </div>
                <h3 className="font-semibold leading-snug">{e.title}</h3>
                <dl className="mt-auto space-y-0.5 text-sm text-slate-500">
                  <div>
                    <dt className="sr-only">기간</dt>
                    <dd>
                      {formatRange(e)}
                      {formatTime(e) && ` · ${formatTime(e)}`}
                      {e.period === "week" && e.periodValue && ` · 매주 ${e.periodValue}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">장소</dt>
                    <dd>{VENUE_BY_ID[e.venueId]?.name ?? e.placeRaw ?? "장소 미지정"}</dd>
                  </div>
                </dl>
              </button>
            </li>
          );
        })}
      </ul>
      {visible < events.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-md border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            더보기 ({Math.min(events.length - visible, PAGE_SIZE)}건)
          </button>
        </div>
      )}
    </div>
  );
}
