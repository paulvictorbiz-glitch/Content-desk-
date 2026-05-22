@echo off
REM ──────────────────────────────────────────────────────────────────────────
REM  Content Desk - Refresh real asset list from Google Drive
REM  Pulls file-name metadata (read-only) for the client content folder and
REM  writes app\drive-assets.js. Run this whenever new assets are added to
REM  Drive, then refresh the browser.
REM
REM  Fully self-contained: uses drive-sync\credentials.json + token.json.
REM  Does NOT touch Ziflow or Footage Brain.
REM ──────────────────────────────────────────────────────────────────────────

echo.
echo  === Content Desk - Google Drive Asset Sync ===
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3 from https://python.org/
    pause & exit /b 1
)

set ROOT=%~dp0
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

python "%ROOT%\drive-sync\sync.py"
if errorlevel 1 (
    echo.
    echo [ERROR] Sync failed. See the message above.
    pause & exit /b 1
)

echo.
echo [OK] Asset list updated. Refresh http://localhost:3000 to see it.
echo.
pause
