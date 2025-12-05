@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================
echo   手动重新配置七牛云密钥
echo ===================================
echo.
echo 正在清除旧配置...
qshell.exe user clean
echo.
echo ===================================
echo 请访问七牛云获取密钥：
echo https://portal.qiniu.com/user/key
echo.
echo 重要提示：
echo 1. 完整复制 AccessKey（不要有空格）
echo 2. 完整复制 SecretKey（不要有空格）
echo 3. 粘贴时右键点击命令行窗口
echo ===================================
echo.
pause
echo.
set /p AK=请输入完整的 AccessKey: 
set /p SK=请输入完整的 SecretKey: 
echo.
echo 你输入的 AK: %AK%
echo 你输入的 SK: %SK%
echo.
echo 确认无误？
pause
echo.
echo 正在配置账号...
qshell.exe account %AK% %SK% qiniu-account
echo.
echo 测试配置...
qshell.exe user ls
echo.
echo ===================================
echo 如果上面显示了空间列表，说明配置成功！
echo ===================================
pause
