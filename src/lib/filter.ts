import type { LibEvent } from "./types";
import { EVENT_KINDS } from "@/constants/scheduleTypes";

/** 카테고리 탭 (F10). outdoor 탭은 outdoor + outdoor-closed를 포함 */
export type CategoryTab = "event" | "outdoor";

export interface Filters {
  category: CategoryTab;
  /** 행사/강연/전시 — event 탭에서만 의미 있음 (F11) */
  kind: string | null;
  venueId: string | null;
  /** dateFrom 연도 기준 (F11) */
  year: number | null;
  /** 제목+내용 부분 일치, 대소문자 무시 (F12) */
  query: string;
}

export const DEFAULT_FILTERS: Filters = {
  category: "event",
  kind: null,
  venueId: null,
  year: null,
  query: "",
};

export function filterEvents(events: LibEvent[], f: Filters): LibEvent[] {
  const q = f.query.trim().toLowerCase();
  const kind = f.category === "event" ? f.kind : null;

  return events.filter((e) => {
    if (f.category === "event" ? e.category !== "event" : e.category === "event") return false;
    if (kind && e.kind !== kind) return false;
    if (f.venueId && e.venueId !== f.venueId) return false;
    if (f.year !== null && e.year !== f.year) return false;
    if (q) {
      const hay = `${e.title}\n${e.content ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export { EVENT_KINDS };
