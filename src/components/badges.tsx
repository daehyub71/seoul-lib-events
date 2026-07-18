import type { LibEvent } from "@/lib/types";
import { eventStatus, STATUS_LABEL, type EventStatus } from "@/lib/status";

const KIND_COLORS: Record<string, string> = {
  행사: "bg-blue-100 text-blue-800",
  강연: "bg-emerald-100 text-emerald-800",
  전시: "bg-amber-100 text-amber-800",
};

/** 유형 뱃지 — 색+텍스트 병행 (N3) */
export function KindBadge({ event }: { event: LibEvent }) {
  const closed = event.category === "outdoor-closed";
  const color = closed
    ? "bg-slate-200 text-slate-500"
    : (KIND_COLORS[event.kind] ?? "bg-sky-100 text-sky-800");
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${color}`}>
      {event.kind}
    </span>
  );
}

const STATUS_COLORS: Record<EventStatus, string> = {
  ended: "bg-slate-100 text-slate-500",
  ongoing: "bg-green-100 text-green-800",
  upcoming: "bg-indigo-100 text-indigo-800",
};

/** F13 — 오늘 기준 상태 뱃지 */
export function StatusBadge({ event, today }: { event: LibEvent; today: string }) {
  const s = eventStatus(event, today);
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${STATUS_COLORS[s]}`}>
      {STATUS_LABEL[s]}
    </span>
  );
}

/** "2024-11-09" → "2024.11.09", 기간이면 "~" 연결 */
export function formatRange(e: LibEvent): string {
  const f = (d: string) => d.replaceAll("-", ".");
  return e.isMultiDay ? `${f(e.dateFrom)} ~ ${f(e.dateTo)}` : f(e.dateFrom);
}

export function formatTime(e: LibEvent): string | null {
  if (!e.timeFrom) return null;
  return e.timeTo && e.timeTo !== e.timeFrom ? `${e.timeFrom}–${e.timeTo}` : e.timeFrom;
}
