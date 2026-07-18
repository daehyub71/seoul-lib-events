/** 행사 대분류: 일반 행사 / 야외공간 운영 / 야외공간 미운영 */
export type Category = "event" | "outdoor" | "outdoor-closed";

/** 반복 주기 */
export type Period = "day" | "week" | "month" | "year";

/** 전처리된 일정 1건 */
export interface LibEvent {
  id: string;
  title: string;
  content: string | null;
  /** 원본 schdul_ty 코드 (예: "0001") */
  typeCode: string;
  /** 화면 표시용 유형 라벨 (행사/강연/전시/광화문 야외마당 운영 등) */
  kind: string;
  category: Category;
  /** YYYY-MM-DD */
  dateFrom: string;
  dateTo: string;
  /** HH:mm, 시간 미지정(0000-0000)은 null */
  timeFrom: string | null;
  timeTo: string | null;
  period: Period;
  /** 주 반복 시 요일명 (예: "금요일") */
  periodValue: string | null;
  /** 원본 장소 표기 */
  placeRaw: string | null;
  /** 정규화된 공간 ID (venues.ts) */
  venueId: string;
  organizer: string | null;
  url: string | null;
  year: number;
  isMultiDay: boolean;
}

/** 전처리 산출물 (public/data/events.json) */
export interface EventsData {
  generatedAt: string;
  total: number;
  events: LibEvent[];
}

/** 지리적 지점 (실제 지도 핀) */
export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/** 정규화된 공간 */
export interface Venue {
  id: string;
  name: string;
  /** 1~4: 서울도서관 층. null: 층 특정 불가 또는 외부 */
  floor: number | null;
  /** 소속 지점 (MapLocation.id) */
  locationId: string;
}
