@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   上传音频文件到七牛云
echo ========================================
echo.
echo 即将上传 54 个音频文件：
echo - 四级：27 个
echo - 六级：27 个
echo.
echo 预计时间：3-5分钟（取决于网速）
echo.
pause
echo.

echo [1/2] 上传四级听力音频...
"%~dp0qshell.exe" qupload qiniu-upload-temp-cet4.json

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 四级上传失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 上传六级听力音频...
"%~dp0qshell.exe" qupload qiniu-upload-temp-cet6.json

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 六级上传失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ 上传完成！
echo ========================================
echo.
echo 下一步：
echo 1. 恢复线上版本 listening.json
echo 2. 推送到 GitHub
echo.
echo 运行：恢复线上音频路径.bat
echo 然后运行：推送更新.bat
echo.
pause
