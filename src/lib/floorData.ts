import type { LibEvent } from "./types";

/** F3 — 공간(venueId)별 건수 */
export function countsByVenue(events: LibEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) counts[e.venueId] = (counts[e.venueId] ?? 0) + 1;
  return counts;
}

/** F3 — 서울도서관 층 구성 (4F→1F, constants/venues.ts의 floor와 일치해야 함) */
export const LIBRARY_FLOORS: { floor: number; venueIds: string[] }[] = [
  { floor: 4, venueIds: ["saseo", "segye"] },
  { floor: 3, venueIds: ["seoul-room"] },
  { floor: 2, venueIds: ["digital", "ilban2", "maru"] },
  { floor: 1, venueIds: ["gihoek", "ilban1", "jangae"] },
];

/** T4-4 — 층에 못 박을 수 없는 관내 버킷 (자료실 일원·도서관 외부·공간 미상·기타) */
export const LIBRARY_BUCKETS: string[] = ["jaryosil", "lib-outdoor", "lib-etc", "etc"];
