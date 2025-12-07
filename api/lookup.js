// Vercel Serverless函数 - 单词查询API代理
const crypto = require('crypto');
const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: '缺少查询单词' });

    const appKey = process.env.YOUDAO_APP_KEY;
    const secret = process.env.YOUDAO_SECRET;
    if (!appKey || !secret) return res.status(500).json({ error: '服务器配置错误' });

    const normalize = (w) => String(w || '').trim().toLowerCase().replace(/[^a-z']/g, '');
    const lemmatize = (w) => {
      if (!w) return w;
      if (/ies$/.test(w) && w.length > 3) return w.replace(/ies$/, 'y');
      if (w === 'does') return 'do';
      if (w === 'goes') return 'go';
      if (/ses$|xes$|zes$|ches$|shes$/.test(w)) return w.replace(/es$/, '');
      if (/s$/.test(w) && !/ss$/.test(w)) return w.replace(/s$/, '');
      if (/ied$/.test(w) && w.length > 3) return w.replace(/ied$/, 'y');
      if (/ed$/.test(w) && w.length > 3) return w.replace(/ed$/, '');
      if (/ing$/.test(w) && w.length > 4) return w.replace(/ing$/, '');
      return w;
    };

    const q0 = normalize(word);
    const q1 = lemmatize(q0);
    const candidates = [q0, q1].filter((v, i, a) => a.indexOf(v) === i && v);

    async function youdaoQuery(q) {
      const salt = String(Date.now());
      const curtime = String(Math.round(Date.now() / 1000));
      const input = q.length <= 20 ? q : q.substring(0, 10) + q.length + q.substring(q.length - 10);
      const str1 = appKey + input + salt + curtime + secret;
      const sign = crypto.createHash('sha256').update(str1).digest('hex');

      const url = 'https://openapi.youdao.com/api';
      const params = new URLSearchParams();
      params.append('q', q);
      params.append('from', 'en');
      params.append('to', 'zh-CHS');
      params.append('appKey', appKey);
      params.append('salt', salt);
      params.append('sign', sign);
      params.append('curtime', curtime);
      params.append('signType', 'v3');

      const response = await axios.post(url, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      });
      return response.data;
    }

    let data = null;
    for (const cand of candidates) {
      try {
        data = await youdaoQuery(cand);
        if (data && String(data.errorCode) === '0') break;
      } catch (e) {
        console.warn('查询失败，尝试下一个:', e.message);
      }
    }

    if (data && String(data.errorCode) === '0') {
      let phonetic = '';
      let explains = [];
      let translation = Array.isArray(data.translation) ? data.translation.join('; ') : '';

      if (data.basic) {
        phonetic = data.basic.phonetic || data.basic['us-phonetic'] || data.basic['uk-phonetic'] || '';
        explains = data.basic.explains || [];
      }

      if (!phonetic || explains.length === 0) {
        try {
          const dictApi = https://api.dictionaryapi.dev/api/v2/entries/en/;
          const dictRes = await axios.get(dictApi, { timeout: 5000 });
          const arr = Array.isArray(dictRes.data) ? dictRes.data : [];
          if (arr.length > 0) {
            const first = arr[0] || {};
            if (!phonetic && Array.isArray(first.phonetics)) {
              const ph = first.phonetics.find(p => p.text);
              if (ph && ph.text) phonetic = String(ph.text).replace(/^\[|\]$/g, '');
            }
            if (explains.length === 0 && Array.isArray(first.meanings)) {
              const defs = [];
              first.meanings.forEach(m => {
                if (Array.isArray(m.definitions)) {
                  m.definitions.forEach(d => {
                    if (d && d.definition) defs.push(d.definition);
                  });
                }
              });
              if (defs.length > 0) explains = defs.slice(0, 6);
            }
          }
        } catch (e) {
          console.warn('开源词典补全失败:', e.message);
        }
      }

      return res.status(200).json({
        query: q0,
        phonetic: phonetic,
        explains: explains,
        translation: translation
      });
    } else {
      return res.status(500).json({ error: '词典服务错误' });
    }

  } catch (error) {
    console.error('服务器错误:', error.message);
    return res.status(500).json({ error: '查询服务失败' });
  }
};
