# 【配置指南】EmailJS 邮件发送功能

---

## 🎯 功能说明

用户在网站表单填写信息后，点击"发送消息"，邮件会**自动发送到你的邮箱** `131754469@163.com`

---

## ✅ 已完成的工作

- ✅ 引入 EmailJS SDK
- ✅ 表单添加ID和name属性
- ✅ 邮件发送逻辑代码
- ✅ 发送状态提示（发送中、成功、失败）
- ✅ 按钮动画效果

---

## 🚀 配置步骤（5分钟完成）

### 步骤 1️⃣：注册 EmailJS 账号

1. 访问 **EmailJS 官网**：[https://www.emailjs.com/](https://www.emailjs.com/)
2. 点击 **"Sign Up"** 注册账号
3. 使用邮箱注册（建议用 `131754469@163.com`）
4. 验证邮箱

**💡 提示**：EmailJS 免费版每月可发送 **200封邮件**，足够使用！

---

### 步骤 2️⃣：添加邮件服务

1. 登录后，点击左侧菜单 **"Email Services"**
2. 点击 **"Add New Service"**
3. 选择你的邮箱服务商：
   - **Gmail**（推荐，最稳定）
   - **Outlook/Hotmail**
   - **QQ邮箱**（选择 "Other" 然后手动配置）
   - **163邮箱**（选择 "Other" 然后手动配置）

4. **对于163邮箱配置**：
   ```
   Service: Other (SMTP)
   SMTP Server: smtp.163.com
   Port: 465 或 25
   Username: 131754469@163.com
   Password: [你的邮箱授权码，不是登录密码]
   ```

5. 点击 **"Create Service"**
6. **记下 Service ID**（例如：`service_abc123`）

---

### 步骤 3️⃣：创建邮件模板

1. 点击左侧菜单 **"Email Templates"**
2. 点击 **"Create New Template"**
3. 设置模板内容：

**模板名称**：Contact Form Submission

**Subject（邮件主题）**：
```
新的联系表单提交 - {{user_name}}
```

**Content（邮件内容）**：
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #667eea;">🎉 收到新的联系表单</h2>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>姓名：</strong> {{user_name}}</p>
        <p><strong>邮箱：</strong> {{user_email}}</p>
        <p><strong>提交时间：</strong> {{current_time}}</p>
    </div>
    
    <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h3 style="color: #333; margin-top: 0;">留言内容：</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">{{message}}</p>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
        <p style="margin: 0; color: #0066cc;">
            💡 <strong>提示：</strong>请及时回复用户 {{user_email}}
        </p>
    </div>
</div>
```

4. **To Email（收件人）**：
   ```
   131754469@163.com
   ```
   或者使用变量接收用户填写的邮箱：
   ```
   {{user_email}}
   ```

5. 点击 **"Save"**
6. **记下 Template ID**（例如：`template_xyz789`）

---

### 步骤 4️⃣：获取 Public Key

1. 点击左侧菜单 **"Account"** → **"General"**
2. 找到 **"Public Key"**（例如：`GvR8xYz123AbC456`）
3. **复制这个 Key**

---

### 步骤 5️⃣：更新网站代码

打开 `index.html`，找到以下代码并替换：

```javascript
// 第 644 行：替换 PUBLIC_KEY
emailjs.init('YOUR_PUBLIC_KEY'); 
// 改为：
emailjs.init('GvR8xYz123AbC456'); // 使用你的实际 Public Key

// 第 662 行：替换 SERVICE_ID 和 TEMPLATE_ID
emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
// 改为：
emailjs.sendForm('service_abc123', 'template_xyz789', this)
```

**完整示例**：
```javascript
// 初始化 EmailJS
emailjs.init('GvR8xYz123AbC456'); // 你的 Public Key

// 发送邮件
emailjs.sendForm('service_abc123', 'template_xyz789', this)
```

---

## 📋 配置检查清单

完成配置后，确认以下项目：

- [ ] EmailJS 账号已注册并验证
- [ ] Email Service 已创建（记下 Service ID）
- [ ] Email Template 已创建（记下 Template ID）
- [ ] Public Key 已获取
- [ ] `index.html` 中的三个ID已替换：
  - [ ] `YOUR_PUBLIC_KEY` → 实际的 Public Key
  - [ ] `YOUR_SERVICE_ID` → 实际的 Service ID
  - [ ] `YOUR_TEMPLATE_ID` → 实际的 Template ID

---

## 🧪 测试功能

### 1. 打开网站
```bash
# 在浏览器中打开
index.html
```

### 2. 填写测试表单
- **姓名**：测试用户
- **邮箱**：test@example.com
- **留言**：这是一条测试消息

### 3. 点击"发送消息"

### 4. 观察反馈
- ⏳ **发送中**：按钮显示"发送中..."，有转圈动画
- ✅ **成功**：显示绿色提示"发送成功！我们会尽快回复您"
- ❌ **失败**：显示红色提示和备用邮箱

### 5. 检查邮箱
登录 `131754469@163.com`，应该会收到格式化的邮件！

---

## 🎨 效果展示

### 发送前
```
┌─────────────────────────────┐
│ 姓名: [张三]                │
│ 邮箱: [zhangsan@qq.com]     │
│ 留言: [我想投稿...]         │
│                             │
│  [📤 发送消息]  ← 可点击    │
└─────────────────────────────┘
```

### 发送中
```
┌─────────────────────────────┐
│ 姓名: [张三]                │
│ 邮箱: [zhangsan@qq.com]     │
│ 留言: [我想投稿...]         │
│                             │
│  [⏳ 发送中...]  ← 禁用     │
└─────────────────────────────┘
```

### 发送成功
```
┌─────────────────────────────┐
│ 姓名: [空]                  │
│ 邮箱: [空]                  │
│ 留言: [空]                  │
│                             │
│  [📤 发送消息]              │
│ ┌───────────────────────┐   │
│ │ ✅ 发送成功！         │   │
│ │ 我们会尽快回复您      │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

### 发送失败
```
┌─────────────────────────────┐
│ 姓名: [张三]                │
│ 邮箱: [zhangsan@qq.com]     │
│ 留言: [我想投稿...]         │
│                             │
│  [📤 发送消息]              │
│ ┌───────────────────────┐   │
│ │ ❌ 发送失败           │   │
│ │ 请直接发送邮件至      │   │
│ │ 131754469@163.com     │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

---

## 💡 常见问题

### Q1: 为什么需要邮箱授权码？
**A:** 出于安全考虑，163/QQ等邮箱不允许直接使用登录密码发邮件，需要生成专用的"授权码"。

**获取163邮箱授权码**：
1. 登录 163 邮箱
2. 设置 → POP3/SMTP/IMAP
3. 开启 SMTP 服务
4. 生成授权码（通常需要手机验证）

### Q2: Gmail 怎么配置？
**A:** Gmail 最简单：
1. 在 EmailJS 选择 Gmail
2. 点击"Connect Account"
3. 使用 Google 账号登录授权
4. 完成！

### Q3: 免费版够用吗？
**A:** 完全够用！
- 每月 200 封邮件
- 除非网站特别火，否则不会超

### Q4: 如何避免邮件进入垃圾箱？
**A:** 
1. 使用可靠的邮箱服务（Gmail 最佳）
2. 模板内容避免营销词汇
3. 发送频率不要太高

### Q5: 可以发送附件吗？
**A:** 不支持附件，但可以：
1. 让用户在留言中提供文件链接
2. 引导用户直接发邮件到 131754469@163.com

### Q6: 用户会收到确认邮件吗？
**A:** 默认不会，但可以设置：
1. 创建第二个模板（发给用户）
2. 在代码中发送两次（一次给你，一次给用户）

---

## 🔧 高级功能（可选）

### 1. 自动回复用户
在代码中添加第二次发送：

```javascript
// 发送给管理员
emailjs.sendForm('service_abc123', 'template_xyz789', this)
    .then(function() {
        // 发送确认邮件给用户
        emailjs.send('service_abc123', 'template_confirm', {
            to_email: document.getElementById('user-email').value,
            user_name: document.getElementById('user-name').value
        });
    });
```

### 2. 添加验证码（防止垃圾邮件）
可以集成 Google reCAPTCHA

### 3. 数据统计
在 EmailJS 后台可以看到：
- 发送成功率
- 发送历史
- 错误日志

---

## 📊 邮件数据字段

表单字段对应的模板变量：

| 表单字段 | name属性 | 模板变量 |
|---------|---------|---------|
| 姓名 | `user_name` | `{{user_name}}` |
| 邮箱 | `user_email` | `{{user_email}}` |
| 留言 | `message` | `{{message}}` |

可以添加更多字段：
- 电话号码 → `user_phone` → `{{user_phone}}`
- 主题 → `subject` → `{{subject}}`

---

## 🎉 完成确认

配置成功的标志：

1. ✅ 点击"发送消息"后，按钮变为"发送中..."
2. ✅ 几秒后显示"发送成功"提示
3. ✅ 表单内容自动清空
4. ✅ 邮箱收到格式化的邮件
5. ✅ 邮件包含用户填写的所有信息

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. **检查浏览器控制台**（F12）是否有错误
2. **检查 EmailJS 后台** → Logs 查看发送日志
3. **确认三个ID都正确替换**
4. **检查邮箱服务配置**（SMTP设置）

---

## 📚 相关文档

- 📖 **EmailJS 官方文档**：[https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- 🎥 **配置视频教程**：[YouTube 搜索 "EmailJS Tutorial"](https://www.youtube.com/results?search_query=emailjs+tutorial)
- 💬 **EmailJS 社区**：[https://www.emailjs.com/docs/community/](https://www.emailjs.com/docs/community/)

---

*创建时间: 2025年11月18日 13:41*  
*适用版本: 四六级学习站 v1.0*  
*EmailJS 版本: 3.x*
