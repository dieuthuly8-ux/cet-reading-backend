# 🎓 CET-4/CET-6 真题练习平台

一个功能完善的英语四六级真题在线练习平台，提供听力练习、AI智能出题、实时答题等功能。

## ✨ 功能特点

### 📝 真题练习
- **完整试卷**：收录历年CET-4/CET-6真题
- **分类练习**：按题型（听力、阅读、写作、翻译）分类
- **PDF下载**：支持下载完整试卷PDF
- **题目预览**：快速预览试卷内容

### 🎧 听力专项练习
- **音频播放器**：支持暂停、快进、音量调节
- **Section标记**：可视化标记Section A、B、C位置
  - 🟢 Section A：短新闻
  - 🔵 Section B：长对话
  - 🟣 Section C：听力短文
- **点击跳转**：点击标记可直接跳转到对应Section

### 🤖 AI智能出题
- **自动生成题目**：基于听力原文智能生成5道选择题
- **快速响应**：优化后仅需10-20秒
- **本地缓存**：生成后自动缓存，避免重复生成
- **实时进度**：显示生成进度和预计时间

### 📊 重难点分析
- **词汇标注**：标记重点词汇及释义
- **句式解析**：分析复杂句式结构
- **考点总结**：归纳本套试卷的核心考点

## 🎨 界面设计

- **2×2网格按钮**：功能按钮采用清晰的2×2布局
- **活力配色**：翠绿、靛蓝、天蓝、珊瑚橙四色搭配
- **黑体字体**：按钮文字采用黑体加粗，清晰易读
- **响应式设计**：支持桌面端和移动端

## 🛠️ 技术栈

- **前端框架**：原生 JavaScript
- **样式设计**：CSS3 + Flexbox + Grid
- **AI接口**：
  - SiliconFlow API（语音转文字）
  - Qwen2.5-7B-Instruct（智能出题）
- **音频处理**：HTML5 Audio API
- **数据存储**：LocalStorage

## 📦 项目结构

```
ding-backend/
├── index.html              # 首页
├── app.js                  # 主应用逻辑
├── listening-micro.html    # 听力练习页面
├── style.css               # 全局样式
├── assets/                 # 静态资源
│   ├── papers/            # 试卷文件
│   ├── audios/            # 听力音频
│   └── cet6-pdf/          # PDF文件
├── data/                   # 数据文件
│   └── papers.json        # 试卷数据
└── README.md              # 项目说明
```

## 🚀 快速开始

### 在线访问
直接访问 GitHub Pages：[https://你的用户名.github.io/ding-backend/](https://你的用户名.github.io/ding-backend/)

### 本地运行

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/ding-backend.git
cd ding-backend
```

2. **启动本地服务器**
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js (需要安装 http-server)
npx http-server -p 8000
```

3. **访问网站**
打开浏览器访问：`http://localhost:8000`

## 📖 使用说明

### 1. 选择试卷
- 在首页选择 CET-4 或 CET-6 分类
- 浏览历年真题列表

### 2. 查看详情
- 点击 **查看详情** 查看完整试卷
- 点击 **听力练习** 进入听力专项训练
- 点击 **下载PDF** 下载试卷原文
- 点击 **预览题目** 快速浏览题目内容

### 3. 听力练习
- 选择 **原文练习** 或 **完整测试** 模式
- 使用音频播放器控制播放进度
- 点击Section标记快速跳转
- 查看实时字幕（如有）

### 4. AI出题练习
- 点击 **AI生成题目** 按钮
- 等待10-20秒生成5道选择题
- 完成答题并查看正确答案
- 题目会自动缓存到本地

## ⚙️ API配置

如需使用AI功能，请配置API密钥：

```javascript
// 在 listening-micro.html 中找到以下代码并替换你的API密钥
const transcriptResp = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
    headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE'
    }
});
```

## 🔧 自定义配置

### 添加新试卷
编辑 `data/papers.json`：
```json
{
    "id": "cet4-2024-06-set1",
    "title": "2024年6月 第1套",
    "date": "2024-06",
    "type": "cet4",
    "url": "cet4-2024-06.html",
    "audio": "./assets/audios/cet4-2024-06-set1.mp3"
}
```

### 修改按钮颜色
在 `app.js` 中找到对应按钮样式：
```javascript
background: linear-gradient(135deg, #34c77b 0%, #2bb066 100%);
```

## 📝 更新日志

### v1.2.0 (2025-11)
- ✅ 优化按钮布局为2×2网格
- ✅ 更新按钮配色为活力色系
- ✅ 添加黑体字体样式

### v1.1.0 (2025-11)
- ✅ 添加音频Section标记功能
- ✅ 支持点击标记跳转
- ✅ 添加Section图例说明

### v1.0.0 (2025-11)
- ✅ 上线CET-4/CET-6真题库
- ✅ 实现听力练习功能
- ✅ 集成AI智能出题
- ✅ 优化生成速度

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

- **你的名字** - [GitHub主页](https://github.com/你的用户名)

## 🙏 致谢

- 感谢 SiliconFlow 提供的AI API服务
- 感谢所有贡献者的支持

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
