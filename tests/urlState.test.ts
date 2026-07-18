import { describe, it, expect } from "vitest";
import { filtersToParams, parseFilters } from "@/lib/urlState";
import { DEFAULT_FILTERS, type Filters } from "@/lib/filter";

describe("urlState — F11 필터 ↔ URL 동기화", () => {
  it("기본 필터는 빈 쿼리를 만든다", () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("기본값이 아닌 항목만 직렬화한다", () => {
    const f: Filters = { category: "outdoor", kind: null, venueId: "plaza", year: 2024, query: "책" };
    const p = filtersToParams(f);
    expect(p.get("cat")).toBe("outdoor");
    expect(p.get("venue")).toBe("plaza");
    expect(p.get("year")).toBe("2024");
    expect(p.get("q")).toBe("책");
    expect(p.has("kind")).toBe(false);
  });

  it("round-trip: 직렬화 후 파싱하면 동일하다", () => {
    const f: Filters = { category: "event", kind: "전시", venueId: "gihoek", year: 2016, query: "역사" };
    expect(parseFilters(filtersToParams(f))).toEqual(f);
  });

  it("빈 쿼리는 기본 필터로 파싱된다", () => {
    expect(parseFilters(new URLSearchParams())).toEqual(DEFAULT_FILTERS);
  });

  it("잘못된 값은 기본값으로 대체한다", () => {
    const p = new URLSearchParams("cat=weird&year=abc&kind=없는유형&venue=x");
    const f = parseFilters(p);
    expect(f.category).toBe("event");
    expect(f.year).toBeNull();
    expect(f.kind).toBeNull(); // 정의된 유형(행사/강연/전시)만 허용
    expect(f.venueId).toBeNull(); // 정의된 venue만 허용
  });
});
