# TASKS — 서울도서관 행사 탐색 웹페이지

> PLAN.md의 마일스톤을 실행 단위로 분해. 완료 시 체크. 각 마일스톤 종료 시 사용자 확인.
> 문서 관리 원칙(SPEC §0): 요구사항 변경 시 SPEC → PLAN → TASKS 순으로 갱신. SPEC이 기준 문서.

## M1. 프로젝트 셋업 + 데이터 파이프라인

- [x] T1-1. Next.js 프로젝트 생성 위치 확정 → **`youtube_src/seoul-lib-events/` 하위에 생성** (사용자 변경 요청 반영: youtube_src에 다른 프로젝트도 추가 예정)
- [x] T1-2. Next.js + TypeScript + Tailwind 프로젝트 생성 (create-next-app 최신이 **Next.js 16.2.10** 설치 — 계획서의 15보다 신버전으로 진행)
- [x] T1-3. `constants/scheduleTypes.ts` — 타입 코드 매핑 (SPEC §2.2)
- [x] T1-4. `constants/venues.ts` — 표준 공간·층·좌표 정의 (SPEC §2.3~2.4)
- [x] T1-5. `scripts/preprocess.mjs` — 원본 JSON → `public/data/events.json` 변환 (PLAN §3)
- [x] T1-6. 전처리 검증: 총 1,414건, 행사 994 / 야외 420 통과
- [x] T1-7. venue 매칭 규칙 보완 (원본 오타 "서ㅏ서교육장"→사서교육장, 청계천→맑은냇가 지점 추가. 잔여 미매칭 32종 35건은 시민청·구청·공원 등 진짜 외부 일회성 장소 → "기타/미지정" 확정)
- [x] T1-8. `package.json`에 `preprocess`/`prebuild` 스크립트 연결, `lib/types.ts` 작성, `next build` 통과 확인

## M1.5. 테스트 인프라 + M1 소급 (TDD 도입, 2026-07-18 방법론 변경) ✅

- [x] T1.5-1. Vitest + @testing-library/react + jsdom 설치, `npm test` / `npm run test:watch` 구성
- [x] T1.5-2. 전처리 로직을 `scripts/normalize.mjs`로 분리 (preprocess.mjs와 테스트가 공유)
- [x] T1.5-3. 정규화 단위 테스트 46개 (날짜/시간 포맷, venue 매칭 규칙, 오타 케이스 포함) — `tests/normalize.test.mjs`
- [x] T1.5-4. 데이터 계약 테스트 (건수·카테고리 합계·venueId 유효성·정렬·주반복 요일) — `tests/events-data.test.mjs`

## M2. 목록 뷰 + 필터 + 상세 (TDD 순서로 재구성) ✅ 2026-07-18 완료

- [x] T2-1. **[Red]** `lib/filter.ts` 테스트 작성 — Red 상태(모듈 부재로 실패) 확인
- [x] T2-2. **[Green]** `lib/filter.ts` 구현, 테스트 통과
- [x] T2-3. **[Red→Green]** `lib/urlState.ts` — 직렬화/파싱/round-trip/잘못된 값 방어
- [x] T2-4. **[Red→Green]** `lib/status.ts` — 종료/진행중/예정 경계값 포함
- [x] T2-5. `lib/data.ts` — events.json 클라이언트 fetch (모듈 캐시) + useEvents 훅
- [x] T2-6. `FilterBar` — 카테고리 탭, 유형·공간·연도 셀렉트, 검색 입력 (+컴포넌트 테스트 3개)
- [x] T2-7. `CardListView` — 카드 그리드, 30건 더보기, 미운영 회색 처리 (+컴포넌트 테스트 3개)
- [x] T2-8. `EventDetail` 모달 — 전체 필드 + 상태 뱃지 + 외부 링크 + ESC 닫기 (+컴포넌트 테스트 3개)
- [x] T2-9. 필터 ↔ URL 동기화(router.replace), 뷰 전환 탭 ([지도]/[달력]은 placeholder, M3/M5 전까지 기본 뷰=목록)
- [x] T2-10. 전체 테스트 72개 + `next build` 통과, 프로덕션 서버 스모크 테스트(페이지 200, events.json 200)

> M2 구현 노트 (Next.js 16 대응): useSearchParams를 쓰는 클라이언트 트리는 `page.tsx`(서버 컴포넌트)에서
> `<Suspense>`로 감싸야 정적 빌드 가능. metadata는 서버 컴포넌트(layout.tsx)에만 배치.

## M3. 지도 뷰 ✅ 2026-07-18 완료

