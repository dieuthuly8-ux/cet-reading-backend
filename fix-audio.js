const fs = require('fs');
let content = fs.readFileSync('listening.json', 'utf8');

// 替换所有 HTTP 七牛云链接
content = content.replace(/http:\/\/bf-lgs-kjg-hd-bkl\.clouddn\.com/g, 'https://audio-proxy.dieuthuly8.workers.dev');

// 替换本地路径为 Worker 代理
content = content.replace(/"assets\/audio\/cet6-listening\//g, '"https://audio-proxy.dieuthuly8.workers.dev/cet6/audio/');
content = content.replace(/"assets\/audio\/cet4-listening\//g, '"https://audio-proxy.dieuthuly8.workers.dev/cet4/audio/');

fs.writeFileSync('listening.json', content, 'utf8');
console.log('✓ 音频链接修复完成');
