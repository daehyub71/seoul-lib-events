import type { LibEvent } from "./types";

/** 요일명 (periodValue는 "금요일" 같은 단일 요일명, 데이터 검증 완료) */
const WEEKDAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

/** YYYY-MM-DD → 요일 인덱스 (일=0). UTC로 계산해 로컬 타임존 영향 제거 */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * F5/F6 — 일정이 특정 날짜에 진행 중인지.
 * 기간 일정은 기간 내 모든 날짜, 주 반복은 기간 내 해당 요일만.
 * (월/년 반복은 9건뿐이라 기간 일정과 동일하게 취급)
 */
export function occursOnDate(e: LibEvent, date: string): boolean {
  if (date < e.dateFrom || date > e.dateTo) return false;
  if (e.period === "week" && e.periodValue) {
    const target = WEEKDAY_NAMES.indexOf(e.periodValue);
    if (target >= 0) return weekdayOf(date) === target;
  }
  return true;
}

/** F6 — 주 반복 일정을 기간 내 해당 요일 날짜들로 전개 */
export function expandWeekly(e: LibEvent): string[] {
  if (e.period !== "week" || !e.periodValue) return [];
  const target = WEEKDAY_NAMES.indexOf(e.periodValue);
  if (target < 0) return [];
  const dates: string[] = [];
  // 첫 해당 요일로 점프 후 7일씩 증가
  let d = addDays(e.dateFrom, (target - weekdayOf(e.dateFrom) + 7) % 7);
  while (d <= e.dateTo) {
    dates.push(d);
    d = addDays(d, 7);
  }
  return dates;
}
