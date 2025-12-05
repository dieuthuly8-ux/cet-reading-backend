// 更新网站中的音频和PDF链接为七牛云CDN地址
const fs = require('fs');
const path = require('path');

// 七牛云CDN配置
const CDN_DOMAIN = 'http://bf-lgs-kjg-hd-bkl.clouddn.com';

console.log('========================================');
console.log('  更新CDN链接');
console.log('========================================');
console.log('');

// 更新listening.json中的音频路径
function updateListeningJson() {
  const listeningPath = path.join(__dirname, 'listening.json');
  console.log('[1/2] 更新 listening.json 中的音频路径...');
  
  try {
    const data = JSON.parse(fs.readFileSync(listeningPath, 'utf8'));
    let updateCount = 0;
    
    // 遍历所有试卷
    for (const [examId, examData] of Object.entries(data)) {
      if (examData.sections) {
        for (const section of examData.sections) {
          if (section.audio) {
            // 原路径示例：四级听力/2024-06-set1.mp3 或 ./四级听力/2024-06-set1.mp3
            const oldPath = section.audio;
            
            // 提取文件名
            const fileName = path.basename(oldPath);
            
            // 判断是四级还是六级
            const level = examId.startsWith('cet6') ? 'cet6' : 'cet4';
            
            // 构建七牛云CDN路径
            section.audio = `${CDN_DOMAIN}/${level}/audio/${fileName}`;
            updateCount++;
          }
        }
      }
    }
    
    fs.writeFileSync(listeningPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   ✓ 成功更新 ${updateCount} 个音频路径`);
    console.log('');
  } catch (error) {
    console.error(`   ✗ 更新失败: ${error.message}`);
    console.log('');
  }
}

// 更新exam-contents.json中的PDF路径
function updateExamContentsJson() {
  const contentsPath = path.join(__dirname, 'exam-contents.json');
  console.log('[2/2] 更新 exam-contents.json 中的PDF路径...');
  
  try {
    const data = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
    let updateCount = 0;
    
    // 遍历所有试卷
    for (const [examId, examData] of Object.entries(data)) {
      if (examData.pdfUrl) {
        // 原路径示例：英语四级/2024年6月英语四级（第一套）.pdf
        const oldPath = examData.pdfUrl;
        
        // 提取文件名
        const fileName = path.basename(oldPath);
        
        // 判断是四级还是六级
        const level = examId.startsWith('cet6-') ? 'cet6' : 'cet4';
        
        // 构建七牛云CDN路径
        examData.pdfUrl = `${CDN_DOMAIN}/${level}/pdf/${fileName}`;
        updateCount++;
      }
    }
    
    fs.writeFileSync(contentsPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   ✓ 成功更新 ${updateCount} 个PDF路径`);
    console.log('');
  } catch (error) {
    console.error(`   ✗ 更新失败: ${error.message}`);
    console.log('');
  }
}

// 执行更新
console.log('开始更新文件...');
console.log('');

updateListeningJson();
updateExamContentsJson();

console.log('========================================');
console.log('  更新完成！');
console.log('========================================');
console.log('');
console.log('下一步：');
console.log('1. 运行：推送更新.bat');
console.log('2. 等待Cloudflare Pages自动部署');
console.log('3. 访问网站测试音频和PDF功能');
console.log('');
