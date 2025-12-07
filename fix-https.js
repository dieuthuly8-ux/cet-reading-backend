// 正确地将HTTP替换为HTTPS（保持UTF-8编码）
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'listening.json');

// 读取文件（UTF-8）
let content = fs.readFileSync(filePath, 'utf-8');

// 替换HTTP为HTTPS
const count = (content.match(/http:\/\/t6r1sg3dy\.hd-bkt\.clouddn\.com/g) || []).length;
content = content.replace(/http:\/\/t6r1sg3dy\.hd-bkt\.clouddn\.com/g, 'https://t6r1sg3dy.hd-bkt.clouddn.com');

// 写回文件（UTF-8）
fs.writeFileSync(filePath, content, 'utf-8');

console.log(`✅ 替换了 ${count} 处 HTTP -> HTTPS`);
