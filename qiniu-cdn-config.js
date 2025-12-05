// 七牛云CDN配置
// 请将 'YOUR_CDN_DOMAIN' 替换为你的实际CDN域名

const QINIU_CDN = {
  // 七牛云CDN域名
  domain: 'http://bf-lgs-kjg-hd-bkl.clouddn.com',
  
  // 获取音频文件URL
  getAudioUrl(level, filename) {
    return `${this.domain}/${level}/audio/${filename}`;
  },
  
  // 获取PDF文件URL
  getPaperUrl(level, filename) {
    return `${this.domain}/${level}/pdf/${filename}`;
  }
};

// 使用示例：
// const audioUrl = QINIU_CDN.getAudioUrl('cet4', 'cet4-2023-12-set1.mp3');
// const pdfUrl = QINIU_CDN.getPaperUrl('cet4', '2023-12-set1.pdf');

// 导出配置（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QINIU_CDN;
}
