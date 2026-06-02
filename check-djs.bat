@echo off
cd /d "%~dp0"
echo === Fiesta DJ check ===
echo.
echo 1) Open in browser after server is running:
echo    http://localhost:3001/api/vendors
echo    Search for "type":"dj" in the JSON
echo.
echo 2) DJ category page:
echo    http://localhost:3001/category/dj
echo.
echo 3) Start server if needed:
echo    npm run dev -- -p 3001
echo.
pause
