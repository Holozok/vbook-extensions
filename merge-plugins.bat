@echo off
chcp 65001 >nul
cls
echo.
echo ========================================
echo   Hợp nhất Plugin JSON
echo ========================================
echo.

cd /d "%~dp0"
node merge-plugins.js

echo.
echo ========================================
echo   Nhấn phím bất kỳ để đóng...
echo ========================================
pause >nul
