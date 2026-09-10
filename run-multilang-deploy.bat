@echo off
cd /d "%~dp0"

echo ============================
echo STEP 1: git add + commit
echo ============================
git add -A
git commit -m "Multilingual SEO UX architecture"

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
  echo BUILD FAILED - stopping. Nothing else will run.
  goto :end
)

echo.
echo ============================
echo STEP 3: verifying all expected files in dist
echo ============================
set MISSING=0
for %%F in (
  dist\index.html
  dist\about.html
  dist\tips.html
  dist\staff.html
  dist\ka\index.html
  dist\ka\about.html
  dist\ka\tips.html
  dist\ru\index.html
  dist\ru\about.html
  dist\ru\tips.html
  dist\hy\index.html
  dist\hy\about.html
  dist\hy\tips.html
  dist\images\logo.webp
  dist\images\about-photo.webp
  dist\images\tips-photo-hygiene.webp
  dist\images\tips-photo-detail.webp
  dist\robots.txt
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
echo All 18 expected files are present in dist.

echo.
echo ============================
echo STEP 4: registering new language routes in Fimo pages registry
echo (existing home/about/tips/staff routes are left untouched)
echo ============================
call npx fimo@latest pages set ka-index --path /ka/index.html --label "KA Home"
call npx fimo@latest pages set ka-about --path /ka/about.html --label "KA About"
call npx fimo@latest pages set ka-tips  --path /ka/tips.html  --label "KA Tips"
call npx fimo@latest pages set ru-index --path /ru/index.html --label "RU Home"
call npx fimo@latest pages set ru-about --path /ru/about.html --label "RU About"
call npx fimo@latest pages set ru-tips  --path /ru/tips.html  --label "RU Tips"
call npx fimo@latest pages set hy-index --path /hy/index.html --label "HY Home"
call npx fimo@latest pages set hy-about --path /hy/about.html --label "HY About"
call npx fimo@latest pages set hy-tips  --path /hy/tips.html  --label "HY Tips"

echo.
echo ============================
echo STEP 5: Fimo Preview deploy (no --publish)
echo ============================
call npx fimo@latest deploy -m "Multilingual SEO UX architecture"

:end
echo.
echo ============================
echo FINISHED. Copy everything above (from the top) and send it back.
echo ============================
pause
