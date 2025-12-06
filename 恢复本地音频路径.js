// 恢复 listening.json 为本地路径，用于本地开发
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  恢复本地音频路径');
console.log('========================================');
console.log('');

const listeningPath = path.join(__dirname, 'listening.json');

try {
  // 备份当前版本（线上版本）
  const backupPath = path.join(__dirname, 'listening.json.online-backup');
  fs.copyFileSync(listeningPath, backupPath);
  console.log('✓ 已备份线上版本到: listening.json.online-backup');
  console.log('');
  
  const data = JSON.parse(fs.readFileSync(listeningPath, 'utf8'));
  let updateCount = 0;
  
  // 遍历所有试卷
  for (const [examId, examData] of Object.entries(data)) {
    if (examData.sections) {
      for (const section of examData.sections) {
        if (section.audio && section.audio.includes('clouddn.com')) {
          // 从CDN路径提取文件名
          const fileName = section.audio.split('/').pop();
          
          // 判断是四级还是六级
          const level = examId.startsWith('cet6') ? '六级听力' : '四级听力';
          
          // 恢复为本地路径
          section.audio = `./${level}/${fileName}`;
          updateCount++;
        }
      }
    }
  }
  
  fs.writeFileSync(listeningPath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`✓ 成功恢复 ${updateCount} 个音频路径为本地路径`);
  console.log('');
  console.log('========================================');
  console.log('  恢复完成！');
  console.log('========================================');
  console.log('');
  console.log('现在你可以：');
  console.log('1. 在本地打开 index.html 使用听力功能');
  console.log('2. 音频会从本地文件夹加载');
  console.log('');
  console.log('⚠️ 注意：');
  console.log('- 这个版本是本地使用的');
  console.log('- 不要推送到GitHub（会覆盖线上版本）');
  console.log('- 如需恢复线上版本，运行：恢复线上音频路径.bat');
  console.log('');
  
} catch (error) {
  console.error('✗ 恢复失败:', error.message);
}
