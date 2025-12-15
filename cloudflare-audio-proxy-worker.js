// Cloudflare Worker - 音频代理
// 将 HTTP 的七牛云音频代理为 HTTPS

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 从路径获取音频文件路径，例如 /cet6/audio/cet6-2024-12-set1.mp3
    const audioPath = url.pathname;
    
    // 七牛云源站地址
    const qiniuUrl = `http://t6r1sg3dy.hd-bkt.clouddn.com${audioPath}`;
    
    try {
      // 从七牛云获取音频
      const response = await fetch(qiniuUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        return new Response('Audio not found', { status: 404 });
      }
      
      // 返回音频，添加 CORS 头
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Cache-Control', 'public, max-age=31536000'); // 缓存1年
      
      return new Response(response.body, {
        status: response.status,
        headers: headers
      });
    } catch (error) {
      return new Response('Proxy error: ' + error.message, { status: 500 });
    }
  }
};
