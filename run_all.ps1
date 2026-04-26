# Antigravity Deepfake Detection - Launch Script

Write-Host "[LAUNCH] Launching Antigravity Deepfake Detection System..." -ForegroundColor Cyan

# 1. Start Backend
Write-Host "[BACKEND] Starting Backend API (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

# 2. Wait a moment for backend to initialize
# Pre-loading models takes some time, so we give it a head start
Start-Sleep -Seconds 3

# 3. Start Frontend
Write-Host "[FRONTEND] Starting Frontend Dashboard (Next.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "[SUCCESS] Both services are starting in separate windows." -ForegroundColor White
Write-Host "URL Backend: http://localhost:8000" -ForegroundColor Gray
Write-Host "URL Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: It may take a minute for the models to fully load into memory." -ForegroundColor DarkGray
