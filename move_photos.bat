@echo off
mkdir public\missing_photos 2>nul
mkdir public\images 2>nul
xcopy /Y /I "..\missing_photos\*" "public\missing_photos\"
copy /Y "C:\Users\123\.gemini\antigravity\brain\33083e1a-a8e6-49eb-b1f7-d14a0680015b\rabbi_at_chuppah_1778349253982.png" "public\images\rabbi_chuppah.png"
echo Photos moved and Rabbi image updated!
pause
