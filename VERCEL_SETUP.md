# Vercel部署指南 - 百度翻译API代理

## 📋 完整步骤

### 第1步：准备百度翻译API密钥

1. 访问 https://fanyi-api.baidu.com/
2. 注册/登录百度账号
3. 开通"通用翻译API"（免费版）
4. 获取 **APP ID** 和 **密钥**
5. 记录这两个值（稍后配置使用）

---

### 第2步：部署到Vercel（5分钟）

#### 1. **注册Vercel账号**
- 访问 https://vercel.com
- 使用GitHub账号登录

#### 2. **导入GitHub仓库**
- 在Vercel控制台点击 **"Add New Project"**
- 选择你的仓库 `cet-reading-backend`
- 点击 **"Import"**

#### 3. **配置环境变量（重要！）**
在部署设置页面：
- 找到 **"Environment Variables"** 区域
- 添加两个变量：
  ```
  BAIDU_APPID = 你的百度APP ID
  BAIDU_SECRET = 你的百度密钥
  ```
- ⚠️ 注意：变量名必须完全一致，区分大小写

#### 4. **点击Deploy**
- 等待3-5分钟完成部署
- 部署成功后会获得一个URL，类似：`https://your-project.vercel.app`

---

### 第3步：更新前端代码

#### 修改 `translator.html` 第191行

将：
```javascript
const API_ENDPOINT = 'https://your-vercel-app.vercel.app/api/translate';
```

改为你的实际Vercel URL：
```javascript
const API_ENDPOINT = 'https://你的项目名.vercel.app/api/translate';
```

#### 提交并推送
```bash
git add translator.html
git commit -m "update: 配置Vercel API端点"
git push origin main
```

---

### 第4步：测试

1. 等待GitHub Pages重新部署（2-3分钟）
2. 访问你的网站翻译页面
3. 输入英文文本
4. 点击"开始翻译"
5. ✅ 应该能看到翻译结果！

---

## 🎯 优势总结

✅ **用户无需配置** - 开箱即用  
✅ **API密钥安全** - 保存在Vercel环境变量，不会泄露  
✅ **完全免费** - Vercel + 百度翻译都免费  
✅ **长期稳定** - 99.9%在线率  
✅ **自动部署** - 推送代码后Vercel自动更新  

---

## ⚠️ 注意事项

1. 环境变量名必须完全一致（`BAIDU_APPID` 和 `BAIDU_SECRET`）
2. 记得更新前端的API_ENDPOINT为你的Vercel URL
3. 首次部署后，每次修改代码Vercel会自动重新部署

---

## 🆘 常见问题

**Q: 翻译失败怎么办？**  
A: 检查Vercel环境变量是否配置正确，查看Vercel控制台的函数日志

**Q: 如何查看错误日志？**  
A: 在Vercel控制台 → 你的项目 → Functions → 点击 `/api/translate` 查看日志

**Q: 可以换其他翻译API吗？**  
A: 可以，修改 `api/translate.js` 文件即可
