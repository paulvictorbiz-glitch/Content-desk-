@echo off
REM ──────────────────────────────────────────────────────────────────────────
REM  Content Desk – Local Development Launch
REM  Serves the static React app on http://localhost:3000
REM  (Does not conflict with Ziflow :8000 or Footage Brain :8765)
REM ──────────────────────────────────────────────────────────────────────────

echo.
echo  ██████╗ ██████╗ ███╗   ██╗████████╗███████╗███╗   ██╗████████╗
echo  ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝
echo  ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗  ██╔██╗ ██║   ██║
echo  ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██║╚██╗██║   ██║
echo  ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██║ ╚████║   ██║
echo   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝
echo                           DESK
echo.
echo  Digital Asset Planner
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node 18+ from https://nodejs.org/
    pause & exit /b 1
)

REM Get the folder where this bat file lives
set ROOT=%~dp0
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo [INFO] Starting Content Desk on http://localhost:3000
echo.
echo        (Does NOT conflict with Ziflow :8000 or Footage Brain :8765)
echo.

REM Start the server using Node.js (only needs built-in modules — no npm install)
REM The window stays open to show server output.
node "%ROOT%\server.js"
