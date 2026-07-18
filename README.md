# Seoul Library Events Explorer

> 한국어 문서: [README_KO.md](README_KO.md)

A web app for exploring 1,414 events held at Seoul Metropolitan Library (2012–2025) — lectures, exhibitions, programs, and the operating schedules of its outdoor reading spaces — through an interactive map, a floor-by-floor building guide, a monthly calendar, and a filterable card list.

Built with Next.js 16 (static generation), deployed on Vercel.

## Data Source

Seoul Metropolitan Library schedule open data (`data/서울도서관 일정 정보.json`), a public dataset of 1,414 schedule records. The raw data is normalized at build time:

- Schedule type codes are mapped to labels (event / lecture / exhibition / outdoor reading space operation).
- Inconsistent venue names (e.g. five different spellings of "Librarian Training Room") are unified into 16 standard venues with floor assignments.
- Weekly recurring schedules keep their weekday so the calendar can expand them.

## Features

- **Map view** (main): Leaflet + OpenStreetMap with 4 location pins (the library, Seoul Plaza, Gwanghwamun Book Yard, Cheonggyecheon), each showing a live count for the current filters. Clicking the library pin switches to a **floor-by-floor indoor guide** (4F–1F cross-section) where each room shows its event count.
- **Calendar view**: monthly grid with multi-day events rendered as bars (3 lanes + per-day overflow), weekly recurring schedules expanded to their weekdays, and a per-date event panel.
- **List view**: card grid with load-more pagination.
- **Shared filters**: category (events vs. outdoor space operation), type, venue, year, and full-text search — synchronized to the URL so views and filters are shareable.
- **Event detail**: period, time, recurrence, venue, organizer, description, and application link when available.

## Getting Started

Requires Node.js 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000 (runs against the committed preprocessed data)
```

### Tests

```bash
npm test           # Vitest: 113 tests (logic TDD + component + data contract)
npm run test:watch
```

### Build

```bash
npm run build      # prebuild hook re-runs preprocessing + validation, then static build
npm start
```

## Data Refresh

Replace `data/서울도서관 일정 정보.json` with a newer export, then:

```bash
npm run preprocess   # regenerates public/data/events.json, reports unmatched venues
```

The script exits non-zero if record counts drift from the expected profile, so a bad file cannot ship silently. Adjust the validation numbers in `scripts/preprocess.mjs` when the dataset legitimately grows.

## Project Structure

```
docs/            SPEC.md · PLAN.md · TASKS.md (spec-driven development docs, Korean)
data/            raw open data (not modified)
scripts/         normalize.mjs (shared transform logic) · preprocess.mjs (build step)
public/data/     events.json (preprocessed, committed)
src/lib/         filter, urlState, status, mapData, floorData, calendarData, recurrence
src/components/  App, MapView, FloorPlanView, CalendarView, CardListView,
                 EventListPanel, EventDetail, FilterBar
tests/           Vitest + Testing Library
```

Development follows SDD (spec first: `docs/SPEC.md` is the source of truth) and TDD (logic modules are test-first). See `docs/` for the full requirement IDs (F1–F14, N1–N7).

## Deployment

Pushed to `main` → built and deployed automatically by Vercel (GitHub integration). No server runtime is required; the site is fully static and the data is a bundled JSON file.
