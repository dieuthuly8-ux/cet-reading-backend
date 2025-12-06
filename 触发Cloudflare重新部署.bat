@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   触发 Cloudflare Pages 重新部署
echo ========================================
echo.

REM 添加一个空提交来触发部署
git commit --allow-empty -m "触发Cloudflare Pages重新部署 [skip ci]"

echo.
echo 正在推送到 GitHub...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 推送失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ 推送成功！
echo ========================================
echo.
echo Cloudflare Pages 将在 1-2 分钟内开始部署
echo.
echo 请刷新 Cloudflare Pages 控制台查看部署状态
echo.
pause
