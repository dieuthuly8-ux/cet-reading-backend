@echo off
chcp 65001 >nul
echo ================================
echo   四六级学习站 - 一键部署
echo ================================
echo.

echo [1/3] 检查Node.js环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js已安装

echo.
echo [2/3] 安装Vercel CLI...
call npm install -g vercel
if %errorlevel% neq 0 (
    echo ❌ 安装失败，请检查网络连接
    pause
    exit /b 1
)
echo ✅ Vercel CLI安装成功

echo.
echo [3/3] 开始部署...
echo.
echo 提示：
echo - 首次部署需要登录Vercel账号（浏览器会自动打开）
echo - 如果没有Vercel账号，使用GitHub账号注册即可
echo - 登录后回到此窗口继续
echo.
pause

vercel

echo.
echo ================================
echo   部署完成！
echo ================================
echo.
echo 你的网站已部署到Vercel
echo 访问Vercel控制台查看: https://vercel.com/dashboard
echo.
pause
