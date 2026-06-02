@echo off
cd /d "%~dp0"
echo Starting Fiesta site on http://localhost:3001
echo (Scraping dashboard should run on port 3000)
echo.
npx next dev -p 3001
pause
