// 将listening.json中的所有HTTPS音频链接改为HTTP（七牛云测试域名支持HTTP）
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'listening.json');
let content = fs.readFileSync(filePath, 'utf-8');

// 统计替换次数
const count = (content.match(/https:\/\/t6r1sg3dy\.hd-bkt\.clouddn\.com/g) || []).length;

// 替换HTTPS为HTTP
content = content.replace(/https:\/\/t6r1sg3dy\.hd-bkt\.clouddn\.com/g, 'http://t6r1sg3dy.hd-bkt.clouddn.com');

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');

console.log(`✅ 已将 ${count} 处 HTTPS 改为 HTTP`);
console.log('七牛云测试域名使用 HTTP 协议，避免混合内容阻止问题');
