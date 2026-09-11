@echo off
cd /d "%~dp0"

echo ============================
echo Getting the live Preview link (plain text mode)
echo ============================
call npx fimo@latest preview url > preview_url_output.txt 2>&1
type preview_url_output.txt

echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
