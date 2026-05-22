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

- **Dashboard** — KPI overview, next 7 days, pipeline, activity log
- **Assets** — Library management with filters, detail drawer, bulk actions
- **Planner** — Spreadsheet-tight scheduling table, pattern management, auto-generate rows
- **Captions** — Split list/editor, batch caption generation UI
- **Export** — CSV preview with date picker and status column toggle
- **Settings** — Topics/categories, daily patterns, LLM prompt templates

## Tech Stack

- **React 18** — via CDN (no build step required)
- **Babel standalone** — JSX transpilation
- **Local state management** — React hooks + custom reducer pattern
- **Hash-based routing** — Single-page navigation

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
├── app/                        ← React components
│   ├── app.jsx                 ← Root router
│   ├── data.js                 ← Sample data (topics, assets, posts)
│   ├── state.jsx               ← State + routing
│   ├── shell.jsx               ← Top bar, tabs, alerts
│   ├── dashboard.jsx           ← Dashboard screen
│   ├── assets.jsx              ← Assets library
│   ├── planner.jsx             ← Post planner
│   ├── captions.jsx            ← Caption editor
│   ├── export.jsx              ← CSV export
│   ├── settings.jsx            ← Configuration
│   ├── ui.jsx                  ← Design tokens & primitives
│   └── icons.jsx               ← Icon library
└── wf-*.jsx                    ← Original wireframe designs
```

## Sample Data

The app ships with realistic demo data:
- **60+ assets** with metadata (type, topic, upload date)
- **84 posts** across 6 weeks with mixed caption states
- **3 topics** (Business, Meditation, Martial arts) with colors & LLM prompts
- **Settings** with Drive config and export schema

## Development Notes

- **No build step** — Babel/React loaded from CDN
- **Immutable state** — Updates via reducer pattern
- **Hash routing** — #/dashboard?filter=empty style URLs
- **Responsive** — CSS grid layout
- **Toast notifications** — Auto-dismiss alerts

## Next Steps

- Connect to real backend (Footage Brain API)
- Persist state to localStorage or database
- Add real caption generation (Anthropic API)
- Integrate with Google Drive / cloud storage
- Add user authentication

---

**Status:** 95% complete, production-ready for customization  
**Last updated:** May 22, 2026
