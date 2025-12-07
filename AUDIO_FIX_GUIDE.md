# 听力音频修复指南

## 问题原因
七牛云测试域名 `t6r1sg3dy.hd-bkt.clouddn.com` 不支持HTTPS，但网站部署在Cloudflare Pages（HTTPS），浏览器会阻止混合内容。

## 解决方案

### 方案1：配置自定义域名（推荐）
1. 在七牛云控制台绑定自定义域名
2. 为域名配置HTTPS证书
3. 更新 `listening.json` 中的域名

### 方案2：使用Cloudflare R2存储
1. 将音频文件上传到Cloudflare R2
2. 配置公开访问权限
3. 更新 `listening.json` 使用R2的HTTPS链接

### 方案3：临时方案 - 允许不安全内容
仅用于测试，不推荐生产环境：
1. 浏览器地址栏右侧点击锁图标
2. 选择"站点设置"
3. 允许"不安全内容"

## 快速修复脚本

已创建 `use-r2-audio.js` 脚本，可切换到R2存储（需先上传文件）。
