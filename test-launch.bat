@echo off
REM Test script to diagnose Content Desk startup issues

echo.
echo === Content Desk Diagnostic Test ===
echo.

REM Get the folder where this bat file lives
set ROOT=%~dp0
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo Root directory: %ROOT%
echo.

REM Check if Node.js is available
echo Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found in PATH!
    echo Please add Node.js to your system PATH
    pause
    exit /b 1
)
node --version
echo.

REM Check if server.js exists
echo Checking server.js...
if exist "%ROOT%\server.js" (
    echo [OK] server.js found
) else (
    echo [ERROR] server.js not found!
    pause
    exit /b 1
)
echo.

REM Check if HTML file exists
echo Checking Nikky Content Desk.html...
if exist "%ROOT%\Nikky Content Desk.html" (
    echo [OK] HTML file found
) else (
    echo [ERROR] HTML file not found!
    pause
    exit /b 1
)
echo.

REM Kill any existing node processes on port 3000
echo Cleaning up port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000"') do taskkill /pid %%a /f >nul 2>&1
timeout /t 1 >nul

REM Try to start the server with verbose output
echo Starting server...
echo.
node "%ROOT%\server.js"
