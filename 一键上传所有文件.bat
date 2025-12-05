@echo off
chcp 65001 >nul
echo ===================================
echo   一键上传所有文件到七牛云
echo ===================================
echo.
echo 准备上传以下内容：
echo - CET4 听力音频
echo - CET6 听力音频  
echo - CET4 真题PDF
echo - CET6 真题PDF
echo.
echo 预计时间：10-20分钟
echo.
pause
echo.

echo [1/4] 上传 CET4 听力音频...
"%~dp0qshell.exe" qupload "%~dp0qiniu-upload-cet4-audio.json"
echo.

echo [2/4] 上传 CET6 听力音频...
"%~dp0qshell.exe" qupload "%~dp0qiniu-upload-cet6-audio.json"
echo.

echo [3/4] 上传 CET4 真题PDF...
"%~dp0qshell.exe" qupload "%~dp0qiniu-upload-cet4-pdf.json"
echo.

echo [4/4] 上传 CET6 真题PDF...
"%~dp0qshell.exe" qupload "%~dp0qiniu-upload-cet6-pdf.json"
echo.

echo ===================================
echo   上传完成！
echo ===================================
echo.
echo 访问你的七牛云空间查看：
echo https://portal.qiniu.com/kodo/bucket/cet-learning-files
echo.
echo 下一步：修改网站代码连接CDN
echo.
pause
