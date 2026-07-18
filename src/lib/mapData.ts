import type { LibEvent } from "./types";
import { MAP_LOCATIONS, VENUE_BY_ID } from "@/constants/venues";

/** F1/F2 — 지점별 이벤트 건수 (필터 적용된 목록 기준, 4개 지점 항상 포함) */
export function countsByLocation(events: LibEvent[]): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(
    MAP_LOCATIONS.map((l) => [l.id, 0]),
  );
  for (const e of events) {
    const loc = VENUE_BY_ID[e.venueId]?.locationId;
    if (loc !== undefined) counts[loc] += 1;
  }
  return counts;
}

/** F2 — 특정 지점의 이벤트 목록 (입력 순서 유지) */
export function eventsAtLocation(events: LibEvent[], locationId: string): LibEvent[] {
  return events.filter((e) => VENUE_BY_ID[e.venueId]?.locationId === locationId);
}
