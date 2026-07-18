# PLAN — 서울도서관 행사 탐색 웹페이지

> SPEC.md의 요구사항을 구현하기 위한 기술 계획. 작업 단위는 TASKS.md 참조.
> 문서 관리 원칙(SPEC §0): 요구사항 변경 시 SPEC → PLAN → TASKS 순으로 갱신. SPEC이 기준 문서.

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript | Vercel 최적화, SSG. (계획 시점 15 → 생성 시점 최신 16.2.10) |
| 스타일 | Tailwind CSS | 빠른 반응형 구현 |
| 지도 | react-leaflet + OpenStreetMap 타일 | 무료, API 키 불필요. SSR 비호환이므로 `dynamic import(ssr:false)` 필수 |
| 실내 지도 | 자체 SVG 컴포넌트 | 층별 단면도는 라이브러리보다 직접 그리는 편이 단순 |
| 달력 | 자체 구현 (월 그리드) | 기간 바 + 반복 전개 요구사항이 커스텀이라 라이브러리 이득 적음 |
| 상태 관리 | React state + URL searchParams | 필터 상태를 URL에 반영해 공유 가능하게. 별도 라이브러리 불필요 |
| 데이터 | 빌드 전 전처리 스크립트 → 정적 JSON | 아래 §3 |

## 2. 프로젝트 구조 (예정)

```
youtube_src/                          # 여러 프로젝트가 공존하는 상위 작업 폴더
└─ seoul-lib-events/                  # 본 프로젝트 루트 (git 리포)
   (아래 경로는 모두 seoul-lib-events/ 기준)
├─ data/서울도서관 일정 정보.json     # 원본 (수정하지 않음)
├─ docs/ (SPEC.md, PLAN.md, TASKS.md)
├─ scripts/preprocess.mjs            # 원본 → public/data/events.json 변환
├─ public/data/events.json           # 전처리 결과 (빌드 산출물, 커밋 포함)
└─ src/
   ├─ app/
   │  ├─ layout.tsx / page.tsx       # 단일 페이지 (뷰 전환은 클라이언트)
   │  └─ globals.css
   ├─ components/
   │  ├─ MapView.tsx                 # Leaflet 실제 지도 (dynamic import)
   │  ├─ FloorPlanView.tsx           # 층별 SVG 실내 지도
   │  ├─ CalendarView.tsx            # 월간 달력
   │  ├─ CardListView.tsx            # 카드 목록
   │  ├─ EventDetail.tsx             # 상세 패널/모달
   │  ├─ FilterBar.tsx               # 카테고리 탭 + 필터 + 검색
   │  └─ EventListPanel.tsx          # 핀/공간/날짜 클릭 시 목록 패널 (공용)
   ├─ lib/
   │  ├─ types.ts                    # Event, Venue, Category 타입
   │  ├─ data.ts                     # 로드 + 인덱싱
   │  ├─ filter.ts                   # 필터/검색 로직
   │  └─ recurrence.ts               # 주간 반복 전개 (F6)
   └─ constants/
      ├─ venues.ts                   # 표준 공간, 층, 좌표 (SPEC §2.3~2.4)
      └─ scheduleTypes.ts            # 타입 코드 매핑 (SPEC §2.2)

※ 변경(2026-07-18): youtube_src에 다른 프로젝트가 계속 추가될 예정이라, 본 프로젝트는 `youtube_src/seoul-lib-events/` 하위로 구성 (사용자 요청). 배포는 GitHub 리포 연동 → Vercel 자동 배포 (확정).
```

## 3. 데이터 파이프라인

`scripts/preprocess.mjs` — 빌드 전 1회 실행 (`prebuild` 훅으로 자동화):

1. 원본 JSON 로드 → `DATA` 배열만 사용
2. 필드 변환: 날짜 `YYYYMMDD` → `YYYY-MM-DD`, 시간 `0000/0000` → null, `\r\n` 정리, 주최·장소 trim
3. 타입 코드 → 라벨/카테고리 부여 (`event` | `outdoor` | `outdoor-closed`)
4. 장소 정규화: 키워드 우선순위 매칭으로 `venueId` 부여. **매칭 안 되는 표기는 로그로 출력**해 규칙을 보완하며 수렴시킴
5. 파생 필드: `isMultiDay`, `year`, 정렬 키
6. 결과를 `public/data/events.json`으로 저장 (필요 필드만 → 용량 축소 예상)

검증: 전처리 후 건수 합계(1,414), 카테고리별 건수(994/420), venueId 미부여 비율을 스크립트가 출력.
venueId 미부여가 미기재(545건) 외에 과도하게 남으면 규칙 추가.

## 4. 화면/인터랙션 설계

