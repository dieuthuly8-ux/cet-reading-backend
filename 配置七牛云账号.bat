@echo off
chcp 65001 >nul
echo ===================================
echo   配置七牛云账号
echo ===================================
echo.
echo 请先获取你的七牛云密钥：
echo 1. 访问：https://portal.qiniu.com/user/key
echo 2. 复制 AccessKey 和 SecretKey
echo.
echo 打开浏览器获取密钥...
start https://portal.qiniu.com/user/key
echo.
pause
echo.
echo ===================================
set /p AK=请粘贴你的 AccessKey: 
set /p SK=请粘贴你的 SecretKey: 
echo.
echo 正在配置...
"%~dp0qshell.exe" account %AK% %SK% qiniu-account
echo.
echo ===================================
echo   配置完成！
echo ===================================
echo.
echo 现在可以运行：一键上传所有文件.bat
echo.
pause
