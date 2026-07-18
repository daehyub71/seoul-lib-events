# 서울도서관 행사 탐색

> English documentation: [README.md](README.md)

서울도서관에서 2012–2025년에 열린 행사·강연·전시 및 야외 독서공간 운영 일정 1,414건을 지도, 층별 건물 안내, 월간 달력, 카드 목록으로 탐색하는 웹앱입니다.

Next.js 16(정적 생성)으로 만들어 Vercel에 배포합니다.

## 데이터 출처

서울도서관 일정 정보 공공데이터(`data/서울도서관 일정 정보.json`, 1,414건)를 사용합니다. 원본은 빌드 시점에 정규화됩니다:

- 일정 타입 코드 → 라벨 매핑 (행사/강연/전시/야외 독서공간 운영·미운영)
- 제각각인 장소 표기(예: "사서교육장" 표기만 5가지)를 16개 표준 공간 + 층 정보로 통일
- 주간 반복 일정은 요일 정보를 유지해 달력에서 전개 가능

## 주요 기능

- **지도 뷰(메인)**: Leaflet + OpenStreetMap에 4개 지점 핀(서울도서관·책읽는 서울광장·광화문 책마당·책읽는 맑은냇가). 핀마다 현재 필터 기준 건수 뱃지가 표시됩니다. 서울도서관 핀을 클릭하면 **4F–1F 층별 실내 안내**로 전환되어 공간별 행사를 탐색할 수 있습니다.
- **달력 뷰**: 월간 그리드에 기간 행사는 가로 바(3레인 + 날짜별 "+N건" 오버플로)로, 주간 반복 일정은 해당 요일마다 칩으로 표시. 날짜 클릭 시 그날 진행 중인 일정 패널.
- **목록 뷰**: 카드 그리드 + 30건 단위 더보기.
- **공통 필터**: 카테고리(행사 ↔ 야외공간 운영)·유형·공간·연도·검색. 필터 상태가 URL에 동기화되어 공유 가능합니다.
- **행사 상세**: 기간·시간·반복·장소·주최·내용·신청 링크(있는 경우).

## 시작하기

Node.js 20.9 이상이 필요합니다.

```bash
npm install
npm run dev        # http://localhost:3000 (커밋된 전처리 데이터로 바로 실행)
```

### 테스트

```bash
npm test           # Vitest: 113개 (로직 TDD + 컴포넌트 + 데이터 계약)
npm run test:watch
```

### 빌드

```bash
npm run build      # prebuild 훅이 전처리+검증을 재실행한 뒤 정적 빌드
npm start
```

## 데이터 갱신

`data/서울도서관 일정 정보.json`을 새 파일로 교체한 뒤:

```bash
npm run preprocess   # public/data/events.json 재생성, 미매칭 장소 리포트 출력
```

건수가 기대 프로필과 다르면 스크립트가 실패(종료 코드 1)하므로 잘못된 파일이 조용히 배포되지 않습니다. 데이터가 정상적으로 늘어난 경우에는 `scripts/preprocess.mjs`의 검증 수치를 함께 수정하세요.

## 프로젝트 구조

```
docs/            SPEC.md · PLAN.md · TASKS.md (스펙 주도 개발 문서)
data/            원본 공공데이터 (수정하지 않음)
scripts/         normalize.mjs (변환 로직, 테스트와 공유) · preprocess.mjs (빌드 단계)
public/data/     events.json (전처리 산출물, 커밋 포함)
src/lib/         filter, urlState, status, mapData, floorData, calendarData, recurrence
src/components/  App, MapView, FloorPlanView, CalendarView, CardListView,
                 EventListPanel, EventDetail, FilterBar
tests/           Vitest + Testing Library
```

개발은 SDD(SPEC 우선 — `docs/SPEC.md`가 단일 기준)와 TDD(로직 모듈은 테스트 먼저)를 따릅니다. 요구사항 ID(F1~F14, N1~N7)는 `docs/`를 참조하세요.

## 배포

`main`에 push하면 Vercel(GitHub 연동)이 자동으로 빌드·배포합니다. 서버 런타임이 필요 없는 완전 정적 사이트이며, 데이터는 번들된 JSON 파일입니다.
