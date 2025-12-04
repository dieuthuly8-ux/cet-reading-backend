# Cloudflare Pages 部署说明

## ✅ 已完成的操作

### 1. 移除的文件
为了符合 Cloudflare Pages **25MB单文件大小限制**，以下文件已从Git仓库中移除：

- **所有音频文件** (`.mp3`)
  - `四级听力/` 目录（50+个文件）
  - `六级听力/` 目录（50+个文件）
  - `assets/audio/` 目录（50+个文件）
  
- **所有PDF文件** (`.pdf`)
  - `英语四级/` 目录（100+个文件）
  - `英语六级/` 目录（50+个文件）
  - `assets/papers/` 目录

### 2. 已更新的配置
`.gitignore` 文件已更新，防止大文件被重新提交：
```
# 音频文件
*.mp3
*.wav
*.ogg
四级听力/
六级听力/

# PDF文件
*.pdf
英语四级/
英语六级/
关键信息/

# assets目录中的大文件
assets/audio/
assets/cet4/
assets/cet6/
assets/papers/
```

---

## 🌐 部署后的网站功能

### ✅ 完全正常的功能
- 网站首页和导航
- 轮播图和UI界面
- 真题列表浏览
- 阅读神器（翻译功能需配置API）
- 搜索功能
- 所有页面交互

### ⚠️ 需要后续配置的功能
- 听力音频播放
- PDF真题下载

---

## 📦 如何恢复音频和PDF功能

### 方案1：使用 Cloudflare R2（推荐）
Cloudflare R2 是对象存储服务，与Pages完美集成。

**优点：**
- 免费10GB存储
- 免费流量
- 全球CDN加速
- 与Pages在同一平台

**步骤：**
1. 在Cloudflare控制台创建R2存储桶
2. 上传音频和PDF文件
3. 配置公开访问
4. 更新网页中的文件链接

### 方案2：使用阿里云OSS / 腾讯云COS
国内CDN，中国访问速度快。

**优点：**
- 国内访问速度快
- 价格便宜
- 稳定可靠

**步骤：**
1. 注册阿里云/腾讯云
2. 开通OSS/COS服务
3. 上传文件
4. 配置CDN加速
5. 更新网页中的文件链接

### 方案3：使用GitHub Releases
免费，适合开源项目。

**优点：**
- 完全免费
- 无需额外账号
- 与代码仓库集成

**步骤：**
1. 在GitHub仓库创建Release
2. 上传音频和PDF文件作为附件
3. 使用jsDelivr CDN加速
4. 链接格式：`https://cdn.jsdelivr.net/gh/用户名/仓库名@release/文件路径`

### 方案4：使用七牛云
提供免费额度。

**优点：**
- 有免费额度
- 国内访问快
- 简单易用

---

## 🔧 修改代码引用大文件

### 示例：修改听力音频引用

**原代码（本地文件）：**
```javascript
const audioUrl = 'assets/audio/cet4-listening/cet4-2023-12-set1.mp3';
```

**新代码（CDN链接）：**
```javascript
// 使用Cloudflare R2
const audioUrl = 'https://你的存储桶名.r2.dev/cet4-listening/cet4-2023-12-set1.mp3';

// 或使用其他CDN
const audioUrl = 'https://cdn.example.com/cet4-listening/cet4-2023-12-set1.mp3';
```

### 示例：修改PDF下载链接

**原代码：**
```html
<a href="英语四级/2023年12月.pdf" download>下载真题</a>
```

**新代码：**
```html
<a href="https://你的CDN地址/2023年12月.pdf" download>下载真题</a>
```

---

## 🚀 当前部署状态

- **仓库：** https://github.com/dieuthuly8-ux/cet-reading-backend
- **分支：** main
- **部署平台：** Cloudflare Pages
- **预计网址：** https://cet-reading-backend.pages.dev

---

## 📝 后续待办事项

### 立即任务
- [x] 移除大文件
- [x] 推送到GitHub
- [ ] 等待Cloudflare部署完成
- [ ] 测试网站基本功能

### 长期任务
- [ ] 选择CDN方案托管大文件
- [ ] 上传音频和PDF到CDN
- [ ] 修改网页代码引用CDN链接
- [ ] 配置百度翻译API环境变量

---

## 💡 提示

1. **本地文件仍然保留**  
   大文件只是从Git仓库中移除，你的本地文件夹中仍然保留，不会丢失。

2. **重新开发时注意**  
   修改代码时不要直接提交大文件，使用CDN链接代替。

3. **环境变量配置**  
   翻译功能需要在Cloudflare Pages设置中配置：
   - `BAIDU_APPID`
   - `BAIDU_SECRET`

---

## 📞 需要帮助？

如果在部署或配置过程中遇到问题，可以：
1. 查看Cloudflare Pages构建日志
2. 检查浏览器控制台错误
3. 参考本文档的解决方案
