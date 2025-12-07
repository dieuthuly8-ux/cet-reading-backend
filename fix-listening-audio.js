// 修复 listening.json 中的音频URL
const fs = require('fs');
const path = require('path');

const CDN_DOMAIN = 'http://t6r1sg3dy.hd-bkt.clouddn.com';
const listeningPath = path.join(__dirname, 'listening.json');

// 读取 listening.json
let content = fs.readFileSync(listeningPath, 'utf-8');
const originalSize = content.length;

// 替换旧的CDN域名
const oldDomains = [
    'http://bf-lgs-kjg-hd-bkl.clouddn.com',
    'https://bf-lgs-kjg-hd-bkl.clouddn.com'
];

let replaceCount = 0;
oldDomains.forEach(old => {
    const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
        replaceCount += matches.length;
        content = content.replace(regex, CDN_DOMAIN);
    }
});

console.log(`替换旧CDN域名: ${replaceCount} 处`);

// 替换本地路径为CDN路径
// assets/audio/cet4-listening/cet4-2024-06-set1.mp3 -> CDN/cet4/audio/cet4-2024-06-set1.mp3
const localPathRegex = /"assets\/audio\/(cet[46])-listening\/(cet[46]-\d{4}-\d{2}-set\d+\.mp3)"/g;
let localReplaceCount = 0;
content = content.replace(localPathRegex, (match, type, file) => {
    localReplaceCount++;
    return `"${CDN_DOMAIN}/${type}/audio/${file}"`;
});

console.log(`替换本地路径: ${localReplaceCount} 处`);

// 写回文件
fs.writeFileSync(listeningPath, content, 'utf-8');

console.log(`\n✅ listening.json 已更新！`);
console.log(`文件大小: ${originalSize} -> ${content.length} 字节`);
