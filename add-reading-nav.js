// 批量在所有HTML文件的导航栏添加"阅读微练习"链接
const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'cet4.html',
  'cet6.html',
  'translator.html',
  'news.html',
  'about.html',
  'help.html',
  'exam-detail.html'
];

const oldNav = '<li class="nav-item"><a href="listening-micro.html" class="nav-link">听力练习</a></li>';
const newNav = `<li class="nav-item"><a href="listening-micro.html" class="nav-link">听力练习</a></li>
                <li class="nav-item"><a href="reading-micro.html" class="nav-link">阅读微练习</a></li>`;

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`✗ 跳过: ${file} (文件不存在)`);
    skipped++;
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否已包含阅读微练习链接
  if (content.includes('reading-micro.html')) {
    console.log(`✓ 跳过: ${file} (已包含)`);
    skipped++;
    return;
  }
  
  // 替换导航栏
  if (content.includes(oldNav)) {
    content = content.replace(new RegExp(oldNav.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newNav);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ 更新: ${file}`);
    updated++;
  } else {
    console.log(`✗ 跳过: ${file} (未找到导航栏)`);
    skipped++;
  }
});

console.log('\n========================================');
console.log(`✅ 更新: ${updated} 个文件`);
console.log(`⏭️  跳过: ${skipped} 个文件`);
