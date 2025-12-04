// Vercel Serverless函数 - 百度翻译API代理
const crypto = require('crypto');

module.exports = async (req, res) => {
  // 设置CORS，允许跨域访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: '缺少翻译文本' });
    }

    // 从环境变量获取API密钥（安全）
    const appid = process.env.BAIDU_APPID;
    const secret = process.env.BAIDU_SECRET;

    if (!appid || !secret) {
      return res.status(500).json({ error: '服务器配置错误' });
    }

    // 生成签名
    const salt = Date.now();
    const sign = crypto
      .createHash('md5')
      .update(`${appid}${text}${salt}${secret}`)
      .digest('hex');

    // 调用百度翻译API
    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(text)}&from=en&to=zh&appid=${appid}&salt=${salt}&sign=${sign}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error_code) {
      return res.status(400).json({ 
        error: `翻译失败: ${data.error_msg}`,
        code: data.error_code 
      });
    }

    // 返回翻译结果
    const result = data.trans_result.map(item => item.dst).join('\n');
    res.status(200).json({ result });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
