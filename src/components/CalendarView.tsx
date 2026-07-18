"use client";

import { useMemo, useState } from "react";
import type { LibEvent } from "@/lib/types";
import {
  monthMatrix,
  weekSegments,
  assignLanes,
  eventsOnDate,
  latestMonthOf,
  addMonths,
  type YearMonth,
} from "@/lib/calendarData";
import EventListPanel from "./EventListPanel";

const MAX_LANES = 3;
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const KIND_BAR_COLORS: Record<string, string> = {
  행사: "bg-blue-500/90 text-white",
  강연: "bg-emerald-500/90 text-white",
  전시: "bg-amber-500/90 text-white",
};

function barColor(e: LibEvent): string {
  if (e.category === "outdoor-closed") return "bg-slate-300 text-slate-600";
  if (e.category === "outdoor") return "bg-sky-500/90 text-white";
  return KIND_BAR_COLORS[e.kind] ?? "bg-slate-500 text-white";
}

interface Props {
  events: LibEvent[];
  today: string;
  onSelectEvent: (e: LibEvent) => void;
}

/** F4~F7 — 월간 달력 뷰 */
export default function CalendarView({ events, today, onSelectEvent }: Props) {
  // F7 — 초기 표시 월: 데이터가 존재하는 가장 최근 월
  const initial = useMemo(() => latestMonthOf(events), [events]);
  const [ym, setYm] = useState<YearMonth>(initial);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const weeks = useMemo(() => monthMatrix(ym.year, ym.month), [ym]);

  // 이 달에 걸치는 일정만 미리 추림 (주별 계산 부담 감소)
  const monthEvents = useMemo(() => {
    const first = weeks.flat().find(Boolean)!;
    const last = [...weeks.flat()].reverse().find(Boolean)!;
    return events.filter((e) => e.dateFrom <= last && e.dateTo >= first);
  }, [events, weeks]);

  const move = (delta: number) => {
    setYm((cur) => addMonths(cur, delta));
    setSelectedDate(null);
  };

  const years = useMemo(
    () => [...new Set(events.map((e) => e.year))].sort((a, b) => b - a),
    [events],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {/* 월 내비게이션 */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => move(-1)}
            aria-label="이전 달"
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          >
            ◀
          </button>
          <div className="flex items-center gap-2">
            <select
              aria-label="연도 이동"
              value={ym.year}
              onChange={(e) => {
                setYm({ year: Number(e.target.value), month: ym.month });
                setSelectedDate(null);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
              {!years.includes(ym.year) && <option value={ym.year}>{ym.year}년</option>}
            </select>
            <select
              aria-label="월 이동"
              value={ym.month}
              onChange={(e) => {
                setYm({ year: ym.year, month: Number(e.target.value) });
                setSelectedDate(null);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => move(1)}
            aria-label="다음 달"
            className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          >
            ▶
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-slate-200 pb-1 text-center text-xs font-medium text-slate-400">
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={w} className={i === 0 ? "text-red-400" : ""}>
              {w}
            </div>
          ))}
        </div>

        {/* 주 단위 렌더링: 날짜 행 + 레인 바 (F4) */}
        {monthEvents.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            이 달에는 일정이 없습니다. 연/월을 이동해보세요.
          </p>
        )}
        {weeks.map((week, wi) => {
          const { placed, overflow } = assignLanes(
            weekSegments(monthEvents, week),
            MAX_LANES,
          );
          return (
            <div key={wi} className="border-b border-slate-100 last:border-b-0">
              {/* 날짜 숫자 행 */}
              <div className="grid grid-cols-7">
                {week.map((d, ci) => (
                  <div key={ci} className="px-1 pt-1">
                    {d && (
                      <button
                        onClick={() => setSelectedDate(d)}
                        aria-label={`${d} 일정 보기`}
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          d === today
                            ? "bg-slate-900 font-bold text-white"
                            : selectedDate === d
                              ? "bg-slate-200 font-semibold"
                              : "hover:bg-slate-100"
                        } ${ci === 0 ? "text-red-500" : ""} ${d === today ? "text-white" : ""}`}
                      >
                        {Number(d.slice(8, 10))}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {/* 레인 바: 7열 그리드에서 col-span으로 표현 */}
              <div
                className="grid gap-y-0.5 px-0.5 pb-1"
                style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
              >
                {Array.from({ length: MAX_LANES }, (_, lane) =>
                  placed
                    .filter((s) => s.lane === lane)
                    .map((s) => (
                      <button
                        key={`${s.event.id}-${s.startCol}`}
                        onClick={() => onSelectEvent(s.event)}
                        title={s.event.title}
                        style={{
                          gridColumn: `${s.startCol + 1} / ${s.endCol + 2}`,
                          gridRow: lane + 1,
                        }}
                        className={`truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-4 ${barColor(s.event)}`}
                      >
                        {s.event.title}
                      </button>
                    )),
                )}
                {/* 오버플로 "+N" (F4) */}
                {[...overflow.entries()].map(([col, n]) => (
                  <button
                    key={`ov-${col}`}
                    onClick={() => week[col] && setSelectedDate(week[col])}
                    style={{ gridColumn: `${col + 1} / ${col + 2}`, gridRow: MAX_LANES + 1 }}
                    className="truncate px-1.5 text-left text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    +{n}건
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* F5 — 날짜 클릭 목록 패널 */}
      {selectedDate ? (
        <EventListPanel
          title={`${Number(selectedDate.slice(5, 7))}월 ${Number(selectedDate.slice(8, 10))}일`}
          events={eventsOnDate(monthEvents, selectedDate)}
          today={today}
          onSelect={onSelectEvent}
          onClose={() => setSelectedDate(null)}
        />
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
          날짜를 클릭하면 그날 진행 중인
          <br />
          일정이 여기에 표시됩니다.
        </div>
      )}
    </div>
  );
}