단일 페이지, 상단 뷰 전환 탭: **[지도] [달력] [목록]** + 카테고리 탭 **[행사] [야외공간 운영]** + FilterBar.
필터 상태는 3개 뷰가 공유하며 URL 쿼리에 동기화.

### 지도 뷰 (기본)
- 데스크톱: 좌측 지도 65% + 우측 목록 패널 35%. 모바일: 지도 위 + 하단 시트.
- 서울도서관 핀 클릭 → 같은 영역이 FloorPlanView로 전환 (뒤로가기 버튼 제공)
- FloorPlanView: 4개 층 단면 스택(시맨틱 HTML 블록, SPEC F3 변경 참조). 공간 블록에 건수 뱃지, hover 하이라이트, 클릭 시 우측 패널에 목록. 층 미배정 건은 하단 버킷 칩(자료실 일원·도서관 외부·공간 미상·기타)
- 외부 3개 핀은 카테고리와 무관하게 항상 표시하되, 현재 카테고리에 해당하는 건수만 뱃지에 반영

### 달력 뷰
- 초기 월: 2025-05 (데이터 최신 월). `◀ ▶` 이동 + 연/월 점프 셀렉트
- 기간 행사는 주 단위 가로 바(최대 3줄, 초과분 "+N건"), 단일 행사는 칩
- 주 반복(73건)은 `recurrence.ts`에서 요일 기준 개별 날짜로 전개
- 날짜 클릭 → 하단/사이드 목록 패널

### 목록 뷰
- 카드 그리드 (모바일 1열 / 데스크톱 2~3열), 최신순, 30건 단위 더보기
- 카드 클릭 → EventDetail

### 상세 (공용)
- 모달. 유형 뱃지 + 상태 뱃지(종료/진행중/예정, 2026-07 기준 계산은 런타임 `new Date()`)
- `refer_url` 있으면 "신청/안내 페이지" 외부 링크 버튼

## 5. 구현 단계 (마일스톤)

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| M1 | 프로젝트 셋업 + 데이터 파이프라인 | `events.json` 생성, 검증 수치 통과 |
| M2 | 목록 뷰 + 필터/검색 + 상세 | 필터 조합이 정확한 건수 반환 |
| M3 | 지도 뷰 (실제 지도 + 핀 + 패널) | 4개 핀, 건수 뱃지, 클릭 목록 동작 |
| M4 | 층별 실내 뷰 | 핀→층별 뷰 전환, 공간별 탐색 동작 |
| M5 | 달력 뷰 (기간 바 + 반복 전개) | 2024-11 등 밀집 월 정상 렌더 |
| M6 | 반응형/접근성 다듬기 + README(영/한) 작성 + Vercel 배포 | 모바일 확인, README.md·README_KO.md(N7), 프로덕션 URL |

각 단계 종료 시 사용자 확인 후 다음 단계 진행. 목록(M2)을 지도(M3)보다 먼저 만드는 이유:
필터·데이터 로직을 가장 단순한 뷰에서 검증한 뒤 지도/달력이 재사용하기 위함.

## 6. 테스트 전략 (TDD, SPEC §0)

| 계층 | 도구 | 방식 |
|---|---|---|
| 로직 (전처리 정규화, filter, recurrence, 상태 계산, URL 직렬화) | Vitest | **테스트 먼저 작성 → 구현**. 순수 함수로 분리해 픽스처 기반 단위 테스트 |
| 컴포넌트 (FilterBar, CardListView, EventDetail 등) | Vitest + @testing-library/react (jsdom) | 핵심 렌더링·상호작용 테스트. UI 세부 스타일은 테스트하지 않음 |
| 데이터 계약 | Vitest | 실제 전처리 산출물(events.json)에 대해 건수·카테고리·venueId 유효성 검증 |
| 빌드 | `next build` | prebuild 검증 + 정적 생성 통과 |

- 실행: `npm test` (watch: `npm run test:watch`). 마일스톤 완료 조건에 전체 테스트 통과 포함.
- 전처리 로직은 `scripts/normalize.mjs`로 분리해 preprocess.mjs와 테스트가 공유 (M1 소급 적용).

## 7. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| Leaflet SSR 충돌 (`window` 참조) | `next/dynamic` + `ssr: false` 고정 패턴 |
| 장소 정규화 누락으로 실내 뷰 건수 왜곡 | 전처리 스크립트가 미매칭 표기를 리포트 → 규칙 반복 보완. "기타/미지정" 버킷 상시 노출로 누락 가시화 |
| 생각마루 층 표기 혼재 (1층/2층) | 대표 층으로 통일하되 상세에 원문 장소 그대로 표시 |
| 달력 기간 바 겹침 렌더링 복잡도 | 주 단위 레인 배치 알고리즘 단순화 (3레인 + "+N") |
| 야외공간 운영 데이터가 달력 도배 | 카테고리 분리(확정)로 기본 화면에서 제외 |
