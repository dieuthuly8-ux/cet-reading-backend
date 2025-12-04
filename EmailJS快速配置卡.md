# EmailJS 快速配置卡 ⚡

---

## 🎯 5分钟配置完成

### 1️⃣ 注册 EmailJS
🔗 访问：https://www.emailjs.com/
📧 使用邮箱注册并验证

---

### 2️⃣ 添加邮件服务
📍 左侧菜单 → **Email Services** → **Add New Service**

**推荐选择**：
- ✅ **Gmail**（最简单，一键授权）
- ⚙️ **163邮箱**（需要授权码）

**163邮箱配置**：
```
SMTP Server: smtp.163.com
Port: 465
Username: 131754469@163.com
Password: [授权码]
```

📝 **记下 Service ID**：`service_______`

---

### 3️⃣ 创建邮件模板
📍 左侧菜单 → **Email Templates** → **Create New Template**

**邮件主题**：
```
新的联系表单提交 - {{user_name}}
```

**收件人**：
```
131754469@163.com
```

**邮件内容**（复制粘贴）：
```html
<h2>🎉 收到新的联系表单</h2>
<div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
    <p><strong>姓名：</strong> {{user_name}}</p>
    <p><strong>邮箱：</strong> {{user_email}}</p>
</div>
<div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; margin-top: 20px;">
    <h3>留言内容：</h3>
    <p style="white-space: pre-wrap;">{{message}}</p>
</div>
```

📝 **记下 Template ID**：`template_______`

---

### 4️⃣ 获取 Public Key
📍 左侧菜单 → **Account** → **General**
📝 **复制 Public Key**：`________________`

---

### 5️⃣ 更新代码（关键！）

打开 `index.html`，搜索并替换：

#### 第 644 行：
```javascript
// 原代码：
emailjs.init('YOUR_PUBLIC_KEY');

// 改为：
emailjs.init('你的Public Key');
```

#### 第 662 行：
```javascript
// 原代码：
emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)

// 改为：
emailjs.sendForm('你的Service ID', '你的Template ID', this)
```

---

## ✅ 配置完成！

### 测试步骤：
1. 打开 `index.html`
2. 填写表单
3. 点击"发送消息"
4. 查看是否显示"发送成功"
5. 检查邮箱是否收到邮件

---

## 🔑 配置信息记录表

填写后保存此文档：

```
✍️ Public Key:     _________________________________
✍️ Service ID:     _________________________________
✍️ Template ID:    _________________________________
✍️ 收件邮箱:       131754469@163.com
✍️ 配置日期:       ____________
```

---

## ⚠️ 常见错误

### ❌ 错误1：发送失败
**原因**：ID填错了  
**解决**：仔细核对三个ID

### ❌ 错误2：收不到邮件
**原因**：模板收件人未设置  
**解决**：模板中 To Email 填 `131754469@163.com`

### ❌ 错误3：邮件在垃圾箱
**原因**：邮箱服务商误判  
**解决**：标记为"非垃圾邮件"

---

## 📞 需要帮助？

查看详细指南：`【配置指南】EmailJS邮件发送.md`

---

**祝配置顺利！** 🎉
