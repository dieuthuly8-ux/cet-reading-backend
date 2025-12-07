// 修复 papers.json 中六级PDF链接，使其与CDN实际文件名匹配
const fs = require('fs');
const path = require('path');

const CDN_DOMAIN = 'http://t6r1sg3dy.hd-bkt.clouddn.com';
const papersPath = path.join(__dirname, 'papers.json');

// 读取CDN上的实际文件列表
const cdnFiles = fs.readFileSync('cet6-pdf-list.txt', 'utf-8')
    .split('\n')
    .slice(1) // 跳过标题行
    .filter(line => line.trim())
    .map(line => {
        const key = line.split('\t')[0];
        return key;
    });

console.log(`CDN上共有 ${cdnFiles.length} 个六级PDF文件\n`);

// 创建文件名映射
// 从文件名解析年份、月份、套数
function parseFileName(fileName) {
    // 匹配: 2024年6月 或 2024年12月
    const yearMonthMatch = fileName.match(/(\d{4})年(\d{1,2})月/);
    // 匹配: 第一套/第二套/第三套 或 第1套/第2套/第3套
    const setMatch = fileName.match(/第(一|二|三|\d)套/);
    
    if (!yearMonthMatch || !setMatch) return null;
    
    const year = yearMonthMatch[1];
    const month = yearMonthMatch[2].padStart(2, '0');
    let setNo = setMatch[1];
    
    // 转换中文数字
    if (setNo === '一') setNo = '1';
    else if (setNo === '二') setNo = '2';
    else if (setNo === '三') setNo = '3';
    
    return { year, month, setNo };
}

// 创建映射表
const fileMap = {};
cdnFiles.forEach(file => {
    const parsed = parseFileName(file);
    if (parsed) {
        const key = `cet6-${parsed.year}-${parsed.month}-set${parsed.setNo}`;
        fileMap[key] = `${CDN_DOMAIN}/${file}`;
    }
});

console.log('文件映射表:');
Object.entries(fileMap).forEach(([k, v]) => console.log(`  ${k} -> ${v.split('/').pop()}`));

// 读取 papers.json
const data = JSON.parse(fs.readFileSync(papersPath, 'utf-8'));

// 更新六级试卷的 PDF 链接
let updated = 0;
let notFound = [];

if (data.cet6 && Array.isArray(data.cet6)) {
    data.cet6.forEach(paper => {
        if (fileMap[paper.id]) {
            paper.pdf = fileMap[paper.id];
            console.log(`\n✓ 更新: ${paper.id}`);
            console.log(`  -> ${paper.pdf}`);
            updated++;
        } else {
            notFound.push(paper.id);
        }
    });
}

// 写回 papers.json
fs.writeFileSync(papersPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('\n========================================');
console.log(`✅ 已更新 ${updated} 个六级PDF链接`);
if (notFound.length > 0) {
    console.log(`⚠ ${notFound.length} 个试卷未找到对应PDF:`);
    notFound.forEach(id => console.log(`  - ${id}`));
}
