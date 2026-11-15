@echo off
setlocal
cd /d "%~dp0"
call npm run build
if errorlevel 1 exit /b 1
call npm test
if errorlevel 1 exit /b 1
call npm run check:assets
if errorlevel 1 exit /b 1
echo Build checked. Deploy API and compatible database rules together; see REPAIR_NOTES_AR.md.
call npx firebase-tools deploy --only hosting,database --project scorear2
exit /b %errorlevel%
