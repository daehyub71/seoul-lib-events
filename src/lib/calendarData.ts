import type { LibEvent } from "./types";
import { occursOnDate } from "./recurrence";

export interface YearMonth {
  year: number;
  month: number; // 1~12
}

export interface Segment {
  event: LibEvent;
  /** 주 내 칸 인덱스 (일=0 ~ 토=6) */
  startCol: number;
  endCol: number;
  lane?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const dateStr = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** F4 — 월 그리드 (일요일 시작, 월 밖 칸은 null) */
export function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = first.getUTCDay();

  const cells: (string | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => dateStr(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** F5 — 특정 날짜에 진행 중인 일정 (반복 반영) */
export function eventsOnDate(events: LibEvent[], date: string): LibEvent[] {
  return events.filter((e) => occursOnDate(e, date));
}

/**
 * F4 — 한 주(7칸)에 걸치는 세그먼트 목록.
 * 기간 일정은 주 범위로 잘린 연속 바, 주 반복 일정은 해당 요일의 단일 칸.
 */
export function weekSegments(events: LibEvent[], week: (string | null)[]): Segment[] {
  const segs: Segment[] = [];
  for (const e of events) {
    if (e.period === "week" && e.periodValue) {
      for (let col = 0; col < 7; col++) {
        const d = week[col];
        if (d && occursOnDate(e, d)) segs.push({ event: e, startCol: col, endCol: col });
      }
      continue;
    }
    let startCol = -1;
    let endCol = -1;
    for (let col = 0; col < 7; col++) {
      const d = week[col];
      if (d && d >= e.dateFrom && d <= e.dateTo) {
        if (startCol < 0) startCol = col;
        endCol = col;
      }
    }
    if (startCol >= 0) segs.push({ event: e, startCol, endCol });
  }
  // 시작 칸 → 긴 바 우선 → 시작일 순으로 정렬 (레인 배치 안정화)
  return segs.sort(
    (a, b) =>
      a.startCol - b.startCol ||
      b.endCol - b.startCol - (a.endCol - a.startCol) ||
      (a.event.dateFrom < b.event.dateFrom ? -1 : 1),
  );
}

/**
 * F4 — 그리디 레인 배치. maxLanes를 넘는 세그먼트는 날짜(칸)별 오버플로 건수로 집계.
 */
export function assignLanes(
  segs: Segment[],
  maxLanes: number,
): { placed: Segment[]; overflow: Map<number, number> } {
  const laneEnds: number[][] = Array.from({ length: maxLanes }, () => []);
  const placed: Segment[] = [];
  const overflow = new Map<number, number>();

  for (const seg of segs) {
    const lane = laneEnds.findIndex(
      (occupied) => !occupied.some((col) => col >= seg.startCol && col <= seg.endCol),
    );
    if (lane >= 0) {
      for (let c = seg.startCol; c <= seg.endCol; c++) laneEnds[lane].push(c);
      placed.push({ ...seg, lane });
    } else {
      for (let c = seg.startCol; c <= seg.endCol; c++) {
        overflow.set(c, (overflow.get(c) ?? 0) + 1);
      }
    }
  }
  return { placed, overflow };
}

/** F7 — 데이터가 존재하는 가장 최근 월 */
export function latestMonthOf(events: LibEvent[]): YearMonth {
  let max = "";
  for (const e of events) if (e.dateFrom > max) max = e.dateFrom;
  if (!max) return { year: 2025, month: 5 };
  return { year: Number(max.slice(0, 4)), month: Number(max.slice(5, 7)) };
}

export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const idx = ym.year * 12 + (ym.month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12 + 12) % 12 + 1 };
}
