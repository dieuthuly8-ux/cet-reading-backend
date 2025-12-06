// 准备上传文件：复制并重命名为标准格式
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  准备上传文件到七牛云');
console.log('========================================\n');

// 创建临时目录
const tempCet4 = 'temp-cet4-audio';
const tempCet6 = 'temp-cet6-audio';

if (!fs.existsSync(tempCet4)) fs.mkdirSync(tempCet4);
if (!fs.existsSync(tempCet6)) fs.mkdirSync(tempCet6);

// 文件名映射规则
const fileMapping = {
  // 四级
  '2024年6月英语四级听力音频（第1套）.mp3': 'cet4-2024-06-set1.mp3',
  '2024年6月英语四级听力音频（第2套）.mp3': 'cet4-2024-06-set2.mp3',
  '2023年12月四级听力音频第1套.mp3': 'cet4-2023-12-set1.mp3',
  '2023年12月四级听力音频第2套.mp3': 'cet4-2023-12-set2.mp3',
  '2023.06四级真题第1套听力音频.mp3': 'cet4-2023-06-set1.mp3',
  '2023.06四级真题第2套听力音频.mp3': 'cet4-2023-06-set2.mp3',
  '2023年03月四级听力全1套.mp3': 'cet4-2023-03-set1.mp3',
  '2022.12四级真题第1套听力.mp3': 'cet4-2022-12-set1.mp3',
  '2022.12四级真题第2套听力.mp3': 'cet4-2022-12-set2.mp3',
  '2022年09月四级真题（3套相同）听力.mp3': 'cet4-2022-09-set1.mp3',
  '2022年06月四级真题（3套相同）听力.mp3': 'cet4-2022-06-set1.mp3',
  '2021.12四级真题第1套听力.mp3': 'cet4-2021-12-set1.mp3',
  '2021.12四级真题第2套听力.mp3': 'cet4-2021-12-set2.mp3',
  '2021.06四级真题第1套听力音频.mp3': 'cet4-2021-06-set1.mp3',
  '2021.06四级真题第2套听力音频.mp3': 'cet4-2021-06-set2.mp3',
  '2020.12四级真题第1套听力音频.mp3': 'cet4-2020-12-set1.mp3',
  '2020.12四级真题第2套听力音频.mp3': 'cet4-2020-12-set2.mp3',
  '2020.09四级真题听力音频.mp3': 'cet4-2020-09-set1.mp3',
  '2020.07四级真题听力音频.mp3': 'cet4-2020-07-set1.mp3',
  '2019.12四级真题第1套听力音频.mp3': 'cet4-2019-12-set1.mp3',
  '2019.12四级真题第2套听力音频.mp3': 'cet4-2019-12-set2.mp3',
  '2019.06四级真题第1套听力音频.mp3': 'cet4-2019-06-set1.mp3',
  '2019.06四级真题第2、3套听力音频.mp3': 'cet4-2019-06-set2.mp3',
  '2018.12四级真题第1套听力音频.mp3': 'cet4-2018-12-set1.mp3',
  '2018.12四级真题第2套听力音频.mp3': 'cet4-2018-12-set2.mp3',
  '2018.06四级真题第1套听力音频.mp3': 'cet4-2018-06-set1.mp3',
  '2018.06四级真题第2套听力音频.mp3': 'cet4-2018-06-set2.mp3',
  
  // 六级
  '2024年6月大学英语六级听力音频（第1套）.mp3': 'cet6-2024-06-set1.mp3',
  '2024年6月大学英语六级听力音频（第2套）.mp3': 'cet6-2024-06-set2.mp3',
  '2024年12月大学英语六级听力音频（第1套）.mp3': 'cet6-2024-12-set1.mp3',
  '2024年12月大学英语六级听力音频（第2套）.mp3': 'cet6-2024-12-set2.mp3',
  '2025年6月大学英语六级听力音频（第1套）.mp3': 'cet6-2025-06-set1.mp3',
  '2025年6月大学英语六级听力音频（第2套）.mp3': 'cet6-2025-06-set2.mp3',
  '2023年12月大学英语六级听力音频（第1套）.mp3': 'cet6-2023-12-set1.mp3',
  '2023年12月大学英语六级听力音频（第2套）.mp3': 'cet6-2023-12-set2.mp3',
  '2023年6月大学英语六级听力音频（第1套）.mp3': 'cet6-2023-06-set1.mp3',
  '2023年6月大学英语六级听力音频（第2套）.mp3': 'cet6-2023-06-set2.mp3',
  '2023年3月大学英语六级听力音频（第1套）.mp3': 'cet6-2023-03-set1.mp3',
  '2022年12月大学英语六级听力音频（第1套）.mp3': 'cet6-2022-12-set1.mp3',
  '2022年12月大学英语六级听力音频（第2套）.mp3': 'cet6-2022-12-set2.mp3',
  '2022年9月大学英语六级听力音频（第1套）.mp3': 'cet6-2022-09-set1.mp3',
  '2022年6月大学英语六级听力音频（第1套）.mp3': 'cet6-2022-06-set1.mp3',
  '2021年12月大学英语六级听力音频（第1套）.mp3': 'cet6-2021-12-set1.mp3',
  '2021年12月大学英语六级听力音频（第2套）.mp3': 'cet6-2021-12-set2.mp3',
  '2021年6月大学英语六级听力音频（第1套）.mp3': 'cet6-2021-06-set1.mp3',
  '2021年6月大学英语六级听力音频（第2套）.mp3': 'cet6-2021-06-set2.mp3',
  '2020年12月大学英语六级听力音频（第1套）.mp3': 'cet6-2020-12-set1.mp3',
  '2020年12月大学英语六级听力音频（第2套）.mp3': 'cet6-2020-12-set2.mp3',
  '2020年9月大学英语六级听力音频（第1套）.mp3': 'cet6-2020-09-set1.mp3',
  '2020年7月大学英语六级听力音频（第1套）.mp3': 'cet6-2020-07-set1.mp3',
  '2019年12月大学英语六级听力音频（第1套）.mp3': 'cet6-2019-12-set1.mp3',
  '2019年12月大学英语六级听力音频（第2套）.mp3': 'cet6-2019-12-set2.mp3',
  '2019年6月大学英语六级听力音频（第1套）.mp3': 'cet6-2019-06-set1.mp3',
  '2019年6月大学英语六级听力音频（第2套）.mp3': 'cet6-2019-06-set2.mp3',
};

let cet4Count = 0;
let cet6Count = 0;

// 处理文件
for (const [oldName, newName] of Object.entries(fileMapping)) {
  const isCet4 = oldName.includes('四级');
  const sourceDir = isCet4 ? '四级听力' : '六级听力';
  const targetDir = isCet4 ? tempCet4 : tempCet6;
  
  const sourcePath = path.join(sourceDir, oldName);
  const targetPath = path.join(targetDir, newName);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    if (isCet4) cet4Count++;
    else cet6Count++;
    console.log(`✓ ${oldName} -> ${newName}`);
  } else {
    console.log(`⚠ 未找到: ${oldName}`);
  }
}

console.log('\n========================================');
console.log(`  准备完成！`);
console.log(`  四级: ${cet4Count} 个文件`);
console.log(`  六级: ${cet6Count} 个文件`);
console.log('========================================\n');
console.log('下一步：运行 上传准备好的文件.bat');
