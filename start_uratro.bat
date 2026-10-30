@echo off
title URATRO Launcher
echo ==============================================================
echo URATRO // Autonomous Smart Metro & Operations Management System
echo ==============================================================
echo.
echo [*] Starting FastAPI Backend on http://localhost:8000...
start "URATRO Backend" cmd /k "python backend\run.py"

echo [*] Starting Vite Frontend on http://localhost:3000...
start "URATRO Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 3000"

echo [*] Waiting for services to initialize...
timeout /t 3 > nul

echo [*] Launching Control Room in default browser...
start http://localhost:3000

echo.
echo [✓] URATRO is running! Press any key to exit this launcher window.
pause > nul
