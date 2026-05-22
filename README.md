# Content Desk — Digital Asset Planner

A React single-page application for managing digital assets, posts, captions, and scheduling. Built from design specs with realistic sample data and full interactive features.

## Quick Start

### Local Development
```bash
cd C:\Users\Mi\nikky-content-desk
launch.bat
```

Opens at **http://localhost:3000**

## Features

- **Dashboard** — live KPIs over the real library + planner, next 7 days, pipeline
- **Assets** — 1,700+ real Google Drive assets; filter, manual topic tagging,
  posted-date detection, one-click **Scan Drive**
- **Planner** — mirrors the reference sheet's *Planable CSV Output* tab: videos
  left, pictures right; every cell editable; **Sync from Sheet**
- **Captions** — caption workspace over the planner with per-cell and batch
  LLM generation
- **Export** — real **Planable CSV download** (exact 10-column layout)
- **Settings** — topics, daily patterns, LLM prompt templates

## Data sources

- **Google Drive** — asset names pulled by `drive-sync/sync.py` (read-only,
  metadata scope) → `app/drive-assets.js`
- **Reference sheet** — the *Planable CSV Output* tab pulled by
  `drive-sync/sheet-sync.py` → `app/planner-data.js`
- **localStorage** — planner edits, settings and topic tags persist across reloads
- **Anthropic API** — caption generation; set `ANTHROPIC_API_KEY` in the server
  environment to enable it

## Tech Stack

- **React 18** + **Babel standalone** — via CDN, no build step
- **Node.js `server.js`** — static serving + `/api/scan-drive`,
  `/api/sync-sheet`, `/api/generate-caption`
- **Python `drive-sync/`** — Google Drive + Sheets sync
- **Hash-based routing**, reducer state, localStorage persistence

## Port Assignment

| App | Port | Purpose |
|-----|------|---------|
| Content Desk | **3000** | Asset management & planning |
| Ziflow | 8000 | Workflow & reel management |
| Footage Brain | 8765 | Search, transcription, indexing |

**No conflicts** — all three can run simultaneously.

## Running All Three Apps Together

```bash
C:\Users\Mi\Downloads\ziflow project-final\start-all-three.bat
```

This launches:
1. Content Desk (http://localhost:3000)
2. Footage Brain (http://localhost:8765) 
3. Ziflow (http://localhost:8000)

Each in its own command window with auto-opening browser tabs.

## GitHub

Repository: https://github.com/paulvictorbiz-glitch/Content-desk-

## Project Structure

```
nikky-content-desk/
├── Nikky Content Desk.html     ← Entry point
├── launch.bat                  ← Local dev launcher
├── sync-drive.bat              ← Refresh assets from Google Drive
├── server.js                   ← Static server + sync / generate APIs
├── CHANGES.md                  ← Change log
├── drive-sync/                 ← Google Drive + Sheets sync (Python)
│   ├── sync.py                 ← Drive asset metadata → app/drive-assets.js
│   ├── sheet-sync.py           ← Planable CSV Output tab → app/planner-data.js
│   └── credentials.json/token.json  ← OAuth (gitignored)
└── app/                        ← React components
    ├── app.jsx                 ← Root router
    ├── data.js                 ← Asset model + topic/posted classifiers
    ├── drive-assets.js         ← Generated — real Drive metadata
    ├── planner-data.js         ← Generated — planner rows from the sheet
    ├── state.jsx               ← Reducer state + routing + persistence
    ├── shell.jsx               ← Top bar, tabs, alerts
    ├── dashboard.jsx           ← Live KPIs
    ├── assets.jsx              ← Asset library + tagging + Scan Drive
    ├── planner.jsx             ← Editable videos/pictures planner
    ├── captions.jsx            ← Caption workspace + LLM generation
    ├── export.jsx              ← Planable CSV export
    ├── settings.jsx            ← Configuration
    ├── ui.jsx / icons.jsx      ← Design primitives
    └── …
```

## Development Notes

- **No build step** — Babel/React from CDN; `server.js` serves files fresh
- **Persistence** — planner edits, settings and topic tags live in localStorage
- **Refreshing data** — "Scan Drive" (Assets) and "Sync from Sheet" (Planner)
  re-run the Python sync scripts and reload
- **Caption generation** — needs `ANTHROPIC_API_KEY` in the server environment

---

**Last updated:** May 22, 2026
