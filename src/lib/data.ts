"use client";

import { useEffect, useState } from "react";
import type { EventsData } from "./types";

let cache: Promise<EventsData> | null = null;

/** /data/events.json을 1회만 fetch (모듈 레벨 캐시, N1) */
export function fetchEvents(): Promise<EventsData> {
  if (!cache) {
    cache = fetch("/data/events.json").then((r) => {
      if (!r.ok) {
        cache = null;
        throw new Error(`데이터 로드 실패: ${r.status}`);
      }
      return r.json();
    });
  }
  return cache;
}

export function useEvents() {
  const [data, setData] = useState<EventsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchEvents()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
