// ===== API 配置 =====
// 本地开发时使用: 'http://localhost:3000'
// 部署到云端后，将此地址改为你的 Render 服务地址，例如: 'https://cet-reading-backend.onrender.com'
const API_BASE_URL = 'http://localhost:3000';
// ====================

document.addEventListener('DOMContentLoaded', () => {
    // ^-- 这是"安全罩"的开始
    console.log("DOM fully loaded and parsed"); // 确认安全罩生效

    // 安全转义函数，防止将不受信任文本插入为 HTML 造成 XSS
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* --- 0. 页面滚动进度条 --- */
    const scrollProgress = document.getElementById('scroll-progress');
    let scrollTicking = false;
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = (window.scrollY / windowHeight) * 100;
                    scrollProgress.style.width = scrolled + '%';
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });
        console.log("滚动进度条已初始化");
    }

    /* --- 0.1 导航栏滚动效果 --- */
    const nav = document.querySelector('nav');
    let navTicking = false;
    if (nav) {
        window.addEventListener('scroll', () => {
            if (!navTicking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 50) {
                        nav.classList.add('scrolled');
                    } else {
                        nav.classList.remove('scrolled');
                    }
                    navTicking = false;
                });
                navTicking = true;
            }
        }, { passive: true });
    }

    /* --- 0.2 粒子背景初始化 (仅首页) --- */
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#007AFF' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#007AFF',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
        console.log("粒子背景已初始化");
    }

    /* --- 1. 汉堡菜单交互 --- */
    const toggleBtn = document.querySelector('#mobile-nav-toggle'); // 使用 ID Selector
    const navMenu = document.querySelector('#primary-navigation'); // 使用 ID Selector

    if (toggleBtn && navMenu) {
        console.log("汉堡菜单元素已找到");
        toggleBtn.addEventListener('click', () => {
            console.log("汉堡按钮被点击");
            navMenu.classList.toggle('active');
        });
    } else {
        console.warn("未找到汉堡菜单或按钮元素"); // 添加警告
    }


    /* --- 2. 翻译器交互（优化版）--- */
    const translateButton = document.getElementById('translate-btn');
    const textInput = document.getElementById('english-text');
    const outputDiv = document.getElementById('translation-output'); // 把 outputDiv 移到外面，查词也要用
    const serviceStatus = document.getElementById('service-status');
    const statusMessage = document.getElementById('status-message');

    // 检测服务器状态
    async function checkServerStatus() {
        if (!serviceStatus || !statusMessage) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'test' })
            });
            
            if (response.ok || response.status === 400) {
                // 服务器在线
                serviceStatus.style.display = 'block';
                serviceStatus.style.background = '#d4edda';
                serviceStatus.style.color = '#155724';
                serviceStatus.style.border = '1px solid #c3e6cb';
                statusMessage.innerHTML = '<strong>✅ 服务器在线</strong> - 翻译功能正常可用';
                return true;
            }
        } catch (error) {
            // 服务器离线
            serviceStatus.style.display = 'block';
            serviceStatus.style.background = '#f8d7da';
            serviceStatus.style.color = '#721c24';
            serviceStatus.style.border = '1px solid #f5c6cb';
            statusMessage.innerHTML = `
                <strong>❌ 服务器未启动</strong> - 请先启动后端服务器<br>
                <small style="margin-top: 0.5rem; display: block;">
                    运行命令：<code style="background: #fff; padding: 2px 6px; border-radius: 4px;">cd backend && npm start</code>
                    <br>详细说明请查看下方使用指南 ↓
                </small>
            `;
            return false;
        }
    }

    // ⚠️ 跳过translator.html页面的翻译逻辑（该页面有独立的Vercel API代码）
    const isTranslatorPage = window.location.pathname.includes('translator.html');
    
    if (translateButton && textInput && outputDiv && !isTranslatorPage) { // 确保所有翻译器元素都存在
        console.log("翻译器元素已找到");
        
        // 页面加载时检测服务器状态（GitHub Pages静态部署时不显示）
        // checkServerStatus();
        
        translateButton.addEventListener('click', async () => {
            console.log("翻译按钮被点击");
            const textToTranslate = textInput.value;

            if (!textToTranslate) {
                outputDiv.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: #856404; background: #fff3cd; border-radius: 8px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>请输入英文内容后再翻译</p>
                    </div>
                `;
                return;
            }

            // 显示加载状态（渐进式提示 + 动态小点）
            const startTs = Date.now();
            let dot = 0;
            outputDiv.innerHTML = '';
            const wrapLoad = document.createElement('div');
            wrapLoad.style.padding = '1.5rem';
            wrapLoad.style.border = '1px solid #eef2f7';
            wrapLoad.style.borderRadius = '10px';
            wrapLoad.style.background = '#fafbff';
            wrapLoad.style.textAlign = 'left';
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '12px';
            const icon = document.createElement('i');
            icon.className = 'fas fa-spinner fa-spin';
            icon.style.color = '#007AFF';
            icon.style.fontSize = '1.4rem';
            const title = document.createElement('div');
            title.style.fontWeight = '600';
            title.style.color = '#1f2d3d';
            title.textContent = '正在翻译';
            const dots = document.createElement('span');
            dots.style.marginLeft = '6px';
            dots.style.color = '#5a6775';
            row.appendChild(icon);
            row.appendChild(title);
            row.appendChild(dots);
            const ul = document.createElement('ul');
            ul.style.margin = '10px 0 0 22px';
            ul.style.color = '#5a6775';
            ul.style.lineHeight = '1.8';
            const li1 = document.createElement('li'); li1.textContent = '提交请求到翻译引擎';
            const li2 = document.createElement('li'); li2.textContent = '等待返回结果';
            const li3 = document.createElement('li'); li3.textContent = '生成双语对照';
            ul.appendChild(li1); ul.appendChild(li2); ul.appendChild(li3);
            wrapLoad.appendChild(row);
            wrapLoad.appendChild(ul);
            outputDiv.appendChild(wrapLoad);
            const tick = setInterval(()=>{ dot=(dot+1)%4; dots.textContent='.'.repeat(dot); }, 400);

            try {
                const response = await fetch(`${API_BASE_URL}/api/translate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: textToTranslate })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({})); // 安全解析错误
                    console.error("翻译服务器出错:", errorData);
                    throw new Error(errorData.error || `翻译服务器返回 ${response.status}`);
                }

                const engine = response.headers.get('X-Translator') || '';
                const translationResult = await response.json();
                console.log("翻译成功，结果:", translationResult, 'engine=', engine);

                // 停止动态加载提示
                try { clearInterval(tick); } catch(_) {}

                // --- 双语对照逻辑 ---
                function splitSentences(text, language) {
                    if (typeof text !== "string") return [];
                    let regex;
                    if (language === 'en') {
                        regex = /[^.!?]+[.!?]+/g;
                    } else if (language === 'zh') {
                        regex = /[^。！？]+[。！？]+/g;
                    } else {
                        return [];
                    }
                    const match = text.match(regex);
                    return match ? match : [];
                }

                const englishSentences = splitSentences(textToTranslate, 'en');
                const chineseSentences = splitSentences(translationResult, 'zh');

                if (englishSentences.length === 0 || chineseSentences.length === 0) {
                    console.warn("无法按句子拆分");
                    // 安全渲染：不使用包含用户输入的 innerHTML
                    outputDiv.innerHTML = '';
                    const tipP = document.createElement('p');
                    tipP.textContent = '无法按句子拆分，显示原文和完整翻译：';
                    const enP = document.createElement('p');
                    enP.className = 'en-sentence';
                    enP.textContent = textToTranslate;
                    const zhP = document.createElement('p');
                    zhP.className = 'zh-sentence';
                    zhP.textContent = translationResult;
                    outputDiv.appendChild(tipP);
                    outputDiv.appendChild(enP);
                    outputDiv.appendChild(zhP);
                    return;
                }

                outputDiv.innerHTML = ''; // 清空旧内容
                console.log("开始生成双语对照...");

                // 顶部徽标：显示使用的引擎
                if (engine) {
                    const badge = document.createElement('div');
                    badge.textContent = engine === 'baidu' ? '由 百度翻译 提供' : (engine === 'youdao' ? '由 有道翻译 提供' : '翻译已完成');
                    badge.style.fontSize = '12px';
                    badge.style.color = '#556370';
                    badge.style.background = '#eef4ff';
                    badge.style.border = '1px solid #d7e3ff';
                    badge.style.display = 'inline-block';
                    badge.style.padding = '4px 8px';
                    badge.style.borderRadius = '999px';
                    badge.style.margin = '0 0 10px 0';
                    outputDiv.appendChild(badge);
                }
                const maxLength = Math.max(englishSentences.length, chineseSentences.length);

                // 打字机效果渲染
                const typeText = async (el, text) => {
                    el.textContent = '';
                    const chars = Array.from(text);
                    for (let i=0;i<chars.length;i++) {
                        el.textContent += chars[i];
                        await new Promise(r=>setTimeout(r, Math.min(8 + i*0.05, 20)));
                    }
                };

                // 将英文句子渲染为可点击单词
                const wrapWords = (text) => {
                    const frag = document.createDocumentFragment();
                    const parts = String(text||'').split(/([A-Za-z]+(?:'[A-Za-z]+)?)/g);
                    parts.forEach(part => {
                        if (!part) return;
                        if (/^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(part)) {
                            const span = document.createElement('span');
                            span.className = 'word';
                            span.textContent = part;
                            span.style.cursor = 'pointer';
                            span.style.textDecoration = 'underline';
                            span.style.textDecorationStyle = 'dotted';
                            span.style.textUnderlineOffset = '3px';
                            frag.appendChild(span);
                        } else {
                            frag.appendChild(document.createTextNode(part));
                        }
                    });
                    return frag;
                };

                for (let i = 0; i < maxLength; i++) {
                    const enSentence = englishSentences[i] ? englishSentences[i].trim() : '';
                    const zhSentence = chineseSentences[i] ? chineseSentences[i].trim() : '';
                    const pairDiv = document.createElement('div');
                    pairDiv.className = 'sentence-pair';
                    const enP = document.createElement('p');
                    enP.className = 'en-sentence';
                    enP.appendChild(wrapWords(enSentence));
                    const zhP = document.createElement('p');
                    zhP.className = 'zh-sentence';
                    pairDiv.appendChild(enP);
                    pairDiv.appendChild(zhP);
                    outputDiv.appendChild(pairDiv);
                    // 逐句显示中文翻译，形成“翻译中→结果输出”的体验
                    await typeText(zhP, zhSentence);
                }
                console.log("双语对照生成完毕");
                // --- 双语对照逻辑结束 ---

            } catch (error) {
                console.error("翻译失败:", error);
                
                // 友好的错误提示
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    outputDiv.innerHTML = `
                        <div style="padding: 2rem; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; color: #721c24;">
                            <h3 style="margin-top: 0;">
                                <i class="fas fa-exclamation-triangle"></i> 无法连接到翻译服务器
                            </h3>
                            <p style="margin: 1rem 0;">可能的原因：</p>
                            <ul style="padding-left: 20px; line-height: 1.8;">
                                <li>后端服务器未启动</li>
                                <li>服务器端口不是3000</li>
                                <li>防火墙阻止了连接</li>
                            </ul>
                            <p style="margin: 1rem 0;"><strong>解决方法：</strong></p>
                            <div style="background: #2d2d2d; color: #f8f8f2; padding: 1rem; border-radius: 4px; font-family: monospace;">
                                cd backend<br>
                                npm install<br>
                                npm start
                            </div>
                            <p style="margin-top: 1rem;">
                                <a href="#" onclick="location.reload(); return false;" style="color: #007AFF;">
                                    <i class="fas fa-sync-alt"></i> 刷新页面重试
                                </a>
                            </p>
                        </div>
                    `;
                } else {
                    // 安全渲染错误信息，避免将错误消息直接拼进 innerHTML
                    outputDiv.innerHTML = '';
                    const wrapper = document.createElement('div');
                    wrapper.style.padding = '2rem';
                    wrapper.style.background = '#f8d7da';
                    wrapper.style.border = '1px solid #f5c6cb';
                    wrapper.style.borderRadius = '8px';
                    wrapper.style.color = '#721c24';

                    const h3 = document.createElement('h3');
                    h3.style.marginTop = '0';
                    h3.innerHTML = '<i class="fas fa-times-circle"></i> 翻译失败';

                    const p = document.createElement('p');
                    const strong = document.createElement('strong');
                    strong.textContent = '错误信息：';
                    const msg = document.createElement('span');
                    msg.textContent = error && error.message ? error.message : '未知错误';
                    p.appendChild(strong);
                    p.appendChild(document.createTextNode(' '));
                    p.appendChild(msg);

                    const p2 = document.createElement('p');
                    p2.style.marginTop = '1rem';
                    const a = document.createElement('a');
                    a.href = '#';
                    a.style.color = '#007AFF';
                    a.innerHTML = '<i class="fas fa-sync-alt"></i> 刷新页面重试';
                    a.addEventListener('click', (e) => { e.preventDefault(); location.reload(); });
                    p2.appendChild(a);

                    wrapper.appendChild(h3);
                    wrapper.appendChild(p);
                    wrapper.appendChild(p2);
                    outputDiv.appendChild(wrapper);
                }
                
                // 重新检测服务器状态
                checkServerStatus();
            }
        });
    } else {
        // 如果不在翻译页面，也要检查 outputDiv 是否存在，供查词使用
        if (!outputDiv) {
           console.warn("未找到翻译输出区域 (translation-output)");
        } else {
           console.log("不在翻译页面，但找到了 translation-output 供查词使用");
        }
    }

    /* --- 3. 双击查词弹窗交互 (最终版 + 日志) --- */
    const modalOverlay = document.getElementById('lookup-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalWord = document.getElementById('modal-word');
    const modalPhonetic = document.getElementById('modal-phonetic');
    const modalExplains = document.getElementById('modal-explains');
    const modalTranslation = document.getElementById('modal-translation');
    // 注意: translationOutputDiv 在上面已经获取过了

    if (
        modalOverlay &&
        closeModalBtn &&
        modalWord &&
        modalPhonetic &&
        modalExplains &&
        modalTranslation &&
        outputDiv // 使用上面获取的 outputDiv
    ) {
        console.log("查词弹窗元素已找到");

        // 1. 定义关闭弹窗
        function closeModal() {
            console.log("关闭弹窗");
            modalOverlay.classList.remove('active');
        }

        // 2. 关闭按钮事件
        closeModalBtn.addEventListener('click', closeModal);

        // 3. 点击遮罩层关闭
        modalOverlay.addEventListener('click', function (event) {
            if (event.target === modalOverlay) {
                console.log("点击遮罩层关闭");
                closeModal();
            }
        });

        // 4. 抽取：打开查词弹窗并查询
        async function openLookup(selectedWord) {
            if (!selectedWord || !/^[a-zA-Z]+$/.test(selectedWord)) return;
            console.log(`准备查询单词: "${selectedWord}"`);
            modalWord.textContent = selectedWord;
            modalPhonetic.textContent = '查询中...';
            modalExplains.innerHTML = '';
            modalTranslation.textContent = '';
            modalOverlay.classList.add('active');
            try {
                console.log("发送查词请求到后端...");
                const response = await fetch(`${API_BASE_URL}/api/lookup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word: selectedWord })
                });
                console.log("收到后端响应状态:", response.status);
                if (!response.ok) {
                    let errorData = { error: `查词服务器返回 ${response.status}`};
                    try { errorData = await response.json(); } catch (e) {}
                    throw new Error(errorData.error || `查词服务器返回 ${response.status}`);
                }
                const lookupResult = await response.json();
                console.log("查词成功！后端返回:", lookupResult);
                modalPhonetic.textContent = lookupResult.phonetic ? `[${lookupResult.phonetic}]` : '(无音标)';
                modalExplains.innerHTML = '';
                if (lookupResult.explains && Array.isArray(lookupResult.explains) && lookupResult.explains.length > 0) {
                    lookupResult.explains.forEach(explain => {
                        const p = document.createElement('p');
                        p.textContent = explain;
                        modalExplains.appendChild(p);
                    });
                } else {
                    modalExplains.innerHTML = '<p>(无详细释义)</p>';
                }
                if (lookupResult.translation && Array.isArray(lookupResult.translation) && lookupResult.translation.length > 0) {
                    modalTranslation.textContent = lookupResult.translation.join(', ');
                } else {
                    modalTranslation.textContent = '';
                }
            } catch (error) {
                console.error("查词失败:", error);
                modalPhonetic.textContent = `查询失败: ${error.message}`;
                modalExplains.innerHTML = '';
                modalTranslation.textContent = '';
            }
        }

        // 5. 双击选择文本查词
        outputDiv.addEventListener('dblclick', function () {
            const selectedWord = window.getSelection().toString().trim();
            if (!selectedWord) return;
            openLookup(selectedWord);
        });

        // 6. 点击英文单词（已包裹的 span.word）查词
        outputDiv.addEventListener('click', function (e) {
            const t = e.target;
            if (t && t.classList && t.classList.contains('word')) {
                e.preventDefault();
                e.stopPropagation();
                const w = (t.textContent || '').trim();
                openLookup(w);
            }
        });
    } else {
        console.warn("未找到查词弹窗所需的部分或全部元素"); // 添加警告
    }

    /* --- 4. AOS 滚动动画初始化 --- */
    // 确保 AOS 库已在 HTML 中引入
    if (typeof AOS !== 'undefined') {
        console.log("初始化 AOS...");
        AOS.init({
            duration: 800, // 动画持续时间
            once: true // 动画只播放一次
        });
    } else {
        console.warn("AOS库未加载");
    }
    (async () => {
        try {
            const path = window.location.pathname || '';
            if (!(path.endsWith('/') || path.includes('index.html'))) return;
            const sec = document.getElementById('home-listening');
            const link = document.getElementById('home-listening-link');
            const titleEl = document.getElementById('home-listening-title');
            const moreEl = document.getElementById('home-listening-more');
            if (!sec || !link || !titleEl || !moreEl) return;

            // 1) 读取 listening.json
            const resp = await fetch('./listening.json', { cache: 'no-store' });
            if (!resp.ok) return;
            const listening = await resp.json();
            const ids = Object.keys(listening || {});
            if (!ids || ids.length === 0) return;

            // 2) 选择最新的一套：解析 id 中的年/月/套
            const parseId = (id) => {
                const m = id.match(/cet(4|6)-(20\d{2})-(\d{1,2})-set(\d+)/i);
                if (!m) return { level: 0, year: 0, month: 0, set: 0, id };
                return { level: parseInt(m[1],10), year: parseInt(m[2],10), month: parseInt(m[3],10), set: parseInt(m[4],10), id };
            };
            ids.sort((a,b) => {
                const A = parseId(a), B = parseId(b);
                // 年 desc, 月 desc, 套 desc, 等级(4/6) desc
                return (B.year - A.year) || (B.month - A.month) || (B.set - A.set) || (B.level - A.level);
            });
            const examId = ids[0];

            // 3) 读取 papers.json 获取标题
            let paperTitle = '';
            try {
                const pr = await fetch('./papers.json', { cache: 'no-store' });
                if (pr.ok) {
                    const papers = await pr.json();
                    const findTitle = (arr) => (Array.isArray(arr) ? (arr.find(x => x.id === examId)?.title || '') : '');
                    paperTitle = findTitle(papers.cet4) || findTitle(papers.cet6) || '';
                }
            } catch(_) {}

            // 4) 填充链接与标题
            link.href = 'exam-detail.html?id=' + encodeURIComponent(examId);
            if (paperTitle) titleEl.textContent = `本期推荐：${paperTitle}`;
            const isCet4 = /^cet4-/i.test(examId);
            moreEl.href = isCet4 ? 'cet4.html' : 'cet6.html';

            try {
                const featureEvalBtn = document.getElementById('home-feature-eval-btn');
                const featureMicroBtn = document.getElementById('home-feature-micro-btn');
                if (featureEvalBtn || featureMicroBtn) {
                    let weakSkills = [];
                    try {
                        const profRaw = localStorage.getItem('listening:profile');
                        if (profRaw) {
                            const prof = JSON.parse(profRaw || '{}');
                            const skills = prof && prof.skill ? Object.entries(prof.skill).map(([name, v])=>{
                                const tot = (v?.right||0)+(v?.wrong||0);
                                const errRate = tot>0 ? (v.wrong/tot) : 0;
                                return { name, tot, errRate, wrong: (v?.wrong||0) };
                            }).sort((a,b)=> (b.errRate - a.errRate) || (b.wrong - a.wrong) || (b.tot - a.tot)) : [];
                            weakSkills = skills.slice(0,2).map(s=>s.name).filter(Boolean);
                        }
                    } catch(_) {}
                    if (featureEvalBtn) {
                        featureEvalBtn.href = 'exam-detail.html?id=' + encodeURIComponent(examId);
                        featureEvalBtn.title = '直达最新含听力的试卷，开始测评';
                    }
                    if (featureMicroBtn) {
                        let url;
                        if (weakSkills.length > 0) {
                            const u = new URL(window.location.origin + window.location.pathname.replace(/[^\/]*$/, 'listening-micro.html'));
                            u.searchParams.set('skills', weakSkills.join(','));
                            u.searchParams.set('count', '10');
                            u.searchParams.set('onlyTagged', '1');
                            u.searchParams.set('auto', '1');
                            url = u.pathname + u.search;
                            featureMicroBtn.title = '根据你的弱项生成微练习';
                        } else {
                            url = 'listening-micro.html?count=10&onlyTagged=1&auto=1';
                            featureMicroBtn.title = '快速生成微练习';
                        }
                        featureMicroBtn.href = url;
                    }
                }
            } catch(_) {}

            // 展示模块
            sec.style.display = 'block';
        } catch (_) {}
    })();

    // 首页：最近练习
    (function renderHomeHistory(){
        try {
            const path = window.location.pathname || '';
            if (!(path.endsWith('/') || path.includes('index.html'))) return;
            const wrap = document.getElementById('home-history');
            const list = document.getElementById('home-history-list');
            const clearBtn = document.getElementById('home-history-clear');
            if (!wrap || !list || !clearBtn) return;
            let arr = [];
            try { arr = JSON.parse(localStorage.getItem('listening:history') || '[]'); } catch(_){}
            if (!Array.isArray(arr) || arr.length === 0) { wrap.style.display = 'none'; return; }
            wrap.style.display = 'block';
            // 渲染前 N 条
            const N = 8;
            list.innerHTML = '';
            const ul = document.createElement('ul');
            ul.style.margin = '0 0 0 1.2rem';
            arr.slice(0, N).forEach(rec => {
                const li = document.createElement('li');
                li.style.margin = '4px 0';
                const dt = new Date(rec.ts);
                const when = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
                const a = document.createElement('a');
                a.href = `exam-detail.html?id=${encodeURIComponent(rec.id)}`;
                a.textContent = rec.title || rec.id || '试卷';
                a.style.marginRight = '8px';
                li.appendChild(a);
                const span = document.createElement('span');
                span.textContent = `得分 ${rec.correct}/${rec.total} ｜ ${when}`;
                span.style.color = '#555';
                li.appendChild(span);
                ul.appendChild(li);
            });
            list.appendChild(ul);
            clearBtn.onclick = () => {
                try { localStorage.removeItem('listening:history'); } catch(_){}
                wrap.style.display = 'none';
            };
        } catch(_){}
    })();
    // --- 动态加载并显示真题列表 (带筛选和搜索功能) ---
    const papersContainer = document.getElementById('papers-list') || document.querySelector('.papers-list-container');
    if (papersContainer) {
        // 1. 判断当前页面的 URL 是 CET4 还是 CET6（支持带.html和不带.html的URL）
        const pathname = window.location.pathname.toLowerCase();
        const isCet4Page = pathname.includes('cet4');
        const isCet6Page = pathname.includes('cet6');
        let paperType = null;
        if (isCet4Page) {
            paperType = 'cet4';
        } else if (isCet6Page) {
            paperType = 'cet6';
        }
        // 安全检查
        if (paperType === null) {
            console.error("无法确定页面类型");
            return;
        }

        let allPapers = []; // 存储所有真题
        let listeningIdSet = null; // 含听力数据的试卷ID集合

        // 2. 加载数据库
        fetch('./papers.json')
            .then(response => response.json())
            .then(data => {
                // 3. 获取对应真题数组
                allPapers = data[paperType];
                if (!Array.isArray(allPapers)) {
                    console.error("真题数据格式错误或不存在：", paperType);
                    return;
                }
                if (isCet4Page) {
                    allPapers = allPapers.filter(p => {
                        const y = parseInt(p?.year, 10);
                        return Number.isFinite(y) && y >= 2018 && y <= 2025;
                    });
                }
                
                // 4. 读取 listening.json 以标记有听力的试卷
                (async () => {
                    try {
                        const r = await fetch('./listening.json', { cache: 'no-store' });
                        if (r.ok) {
                            const listening = await r.json();
                            listeningIdSet = new Set(Object.keys(listening || {}));
                        }
                    } catch(_) {}
                    if (isCet4Page) {
                        try {
                            const list = await filterCet4ByPdfAvailability(allPapers);
                            renderPapers(list);
                            updateResultsCount(list.length);
                        } catch(_) {
                            renderPapers(allPapers);
                            updateResultsCount(allPapers.length);
                        }
                    } else {
                        renderPapers(allPapers);
                        updateResultsCount(allPapers.length);
                    }
                    console.log(`${paperType.toUpperCase()} 真题列表加载完毕，共 ${allPapers.length} 套`);
                    // 5. 设置筛选和搜索功能
                    setupFiltersAndSearch();
                    
                    // 6. 预加载 exam-contents.json 到浏览器缓存（提升详情页加载速度）
                    setTimeout(() => {
                        fetch('./exam-contents.json', { cache: 'force-cache' })
                            .then(() => console.log('✓ exam-contents.json 已预加载'))
                            .catch(() => {});
                    }, 1000); // 延迟1秒，避免阻塞主渲染
                })();
            })
            .catch(error => {
                console.error('加载真题数据失败:', error);
            });

        // 渲染真题卡片
        // 简单缓存 exam-contents.json，避免重复请求
        let examContentsCache = null;

        async function getExamHeadingsById(examId) {
            try {
                if (!examContentsCache) {
                    const resp = await fetch('./exam-contents.json', { cache: 'force-cache' });
                    examContentsCache = await resp.json();
                }
                const item = examContentsCache && examContentsCache[examId];
                if (!item || !item.html) return [];
                // 在离屏容器解析 HTML 获取标题
                const tmp = document.createElement('div');
                tmp.innerHTML = item.html;
                const nodes = tmp.querySelectorAll('h2, h3');
                const list = [];
                nodes.forEach(n => {
                    const t = (n.textContent || '').trim();
                    if (t) list.push(t);
                });
                return list.slice(0, 12); // 最多展示 12 条
            } catch (e) {
                console.error('加载试卷预览失败:', e);
                return [];
            }
        }

        function renderPapers(papers) {
            papersContainer.innerHTML = '';
            const noResults = document.getElementById('no-results');
            
            if (papers.length === 0) {
                // 显示无结果提示
                if (noResults) noResults.style.display = 'block';
                papersContainer.style.display = 'none';
            } else {
                // 隐藏无结果提示
                if (noResults) noResults.style.display = 'none';
                papersContainer.style.display = 'grid';
                
                // 生成卡片
                papers.forEach(paper => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'paper-card show';
                    cardDiv.setAttribute('data-year', paper.year || '');
                    cardDiv.setAttribute('data-month', paper.month || '');

                    // 标题/描述
                    const h3 = document.createElement('h3');
                    h3.textContent = paper.title;
                    // 听力角标
                    if (listeningIdSet && paper.id && listeningIdSet.has(paper.id)) {
                        const badge = document.createElement('span');
                        badge.textContent = '含听力';
                        badge.style.marginLeft = '8px';
                        badge.style.fontSize = '0.75rem';
                        badge.style.color = '#8c6d1f';
                        badge.style.background = '#fff3bf';
                        badge.style.border = '1px solid #ffd666';
                        badge.style.borderRadius = '6px';
                        badge.style.padding = '2px 6px';
                        h3.appendChild(badge);
                    }
                    const p = document.createElement('p');
                    p.textContent = paper.desc || '';

                    // 重难点区域
                    const keyPointsDiv = document.createElement('div');
                    keyPointsDiv.className = 'key-points-section';
                    keyPointsDiv.style.marginTop = '12px';
                    keyPointsDiv.style.padding = '12px';
                    keyPointsDiv.style.background = '#f8f9fa';
                    keyPointsDiv.style.borderRadius = '8px';
                    keyPointsDiv.style.borderLeft = '3px solid #007AFF';
                    
                    if (paper.keyPoints) {
                        const kp = paper.keyPoints;
                        
                        // 标题和难度
                        const header = document.createElement('div');
                        header.style.display = 'flex';
                        header.style.justifyContent = 'space-between';
                        header.style.alignItems = 'center';
                        header.style.marginBottom = '8px';
                        
                        const title = document.createElement('div');
                        title.innerHTML = '<strong><i class="fas fa-star"></i> 考试重难点</strong>';
                        title.style.fontSize = '0.9rem';
                        title.style.color = '#333';
                        
                        const difficulty = document.createElement('span');
                        difficulty.textContent = `难度: ${kp.difficulty}`;
                        difficulty.className = 'difficulty-badge';
                        difficulty.style.fontSize = '0.85rem';
                        difficulty.style.padding = '2px 8px';
                        difficulty.style.borderRadius = '4px';
                        difficulty.style.fontWeight = '500';
                        
                        // 根据难度设置颜色
                        if (kp.difficulty === '较难') {
                            difficulty.style.background = '#ffe0e0';
                            difficulty.style.color = '#d32f2f';
                        } else if (kp.difficulty === '中等') {
                            difficulty.style.background = '#fff3e0';
                            difficulty.style.color = '#f57c00';
                        } else {
                            difficulty.style.background = '#e8f5e9';
                            difficulty.style.color = '#388e3c';
                        }
                        
                        header.appendChild(title);
                        header.appendChild(difficulty);
                        keyPointsDiv.appendChild(header);
                        
                        // 关键考点（横向标签）
                        const tagsDiv = document.createElement('div');
                        tagsDiv.style.display = 'flex';
                        tagsDiv.style.flexWrap = 'wrap';
                        tagsDiv.style.gap = '6px';
                        tagsDiv.style.marginTop = '8px';
                        
                        // 选择最重要的3-4个考点展示
                        const allPoints = [
                            ...(kp.listening || []).slice(0, 1),
                            ...(kp.reading || []).slice(0, 1),
                            ...(kp.translation || []).slice(0, 2)
                        ];
                        
                        allPoints.forEach(point => {
                            const tag = document.createElement('span');
                            tag.className = 'key-point-tag';
                            tag.textContent = point;
                            tag.style.fontSize = '0.75rem';
                            tag.style.padding = '3px 8px';
                            tag.style.background = 'white';
                            tag.style.border = '1px solid #e0e0e0';
                            tag.style.borderRadius = '12px';
                            tag.style.color = '#555';
                            tagsDiv.appendChild(tag);
                        });
                        
                        keyPointsDiv.appendChild(tagsDiv);
                        
                        // 查看详细重难点按钮
                        const toggleBtn = document.createElement('button');
                        toggleBtn.className = 'toggle-keypoints-btn';
                        toggleBtn.type = 'button';
                        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> 查看详细分析';
                        toggleBtn.style.marginTop = '8px';
                        toggleBtn.style.fontSize = '0.8rem';
                        toggleBtn.style.color = '#007AFF';
                        toggleBtn.style.background = 'transparent';
                        toggleBtn.style.border = 'none';
                        toggleBtn.style.cursor = 'pointer';
                        toggleBtn.style.padding = '4px 0';
                        
                        // 详细信息（默认隐藏）
                        const detailDiv = document.createElement('div');
                        detailDiv.className = 'keypoints-detail';
                        detailDiv.style.display = 'none';
                        detailDiv.style.marginTop = '12px';
                        detailDiv.style.paddingTop = '12px';
                        detailDiv.style.borderTop = '1px solid #e0e0e0';
                        
                        // 创建详细列表
                        const createList = (title, items, icon) => {
                            if (!items || items.length === 0) return '';
                            const listItems = items.map(item => `<li>${item}</li>`).join('');
                            return `
                                <div style="margin-bottom: 10px;">
                                    <div style="font-weight: 600; color: #333; margin-bottom: 4px;">
                                        <i class="fas ${icon}"></i> ${title}
                                    </div>
                                    <ul style="margin: 0 0 0 1.5rem; font-size: 0.85rem; color: #555;">
                                        ${listItems}
                                    </ul>
                                </div>
                            `;
                        };
                        
                        detailDiv.innerHTML = `
                            ${createList('听力重点', kp.listening, 'fa-headphones')}
                            ${createList('阅读难点', kp.reading, 'fa-book-open')}
                            ${createList('写作要点', kp.writing, 'fa-pen')}
                            ${createList('翻译主题', kp.translation, 'fa-language')}
                        `;
                        
                        toggleBtn.addEventListener('click', () => {
                            const isHidden = detailDiv.style.display === 'none';
                            detailDiv.style.display = isHidden ? 'block' : 'none';
                            toggleBtn.innerHTML = isHidden 
                                ? '<i class="fas fa-chevron-up"></i> 收起详细分析'
                                : '<i class="fas fa-chevron-down"></i> 查看详细分析';
                        });
                        
                        keyPointsDiv.appendChild(toggleBtn);
                        keyPointsDiv.appendChild(detailDiv);
                    } else {
                        // 没有重难点数据时显示提示
                        keyPointsDiv.innerHTML = '<p style="margin:0; color:#888; font-size:0.85rem;"><i class="fas fa-info-circle"></i> 暂无重难点分析数据</p>';
                    }

                    // 按钮容器 - 2x2网格布局
                    const btnWrap = document.createElement('div');
                    btnWrap.className = 'btn-wrap';
                    btnWrap.style.cssText = `
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 10px !important;
                        margin-top: 1rem;
                        align-items: stretch;
                    `;

                    // 判断是否为 PDF 链接
                    const isPDF = typeof paper.url === 'string' && paper.url.toLowerCase().endsWith('.pdf');
                    
                    // 1. 查看详情按钮（统一显示）
                    if (!isPDF && typeof paper.url === 'string') {
                        const mainBtn = document.createElement('a');
                        mainBtn.className = 'paper-btn paper-btn-detail';
                        mainBtn.href = paper.url;
                        mainBtn.style.cssText = `
                            background: linear-gradient(135deg, #34c77b 0%, #2bb066 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
                            font-weight: bold;
                            font-size: 0.95rem;
                            padding: 12px 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            height: 44px;
                            width: 100%;
                            box-sizing: border-box;
                            text-decoration: none;
                            box-shadow: 0 2px 8px rgba(52, 199, 123, 0.3);
                        `;
                        mainBtn.innerHTML = '<i class="fas fa-file-alt"></i> 查看详情';
                        btnWrap.appendChild(mainBtn);
                    }
                    
                    // 1.5 听力练习按钮（仅含听力试卷显示）
                    if (listeningIdSet && paper.id && listeningIdSet.has(paper.id)) {
                        const listeningBtn = document.createElement('a');
                        listeningBtn.className = 'paper-btn paper-btn-listening';
                        listeningBtn.href = `listening-micro.html?exam=${encodeURIComponent(paper.id)}`;
                        listeningBtn.style.cssText = `
                            background: linear-gradient(135deg, #5b6fd6 0%, #4c5cc4 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
                            font-weight: bold;
                            font-size: 0.95rem;
                            padding: 12px 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            height: 44px;
                            width: 100%;
                            box-sizing: border-box;
                            text-decoration: none;
                            box-shadow: 0 2px 8px rgba(91, 111, 214, 0.3);
                        `;
                        listeningBtn.innerHTML = '<i class="fas fa-headphones"></i> 听力练习';
                        btnWrap.appendChild(listeningBtn);
                    }

                    // 2. 下载PDF按钮（四级和六级统一逻辑）
                    let pdfHref = null;
                    
                    // 优先使用 papers.json 中的 pdf 字段（六级）
                    if (paper.pdf && typeof paper.pdf === 'string') {
                        pdfHref = paper.pdf;
                    }
                    // 四级使用路径推导
                    else if (isCet4Page && typeof paper.id === 'string') {
                        const m = paper.id.match(/^cet4-(20\d{2})-(\d{2})-set(\d)$/i);
                        if (m) {
                            const y = m[1], mo = m[2], s = m[3];
                            pdfHref = `./assets/papers/cet4/${y}-${mo}-S${s}.pdf`;
                        }
                    }
                    // 六级也尝试路径推导（兜底）
                    else if (!isCet4Page && typeof paper.id === 'string') {
                        const m = paper.id.match(/^cet6-(20\d{2})-(\d{1,2})-set(\d)$/i);
                        if (m) {
                            const y = m[1], mo = m[2].padStart(2, '0'), s = m[3];
                            pdfHref = `./assets/cet6-pdf/CET-6 ${y}.${mo} 第${s}套.pdf`;
                        }
                    }
                    
                    // 显示下载PDF按钮
                    if (pdfHref) {
                        const pdfBtn = document.createElement('a');
                        pdfBtn.className = 'paper-btn paper-btn-pdf';
                        pdfBtn.href = pdfHref;
                        pdfBtn.target = '_blank';
                        pdfBtn.style.cssText = `
                            background: linear-gradient(135deg, #3b9dd9 0%, #2d8ac7 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
                            font-weight: bold;
                            font-size: 0.95rem;
                            padding: 12px 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            height: 44px;
                            width: 100%;
                            box-sizing: border-box;
                            text-decoration: none;
                            box-shadow: 0 2px 8px rgba(59, 157, 217, 0.3);
                        `;
                        pdfBtn.innerHTML = '<i class="fas fa-download"></i> 下载PDF';
                        pdfBtn.addEventListener('click', async (e)=>{
                            try{
                                e.preventDefault();
                                // 尝试打开PDF
                                window.open(pdfHref, '_blank');
                            }catch(_){
                                // 失败也尝试直接打开
                                window.open(pdfHref, '_blank');
                            }
                        });
                        btnWrap.appendChild(pdfBtn);
                    }

                    // 3. 预览题目按钮（统一显示）
                    if (!isPDF && typeof paper.url === 'string') {
                        const previewBtn = document.createElement('button');
                        previewBtn.className = 'paper-btn paper-btn-preview';
                        previewBtn.type = 'button';
                        previewBtn.style.cssText = `
                            background: linear-gradient(135deg, #f5875f 0%, #e6734b 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
                            font-weight: bold;
                            font-size: 0.95rem;
                            padding: 12px 16px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            height: 44px;
                            width: 100%;
                            box-sizing: border-box;
                            cursor: pointer;
                            box-shadow: 0 2px 8px rgba(245, 135, 95, 0.3);
                        `;
                        previewBtn.innerHTML = '<i class="fas fa-eye"></i> 预览题目';
                        btnWrap.appendChild(previewBtn);

                        // 预览容器
                        const previewBox = document.createElement('div');
                        previewBox.style.display = 'none';
                        previewBox.style.marginTop = '8px';
                        previewBox.style.padding = '10px';
                        previewBox.style.border = '1px solid #eee';
                        previewBox.style.borderRadius = '8px';
                        previewBox.style.background = '#fafafa';

                        previewBtn.addEventListener('click', async () => {
                            // 切换显示
                            if (previewBox.dataset.loaded === '1') {
                                previewBox.style.display = previewBox.style.display === 'none' ? 'block' : 'none';
                                return;
                            }
                            previewBtn.disabled = true;
                            previewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
                            try {
                                // 从 URL 中解析 examId
                                const idMatch = paper.url.match(/id=([^&#]+)/);
                                const examId = idMatch ? decodeURIComponent(idMatch[1]) : '';
                                if (!examId) {
                                    previewBox.textContent = '无法识别试卷ID，暂不支持预览。';
                                } else {
                                    const list = await getExamHeadingsById(examId);
                                    if (list.length === 0) {
                                        previewBox.textContent = '暂无可预览的小节标题。';
                                    } else {
                                        const ul = document.createElement('ul');
                                        ul.style.margin = '0 0 0 1.2rem';
                                        list.forEach(t => {
                                            const li = document.createElement('li');
                                            li.textContent = t;
                                            ul.appendChild(li);
                                        });
                                        const tip = document.createElement('p');
                                        tip.style.color = '#888';
                                        tip.style.marginTop = '6px';
                                        tip.textContent = '以上为部分小节标题（最多12条），更多内容请进入详情页。';
                                        previewBox.innerHTML = '';
                                        previewBox.appendChild(ul);
                                        previewBox.appendChild(tip);
                                    }
                                    previewBox.dataset.loaded = '1';
                                }
                                previewBox.style.display = 'block';
                            } catch (err) {
                                console.error(err);
                                previewBox.textContent = '加载预览失败';
                                previewBox.style.display = 'block';
                            } finally {
                                previewBtn.disabled = false;
                                previewBtn.innerHTML = '<i class="fas fa-eye"></i> 预览题目';
                            }
                        });

                        cardDiv.appendChild(previewBox);
                    }

                    cardDiv.appendChild(h3);
                    cardDiv.appendChild(p);
                    cardDiv.appendChild(keyPointsDiv);
                    cardDiv.appendChild(btnWrap);
                    papersContainer.appendChild(cardDiv);
                });
            }
        }

        // 更新结果统计
        function updateResultsCount(count) {
            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                resultsCount.textContent = count;
            }
        }

        // 筛选和搜索功能设置
        function setupFiltersAndSearch() {
            const searchInput = document.getElementById('search-input');
            const yearFilter = document.getElementById('year-filter');
            const monthFilter = document.getElementById('month-filter');
            const listeningOnly = document.getElementById('filter-listening-only');
            const resetBtn = document.getElementById('reset-filters');

            if (!searchInput || !yearFilter || !monthFilter) {
                console.warn("筛选控件未找到");
                return;
            }

            // 执行筛选
            function applyFilters() {
                const searchTerm = searchInput.value.toLowerCase().trim();
                const selectedYear = yearFilter.value;
                const selectedMonth = monthFilter.value;
                const onlyListening = !!(listeningOnly && listeningOnly.checked);

                const filtered = allPapers.filter(paper => {
                    // 搜索匹配
                    const matchSearch = !searchTerm || 
                        paper.title.toLowerCase().includes(searchTerm) || 
                        paper.desc.toLowerCase().includes(searchTerm);
                    
                    // 年份匹配
                    const matchYear = !selectedYear || 
                        String(paper.year) === selectedYear;
                    
                    // 月份匹配
                    const matchMonth = !selectedMonth || 
                        paper.month === selectedMonth;
                    // 含听力匹配
                    const matchListening = !onlyListening || (listeningIdSet && paper.id && listeningIdSet.has(paper.id));
                    
                    return matchSearch && matchYear && matchMonth && matchListening;
                });

                renderPapers(filtered);
                updateResultsCount(filtered.length);
            }

            // 搜索输入事件 (实时搜索) - 优化防抖延迟
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(applyFilters, 200); // 减少防抖延迟从300ms到200ms
            });

            // 筛选器改变事件
            yearFilter.addEventListener('change', applyFilters);
            monthFilter.addEventListener('change', applyFilters);
            if (listeningOnly) listeningOnly.addEventListener('change', applyFilters);

            // 重置按钮
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    yearFilter.value = '';
                    monthFilter.value = '';
                    if (listeningOnly) listeningOnly.checked = false;
                    renderPapers(allPapers);
                    updateResultsCount(allPapers.length);
                });
            }

            console.log("筛选和搜索功能已初始化");
        }
    }
    /* --- 4. 导航栏高亮当前链接（兼容 file:// 场景） --- */
    console.log("正在执行导航栏高亮脚本...");
    try {
        const currentPath = window.location.pathname; // e.g., "/news.html" 或 file 路径
        const currentHref = window.location.href;
        const allNavLinks = document.querySelectorAll('.nav-menu li a');
        let activeLinkFound = false;

        console.log("当前路径:", currentPath);

        allNavLinks.forEach(link => {
            // 取出链接自身的 href 文件名（不解析绝对 URL 以兼容 file://）
            const hrefAttr = link.getAttribute('href') || '';
            const linkFile = hrefAttr.split('/').pop();

            // 当前页面的文件名（兼容 file:// 与 http(s)://）
            const currentFileFromPath = (currentPath.split('/').pop() || '').toLowerCase();
            const currentFileFromHref = (currentHref.split('/').pop() || '').toLowerCase();
            const currentFile = (currentFileFromPath || currentFileFromHref || '').toLowerCase();

            // 1. 文件名完全匹配（排除空链接）
            if (linkFile && currentFile && currentFile === linkFile.toLowerCase()) {
                console.log('匹配到文件名:', linkFile);
                link.classList.add('active-nav-link');
                activeLinkFound = true;
                return;
            }

            // 2. 详情页前缀匹配（如 cet4-2024... 与 cet4.html）
            const prefix = linkFile.replace('.html', '').toLowerCase();
            if (prefix && currentFile && currentFile.startsWith(prefix) && linkFile.toLowerCase() !== 'index.html') {
                console.log('匹配到详情页前缀:', linkFile);
                link.classList.add('active-nav-link');
                activeLinkFound = true;
            }
        });

        // 3. 检查首页
        if (!activeLinkFound && (currentPath === '/' || currentPath.endsWith('/index.html'))) {
            console.log("匹配到首页");
            const homeLink = document.querySelector('.nav-menu li a[href="index.html"]');
            if (homeLink) {
                homeLink.classList.add('active-nav-link');
            }
        }
    } catch (e) {
        console.error("高亮导航链接时出错:", e);
    }
    /* --- 导航栏高亮脚本结束 --- */
    
    /* --- 5. 移动端收起导航栏菜单 --- */
    console.log("正在绑定移动端菜单关闭功能");
    try {
        // 获取所有菜单链接
        const menuLinks = document.querySelectorAll('.nav-menu li a');
        // 获取 mobile 菜单收起的按钮和菜单本身
        const menuToggle = document.querySelector('#mobile-nav-toggle'); // 改为 ID 选择器
        const navMenu = document.querySelector('#primary-navigation'); // 改为 ID 选择器

        menuLinks.forEach(link => {
            link.addEventListener('click', function () {
                // 如果菜单按钮可见（说明处于移动端）
                if (menuToggle && window.getComputedStyle(menuToggle).display !== "none") {
                    // 菜单栏有打开时关闭它
                    if (navMenu.classList.contains('active')) { // 改为 active
                        navMenu.classList.remove('active'); // 改为 active
                    }
                }
            });
        });
    } catch(e) {
        console.error("移动端菜单关闭功能绑定时出错:", e);
    }
    /* --- 移动端导航栏自动收起脚本结束 --- */

}); // <-- 这是“安全罩”的结束
