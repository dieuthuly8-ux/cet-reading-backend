# 【图文教程】EmailJS 配置全流程

> 跟着这个教程，5分钟搞定邮件发送功能！

---

## 📋 准备工作

**你需要**：
- ✅ 一个邮箱（推荐使用 Gmail 或 QQ 邮箱）
- ✅ 能够访问 https://www.emailjs.com/
- ✅ 5分钟时间

**你将得到**：
- ✅ Public Key
- ✅ Service ID
- ✅ Template ID

---

## 🚀 步骤1：注册 EmailJS 账号

### 1.1 访问官网
```
🔗 https://www.emailjs.com/
```

### 1.2 点击右上角 "Sign Up"

### 1.3 填写注册信息
```
Email:    131754469@163.com （或你的其他邮箱）
Password: ********** （设置一个密码）
```

### 1.4 勾选同意条款，点击 "Sign Up"

### 1.5 验证邮箱
- 打开你的邮箱
- 找到 EmailJS 发送的验证邮件
- 点击验证链接
- 回到 EmailJS 网站登录

**✅ 完成！现在你已经有了 EmailJS 账号**

---

## 📧 步骤2：添加邮件服务

### 2.1 进入 Email Services
- 登录后，左侧菜单找到 **"Email Services"**
- 点击进入

### 2.2 添加新服务
- 点击右上角 **"Add New Service"** 按钮

### 2.3 选择邮箱类型

有两种推荐方案，选择其一：

---

### ⭐ 方案A：使用 Gmail（最简单，强烈推荐）

1. 在服务列表中选择 **"Gmail"**
2. 点击 **"Connect Account"**
3. 会弹出 Google 登录窗口
4. 选择你的 Google 账号
5. 点击 **"允许"** 授权 EmailJS 访问
6. 完成！EmailJS 会自动配置

**Service ID 示例**：`service_gmail123`

**✅ 优点**：
- 一键配置，无需手动设置
- 最稳定，送达率高
- 不会进垃圾箱

---

### 方案B：使用 QQ/163 邮箱（需要授权码）

#### 如果使用 QQ 邮箱：

1. **获取 QQ 邮箱授权码**：
   - 登录 https://mail.qq.com/
   - 点击 **"设置"** → **"账户"**
   - 找到 **"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"**
   - 开启 **"SMTP服务"**
   - 点击 **"生成授权码"**
   - 按提示用手机发送短信
   - **记下授权码**（例如：abcdabcdabcd）

2. **在 EmailJS 中配置**：
   - 选择 **"Other"**
   - 填写信息：
     ```
     Service Name: QQ Mail
     SMTP Server: smtp.qq.com
     Port: 465
     Username: 你的QQ号@qq.com
     Password: [刚才获取的授权码]
     Secure: Yes (SSL/TLS)
     ```
   - 点击 **"Create Service"**

#### 如果使用 163 邮箱：

1. **获取 163 邮箱授权码**：
   - 登录 https://mail.163.com/
   - 点击 **"设置"** → **"POP3/SMTP/IMAP"**
   - 开启 **"SMTP服务"**
   - 点击 **"客户端授权密码"** → **"开启"**
   - 按提示获取授权码
   - **记下授权码**

2. **在 EmailJS 中配置**：
   - 选择 **"Other"**
   - 填写信息：
     ```
     Service Name: 163 Mail
     SMTP Server: smtp.163.com
     Port: 465
     Username: 131754469@163.com
     Password: [刚才获取的授权码]
     Secure: Yes (SSL/TLS)
     ```
   - 点击 **"Create Service"**

### 2.4 记录 Service ID

服务创建成功后，你会看到类似这样的界面：

```
┌──────────────────────────────┐
│ Gmail                        │
│ service_abc123xyz  ← 这就是！│
│ Status: Active ✓             │
└──────────────────────────────┘
```

**📝 记下你的 Service ID**：`service_________`

**✅ 完成！邮件服务已配置**

---

## 📝 步骤3：创建邮件模板

### 3.1 进入 Email Templates
- 左侧菜单点击 **"Email Templates"**

### 3.2 创建新模板
- 点击右上角 **"Create New Template"** 按钮

### 3.3 设置模板基本信息

**Template Name（模板名称）**：
```
Contact Form
```

### 3.4 设置邮件内容

#### ① To Email（收件人邮箱）
```
131754469@163.com
```

