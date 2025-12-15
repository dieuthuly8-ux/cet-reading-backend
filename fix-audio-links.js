const fs = require('fs');

console.log('🔧 修复 listening.json 中的音频链接...');

// 读取文件
let content = fs.readFileSync('listening.json', 'utf8');

// 统计需要替换的数量
const workerLinks = (content.match(/https:\/\/audio-proxy\.dieuthuly8\.workers\.dev/g) || []).length;
console.log(`📊 找到 ${workerLinks} 个 Worker 代理链接`);

// 替换所有 Worker 代理链接为直接的七牛云 HTTP 链接
content = content.replace(
  /https:\/\/audio-proxy\.dieuthuly8\.workers\.dev/g,
  'http://t6r1sg3dy.hd-bkt.clouddn.com'
);

// 写回文件
fs.writeFileSync('listening.json', content, 'utf8');

console.log('✅ 音频链接修复完成！');
console.log('💡 现在使用七牛云直接链接，浏览器会自动处理混合内容');
