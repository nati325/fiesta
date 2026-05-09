@echo off
mkdir public\missing_photos 2>nul
xcopy /Y /I "..\missing_photos\*" "public\missing_photos\"
echo Photos moved successfully!
pause
