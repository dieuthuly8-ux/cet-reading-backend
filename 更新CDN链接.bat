@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================
echo   更新网站CDN链接
echo ===================================
echo.
echo 正在更新 listening.json 和 exam-contents.json...
echo.
node 更新CDN链接.js
echo.
echo ===================================
echo   更新完成！
echo ===================================
echo.
echo 下一步操作：
echo 1. 双击运行：推送更新.bat
echo 2. 等待Cloudflare Pages自动部署（约2分钟）
echo 3. 访问你的网站测试功能
echo.
echo 你的网站地址：
echo https://cet-study-2024.pages.dev
echo.
pause
