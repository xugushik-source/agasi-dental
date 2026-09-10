@echo off
cd /d "%~dp0"

echo ============================
echo git add + commit
echo ============================
git add -A
git commit -m "SEO: meta/OG/robots/schema, staff.html noindex, lazy-load below-fold images"

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
if not exist dist\robots.txt goto :missing
goto :alldone

:missing
echo.
echo ONE OR MORE EXPECTED FILES MISSING FROM dist - deploy NOT run.
goto :end

:alldone
echo.
echo ============================
echo All expected files present in dist - running Fimo PREVIEW deploy
echo (no --publish)
echo ============================
call npx fimo@latest deploy -m "SEO UX and content improvements"

:end
echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
