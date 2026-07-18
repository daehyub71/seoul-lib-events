/** F13 — 오늘 기준 종료/진행중/예정. 날짜는 YYYY-MM-DD 문자열 비교 */
export type EventStatus = "upcoming" | "ongoing" | "ended";

export const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행중",
  ended: "종료",
};

export function eventStatus(
  e: { dateFrom: string; dateTo: string },
  today: string,
): EventStatus {
  if (e.dateTo < today) return "ended";
  if (e.dateFrom > today) return "upcoming";
  return "ongoing";
}

/** 런타임의 오늘 날짜 (KST 기준 로컬 날짜) */
export function todayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