#### ② From Name（发件人名称）
```
四六级学习站
```

#### ③ From Email（发件人邮箱）
```
{{user_email}}
```
这样你可以直接回复用户邮件！

#### ④ Subject（邮件主题）
```
🎉 新的表单提交 - {{user_name}}
```

#### ⑤ Content（邮件内容）

**复制以下HTML代码，粘贴到 "Content" 框中**：

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .info-box p { margin: 10px 0; line-height: 1.6; }
        .info-box strong { color: #667eea; }
        .message-box { background: white; padding: 20px; border: 2px solid #e0e0e0; border-radius: 8px; margin: 20px 0; }
        .message-box h3 { margin-top: 0; color: #333; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .tip { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0066cc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 收到新的联系表单</h1>
        </div>
        
        <div class="content">
            <div class="info-box">
                <p><strong>👤 姓名：</strong>{{user_name}}</p>
                <p><strong>📧 邮箱：</strong>{{user_email}}</p>
                <p><strong>🕐 时间：</strong>刚刚</p>
            </div>
            
            <div class="message-box">
                <h3>📝 留言内容：</h3>
                <p style="white-space: pre-wrap; line-height: 1.8; color: #333;">{{message}}</p>
            </div>
            
            <div class="tip">
                <p style="margin: 0; color: #0066cc;">
                    💡 <strong>提示：</strong>请及时回复用户 <a href="mailto:{{user_email}}">{{user_email}}</a>
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>此邮件来自 四六级学习站 自动发送系统</p>
            <p>请勿直接回复此邮件</p>
        </div>
    </div>
</body>
</html>
```

### 3.5 测试模板（可选）

- 在右侧可以看到邮件预览
- 点击 **"Test it"** 可以发送测试邮件
- 填写测试数据：
  ```
  user_name: 测试用户
  user_email: test@example.com
  message: 这是一条测试消息
  ```
- 点击 **"Send Test Email"**
- 检查你的邮箱是否收到

### 3.6 保存模板

- 确认无误后，点击右上角 **"Save"** 按钮

### 3.7 记录 Template ID

保存后，你会看到：

```
┌──────────────────────────────┐
│ Contact Form                 │
│ template_xyz789abc ← 这就是！│
│ Status: Active ✓             │
└──────────────────────────────┘
```

**📝 记下你的 Template ID**：`template_________`

**✅ 完成！邮件模板已创建**

---

## 🔑 步骤4：获取 Public Key

### 4.1 进入账户设置
- 左侧菜单点击 **"Account"**
- 选择 **"General"** 标签

### 4.2 复制 Public Key

你会看到：

```
┌────────────────────────────────┐
│ Public Key                     │
│ ┌────────────────────────────┐ │
│ │ GvR8xYz123AbC456DeF789     │ │
│ │        [📋 Copy]            │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

- 点击 **Copy** 按钮复制

**📝 记下你的 Public Key**：`________________`

**✅ 完成！所有配置信息已获取**

---

## 💻 步骤5：更新网站代码

### 5.1 打开 index.html

### 5.2 找到第 644 行

搜索 `YOUR_PUBLIC_KEY`，找到这行代码：

```javascript
emailjs.init('YOUR_PUBLIC_KEY');
```

### 5.3 替换 Public Key

改为：

```javascript
emailjs.init('GvR8xYz123AbC456DeF789'); // 粘贴你的 Public Key
```

**实际示例**（使用你自己的Key）：
```javascript
// ❌ 错误（不要照抄）
emailjs.init('YOUR_PUBLIC_KEY');

// ✅ 正确（使用你的实际Key）
emailjs.init('GvR8xYz123AbC456DeF789');
```

### 5.4 找到第 662 行

搜索 `YOUR_SERVICE_ID`，找到这行代码：

```javascript
emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
```

### 5.5 替换 Service ID 和 Template ID

改为：

```javascript
emailjs.sendForm('service_abc123xyz', 'template_xyz789abc', this)
```

**实际示例**（使用你自己的ID）：
```javascript
// ❌ 错误（不要照抄）
emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)

// ✅ 正确（使用你的实际ID）
emailjs.sendForm('service_abc123xyz', 'template_xyz789abc', this)
```

### 5.6 保存文件

**Ctrl + S** 保存 `index.html`

**✅ 完成！代码已更新**

---

## 🧪 步骤6：测试功能

### 6.1 打开网站

在浏览器中打开：
```
e:\cursor\作业\index.html
```

### 6.2 找到表单

滚动到页面的 **"向我们投稿"** 或 **"发送消息"** 部分

### 6.3 填写测试信息

```
姓名：张三
邮箱：zhangsan@qq.com
留言：这是一条测试消息，请忽略
```

### 6.4 点击"发送消息"

观察按钮变化：
1. **点击前**：📤 发送消息
2. **点击后**：⏳ 发送中...（按钮禁用）
3. **2-3秒后**：
   - ✅ **成功**：显示绿色提示框
   - ❌ **失败**：显示红色提示框

### 6.5 检查邮箱

登录 `131754469@163.com`，应该收到一封格式化的邮件！

**邮件主题**：
```
🎉 新的表单提交 - 张三
```

**邮件内容**：
```
👤 姓名：张三
📧 邮箱：zhangsan@qq.com
🕐 时间：刚刚

📝 留言内容：
这是一条测试消息，请忽略
```

---

## ✅ 配置检查清单

完成后，确认以下所有项目：

- [ ] EmailJS 账号已注册并验证
- [ ] Email Service 已创建
- [ ] 已记录 Service ID：`service_________`
- [ ] Email Template 已创建
- [ ] 已记录 Template ID：`template_________`
- [ ] 已获取 Public Key：`________________`
- [ ] `index.html` 第 644 行已更新
- [ ] `index.html` 第 662 行已更新
- [ ] 文件已保存
- [ ] 测试发送成功
- [ ] 邮箱收到测试邮件

**✅ 全部打勾 = 配置完成！**

---

## 🔍 故障排除

### ❌ 问题1：点击发送后显示"发送失败"

**可能原因**：
- Public Key 填错了
- Service ID 填错了
- Template ID 填错了

**解决方法**：
1. 按 F12 打开浏览器控制台
2. 查看错误信息
3. 检查三个ID是否正确复制
4. 确保没有多余的空格

---

### ❌ 问题2：发送成功但收不到邮件

**可能原因**：
- 模板中的收件人邮箱未设置
- 邮件进入垃圾箱了
- Email Service 配置错误

**解决方法**：
1. 检查 EmailJS 后台 → Logs，查看发送记录
2. 检查邮箱的垃圾箱
3. 确认模板的 "To Email" 是 `131754469@163.com`
4. 重新测试 Email Service 连接

---

### ❌ 问题3：按钮一直显示"发送中..."

**可能原因**：
- 网络问题
- EmailJS 服务暂时不可用
- 代码错误

**解决方法**：
1. 检查网络连接
2. 刷新页面重试
3. 检查浏览器控制台错误信息
4. 访问 https://status.emailjs.com/ 查看服务状态

---

### ❌ 问题4：163/QQ 邮箱发送失败

**可能原因**：
- 使用了登录密码，而不是授权码
- 授权码过期了

**解决方法**：
1. 确认使用的是**授权码**，不是登录密码
2. 重新生成授权码
3. 建议改用 Gmail（一键配置，更稳定）

---

## 📊 配置信息记录表

**复制并填写，保存备用**：

```
======================================
EmailJS 配置信息
======================================
配置日期：2025年11月18日

【账号信息】
注册邮箱：131754469@163.com
密码：[请妥善保管]

【三个关键ID】
Public Key:   ________________________
Service ID:   service_______________
Template ID:  template______________

【邮件服务】
类型：□ Gmail  □ QQ邮箱  □ 163邮箱
SMTP服务器：_______________________
授权码：___________________________

【模板设置】
收件人：131754469@163.com
主题：🎉 新的表单提交 - {{user_name}}

【代码位置】
文件：index.html
第644行：emailjs.init('______')
第662行：emailjs.sendForm('______', '______', this)

【测试结果】
测试日期：___________
测试结果：□ 成功  □ 失败
备注：_______________________________
======================================
```

---

## 🎉 大功告成！

现在你的网站已经可以：
- ✅ 接收用户留言
- ✅ 自动发送到你的邮箱
- ✅ 提供友好的用户反馈
- ✅ 100% 免费使用

**免费额度**：每月 200 封邮件

**建议**：
- 定期检查邮箱
- 及时回复用户
- 如果流量大，考虑升级到付费版

---

*创建时间: 2025年11月18日*  
*作者: AI助手*  
*适用版本: EmailJS v3.x*
