@echo off
setlocal
set "OPENCLAW_HOME=%~dp0.claw"
node "%~dp0openclaw\openclaw.mjs" %*
endlocal
