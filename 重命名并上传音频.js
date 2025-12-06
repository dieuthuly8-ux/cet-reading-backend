// 重命名音频文件并生成上传列表
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  重命名音频文件为标准格式');
console.log('========================================');
console.log('');

// 读取listening.json获取所需的文件名
const listeningData = JSON.parse(fs.readFileSync('listening.json', 'utf8'));

// 存储重命名映射
const renameMap = [];

// 遍历所有试卷
for (const [examId, examData] of Object.entries(listeningData)) {
  if (examData.sections) {
    for (const section of examData.sections) {
      if (section.audio) {
        // 提取CDN路径中的文件名
        const cdnFileName = section.audio.split('/').pop();
        
        // 判断是四级还是六级
        const level = examId.startsWith('cet6') ? '六级听力' : '四级听力';
        const levelDir = path.join(__dirname, level);
        
        if (!fs.existsSync(levelDir)) continue;
        
        // 检查标准文件名是否已存在
        const standardPath = path.join(levelDir, cdnFileName);
        if (fs.existsSync(standardPath)) {
          console.log(`✓ 文件已存在: ${cdnFileName}`);
          continue;
        }
        
        // 查找匹配的原始文件
        const files = fs.readdirSync(levelDir);
        let matched = false;
        
        // 提取年月信息
        const match = examId.match(/cet[46]-(\d{4})-(\d{2})-set(\d)/);
        if (!match) continue;
        
        const [, year, month, setNum] = match;
        
        // 尝试匹配文件
        for (const file of files) {
          if (file.includes(year) && 
              file.includes(month) && 
              (file.includes(`第${setNum}套`) || file.includes(`（第${setNum}套）`))) {
            
            const oldPath = path.join(levelDir, file);
            renameMap.push({
              oldPath,
              newPath: standardPath,
              oldName: file,
              newName: cdnFileName
            });
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          console.log(`⚠ 未找到匹配文件: ${examId} -> ${cdnFileName}`);
        }
      }
    }
  }
}

console.log('');
console.log(`找到 ${renameMap.length} 个需要重命名的文件`);
console.log('');

// 保存重命名计划
fs.writeFileSync('重命名计划.json', JSON.stringify(renameMap, null, 2), 'utf8');
console.log('✓ 已保存重命名计划到: 重命名计划.json');
console.log('');
console.log('预览前5个重命名操作：');
renameMap.slice(0, 5).forEach((item, i) => {
  console.log(`${i + 1}. ${item.oldName}`);
  console.log(`   -> ${item.newName}`);
  console.log('');
});

console.log('========================================');
console.log('下一步：');
console.log('1. 检查 重命名计划.json 确认无误');
console.log('2. 运行: node 执行重命名.js');
console.log('3. 运行: 一键上传所有文件.bat');
console.log('========================================');
