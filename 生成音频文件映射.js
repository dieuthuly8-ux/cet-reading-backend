// 生成音频文件映射关系
const fs = require('fs');
const path = require('path');

console.log('分析音频文件映射关系...\n');

// 实际文件列表
const cet4Files = fs.readdirSync('四级听力').filter(f => f.endsWith('.mp3'));
const cet6Files = fs.readdirSync('六级听力').filter(f => f.endsWith('.mp3'));

console.log(`四级听力文件: ${cet4Files.length} 个`);
console.log(`六级听力文件: ${cet6Files.length} 个\n`);

// 读取listening.json
const listening = JSON.parse(fs.readFileSync('listening.json', 'utf8'));

// 提取需要的文件名
const requiredFiles = {};
for (const [examId, data] of Object.entries(listening)) {
  if (data.sections) {
    for (const section of data.sections) {
      if (section.audio) {
        const fileName = section.audio.split('/').pop();
        if (!requiredFiles[fileName]) {
          requiredFiles[fileName] = {
            examId,
            cdnPath: section.audio,
            localPath: null
          };
        }
      }
    }
  }
}

console.log(`listening.json需要 ${Object.keys(requiredFiles).length} 个音频文件\n`);

// 保存结果
fs.writeFileSync('音频文件需求列表.json', JSON.stringify(requiredFiles, null, 2), 'utf8');

console.log('已保存到: 音频文件需求列表.json\n');
console.log('前5个需要的文件:');
Object.keys(requiredFiles).slice(0, 5).forEach((f, i) => {
  console.log(`${i+1}. ${f}`);
});
