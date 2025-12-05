@echo off
chcp 65001 >nul
echo ===================================
echo   检查并重新配置七牛云
echo ===================================
echo.
echo 步骤1：删除旧配置
"%~dp0qshell.exe" user clean
echo.
echo 步骤2：重新获取密钥
echo 打开浏览器...
start https://portal.qiniu.com/user/key
echo.
echo 请仔细复制 AccessKey 和 SecretKey
echo 注意：不要有多余的空格！
echo.
pause
echo.
echo ===================================
set /p AK=请粘贴 AccessKey（完整复制）: 
set /p SK=请粘贴 SecretKey（完整复制）: 
echo.
echo 正在配置...
"%~dp0qshell.exe" account %AK% %SK% qiniu-account
echo.
echo 测试配置是否成功...
"%~dp0qshell.exe" user ls
echo.
echo ===================================
echo   配置完成！
echo ===================================
echo.
echo 如果上面显示了你的空间列表，说明配置成功
echo 现在可以重新运行：一键上传所有文件.bat
echo.
pause
