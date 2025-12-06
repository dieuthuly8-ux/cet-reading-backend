@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   直接上传所有现有音频文件
echo ========================================
echo.
echo 这将上传所有本地音频文件到七牛云
echo 保持原文件名不变
echo.
pause
echo.

echo [1/4] 上传四级听力音频...
"%~dp0qshell.exe" qupload qiniu-upload-cet4-audio.json

echo.
echo [2/4] 上传六级听力音频...
"%~dp0qshell.exe" qupload qiniu-upload-cet6-audio.json

echo.
echo [3/4] 上传四级PDF...
"%~dp0qshell.exe" qupload qiniu-upload-cet4-pdf.json

echo.
echo [4/4] 上传六级PDF...
"%~dp0qshell.exe" qupload qiniu-upload-cet6-pdf.json

echo.
echo ========================================
echo   上传完成！
echo ========================================
echo.
echo 下一步：运行 更新listening为实际文件名.js
echo.
pause
