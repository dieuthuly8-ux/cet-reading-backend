const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('./listening.json', 'utf8'));
  console.log('✅ JSON格式正确');
  console.log('试卷数量:', Object.keys(data).length);
  
  const cet4 = data['cet4-2024-12-set1'];
  if (cet4) {
    console.log('\n✅ cet4-2024-12-set1 存在');
    cet4.sections.forEach((sec, i) => {
      console.log(`\nSection ${i+1}: ${sec.name}`);
      console.log(`  - 有audio: ${sec.audio ? '是' : '否'}`);
      console.log(`  - 有transcript: ${sec.transcript ? '是 (' + sec.transcript.length + '字符)' : '否'}`);
      if (sec.transcript) {
        const preview = sec.transcript.substring(0, 100).replace(/\n/g, ' ');
        console.log(`  - 预览: ${preview}...`);
      }
    });
  }
  
  console.log('\n✅ 验证完成，听力阅读训练数据已就绪！');
} catch(e) {
  console.error('❌ 错误:', e.message);
  process.exit(1);
}
