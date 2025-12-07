// 检查papers.json中所有试卷的PDF是否存在
const fs = require('fs');
const path = require('path');

const papersPath = path.join(__dirname, 'papers.json');
const data = JSON.parse(fs.readFileSync(papersPath, 'utf-8'));

// 收集所有需要检查的PDF URL
const toCheck = [];

// 四级试卷
if (data.cet4 && Array.isArray(data.cet4)) {
    data.cet4.forEach(paper => {
        if (paper.pdf) {
            toCheck.push({ type: 'cet4', id: paper.id, title: paper.title, pdf: paper.pdf });
        }
    });
}

// 六级试卷
if (data.cet6 && Array.isArray(data.cet6)) {
    data.cet6.forEach(paper => {
        if (paper.pdf) {
            toCheck.push({ type: 'cet6', id: paper.id, title: paper.title, pdf: paper.pdf });
        }
    });
}

console.log(`共需检查 ${toCheck.length} 个PDF文件\n`);

// 使用fetch检查每个PDF是否存在
async function checkPdfExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (e) {
        return false;
    }
}

async function main() {
    const missing = [];
    const exists = [];
    
    for (const item of toCheck) {
        const ok = await checkPdfExists(item.pdf);
        if (ok) {
            exists.push(item);
            console.log(`✓ ${item.id}`);
        } else {
            missing.push(item);
            console.log(`✗ ${item.id} - ${item.pdf}`);
        }
    }
    
    console.log('\n========================================');
    console.log(`存在: ${exists.length} 个`);
    console.log(`缺失: ${missing.length} 个`);
    
    if (missing.length > 0) {
        console.log('\n缺失的试卷:');
        missing.forEach(m => console.log(`  - ${m.id}: ${m.title}`));
        
        // 保存缺失列表
        fs.writeFileSync('missing-pdfs.json', JSON.stringify(missing, null, 2), 'utf-8');
        console.log('\n缺失列表已保存到 missing-pdfs.json');
    }
}

main();
