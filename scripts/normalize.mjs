/**
 * 원본 공공데이터 1행 → 정규화된 이벤트 객체 변환 로직.
 * preprocess.mjs(빌드 스크립트)와 tests/normalize.test.mjs가 공유한다.
 */

// SPEC §2.2 — src/constants/scheduleTypes.ts와 동일하게 유지할 것
export const SCHEDULE_TYPES = {
  "0001": { kind: "행사", category: "event" },
  "0003": { kind: "강연", category: "event" },
  "0004": { kind: "전시", category: "event" },
  "0011": { kind: "광화문 야외마당 운영", category: "outdoor", venueId: "gwanghwamun" },
  "0012": { kind: "광화문 실내마당 운영", category: "outdoor", venueId: "gwanghwamun" },
  "0013": { kind: "광화문 책마당 미운영", category: "outdoor-closed", venueId: "gwanghwamun" },
  "0014": { kind: "책읽는 서울광장 운영", category: "outdoor", venueId: "plaza" },
  "0015": { kind: "책읽는 서울광장 미운영", category: "outdoor-closed", venueId: "plaza" },
  "0016": { kind: "책읽는 맑은냇가 운영", category: "outdoor", venueId: "malgeun" },
  "0017": { kind: "책읽는 맑은냇가 미운영", category: "outdoor-closed", venueId: "malgeun" },
};

export const PERIOD = { "0001": "day", "0002": "week", "0003": "month", "0004": "year" };

// 도서관 내 개별 공간 키워드 (복수 매칭 시 "자료실 일원"으로 처리)
const ROOM_RULES = [
  { venueId: "saseo", re: /사서\s*교육장|서ㅏ서교육장/ }, // 원본 오타 1건 포함
  { venueId: "segye", re: /세계자료실/ },
  { venueId: "seoul-room", re: /서울자료실/ },
  { venueId: "jangae", re: /장애인자료실/ },
  { venueId: "gihoek", re: /기획전시실/ },
  { venueId: "maru", re: /생각마루/ },
  { venueId: "digital", re: /디지털자료실/ },
  { venueId: "ilban1", re: /일반자료실\s*1(?!\s*,?\s*2)/ },
  { venueId: "ilban2", re: /일반자료실\s*[,]?\s*2|일반자료실1\s*,\s*2/ },
];

/**
 * 장소 문자열 → venueId. 미매칭이면 null (호출부에서 "etc" 처리 + 리포트).
 * SPEC §2.3 매칭 규칙.
 */
export function matchVenue(placeRaw) {
  if (!placeRaw) return "etc";
  const p = placeRaw.replace(/\s+/g, " ").trim();
  if (!p) return "etc";

  // 외부 지점 우선
  if (/서울광장/.test(p)) return "plaza";
  if (/광화문/.test(p)) return "gwanghwamun";
  if (/맑은냇가|청계천/.test(p)) return "malgeun";

  // 복수 공간 표기 → 자료실 일원
  if (/일반자료실\s*1\s*,\s*2|\d+\s*개\s*자료실|각\s*자료실/.test(p)) return "jaryosil";

  const hits = ROOM_RULES.filter((r) => r.re.test(p));
  if (hits.length === 1) return hits[0].venueId;
  if (hits.length >= 2) return "jaryosil";

  // 개별 공간 미명시 일반 표기
  if (/자료실|전시서가|전시도서/.test(p)) return "jaryosil";
  if (/정문|옥상|야외|하늘/.test(p)) return "lib-outdoor";
  if (/도서관|층/.test(p)) return "lib-etc";
  return null; // 미매칭 → 리포트
}

/** "20250523" → "2025-05-23", 형식 불일치 시 null */
export function fmtDate(s) {
  if (!s || !/^\d{8}$/.test(s)) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

/** "1900" → "19:00", 형식 불일치 시 null */
export function fmtTime(s) {
  if (!s || !/^\d{4}$/.test(s)) return null;
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

/** CRLF 정리 + trim, 빈 문자열/null → null */
export function clean(s) {
  if (s == null) return null;
  const t = String(s).replace(/\r\n/g, "\n").trim();
  return t === "" ? null : t;
}

/**
 * 원본 1행 → 이벤트 객체.
 * @returns {{ event: object|null, error: string|null, unmatchedPlace: string|null }}
 */
export function transformRow(r) {
  const ty = SCHEDULE_TYPES[r.schdul_ty];
  if (!ty) return { event: null, error: `알 수 없는 타입 코드: ${r.schdul_ty}`, unmatchedPlace: null };

  const dateFrom = fmtDate(r.date_from);
  const dateTo = fmtDate(r.date_to) ?? dateFrom;
  if (!dateFrom) {
    return { event: null, error: `날짜 파싱 실패: date_from=${r.date_from}`, unmatchedPlace: null };
  }

  const noTime = r.time_from === "0000" && r.time_to === "0000";
  const placeRaw = clean(r.place);

  // 야외공간 운영 일정은 코드가 곧 장소
  let venueId = ty.venueId ?? matchVenue(placeRaw);
  let unmatchedPlace = null;
  if (venueId === null) {
    unmatchedPlace = placeRaw;
    venueId = "etc";
  }

  return {
    error: null,
    unmatchedPlace,
    event: {
      id: String(r.schdul_id),
      title: clean(r.schdul_title) ?? "(제목 없음)",
      content: clean(r.schdul_cntent),
      typeCode: r.schdul_ty,
      kind: ty.kind,
      category: ty.category,
      dateFrom,
      dateTo,
      timeFrom: noTime ? null : fmtTime(r.time_from),
      timeTo: noTime ? null : fmtTime(r.time_to),
      period: PERIOD[r.period] ?? "day",
      periodValue: clean(r.period_value),
      placeRaw,
      venueId,
      organizer: clean(r.spnser),
      url: clean(r.refer_url),
      year: Number(dateFrom.slice(0, 4)),
      isMultiDay: dateFrom !== dateTo,
    },
  };
}
