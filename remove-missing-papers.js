// 删除没有对应PDF的试卷条目
const fs = require('fs');
const path = require('path');

const papersPath = path.join(__dirname, 'papers.json');
const data = JSON.parse(fs.readFileSync(papersPath, 'utf-8'));

// 需要删除的试卷ID列表
const toRemove = [
    'cet4-2020-07-set1',
    'cet4-2020-07-set2',
    'cet6-2023-06-set1',
    'cet6-2023-06-set2',
    'cet6-2022-12-set1',
    'cet6-2021-12-set1',
    'cet6-2020-09-set2',
    'cet6-2020-07-set2'
];

console.log('将删除以下试卷条目:');
toRemove.forEach(id => console.log(`  - ${id}`));

// 删除四级试卷
if (data.cet4 && Array.isArray(data.cet4)) {
    const before = data.cet4.length;
    data.cet4 = data.cet4.filter(paper => !toRemove.includes(paper.id));
    const after = data.cet4.length;
    console.log(`\n四级: ${before} -> ${after} (删除 ${before - after} 个)`);
}

// 删除六级试卷
if (data.cet6 && Array.isArray(data.cet6)) {
    const before = data.cet6.length;
    data.cet6 = data.cet6.filter(paper => !toRemove.includes(paper.id));
    const after = data.cet6.length;
    console.log(`六级: ${before} -> ${after} (删除 ${before - after} 个)`);
}

// 写回 papers.json
fs.writeFileSync(papersPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('\n✅ papers.json 已更新！');
