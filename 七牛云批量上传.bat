@echo off
chcp 65001 >nul
echo ===================================
echo   四六级学习站 - 七牛云批量上传
echo ===================================
echo.
echo 请确保你已经：
echo 1. 下载了qshell工具
echo 2. 配置了账号（AK和SK）
echo 3. 创建了存储空间
echo.
pause
echo.
echo [1/4] 上传四级听力音频...
qshell qupload qiniu-upload-cet4-audio.json
echo.
echo [2/4] 上传六级听力音频...
qshell qupload qiniu-upload-cet6-audio.json
echo.
echo [3/4] 上传四级真题PDF...
qshell qupload qiniu-upload-cet4-pdf.json
echo.
echo [4/4] 上传六级真题PDF...
qshell qupload qiniu-upload-cet6-pdf.json
echo.
echo ===================================
echo   上传完成！
echo ===================================
echo.
echo 接下来：
echo 1. 登录七牛云控制台查看文件
echo 2. 复制CDN域名
echo 3. 修改网站代码中的链接
echo.
pause
