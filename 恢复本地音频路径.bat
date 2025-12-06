@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================
echo   恢复本地音频路径
echo ===================================
echo.
echo 这会将 listening.json 恢复为本地路径
echo 用于在本地打开网页时使用听力功能
echo.
pause
echo.
node 恢复本地音频路径.js
echo.
pause
