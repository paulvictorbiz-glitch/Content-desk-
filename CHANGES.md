# Content Desk — Changes

## 2026-05-22 — End-to-end working app: persistence, editable planner, real export

- **`app/state.jsx`** — the planner now lives in app state and **persists to
  localStorage** (`cd_planner`); settings persist too (`cd_settings`). New
  reducer actions: `updatePlannerCell`, `cyclePosted`, `addPlannerRow`,
  `deletePlannerRow`, `markPlannerPosted`, `setPlanner`.
- **`app/planner.jsx`** — every cell is now editable (title, captions, dates,
  attachment); the Planable flag cycles pending → on Planable → n/a on click;
  rows can be added/deleted; the Generate button writes straight into the cell.
- **`app/export.jsx`** — full rewrite. Produces a **real Planable CSV download**
  (exact 10-column "Planable CSV Output" layout) with a live preview; can mark
  exported rows as on-Planable.
- **`app/captions.jsx`** — full rewrite into a caption workspace over the
  planner: every video caption / picture description / picture quote as an
  editable card, with per-cell and **batch "Generate all empty"** LLM filling.
- **`app/dashboard.jsx`** — KPIs now reflect the real library + planner
  (assets, posted, planner rows, empty captions, pending export); Next-7-days
  and pipeline read the planner.
- **`app/shell.jsx`** — nav badges and the alerts strip recomputed from the
  planner / asset library.
- **`drive-sync/sheet-sync.py`** — normalises sheet date cells to ISO.

## 2026-05-22 — Planner rebuilt to mirror the Planable CSV Output sheet

- **New `drive-sync/sheet-sync.py`** — fetches the reference sheet's
  "Planable CSV Output" tab (link-viewable CSV, no auth) → `app/planner-data.js`
  (`window.PLANNER_ROWS`, 77 rows).
- **`server.js`** — added `POST /api/sync-sheet` and `POST /api/generate-caption`
  (Anthropic API; needs `ANTHROPIC_API_KEY`).
- **`app/planner.jsx`** — full rewrite. Old single scheduling table replaced by
  a videos-left / pictures-right layout mirroring the sheet: Title, Caption,
  Date·Time, Planable flag (sheet col D) | Picture, Description, Quote, Date·Time.
  Each video carries its Google Drive link; empty caption cells show a Generate
  button. "Sync from Sheet" button refreshes from the sheet.

## 2026-05-22 — Scan button, posted detection, manual tagging

**Edited — `server.js`:**
- Added `POST /api/scan-drive` — runs `drive-sync/sync.py` and regenerates
  `app/drive-assets.js`. Returns `{ ok, count, summary }`.

**Edited — `app/data.js`:**
- Added `detectPostedDate()` — a date in the filename (e.g.
  "Nikky Kho April 1 2025.png") flags the asset as already posted
  (`posted` + `postedDate`). 723 of 1702 currently detected.
- Topic classifier: added a `business` keyword list; no keyword match now
  falls to the new `neutral` topic (was `business`) — neutral = "needs a
  manual tag". Result: 393 business, 18 meditation, 1291 neutral.
- Added the `neutral` topic and `window.CDPrefs` — manual topic tags
  persist in `localStorage`, keyed by Drive ID so they survive a re-sync.

**Edited — `app/assets.jsx`:**
- Added the **Scan Drive** button (header) — triggers `/api/scan-drive`
  then reloads.
- Old "Bulk re-topic" / "Link to planner" placeholder buttons → a working
  `TopicPicker` (tag selected assets, or one asset in the detail drawer).
- Usage column shows a `posted` pill; Usage filter gained Posted /
  Not posted. Header sub now shows "X posted · Y to tag".

**Edited — `app/state.jsx`:** added the `bulkSetTopic` reducer action.
**Edited — `app/ui.jsx`:** added the `neutral` topic colour.

## 2026-05-22 — Real Google Drive asset names

Replaced the mock asset library with real client content metadata pulled
from Google Drive (file names only, read-only scope).

**New — fully isolated, no dependency on Ziflow or Footage Brain:**
- `drive-sync/sync.py` — walks the client content folder
  (`1viPWTb6peGAQQTnDlbFg-MsJPJB7lZ_d`) and writes `app/drive-assets.js`.
- `drive-sync/credentials.json`, `drive-sync/token.json` — own copies of
  the Drive OAuth creds (gitignored). Sync reuses the existing
  `drive.metadata.readonly` authorization.
- `sync-drive.bat` — one-click refresh of the asset list.

**Edited — `app/data.js`:**
- Old: `assets` was built solely from the hardcoded `assetSeed` (54 demo rows).
- New: when `window.DRIVE_ASSETS` is present, `assets` is built from real
  Drive metadata (1702 assets — 862 video, 840 image). Falls back to the
  demo seed when `app/drive-assets.js` is absent.
- Added `topicFor()` — best-effort topic from the filename (Drive folders
  are organised by media type, not topic). Unmatched → `business`.
- Added `titleFor()` — derives a display title from the filename.

**Edited — `Nikky Content Desk.html`:**
- Loads `app/drive-assets.js` before `app/data.js` (optional; 404 is
  harmless and triggers the mock fallback).
