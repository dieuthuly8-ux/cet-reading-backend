@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================
echo   推送更新到GitHub
echo ===================================
echo.
echo 正在提交更改...
git add .
git commit -m "配置七牛云CDN，连接大文件"
echo.
echo 正在推送到GitHub...
git push origin main
echo.
echo ===================================
echo   推送完成！
echo ===================================
echo.
echo Cloudflare Pages会在1-2分钟内自动重新部署
echo.
echo 你的网站地址：
echo https://cet-study-2024.pages.dev
echo.
echo 请访问你的网站查看更新
echo.
pause
