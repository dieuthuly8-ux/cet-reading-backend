// 导入六级听力资源到系统
const fs = require('fs');
const path = require('path');

console.log('🎧 开始导入六级听力资源...\n');

// 路径配置
const sourceDir = path.join(__dirname, '六级听力');
const targetBaseDir = path.join(__dirname, 'assets', 'audio', 'cet6-listening');
const listeningJsonPath = path.join(__dirname, 'listening.json');

// 创建目标目录
if (!fs.existsSync(targetBaseDir)) {
    fs.mkdirSync(targetBaseDir, { recursive: true });
    console.log('✓ 创建音频目录:', targetBaseDir);
}

// 读取现有listening.json
let listeningData = {};
if (fs.existsSync(listeningJsonPath)) {
    listeningData = JSON.parse(fs.readFileSync(listeningJsonPath, 'utf8'));
    console.log('✓ 读取现有 listening.json\n');
}

// 解析文件名获取试卷ID
function parseFilename(filename) {
    // 格式: 2024年12月大学英语六级听力音频（第1套）.mp3
    const match = filename.match(/(\d{4})年(\d{1,2})月.*?六级.*?第(\d+)套/);
    if (!match) return null;
    
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const setNum = match[3];
    
    return {
        id: `cet6-${year}-${month}-set${setNum}`,
        year: parseInt(year),
        month: month,
        set: setNum,
        filename: filename
    };
}

// 为每个试卷生成听力数据结构
function generateListeningData(info, audioPath) {
    return {
        "sections": [
            {
                "name": "Section A - Conversations",
                "audio": audioPath,
                "transcript": "",
                "duration": "约8分钟",
                "description": "两篇长对话，每篇对话后有4个问题",
                "questions": []
            },
            {
                "name": "Section B - Passages",
                "audio": audioPath,
                "transcript": "",
                "duration": "约7分钟",
                "description": "两篇听力短文，每篇短文后有3-4个问题",
                "questions": []
            },
            {
                "name": "Section C - Lectures",
                "audio": audioPath,
                "transcript": "",
                "duration": "约10分钟",
                "description": "三篇讲座或讲话，每篇后有3-4个问题",
                "questions": []
            }
        ],
        "totalQuestions": 25,
        "totalDuration": "约25分钟",
        "year": info.year,
        "month": info.month,
        "set": info.set,
        "status": "音频已导入",
        "notes": "完整听力音频，包含Section A、B、C三部分"
    };
}

// 处理所有文件
console.log('=== 开始处理音频文件 ===\n');

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.mp3'));
let successCount = 0;
let skippedCount = 0;

files.forEach(filename => {
    const info = parseFilename(filename);
    
    if (!info) {
        console.log(`⚠ 跳过无法解析的文件: ${filename}`);
        skippedCount++;
        return;
    }
    
    const sourcePath = path.join(sourceDir, filename);
    const targetFilename = `${info.id}.mp3`;
    const targetPath = path.join(targetBaseDir, targetFilename);
    
    // 复制文件（不删除原文件，保留备份）
    try {
        fs.copyFileSync(sourcePath, targetPath);
        
        // 生成相对路径（用于网页访问）
        const audioUrl = `assets/audio/cet6-listening/${targetFilename}`;
        
        // 添加到listening.json
        listeningData[info.id] = generateListeningData(info, audioUrl);
        
        console.log(`✓ ${info.id}`);
        console.log(`  文件: ${filename}`);
        console.log(`  路径: ${audioUrl}`);
        console.log('');
        
        successCount++;
    } catch (error) {
        console.error(`✗ 处理失败: ${filename}`);
        console.error(`  错误: ${error.message}\n`);
    }
});

// 备份并保存listening.json
const backupPath = listeningJsonPath.replace('.json', '.backup.json');
if (fs.existsSync(listeningJsonPath)) {
    fs.copyFileSync(listeningJsonPath, backupPath);
    console.log(`\n✓ 备份原文件: ${backupPath}`);
}

fs.writeFileSync(listeningJsonPath, JSON.stringify(listeningData, null, 2), 'utf8');
console.log(`✓ 更新 listening.json`);

console.log('\n==========================================');
console.log('✅ 六级听力导入完成');
console.log('==========================================');
console.log(`成功: ${successCount} 个文件`);
console.log(`跳过: ${skippedCount} 个文件`);
console.log(`总计: ${Object.keys(listeningData).length} 份听力资源`);
console.log('==========================================\n');

// 生成统计报告
const cet4Count = Object.keys(listeningData).filter(k => k.startsWith('cet4')).length;
const cet6Count = Object.keys(listeningData).filter(k => k.startsWith('cet6')).length;

console.log('📊 资源统计：');
console.log(`  四级听力: ${cet4Count} 份`);
console.log(`  六级听力: ${cet6Count} 份`);
console.log(`  合计: ${cet4Count + cet6Count} 份\n`);

console.log('💡 后续步骤：');
console.log('1. 音频文件已复制到: assets/audio/cet6-listening/');
console.log('2. listening.json 已更新');
console.log('3. 打开网站的"听力测试专区"即可看到六级听力');
console.log('4. 如需添加题目，可以编辑 listening.json 中的 questions 数组\n');

console.log('🎉 完成！现在可以在网站上使用六级听力了！');
