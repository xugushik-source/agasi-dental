@echo off
cd /d "%~dp0"

echo ============================
echo STEP 1: git add + commit
echo ============================
git add -A
git commit -m "Fix desktop image proportions"

echo.
echo ============================
echo git status
echo ============================
git status

echo.
echo ============================
echo STEP 2: npm run build
echo ============================
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo BUILD FAILED - stopping. Deploy NOT run.
  goto :end
)

echo.
echo ============================
echo STEP 3: verifying key files in dist
echo ============================
set MISSING=0
for %%F in (
  dist\ka\about.html
  dist\ru\about.html
  dist\hy\about.html
  dist\ka\tips.html
  dist\ru\tips.html
  dist\hy\tips.html
) do (
  if not exist "%%F" (
    echo MISSING: %%F
    set MISSING=1
  )
)
if "%MISSING%"=="1" (
  echo.
  echo ONE OR MORE EXPECTED FILES ARE MISSING FROM dist - deploy NOT run.
  goto :end
)
echo All expected files are present in dist.

echo.
echo ============================
echo STEP 4: Fimo Preview deploy (no --publish)
echo ============================
call npx fimo@latest deploy -m "Fix desktop image proportions"

:end
echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
