# ✂️ Section 时间戳快速标记指南

## 🎯 核心理念

**不再逐题标记，而是按Section整体标记！**

### 为什么这样更好？

**原方案（逐题标记）**：
- ❌ 一套试卷25道题，需要标记25次
- ❌ 每题标记起止时间，耗时约60分钟
- ❌ 容易出错，需要反复调整

**新方案（Section标记）**：
- ✅ 一套试卷3个Section，只需标记3次
- ✅ 每个Section标记一次，约10分钟完成整套
- ✅ 该Section下的所有题目自动共享音频片段

---

## 📋 三步完成标记

### 第一步：打开工具
打开浏览器访问：`section-timestamp-helper.html`

### 第二步：加载并标记
1. **输入试卷ID**：`cet6-2020-07-set1`
2. **点击"加载Sections"**
3. **加载音频**（自动填充或选择本地文件）
4. **逐个Section标记**：
   - 点击"Section A - Long Conversations"
   - 播放音频，听到Section开始时点击"标记起点"（S键）
   - 播放到Section结束时点击"标记终点"（E键）
   - 自动跳到下一个Section，重复上述步骤

### 第三步：应用数据
1. 点击"生成JSON数据"
2. 点击"复制到剪贴板"
3. 打开 `listening.json`
4. 找到对应试卷，为每个Section添加：
   ```json
   {
     "name": "Section A - Long Conversations",
     "audioStart": 5,
     "audioEnd": 485,
     "questions": [...]
   }
   ```

---

## ⏱️ 时间对比

### 一套试卷标记时间

| 方案 | Section数量 | 标记次数 | 预计时间 |
|------|------------|---------|---------|
| **逐题标记** | 3个 | 25次（每题） | **60分钟** |
| **Section标记** | 3个 | **3次（每Section）** | **10分钟** |

**效率提升 6倍！** 🚀

---

## 📊 示例：CET-6 试卷结构

### Section A - Long Conversations
- **时长**：约8分钟（0:00 - 8:00）
- **题目数**：8题
- **标记一次**：这8道题全部共享 0:00-8:00 片段

### Section B - Passages
- **时长**：约7分钟（8:00 - 15:00）
- **题目数**：10题
- **标记一次**：这10道题全部共享 8:00-15:00 片段

### Section C - Lectures
- **时长**：约12分钟（15:00 - 27:00）
- **题目数**：7题
- **标记一次**：这7道题全部共享 15:00-27:00 片段

---

## 🎯 效果演示

### 标记前（当前状态）
```
题目：What is the underlying issue?
音频：[====================] 0:07 / 26:51
用户需要手动找题目位置 😩
```

### 标记后（目标效果）
```
题目：What is the underlying issue?
来自：Section A - Long Conversations
✂️ Section片段：0:00 - 8:05
音频：[====] 0:35 / 8:05
自动播放Section片段！🎉
```

---

## 💡 最佳实践

### 标记原则
1. **Section起点**：从Section标题音频开始前1秒（如："Section A..."）
2. **Section终点**：到该Section最后一题的答案读完后2秒
3. **宁长勿短**：片段稍长一点比截断题目更好

### 标记顺序
按Section顺序标记即可：
1. Section A
2. Section B  
3. Section C

每个Section标记后自动跳到下一个。

### 快速定位技巧
- 使用倍速（1.5x或2x）快速找到Section开始位置
- 使用 ←/→ 键精确调整（±5秒）
- 使用"预览片段"验证准确性

---

## 📁 JSON 数据示例

### 导出的数据格式
```json
{
  "examId": "cet6-2020-07-set1",
  "sections": [
    {
      "name": "Section A - Long Conversations",
      "audioStart": 5,
      "audioEnd": 485
    },
    {
      "name": "Section B - Passages",
      "audioStart": 485,
      "audioEnd": 905
    },
    {
      "name": "Section C - Lectures",
      "audioStart": 905,
      "audioEnd": 1620
    }
  ]
}
```

### 应用到 listening.json
打开 `listening.json`，找到对应试卷，为每个Section添加字段：

```json
"cet6-2020-07-set1": {
  "sections": [
    {
      "name": "Section A - Long Conversations",
      "description": "2篇长对话，每篇后有4个问题",
      "audioStart": 5,
      "audioEnd": 485,
      "questions": [...]
    },
    ...
  ]
}
```

---

## ✅ 优先级建议

### 第一批（最高优先级）⭐⭐⭐
- 2024-2025年试卷（高频练习）
- 预计标记时间：10套 × 10分钟 = **100分钟（1.5小时）**

### 第二批 ⭐⭐
- 2022-2023年试卷
- 预计标记时间：10套 × 10分钟 = **100分钟（1.5小时）**

### 第三批 ⭐
- 2018-2021年试卷
- 按需标记

**总计**：标记20套核心试卷只需 **3小时**！

---

## 🔧 常见问题

### Q: Section边界不清晰怎么办？
A: 听音频时注意Section标题播报（如"Section A, Long Conversations"），这是最明确的分界点。

### Q: 如果Section之间有间隔音乐怎么办？
A: 将间隔音乐包含在前一个Section的终点时间内，或作为下一个Section的起点。

### Q: 标记错了怎么办？
A: 选中对应Section后点击"清除标记"重新标记，或直接重新标记覆盖。

### Q: 可以中途暂停吗？
A: 可以！已标记的Section会保留，下次继续即可。

### Q: 标记后如何测试？
A: 打开 `listening-micro.html`，生成练习，查看是否显示"Section片段"徽章并正确播放。

---

## 🚀 立即开始

### 快速体验（5分钟）
1. 打开 `section-timestamp-helper.html`
2. 输入：`cet6-2019-12-set1`
3. 标记一个Section体验流程
4. 导出数据查看效果

### 正式标记（10分钟/套）
1. 选择一套高频试卷（如 `cet6-2024-12-set1`）
2. 标记全部3个Sections
3. 应用到 `listening.json`
4. 在 `listening-micro.html` 中测试

---

## 📊 成果展示

标记完成后，在跨试卷微练习中：

```
题目来自：cet6-2020-07-set1 | Section A - Long Conversations
✂️ Section片段：0:05 - 8:05 (8分钟)

[音频播放器] 自动播放 0:05-8:05 片段
该Section的所有8道题都共享这个片段！
```

**一次标记，所有题目受益！** 🎉

---

需要帮助？查看 `section-timestamp-helper.html` 使用界面中的详细说明。
