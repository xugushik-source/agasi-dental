@echo off
cd /d "%~dp0"

echo ============================
echo Cleaning up a leftover git lock file if any (safe, normal)
echo ============================
if exist ".git\index.lock" del /f ".git\index.lock"

echo.
echo ============================
echo git status (should be clean)
echo ============================
git add -A
git commit -m "Publish: multilingual site + Google Reviews block"
git status

echo.
echo ============================
echo npm run build
echo ============================
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo BUILD FAILED - stopping. PUBLISH NOT run.
  goto :end
)

echo.
echo ============================
echo verifying language pages in dist
echo ============================
set MISSING=0
for %%F in (
  dist\ka\index.html
  dist\ru\index.html
  dist\hy\index.html
  dist\ka\about.html
  dist\ru\about.html
  dist\hy\about.html
  dist\ka\tips.html
  dist\ru\tips.html
  dist\hy\tips.html
  dist\staff.html
) do (
  if not exist "%%F" (
    echo MISSING: %%F
    set MISSING=1
  )
)
if "%MISSING%"=="1" (
  echo.
  echo ONE OR MORE EXPECTED FILES ARE MISSING FROM dist - PUBLISH NOT run.
  goto :end
)
echo All expected files are present in dist.

echo.
echo ============================
echo PUBLISHING TO THE REAL LIVE SITE (production)
echo ============================
call npx fimo@latest deploy --publish -m "Publish: multilingual site + Google Reviews block"

echo.
echo ============================
echo Your real site address:
echo ============================
call npx fimo@latest domains list

:end
echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
