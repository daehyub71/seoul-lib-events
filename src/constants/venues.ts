import type { MapLocation, Venue } from "@/lib/types";

/** SPEC §2.4 — 실제 지도 핀 4곳 */
export const MAP_LOCATIONS: MapLocation[] = [
  { id: "library", name: "서울도서관", lat: 37.5662, lng: 126.9779 },
  { id: "seoul-plaza", name: "책읽는 서울광장", lat: 37.5657, lng: 126.978 },
  { id: "gwanghwamun", name: "광화문 책마당", lat: 37.5718, lng: 126.9767 },
  { id: "cheonggyecheon", name: "책읽는 맑은냇가", lat: 37.5696, lng: 126.9784 },
];

/** SPEC §2.3 — 정규화된 공간. floor: 1~4(도서관 층), null(층 특정 불가/외부) */
export const VENUES: Venue[] = [
  { id: "saseo", name: "사서교육장", floor: 4, locationId: "library" },
  { id: "segye", name: "세계자료실", floor: 4, locationId: "library" },
  { id: "seoul-room", name: "서울자료실", floor: 3, locationId: "library" },
  { id: "digital", name: "디지털자료실", floor: 2, locationId: "library" },
  { id: "ilban2", name: "일반자료실2", floor: 2, locationId: "library" },
  { id: "maru", name: "생각마루", floor: 2, locationId: "library" },
  { id: "gihoek", name: "기획전시실", floor: 1, locationId: "library" },
  { id: "ilban1", name: "일반자료실1", floor: 1, locationId: "library" },
  { id: "jangae", name: "장애인자료실", floor: 1, locationId: "library" },
  { id: "jaryosil", name: "자료실 일원", floor: null, locationId: "library" },
  { id: "lib-outdoor", name: "도서관 외부 공간", floor: null, locationId: "library" },
  { id: "lib-etc", name: "서울도서관(공간 미상)", floor: null, locationId: "library" },
  { id: "plaza", name: "책읽는 서울광장", floor: null, locationId: "seoul-plaza" },
  { id: "gwanghwamun", name: "광화문 책마당", floor: null, locationId: "gwanghwamun" },
  { id: "malgeun", name: "책읽는 맑은냇가", floor: null, locationId: "cheonggyecheon" },
  { id: "etc", name: "기타/미지정", floor: null, locationId: "library" },
];

export const VENUE_BY_ID: Record<string, Venue> = Object.fromEntries(
  VENUES.map((v) => [v.id, v]),
);
