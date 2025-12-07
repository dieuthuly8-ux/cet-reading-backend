// 修复 listening.json 中所有试卷的音频路径
// 确保每个试卷指向正确的对应音频文件
const fs = require('fs');
const path = require('path');

const CDN_DOMAIN = 'http://t6r1sg3dy.hd-bkt.clouddn.com';
const listeningPath = path.join(__dirname, 'listening.json');

// 读取 listening.json
const data = JSON.parse(fs.readFileSync(listeningPath, 'utf-8'));

// CDN上可用的音频文件
const availableAudio = {
    // 四级
    'cet4-2018-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2018-06-set1.mp3`,
    'cet4-2018-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2018-06-set2.mp3`,
    'cet4-2018-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2018-12-set1.mp3`,
    'cet4-2018-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2018-12-set2.mp3`,
    'cet4-2019-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2019-06-set1.mp3`,
    'cet4-2019-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2019-06-set2.mp3`,
    'cet4-2019-06-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2019-06-set2.mp3`, // 2、3套共用
    'cet4-2019-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2019-12-set1.mp3`,
    'cet4-2019-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2019-12-set2.mp3`,
    'cet4-2020-07-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2020-07-set1.mp3`,
    'cet4-2020-09-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2020-09-set1.mp3`,
    'cet4-2020-09-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2020-09-set1.mp3`, // 共用
    'cet4-2020-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2020-12-set1.mp3`,
    'cet4-2020-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2020-12-set2.mp3`,
    'cet4-2020-12-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2020-12-set2.mp3`, // 共用
    'cet4-2021-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2021-06-set1.mp3`,
    'cet4-2021-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2021-06-set2.mp3`,
    'cet4-2021-06-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2021-06-set2.mp3`, // 共用
    'cet4-2021-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2021-12-set1.mp3`,
    'cet4-2021-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2021-12-set2.mp3`,
    'cet4-2021-12-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2021-12-set2.mp3`, // 共用
    'cet4-2022-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2022-06-set1.mp3`,
    'cet4-2022-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2022-06-set1.mp3`, // 共用
    'cet4-2022-06-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2022-06-set1.mp3`, // 共用
    'cet4-2022-09-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2022-09-set1.mp3`,
    'cet4-2022-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2022-12-set1.mp3`,
    'cet4-2022-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2022-12-set2.mp3`,
    'cet4-2022-12-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2022-12-set2.mp3`, // 共用
    'cet4-2023-03-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2023-03-set1.mp3`,
    'cet4-2023-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2023-06-set1.mp3`,
    'cet4-2023-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2023-06-set2.mp3`,
    'cet4-2023-06-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2023-06-set2.mp3`, // 共用
    'cet4-2023-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2023-12-set1.mp3`,
    'cet4-2023-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2023-12-set2.mp3`,
    'cet4-2023-12-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2023-12-set2.mp3`, // 共用
    'cet4-2024-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2024-06-set1.mp3`,
    'cet4-2024-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2024-06-set2.mp3`,
    'cet4-2024-06-set3': `${CDN_DOMAIN}/cet4/audio/cet4-2024-06-set2.mp3`, // 共用
    // 四级2024-12和2025-06暂无音频
    
    // 六级
    'cet6-2019-06-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2019-06-set1.mp3`,
    'cet6-2019-06-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2019-06-set2.mp3`,
    'cet6-2019-12-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2019-12-set1.mp3`,
    'cet6-2019-12-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2019-12-set2.mp3`,
    'cet6-2020-07-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2020-07-set1.mp3`,
    'cet6-2020-09-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2020-09-set1.mp3`,
    'cet6-2020-12-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2020-12-set1.mp3`,
    'cet6-2020-12-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2020-12-set2.mp3`,
    'cet6-2021-06-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2021-06-set1.mp3`,
    'cet6-2021-06-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2021-06-set2.mp3`,
    'cet6-2021-12-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2021-12-set1.mp3`,
    'cet6-2021-12-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2021-12-set2.mp3`,
    'cet6-2022-06-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2022-06-set1.mp3`,
    'cet6-2022-09-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2022-09-set1.mp3`,
    'cet6-2022-12-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2022-12-set1.mp3`,
    'cet6-2022-12-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2022-12-set2.mp3`,
    'cet6-2023-03-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2023-03-set1.mp3`,
    'cet6-2023-06-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2023-06-set1.mp3`,
    'cet6-2023-06-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2023-06-set2.mp3`,
    'cet6-2023-12-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2023-12-set1.mp3`,
    'cet6-2023-12-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2023-12-set2.mp3`,
    'cet6-2024-06-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2024-06-set1.mp3`,
    'cet6-2024-06-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2024-06-set2.mp3`,
    'cet6-2024-12-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2024-12-set1.mp3`,
    'cet6-2024-12-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2024-12-set2.mp3`,
    'cet6-2025-06-set1': `${CDN_DOMAIN}/cet6/audio/cet6-2025-06-set1.mp3`,
    'cet6-2025-06-set2': `${CDN_DOMAIN}/cet6/audio/cet6-2025-06-set2.mp3`,
};

let updatedCount = 0;
let noAudioCount = 0;

// 遍历所有试卷
Object.keys(data).forEach(examId => {
    const exam = data[examId];
    const audioUrl = availableAudio[examId];
    
    if (audioUrl) {
        // 更新所有 section 的音频
        if (exam.sections && Array.isArray(exam.sections)) {
            exam.sections.forEach(section => {
                if (section.audio !== audioUrl) {
                    section.audio = audioUrl;
                    updatedCount++;
                }
            });
        }
        // 更新 modes 中的音频
        if (exam.modes) {
            Object.values(exam.modes).forEach(mode => {
                if (mode.sections && Array.isArray(mode.sections)) {
                    mode.sections.forEach(section => {
                        if (section.audio !== audioUrl) {
                            section.audio = audioUrl;
                            updatedCount++;
                        }
                    });
                }
            });
        }
        console.log(`✓ ${examId}: ${audioUrl.split('/').pop()}`);
    } else {
        console.log(`✗ ${examId}: 暂无音频`);
        noAudioCount++;
    }
});

// 写回文件
fs.writeFileSync(listeningPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n========================================`);
console.log(`✅ 更新了 ${updatedCount} 个音频路径`);
console.log(`⚠ ${noAudioCount} 个试卷暂无音频`);
