import { DEFAULT_FILTERS, EVENT_KINDS, type Filters } from "./filter";
import { VENUE_BY_ID } from "@/constants/venues";

/**
 * F11 — 필터 ↔ URL searchParams 직렬화/파싱.
 * 기본값과 다른 항목만 쿼리에 남겨 URL을 짧게 유지한다.
 */
export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.category !== DEFAULT_FILTERS.category) p.set("cat", f.category);
  if (f.kind) p.set("kind", f.kind);
  if (f.venueId) p.set("venue", f.venueId);
  if (f.year !== null) p.set("year", String(f.year));
  if (f.query.trim()) p.set("q", f.query);
  return p;
}

export function parseFilters(p: URLSearchParams): Filters {
  const cat = p.get("cat");
  const kind = p.get("kind");
  const venue = p.get("venue");
  const yearRaw = p.get("year");
  const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;

  return {
    category: cat === "outdoor" ? "outdoor" : "event",
    kind: kind && (EVENT_KINDS as readonly string[]).includes(kind) ? kind : null,
    venueId: venue && VENUE_BY_ID[venue] ? venue : null,
    year,
    query: p.get("q") ?? "",
  };
}
