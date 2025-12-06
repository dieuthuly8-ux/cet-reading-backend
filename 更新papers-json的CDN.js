// 更新 papers.json 中的 PDF 路径为七牛云 CDN 地址
const fs = require('fs');
const path = require('path');

const CDN_DOMAIN = 'http://t6r1sg3dy.hd-bkt.clouddn.com';

console.log('========================================');
console.log('  更新 papers.json 中的 PDF 路径');
console.log('========================================');
console.log('');

const papersPath = path.join(__dirname, 'papers.json');

try {
  const data = JSON.parse(fs.readFileSync(papersPath, 'utf8'));
  let updateCount = 0;
  
  // 更新 CET6 的 PDF 路径
  if (Array.isArray(data.cet6)) {
    data.cet6.forEach(paper => {
      if (paper.pdf && typeof paper.pdf === 'string') {
        // 提取文件名
        const fileName = path.basename(paper.pdf);
        // 更新为七牛云 CDN 路径
        paper.pdf = `${CDN_DOMAIN}/cet6/pdf/${fileName}`;
        updateCount++;
      }
    });
  }
  
  // 更新 CET4 的 PDF 路径（如果有）
  if (Array.isArray(data.cet4)) {
    data.cet4.forEach(paper => {
      if (paper.pdf && typeof paper.pdf === 'string') {
        // 提取文件名
        const fileName = path.basename(paper.pdf);
        // 更新为七牛云 CDN 路径
        paper.pdf = `${CDN_DOMAIN}/cet4/pdf/${fileName}`;
        updateCount++;
      }
    });
  }
  
  // 保存文件
  fs.writeFileSync(papersPath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`✓ 成功更新 ${updateCount} 个 PDF 路径`);
  console.log('');
  console.log('========================================');
  console.log('  更新完成！');
  console.log('========================================');
  console.log('');
  console.log('下一步：运行 推送更新.bat');
  console.log('');
  
} catch (error) {
  console.error('✗ 更新失败:', error.message);
}
