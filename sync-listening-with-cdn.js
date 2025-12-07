// 同步 listening.json，只保留CDN上有实际音频的试卷
const fs = require('fs');
const path = require('path');

const CDN_DOMAIN = 'https://t6r1sg3dy.hd-bkt.clouddn.com';

// CDN上实际存在的音频文件（从之前的列表获取）
const existingAudio = {
    // 四级 - 标准化名称的文件
    'cet4-2018-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2018-06-set1.mp3`,
    'cet4-2018-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2018-06-set2.mp3`,
    'cet4-2018-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2018-12-set1.mp3`,
    'cet4-2018-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2018-12-set2.mp3`,
    'cet4-2019-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2019-06-set1.mp3`,
    'cet4-2019-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2019-06-set2.mp3`,
    'cet4-2019-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2019-12-set1.mp3`,
    'cet4-2019-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2019-12-set2.mp3`,
    'cet4-2020-07-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2020-07-set1.mp3`,
    'cet4-2020-09-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2020-09-set1.mp3`,
    'cet4-2020-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2020-12-set1.mp3`,
    'cet4-2020-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2020-12-set2.mp3`,
    'cet4-2021-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2021-06-set1.mp3`,
    'cet4-2021-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2021-06-set2.mp3`,
    'cet4-2021-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2021-12-set1.mp3`,
    'cet4-2021-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2021-12-set2.mp3`,
    'cet4-2022-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2022-06-set1.mp3`,
    'cet4-2022-09-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2022-09-set1.mp3`,
    'cet4-2022-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2022-12-set1.mp3`,
    'cet4-2022-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2022-12-set2.mp3`,
    'cet4-2023-03-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2023-03-set1.mp3`,
    'cet4-2023-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2023-06-set1.mp3`,
    'cet4-2023-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2023-06-set2.mp3`,
    'cet4-2023-12-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2023-12-set1.mp3`,
    'cet4-2023-12-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2023-12-set2.mp3`,
    'cet4-2024-06-set1': `${CDN_DOMAIN}/cet4/audio/cet4-2024-06-set1.mp3`,
    'cet4-2024-06-set2': `${CDN_DOMAIN}/cet4/audio/cet4-2024-06-set2.mp3`,
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

const listeningPath = path.join(__dirname, 'listening.json');
const data = JSON.parse(fs.readFileSync(listeningPath, 'utf-8'));

const newData = {};
let kept = 0;
let removed = 0;

Object.keys(data).forEach(examId => {
    if (existingAudio[examId]) {
        // 保留这个试卷，并更新所有section的audio为正确的URL
        const exam = data[examId];
        const audioUrl = existingAudio[examId];
        
        // 更新sections中的audio
        if (exam.sections && Array.isArray(exam.sections)) {
            exam.sections.forEach(section => {
                section.audio = audioUrl;
            });
        }
        // 更新modes中的audio
        if (exam.modes) {
            Object.values(exam.modes).forEach(mode => {
                if (mode.sections && Array.isArray(mode.sections)) {
                    mode.sections.forEach(section => {
                        section.audio = audioUrl;
                    });
                }
            });
        }
        
        newData[examId] = exam;
        console.log(`✓ 保留: ${examId}`);
        kept++;
    } else {
        console.log(`✗ 删除: ${examId} (无音频)`);
        removed++;
    }
});

// 写回文件
fs.writeFileSync(listeningPath, JSON.stringify(newData, null, 2), 'utf-8');

console.log('\n========================================');
console.log(`✅ 保留: ${kept} 套试卷`);
console.log(`🗑️  删除: ${removed} 套试卷（无音频）`);