- [x] T3-1. react-leaflet(v5) 설치, `dynamic(ssr:false)` 래핑, OSM 타일 설정
- [x] T3-2. 4개 지점 핀 + 현재 필터 기준 건수 뱃지 (divIcon 커스텀 핀 — 기본 마커 아이콘 번들 이슈 회피). 집계 로직 `lib/mapData.ts`는 TDD(Red→Green), 테스트 5개
- [x] T3-3. `EventListPanel` (공용 목록 패널) — 데스크톱 사이드 / 모바일은 지도 아래 배치 (+컴포넌트 테스트 4개)
- [x] T3-4. 외부 핀 클릭 → 해당 지점 일정 목록 (야외공간 미운영 회색 처리)
- [x] T3-5. 서울도서관 핀 클릭 → 현재는 관내 일정 목록 패널 표시. M4에서 이 자리에 층별 뷰 전환 연결. 기본 뷰를 목록→**지도**로 변경 (F1)
- 검증: 테스트 81개 + `next build` 통과, Leaflet 클라이언트 청크 번들 확인. 지도 타일/핀의 시각적 확인은 브라우저 필요 (`npm run dev`)

## M4. 층별 실내 뷰 ✅ 2026-07-18 완료

- [x] T4-1. 층별 단면 레이아웃 (4F→1F, SPEC §2.3 공간 배치). SVG 대신 시맨틱 HTML 블록으로 구현 (SPEC F3 변경 참조). 층 구성 로직 `lib/floorData.ts`는 TDD, 테스트 5개
- [x] T4-2. `FloorPlanView` — 공간 블록 + 건수 뱃지 + hover/선택 상태 (+컴포넌트 테스트 5개)
- [x] T4-3. 서울도서관 핀 → 층별 뷰 전환, 공간 클릭 → EventListPanel, "지도로 돌아가기"
- [x] T4-4. 층 미배정 버킷 UI (자료실 일원·도서관 외부·공간 미상·기타/미지정)
- 검증: 테스트 91개 + `next build` 통과

> 참고: GitHub 리포 연결(git init 상당)은 사용자 요청으로 M4 진행 중 선행 완료 — https://github.com/daehyub71/seoul-lib-events (T6-5의 Vercel 연동만 남음)

## M5. 달력 뷰 ✅ 2026-07-18 완료

- [x] T5-1. `lib/recurrence.ts` — 주 반복 요일 전개 + 날짜 포함 판정 (TDD, 테스트 7개. 데이터의 periodValue가 단일 요일명임을 사전 확인. 월/년 반복 9건은 기간 일정과 동일 취급)
- [x] T5-2. 월 그리드(일요일 시작) + ◀▶ 이동 + 연/월 셀렉트 점프. 초기 월은 하드코딩 대신 `latestMonthOf()`로 데이터 최신 월 자동 산출 (F7)
- [x] T5-3. 기간 행사 가로 바 — `lib/calendarData.ts`의 weekSegments + assignLanes (TDD, 테스트 10개. 3레인 + "+N건" 오버플로)
- [x] T5-4. 단일 칩·주반복 칩 표시, 바/칩 클릭→상세, 날짜 클릭→EventListPanel (F5: 기간 행사는 기간 내 모든 날짜에 노출)
- [x] T5-5. 빈 월 안내 처리. 밀집 월은 3레인+오버플로로 상한 고정 (+컴포넌트 테스트 5개)
- 검증: 테스트 113개 + `next build` 통과

## M6. 마무리 + 배포

- [ ] T6-1. 반응형 점검 (모바일 지도/층별 뷰/달력)
- [ ] T6-2. 접근성: 키보드 탐색, 색+텍스트 병행 뱃지, aria 라벨
- [ ] T6-3. 메타데이터(title/description/OG), 파비콘
- [ ] T6-3a. `README.md`(영어) 작성 — 프로젝트 소개, 데이터 출처, 기능, 실행/테스트/빌드, 배포, 데이터 갱신 (N7, 2026-07-18 추가)
- [ ] T6-3b. `README_KO.md`(한글) 작성 — README.md와 내용 일치 + 상호 링크 (N7)
- [ ] T6-4. `next build` 정적 생성 확인, Lighthouse 간단 점검
- [ ] T6-5. `git init` + GitHub 리포 생성 + Vercel 연동 (**GitHub 연동 방식으로 확정** — push 시 자동 배포)
- [ ] T6-6. 프로덕션 URL 최종 확인

## 잔여 결정

없음 — 모든 의사결정 완료 (2026-07-18). 이후 새 결정 사항 발생 시 사용자 문의 후 이 문서에 기록.
