import type { Category } from "@/lib/types";

/** SPEC §2.2 — schdul_ty 코드 매핑 */
export const SCHEDULE_TYPES: Record<
  string,
  { kind: string; category: Category }
> = {
  "0001": { kind: "행사", category: "event" },
  "0003": { kind: "강연", category: "event" },
  "0004": { kind: "전시", category: "event" },
  "0011": { kind: "광화문 야외마당 운영", category: "outdoor" },
  "0012": { kind: "광화문 실내마당 운영", category: "outdoor" },
  "0013": { kind: "광화문 책마당 미운영", category: "outdoor-closed" },
  "0014": { kind: "책읽는 서울광장 운영", category: "outdoor" },
  "0015": { kind: "책읽는 서울광장 미운영", category: "outdoor-closed" },
  "0016": { kind: "책읽는 맑은냇가 운영", category: "outdoor" },
  "0017": { kind: "책읽는 맑은냇가 미운영", category: "outdoor-closed" },
};

/** 행사 카테고리 내 유형 필터 옵션 */
export const EVENT_KINDS = ["행사", "강연", "전시"] as const;
