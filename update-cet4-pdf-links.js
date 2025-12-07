// 更新 papers.json 中四级试卷的 PDF CDN 链接
const fs = require('fs');
const path = require('path');

const CDN_DOMAIN = 'http://t6r1sg3dy.hd-bkt.clouddn.com';
const papersPath = path.join(__dirname, 'papers.json');

// 读取 papers.json
const data = JSON.parse(fs.readFileSync(papersPath, 'utf-8'));

// 为四级试卷添加 PDF 链接
if (data.cet4 && Array.isArray(data.cet4)) {
    data.cet4.forEach(paper => {
        if (!paper.pdf && paper.id) {
            // 从 ID 解析年份、月份、套数
            // 格式: cet4-2024-06-set1
            const match = paper.id.match(/cet4-(\d{4})-(\d{2})-set(\d)/i);
            if (match) {
                const year = match[1];
                const month = match[2];
                const setNo = match[3];
                // 生成 CDN URL
                // 格式: cet4/pdf/CET-4 2024.06 第1套.pdf
                paper.pdf = `${CDN_DOMAIN}/cet4/pdf/CET-4 ${year}.${month} 第${setNo}套.pdf`;
                console.log(`✓ 添加: ${paper.id} -> ${paper.pdf}`);
            }
        }
    });
}

// 写回 papers.json
fs.writeFileSync(papersPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('\n✅ papers.json 已更新！');
console.log('📋 下一步：需要将四级PDF上传到七牛云 cet4/pdf/ 目录');
