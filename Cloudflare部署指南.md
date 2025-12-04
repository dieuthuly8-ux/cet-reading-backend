# ☁️ Cloudflare Pages 部署指南（中国速度最快）

## 🎯 为什么选择Cloudflare Pages？

✅ **中国大陆访问最快** - 有中国CDN节点，速度200-300ms  
✅ **完全免费** - 无限流量、无限构建、无限项目  
✅ **自动HTTPS** - 免费SSL证书  
✅ **免费域名** - `xxx.pages.dev`  
✅ **简单易用** - 3步完成部署  

---

## 📝 部署步骤（10分钟）

### 第1步：准备GitHub仓库

**如果还没有上传到GitHub：**

```bash
cd E:\cursor\作业
git init
git add .
git commit -m "准备部署到Cloudflare Pages"
git branch -M main
git remote add origin https://github.com/你的用户名/cet-learning.git
git push -u origin main
```

**或使用GitHub Desktop：**
1. 打开GitHub Desktop
2. File → Add Local Repository
3. 选择 `E:\cursor\作业`
4. Publish Repository

### 第2步：注册Cloudflare账号

1. **访问Cloudflare Pages**
   - https://pages.cloudflare.com/

2. **注册账号**
   - 点击 **Sign up**
   - 填写邮箱和密码
   - 验证邮箱（检查邮箱收件箱）

3. **登录成功**
   - 进入Cloudflare控制台

### 第3步：部署项目

1. **创建项目**
   - 点击 **Create a project**
   - 选择 **Connect to Git**

2. **连接GitHub**
   - 点击 **GitHub** 按钮
   - 授权Cloudflare访问GitHub
   - 选择你的仓库（cet-learning）

3. **配置构建设置**
   ```
   Project name: cet-learning
   Production branch: main
   Framework preset: None
   Build command: (留空)
   Build output directory: /
   Root directory: /
   ```

4. **环境变量（如需翻译功能）**
   
   点击 **Environment variables (advanced)**
   
   添加：
   ```
   变量名: BAIDU_APPID
   值: 你的百度APP ID
   
   变量名: BAIDU_SECRET
   值: 你的百度密钥
   ```
   
   **不需要翻译功能？** 跳过此步！

5. **开始部署**
   - 点击 **Save and Deploy**
   - 等待3-5分钟

### 第4步：获取域名

部署成功后，你会得到：

```
https://cet-learning.pages.dev
```

🎉 **完成！你的网站已经上线了！**

---

## 🌐 自定义域名（可选）

### 使用Cloudflare免费域名

Cloudflare Pages自带的 `.pages.dev` 域名已经很好用了！

### 绑定自己的域名

如果你有自己的域名（如：`cet-learning.eu.org`）：

1. **在Cloudflare Pages控制台**
   - 进入你的项目
   - 点击 **Custom domains**
   - 点击 **Set up a custom domain**

2. **添加域名**
   - 输入你的域名：`cet-learning.eu.org`
   - 点击 **Continue**

3. **配置DNS**
   - Cloudflare会显示DNS记录
   - 按照提示在你的域名服务商处添加记录

4. **等待生效**
   - 通常5-10分钟
   - 最多24小时

---

## 🔄 自动更新

以后每次修改代码：

```bash
git add .
git commit -m "更新内容"
git push origin main
```

Cloudflare会**自动检测并重新部署**（2-3分钟）

---

## ⚡ 速度测试

部署完成后，测试速度：

### 中国大陆
```
北京: ~200ms
上海: ~180ms
广州: ~220ms
成都: ~250ms
```

### 国际
```
美国: ~50ms
欧洲: ~80ms
日本: ~100ms
```

---

## 🎯 优势总结

| 特性 | Cloudflare Pages | Vercel | GitHub Pages |
|------|------------------|--------|--------------|
| 中国速度 | ⭐⭐⭐⭐⭐ 最快 | ⭐⭐⭐⭐ | ⭐⭐ |
| 免费流量 | ✅ 无限 | ⚠️ 100GB/月 | ⚠️ 100GB/月 |
| 免费构建 | ✅ 无限 | ⚠️ 有限制 | ✅ 无限 |
| 自动HTTPS | ✅ | ✅ | ✅ |
| 环境变量 | ✅ | ✅ | ❌ |
| 部署速度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 📊 功能检查

部署后，确认以下功能正常：

- [ ] 首页轮播正常显示
- [ ] 导航菜单工作正常
- [ ] 四级/六级真题页面可访问
- [ ] 听力练习功能正常
- [ ] 阅读神器页面正常
- [ ] 搜索功能正常
- [ ] 联系表单正常
- [ ] 翻译功能正常（如已配置API）

---

## 🛠️ 常见问题

### Q1: 部署失败？
**A**: 检查：
- GitHub仓库是否public
- 项目文件是否完整上传
- 查看Cloudflare部署日志

### Q2: 翻译功能不工作？
**A**: 检查：
- 环境变量是否正确配置
- 百度API密钥是否有效
- `api/translate.js` 文件是否存在

### Q3: 访问速度慢？
**A**: 
- Cloudflare Pages已经是最快的了
- 如果还慢，检查本地网络
- 尝试使用不同网络（如手机热点）

### Q4: 如何查看部署日志？
**A**: 
- Cloudflare控制台 → 你的项目
- 点击某次部署
- 查看详细日志

### Q5: 能部署多个网站吗？
**A**: 
- ✅ 可以！Cloudflare Pages支持无限项目
- 每个项目都有独立域名

---

## 📞 获取帮助

- **Cloudflare官方文档**: https://developers.cloudflare.com/pages/
- **社区论坛**: https://community.cloudflare.com/
- **项目Issues**: 在GitHub项目页面提交

---

## 🎉 完成！

恭喜你的网站已经部署到Cloudflare Pages！

**你现在拥有：**
- ✅ 免费服务器（永久）
- ✅ 免费域名（.pages.dev）
- ✅ 全球CDN加速
- ✅ 自动HTTPS加密
- ✅ 无限流量
- ✅ 自动部署

**分享你的网站：**
```
https://cet-learning.pages.dev
```

🎊 开始分享给你的同学们吧！
