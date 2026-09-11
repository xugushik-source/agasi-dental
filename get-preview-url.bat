@echo off
cd /d "%~dp0"

echo ============================
echo Cleaning up a leftover git lock file (safe, this is normal)
echo ============================
if exist ".git\index.lock" del /f ".git\index.lock"

echo.
echo ============================
echo Trying git commit again
echo ============================
git add -A
git commit -m "Add static Google Reviews block (no API, no key)"
git status

echo.
echo ============================
echo Getting the live Preview link
echo ============================
call npx fimo@latest preview url

echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
