@echo off
cd /d "%~dp0"

echo ============================
echo STEP 1: git add + commit
echo ============================
git add .gitignore vite.config.js
git commit -m "Configure Vite multi-page build"

echo.
echo ============================
echo git status
echo ============================
git status

echo.
echo ============================
echo npm run build
echo ============================
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo BUILD FAILED - stopping. Deploy NOT run.
  goto :end
)

if not exist dist\index.html goto :missing
if not exist dist\about.html goto :missing
if not exist dist\staff.html goto :missing
if not exist dist\tips.html goto :missing
goto :alldone

:missing
echo.
echo ONE OR MORE PAGES MISSING FROM dist - deploy NOT run.
goto :end

:alldone
echo.
echo ============================
echo All 4 pages present in dist - running Fimo PREVIEW deploy
echo (no --publish)
echo ============================
call npx fimo@latest deploy -m "Configure Dental Clinic multi-page build"

:end
echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
