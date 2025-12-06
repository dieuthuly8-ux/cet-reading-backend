@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================
echo   恢复线上音频路径
echo ===================================
echo.
echo 这会将 listening.json 恢复为七牛云CDN路径
echo 用于推送到GitHub部署到线上
echo.
pause
echo.

if exist "listening.json.online-backup" (
    copy /Y "listening.json.online-backup" "listening.json"
    echo ✓ 已恢复线上版本
) else (
    echo ⚠️ 未找到备份文件，运行：更新CDN链接.bat
    node 更新CDN链接.js
)

echo.
echo ===================================
echo   恢复完成！
echo ===================================
echo.
echo 现在可以运行：推送更新.bat
echo.
pause
