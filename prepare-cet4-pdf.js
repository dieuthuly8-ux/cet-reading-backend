// 准备四级PDF文件上传到七牛云
// 将本地文件复制并重命名为标准格式
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '英语四级');
const targetDir = path.join(__dirname, 'temp-cet4-pdf');

// 创建目标目录
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 文件名映射规则
// 源文件: 2024年6月大学英语四级考试真题（第1套）.pdf
// 目标文件: CET-4 2024.06 第1套.pdf

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.pdf'));
let count = 0;

files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    
    // 解析文件名
    // 匹配: 2024年6月 或 2024 年6月 或 2024年12月
    const yearMonthMatch = file.match(/(\d{4})\s*年\s*(\d{1,2})月/);
    // 匹配: 第1套 或 （第1套） 或 （第一套）
    const setMatch = file.match(/第(\d|一|二|三)套/);
    
    if (yearMonthMatch && setMatch) {
        const year = yearMonthMatch[1];
        const month = yearMonthMatch[2].padStart(2, '0');
        let setNo = setMatch[1];
        
        // 转换中文数字
        if (setNo === '一') setNo = '1';
        else if (setNo === '二') setNo = '2';
        else if (setNo === '三') setNo = '3';
        
        // 生成标准文件名
        const targetName = `CET-4 ${year}.${month} 第${setNo}套.pdf`;
        const targetPath = path.join(targetDir, targetName);
        
        // 复制文件
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✓ ${file} -> ${targetName}`);
        count++;
    } else {
        console.log(`⚠ 无法解析: ${file}`);
    }
});

console.log(`\n✅ 共准备 ${count} 个文件到 ${targetDir}`);
console.log('\n📋 下一步：使用 qshell 上传到七牛云');
console.log('命令: qshell qupload2 --src-dir=./temp-cet4-pdf --bucket=cet-learning-files --key-prefix=cet4/pdf/ --overwrite');
