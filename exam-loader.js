// 统一解析 PDF 链接（优先本地文件，其次CDN链接）
async function resolvePdfUrlUnified(examId) {
    let pdf = null;
    let localPdf = null;
    let cdnPdf = null;
    
    // 1. 首先生成本地文件路径（优先使用）
    const m4 = (examId||'').match(/^cet4-(20\d{2})-(\d{2})-set(\d)$/i);
    const m6 = (examId||'').match(/^cet6-(20\d{2})-(\d{1,2})-set(\d+)/i);
    
    if (m4) {
        const y=m4[1], mo=m4[2], s=m4[3];
        localPdf = `./assets/papers/cet4/${y}-${mo}-S${s}.pdf`;
    } else if (m6) {
        const y=m6[1], mo=m6[2], s=m6[3];
        const yearMonthCN = `${y}年${mo}月`;
        const setCN = ['第一套', '第二套', '第三套'][parseInt(s) - 1] || `第${s}套`;
        const monthPadded = mo.padStart(2, '0');
        
        // 尝试多种可能的文件名格式（按优先级，匹配实际文件名）
        const possiblePaths = [
            `./assets/cet6-pdf/${yearMonthCN} 英语六级（${setCN}）.pdf`,  // 2025年6月 英语六级（第一套）.pdf
            `./assets/cet6-pdf/CET-6 ${y}.${monthPadded} 第${s}套.pdf`,   // CET-6 2025.06 第1套.pdf
            `./assets/cet6-pdf/${yearMonthCN} 六级真题 （${setCN}）.pdf`, // 2025年6月 六级真题 （第一套）.pdf
            `./assets/cet6-pdf/CET-6 ${y}.${mo} 第${s}套.pdf`,           // CET-6 2025.6 第1套.pdf
            `./assets/cet6-pdf/CET-6 ${y}-${monthPadded} 第${s}套.pdf`  // CET-6 2025-06 第1套.pdf
        ];
        localPdf = possiblePaths[0]; // 使用第一个作为主要路径
    }
    
    // 2. 从 papers.json 读取CDN链接（作为备用）
    try {
        const r = await fetch('./papers.json', { cache: 'no-store' });
        if (r.ok) {
            const data = await r.json();
            const allPapers = [...(data.cet4 || []), ...(data.cet6 || [])];
            const entry = allPapers.find(x => x?.id === examId);
            if (entry && entry.pdf) {
                cdnPdf = String(entry.pdf);
                // 处理 HTTP 到 HTTPS 的转换
                if (cdnPdf.startsWith('http://')) {
                    cdnPdf = cdnPdf.replace(/^http:\/\//, 'https://');
                }
            }
        }
    } catch(_) {}
    
    // 3. 从 exam-contents.json 读取（备用）
    if (!cdnPdf) {
        try {
            const r = await fetch('./exam-contents.json', { cache: 'no-store' });
            if (r.ok) {
                const data = await r.json();
                const entry = data && (data[examId] || (Array.isArray(data?.items) ? data.items.find(x=>x?.id===examId) : null));
                if (entry && entry.pdf) {
                    cdnPdf = String(entry.pdf);
                    if (cdnPdf.startsWith('http://')) {
                        cdnPdf = cdnPdf.replace(/^http:\/\//, 'https://');
                    }
                }
            }
        } catch(_) {}
    }
    
    // 优先返回本地路径，CDN作为备用
    if (localPdf) {
        return { url: localPdf, fallback: cdnPdf };
    }
    
    // 如果没有本地路径，使用CDN链接
    if (cdnPdf) {
        return { url: cdnPdf, fallback: null };
    }
    
    return null;
}

// 仅删除 Part I–IV 四个模块（更严格且针对性强）
function removeFourPartsStrict() {
    const root = document.getElementById('exam-content');
    if (!root) return;
    const partRe = /\bPart\s+(I|II|III|IV)\b/i;
    // 1) 找到所有包含“Part I/II/III/IV”的元素
    const elements = Array.from(root.querySelectorAll('*')).filter(el => partRe.test((el.textContent||'').replace(/\s+/g,' ').trim()));
    if (elements.length === 0) return;
    // 2) 将它们映射到归属的 H2 标题块
    const h2s = Array.from(root.querySelectorAll('h2'));
    const getOwnerH2 = (el) => {
        // 向上找最近的 H2
        let a = el;
        let hops = 0;
        while (a && a !== root && hops++ < 8) {
            if (a.tagName === 'H2') return a;
            a = a.parentElement;
        }
        // 向后回溯到当前段落之前的最近 H2
        a = el;
        hops = 0;
        while (a && a !== root && hops++ < 100) {
            a = a.previousElementSibling;
            if (!a) break;
            if (a.tagName === 'H2') return a;
        }
        // 最后直接匹配所有 H2，取文本上最接近的那个（文本包含 Part I/II/III/IV）
        return h2s.find(h => partRe.test((h.textContent||'')) ) || null;
    };
    const targets = new Set();
    elements.forEach(el => { const h2 = getOwnerH2(el); if (h2) targets.add(h2); });
    // 3) 删除每个目标 H2 及直到下一个 H2 的内容
    targets.forEach(h2 => {
        let node = h2;
        let guard = 0;
        while (node && guard++ < 500) {
            const next = node.nextElementSibling;
            node.remove();
            if (!next || next.tagName === 'H2') break;
            node = next;
        }
    });
}

// 听力测试入口初始化（检测 listening.json 是否有当前 examId）
async function initListeningEntry(examId) {
    const section = document.getElementById('listening-section');
    const startBtn = document.getElementById('start-listening-btn');
    if (!section || !startBtn) return;

    try {
        const resp = await fetch('./listening.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error('listening.json 加载失败');
        const data = await resp.json();
        const entry = data && data[examId];
        if (!entry) {
            // 当前试卷无听力数据
            return;
        }
        // 显示入口并吸引注意力
        section.style.display = 'block';
        // 页面就绪后将视图滚动到听力模块顶部并聚焦按钮（仅一次）
        setTimeout(() => {
            try { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(_){}
            try { startBtn.focus({preventScroll:true}); } catch(_){}
        }, 200);

        startBtn.addEventListener('click', () => {
            renderListeningTest(entry, examId);
        }, { once: true });
    } catch (e) {
        console.warn('读取听力数据失败:', e);
    }
}

// 渲染听力测试（最小可用版）
function renderListeningTest(entry, examId) {
    const mount = document.getElementById('listening-mount');
    if (!mount) return;
    mount.innerHTML = '';

    // 添加听力测试专区横幅
    const listeningBanner = createListeningTestBanner(examId);
    if (listeningBanner) {
        mount.appendChild(listeningBanner);
    }

    // 仅取第一段 Section 作为 MVP
    const sec = Array.isArray(entry.sections) && entry.sections[0];
    if (!sec) {
        mount.textContent = '暂无听力数据';
        return;
    }

    // 音频播放器
    const audioWrap = document.createElement('div');
    audioWrap.style.margin = '0 0 12px 0';
    const toolbar = document.createElement('div');
    toolbar.className = 'listening-toolbar';

    const modeSelect = document.createElement('select');
    const optExam = document.createElement('option'); optExam.value = 'exam'; optExam.textContent = '考试模式';
    const optPractice = document.createElement('option'); optPractice.value = 'practice'; optPractice.textContent = '练习模式';
    modeSelect.appendChild(optExam); modeSelect.appendChild(optPractice);
    modeSelect.value = 'exam';

    const timerEl = document.createElement('span');
    timerEl.textContent = '用时 00:00';
    timerEl.className = 'listening-timer badge';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'action-btn btn btn-secondary';
    resetBtn.type = 'button';
    resetBtn.textContent = '重置作答';

    // 倒计时（考试模式）
    const countdownEl = document.createElement('span');
    countdownEl.className = 'listening-countdown badge';
    countdownEl.textContent = '';
    const durationWrap = document.createElement('label'); durationWrap.className='chip'; durationWrap.style.gap='6px'; durationWrap.style.alignItems='center'; durationWrap.textContent='倒计时';
    const durationSelect = document.createElement('select');
    ;['10','15','20'].forEach(min => { const o=document.createElement('option'); o.value=min; o.textContent=`${min} 分钟`; durationSelect.appendChild(o); });
    durationSelect.value = '15';
    durationWrap.appendChild(durationSelect);

    // 字幕/原文开关（如果有 transcript）
    const hasTranscript = !!(sec.transcript && String(sec.transcript).trim().length > 0);
    const transcriptToggleWrap = document.createElement('label');
    transcriptToggleWrap.className = 'chip';
    transcriptToggleWrap.style.display = hasTranscript ? 'inline-flex' : 'none';
    transcriptToggleWrap.style.alignItems = 'center';
    transcriptToggleWrap.style.gap = '6px';
    const transcriptToggle = document.createElement('input');
    transcriptToggle.type = 'checkbox';
    const transcriptText = document.createElement('span');
    transcriptText.textContent = '显示原文/字幕';
    transcriptToggleWrap.appendChild(transcriptToggle);
    transcriptToggleWrap.appendChild(transcriptText);

    const modeWrap=document.createElement('label'); modeWrap.className='chip'; modeWrap.style.gap='6px'; modeWrap.textContent='模式'; modeWrap.appendChild(modeSelect);
    toolbar.appendChild(modeWrap);
    toolbar.appendChild(timerEl);
    toolbar.appendChild(countdownEl);
    toolbar.appendChild(durationWrap);
    toolbar.appendChild(transcriptToggleWrap);
    toolbar.appendChild(resetBtn);

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.className = 'listening-audio';
    audio.preload = 'metadata';
    
    // 音频错误处理
    let errorShown = false;
    audio.onerror = function(e) {
        console.error('音频加载失败:', sec.audio);
        console.error('错误详情:', e.target.error);
        
        if (!errorShown) {
            errorShown = true;
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                background: #fff3cd;
                border: 2px solid #ffc107;
                border-radius: 8px;
                padding: 16px;
                margin: 12px 0;
                font-size: 14px;
                line-height: 1.6;
            `;
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: start; gap: 12px;">
                    <span style="font-size: 24px;">⚠️</span>
                    <div>
                        <strong style="color: #856404;">音频加载失败 - 需要配置</strong>
                        <p style="margin: 8px 0 0 0; color: #856404;">
                            由于CDN仅支持HTTP协议，请点击地址栏左侧的<strong>锁图标</strong> → <strong>网站设置</strong> → 
                            将<strong>不安全内容</strong>改为<strong>允许</strong>，然后刷新页面。
                        </p>
                    </div>
                </div>
            `;
            audioWrap.insertBefore(errorDiv, audio);
        }
    };
    
    audio.onloadedmetadata = function() {
        console.log('✅ 音频加载成功:', sec.audio, '时长:', Math.floor(audio.duration), '秒');
    };
    
    audio.src = sec.audio || '';

    audioWrap.appendChild(toolbar);
    audioWrap.appendChild(audio);
    mount.appendChild(audioWrap);

    // 创建章节标记进度条（类似B站）- 延迟创建以确保音频加载
    try {
        const chapterMarks = createChapterMarks(sec.questions || [], audio);
        if (chapterMarks) {
            audioWrap.appendChild(chapterMarks);
        }
    } catch (e) {
        console.warn('创建章节标记失败:', e);
    }

    // 字幕容器
    let transcriptDiv = null;
    if (hasTranscript) {
        transcriptDiv = document.createElement('div');
        transcriptDiv.className = 'listening-transcript';
        transcriptDiv.style.display = 'none';
        transcriptDiv.textContent = sec.transcript;
        mount.appendChild(transcriptDiv);
    }

    // 题目列表
    const listWrap = document.createElement('div');
    listWrap.style.display = 'grid';
    listWrap.style.gap = '12px';
    listWrap.className = 'listening-list';

    const answersState = new Map(); // id -> 'A'|'B'|'C'|'D'

    (sec.questions || []).forEach(q => {
        const card = document.createElement('div');
        card.className = 'question';

        const stem = document.createElement('p');
        stem.innerHTML = `<strong>${q.id}.</strong> ${q.stem || ''}`;
        card.appendChild(stem);

        // 按题音频（可选）
        if (q.audio) {
            const qaWrap = document.createElement('div');
            const qa = document.createElement('audio');
            qa.src = q.audio;
            qa.controls = true;
            qa.className = 'listening-mini-audio';
            // 考试模式播放限制（不允许向后拖动，且只允许播放一次）
            let qaPlayedOnce = false;
            let qaLastAllowed = 0;
            qa.addEventListener('seeking', () => {
                if (modeSelect.value === 'exam' && qa.currentTime > qaLastAllowed + 1) {
                    try { qa.currentTime = qaLastAllowed; } catch(_){}
                }
            });
            qa.addEventListener('timeupdate', () => { qaLastAllowed = Math.max(qaLastAllowed, qa.currentTime); });
            qa.addEventListener('ended', () => {
                qaPlayedOnce = true;
                if (modeSelect.value === 'exam') qa.controls = false;
            });
            modeSelect.addEventListener('change', () => {
                if (modeSelect.value === 'practice') qa.controls = true; else qa.controls = qaPlayedOnce ? false : true;
            });
            qaWrap.appendChild(qa);
            card.appendChild(qaWrap);
        }

        const opts = document.createElement('div');
        opts.className = 'options';
        const letters = ['A','B','C','D'];
        (q.options || []).forEach((optText, idx) => {
            const opt = document.createElement('label');
            opt.className = 'option';
            opt.style.display = 'block';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q_${q.id}`;
            input.value = letters[idx] || '';
            input.style.marginRight = '8px';
            input.addEventListener('change', () => {
                answersState.set(q.id, input.value);
                if (modeSelect.value === 'practice') {
                    const isCorrect = String(input.value).toUpperCase() === String(q.answer||'').toUpperCase();
                    markOptionState(opts, letters, q.answer, input.value);
                    ensureExplain(card, q, isCorrect);
                } else {
                    clearOptionState(opts);
                    removeExplain(card);
                }
                persist();
            });
            opt.appendChild(input);
            const span = document.createElement('span');
            span.textContent = `${letters[idx] || ''}) ${optText}`;
            opt.appendChild(span);
            opts.appendChild(opt);
        });
        card.appendChild(opts);

        listWrap.appendChild(card);
    });

    mount.appendChild(listWrap);

    // 提交按钮
    const submitBtn = document.createElement('button');
    submitBtn.className = 'action-btn download-btn';
    submitBtn.type = 'button';
    submitBtn.style.marginTop = '12px';
    submitBtn.innerHTML = '<i class="fas fa-check"></i> 提交并判分';
    submitBtn.addEventListener('click', () => {
        scoreListeningAnswers(sec, answersState, mount);
    });
    mount.appendChild(submitBtn);

    // 模式、计时与播放限制
    let timer = null; let startTs = null;
    let playedOnce = false;
    let lastAllowed = 0;
    let countdownTimer = null; let remainSec = 0;

    function tick() {
        if (!startTs) return;
        const s = Math.floor((Date.now() - startTs)/1000);
        const mm = String(Math.floor(s/60)).padStart(2,'0');
        const ss = String(s%60).padStart(2,'0');
        timerEl.textContent = `用时 ${mm}:${ss}`;
    }

    audio.addEventListener('play', () => {
        if (!startTs) { startTs = Date.now(); timer = setInterval(tick, 1000); }
        if (modeSelect.value === 'exam' && !countdownTimer) {
            // 启动倒计时
            remainSec = parseInt(durationSelect.value,10) * 60;
            updateCountdown();
            countdownTimer = setInterval(() => {
                remainSec = Math.max(0, remainSec - 1);
                updateCountdown();
                if (remainSec === 0) {
                    clearInterval(countdownTimer); countdownTimer = null;
                    // 到时强制提交
                    scoreListeningAnswers(sec, answersState, mount);
                }
            }, 1000);
        }
    });
    audio.addEventListener('seeking', () => {
        if (modeSelect.value === 'exam' && audio.currentTime > lastAllowed + 1) {
            try { audio.currentTime = lastAllowed; } catch(_){}
        }
    });
    audio.addEventListener('timeupdate', () => {
        lastAllowed = Math.max(lastAllowed, audio.currentTime);
    });
    audio.addEventListener('ended', () => {
        playedOnce = true;
        if (modeSelect.value === 'exam') {
            audio.controls = false;
        }
    });
    audio.addEventListener('error', () => {
        const err = document.createElement('div');
        err.className = 'listening-explain';
        err.style.color = '#c62828';
        err.textContent = '音频加载失败，请检查音频路径或网络后重试。';
        audioWrap.appendChild(err);
    });

    modeSelect.addEventListener('change', () => {
        if (modeSelect.value === 'practice') {
            audio.controls = true;
            stopCountdown();
            countdownEl.textContent = '';
        } else {
            if (playedOnce) audio.controls = false; else audio.controls = true;
        }
        persist();
    });

    resetBtn.addEventListener('click', () => {
        answersState.clear();
        listWrap.querySelectorAll('input[type="radio"]').forEach(i => { i.checked = false; });
        listWrap.querySelectorAll('.option').forEach(o => { o.classList.remove('correct'); o.classList.remove('incorrect'); });
        listWrap.querySelectorAll('.listening-explain').forEach(e => e.remove());
        if (timer) clearInterval(timer);
        timer = null; startTs = null; timerEl.textContent = '用时 00:00';
        playedOnce = false; lastAllowed = 0;
        audio.controls = true; audio.currentTime = 0; audio.pause();
        stopCountdown();
        countdownEl.textContent = '';
        persist();
    });

    function updateCountdown() {
        const mm = String(Math.floor(remainSec/60)).padStart(2,'0');
        const ss = String(remainSec%60).padStart(2,'0');
        countdownEl.textContent = `剩余 ${mm}:${ss}`;
    }
    function stopCountdown() {
        if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    }

    // 键盘快捷键：A/B/C/D 选择当前题；Space 播放/暂停
    let activeCard = null;
    listWrap.addEventListener('click', (e) => {
        const card = e.target.closest('.question');
        if (card && listWrap.contains(card)) activeCard = card;
    });
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('listening-mount').contains(mount)) return; // 页面已更换
        const inModal = false; // 预留
        if (inModal) return;
        // Space 播放/暂停
        if (e.code === 'Space') {
            if (document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
            e.preventDefault();
            if (audio.paused) audio.play(); else audio.pause();
            return;
        }
        const key = e.key.toUpperCase();
        const map = { 'A':0, 'B':1, 'C':2, 'D':3 };
        if (!(key in map)) return;
        const idx = map[key];
        const scope = activeCard || listWrap.querySelector('.question');
        if (!scope) return;
        const radios = scope.querySelectorAll('input[type="radio"]');
        if (radios && radios[idx]) {
            radios[idx].checked = true;
            radios[idx].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    // 本地持久化（answers + mode）
    const storageKey = examId ? `listening:${examId}` : null;
    function persist() {
        if (!storageKey) return;
        const obj = {
            mode: modeSelect.value,
            answers: Array.from(answersState.entries())
        };
        try { localStorage.setItem(storageKey, JSON.stringify(obj)); } catch(_){}
    }
    // 恢复
    (function restore(){
        if (!storageKey) return;
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const obj = JSON.parse(raw);
            if (obj && obj.mode) modeSelect.value = obj.mode;
            if (Array.isArray(obj?.answers)) {
                obj.answers.forEach(([qid, val]) => { answersState.set(qid, val); });
                // 显示到 UI
                (sec.questions||[]).forEach(q => {
                    const val = answersState.get(q.id);
                    if (!val) return;
                    const scope = listWrap.querySelectorAll('.question')[q.id-1];
                    if (!scope) return;
                    const radios = scope.querySelectorAll('input[type="radio"]');
                    const letters = ['A','B','C','D'];
                    const idx = letters.indexOf(String(val).toUpperCase());
                    if (idx>=0 && radios[idx]) {
                        radios[idx].checked = true;
                        if (modeSelect.value === 'practice') {
                            const opts = scope.querySelector('.options');
                            const isCorrect = String(val).toUpperCase() === String(q.answer||'').toUpperCase();
                            markOptionState(opts, letters, q.answer, val);
                            ensureExplain(scope, q, isCorrect);
                        }
                    }
                });
            }
            if (hasTranscript && typeof obj?.showTranscript === 'boolean') {
                transcriptToggle.checked = obj.showTranscript;
                transcriptDiv.style.display = obj.showTranscript ? 'block' : 'none';
            }
        } catch(_){}
    })();

    if (hasTranscript) {
        transcriptToggle.addEventListener('change', () => {
            transcriptDiv.style.display = transcriptToggle.checked ? 'block' : 'none';
            persist();
        });
    }
}

// 判分并显示结果
function scoreListeningAnswers(section, answersState, mount) {
    const qs = Array.isArray(section.questions) ? section.questions : [];
    // 未作答检查
    const unanswered = qs.filter(q => !answersState.get(q.id));
    if (unanswered.length > 0) {
        const firstId = unanswered[0].id;
        const warn = document.createElement('div');
        warn.className = 'listening-result';
        warn.style.borderLeft = '4px solid #ff9500';
        warn.style.background = '#fff8e1';
        warn.style.color = '#8c6d1f';
        warn.textContent = `还有 ${unanswered.length} 题未作答，请完成后再提交。`;
        mount.appendChild(warn);
        // 滚动到第一道未答题
        const target = mount.querySelector(`.question:nth-child(${firstId})`) || mount.querySelector('.question');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    let correct = 0;
    const detail = [];
    qs.forEach(q => {
        const user = answersState.get(q.id) || '-';
        const ok = String(user).toUpperCase() === String(q.answer || '').toUpperCase();
        if (ok) correct++;
        detail.push({ id: q.id, user, answer: q.answer || '', ok, explain: q.explain || '' });
    });

    const resultBox = document.createElement('div');
    resultBox.className = 'listening-result';

    const h = document.createElement('h3');
    h.textContent = `得分：${correct} / ${qs.length}`;
    h.style.margin = '0 0 8px 0';
    resultBox.appendChild(h);

    const ul = document.createElement('ul');
    ul.style.margin = '0 0 0 1.2rem';
    detail.forEach(d => {
        const li = document.createElement('li');
        li.style.margin = '4px 0';
        li.textContent = `${d.id}. 你的答案: ${d.user} ｜ 正确答案: ${d.answer}${d.explain ? ' ｜ 解析：' + d.explain : ''}`;
        if (d.ok) li.style.color = '#2e7d32'; else li.style.color = '#c62828';
        ul.appendChild(li);
    });
    resultBox.appendChild(ul);

    mount.appendChild(resultBox);

    // 个性化总结与推荐
    try {
        const summary = buildPersonalizedSummary(section, detail);
        if (summary) mount.appendChild(summary);
    } catch(_){}

    // 结果历史保存
    try {
        const metaTitle = document.getElementById('exam-title')?.textContent || '';
        const historyKey = 'listening:history';
        const rec = { id: (new URLSearchParams(location.search)).get('id') || '', title: metaTitle, total: qs.length, correct, ts: Date.now() };
        const raw = localStorage.getItem(historyKey);
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift(rec);
        localStorage.setItem(historyKey, JSON.stringify(arr.slice(0, 20)));
        // 更新用户画像
        try { updateUserProfile(section, detail); } catch(_){}
    } catch(_){}
}

function clearOptionState(optsRoot) {
    optsRoot.querySelectorAll('.option').forEach(o => { o.classList.remove('correct'); o.classList.remove('incorrect'); });
}

function markOptionState(optsRoot, letters, answer, user) {
    clearOptionState(optsRoot);
    const correctVal = String(answer||'').toUpperCase();
    const userVal = String(user||'').toUpperCase();
    const nodes = Array.from(optsRoot.querySelectorAll('label.option'));
    nodes.forEach((node, idx) => {
        const val = (letters[idx]||'').toUpperCase();
        if (val === correctVal) node.classList.add('correct');
        if (val === userVal && userVal !== correctVal) node.classList.add('incorrect');
    });
}

function ensureExplain(card, q, isCorrect) {
    removeExplain(card);
    const div = document.createElement('div');
    div.className = 'listening-explain';
    div.style.color = isCorrect ? '#2e7d32' : '#c62828';
    div.textContent = q.explain ? q.explain : (isCorrect ? '回答正确' : '回答错误');
    card.appendChild(div);
}

function removeExplain(card) {
    const old = card.querySelector('.listening-explain');
    if (old) old.remove();
}

// --- 个性化：画像、总结、微练习 ---
function updateUserProfile(section, detail) {
    const key = 'listening:profile';
    let prof = {};
    try { prof = JSON.parse(localStorage.getItem(key) || '{}'); } catch(_){}
    prof.skill = prof.skill || {}; // { skillName: { right, wrong } }
    prof.topic = prof.topic || {}; // { topicName: { right, wrong } }
    prof.error = prof.error || {}; // { errorType: count }

    const qs = Array.isArray(section.questions) ? section.questions : [];
    const map = new Map(qs.map(q => [q.id, q]));
    detail.forEach(d => {
        const q = map.get(d.id) || {};
        const tags = q.tags || {};
        const skills = Array.isArray(tags.skill) ? tags.skill : [];
        const topics = Array.isArray(tags.topic) ? tags.topic : [];
        const distract = Array.isArray(tags.distractor) ? tags.distractor : [];
        skills.forEach(s => {
            const cur = prof.skill[s] || { right:0, wrong:0 };
            cur[d.ok ? 'right' : 'wrong']++;
            prof.skill[s] = cur;
        });
        topics.forEach(t => {
            const cur = prof.topic[t] || { right:0, wrong:0 };
            cur[d.ok ? 'right' : 'wrong']++;
            prof.topic[t] = cur;
        });
        if (!d.ok) distract.forEach(x => { prof.error[x] = (prof.error[x]||0)+1; });
    });
    try { localStorage.setItem(key, JSON.stringify(prof)); } catch(_){}
}

function buildPersonalizedSummary(section, detail) {
    const wrap = document.createElement('div');
    wrap.className = 'listening-result card-elevated';
    const title = document.createElement('h3');
    title.textContent = '个性化总结与建议';
    title.style.margin = '0 0 10px 0';
    wrap.appendChild(title);

    const qs = Array.isArray(section.questions) ? section.questions : [];
    const map = new Map(qs.map(q => [q.id, q]));

    // 统计
    const skillErr = new Map();
    const topicErr = new Map();
    const synonymPairs = [];
    const numberNotes = [];
    detail.forEach(d => {
        const q = map.get(d.id) || {};
        const tags = q.tags || {};
        const skills = Array.isArray(tags.skill) ? tags.skill : [];
        const topics = Array.isArray(tags.topic) ? tags.topic : [];
        if (!d.ok) {
            skills.forEach(s => skillErr.set(s, (skillErr.get(s)||0)+1));
            topics.forEach(t => topicErr.set(t, (topicErr.get(t)||0)+1));
        }
        if (Array.isArray(skills) && skills.includes('synonym')) {
            if (q.explain) synonymPairs.push(`Q${d.id}: ${q.explain}`);
        }
        if (Array.isArray(skills) && skills.includes('number')) {
            numberNotes.push(`Q${d.id}: 注意数字/时间表达`);
        }
    });

    const sortedSkill = Array.from(skillErr.entries()).sort((a,b)=>b[1]-a[1]);
    const sortedTopic = Array.from(topicErr.entries()).sort((a,b)=>b[1]-a[1]);
    const weakSkills = sortedSkill.slice(0,2).map(x=>x[0]);

    // 主体栅格
    const grid = document.createElement('div'); grid.className='grid-2'; grid.style.marginTop='6px';

    // 卡1：弱项技能 + 徽章
    const cardWeak = document.createElement('div'); cardWeak.className='card-elevated'; cardWeak.style.padding='12px';
    const c1h = document.createElement('h4'); c1h.style.margin='0 0 8px 0'; c1h.textContent='弱项技能'; cardWeak.appendChild(c1h);
    if (weakSkills.length>0) {
        const box=document.createElement('div'); box.style.display='flex'; box.style.flexWrap='wrap'; box.style.gap='8px';
        weakSkills.forEach(s=>{ const b=document.createElement('span'); b.className='badge'; b.textContent=s; box.appendChild(b); });
        cardWeak.appendChild(box);
    } else {
        const em=document.createElement('p'); em.style.margin='0'; em.textContent='本次未发现明显弱项技能'; cardWeak.appendChild(em);
    }
    grid.appendChild(cardWeak);

    // 卡2：历史技能条形图
    const cardBars = document.createElement('div'); cardBars.className='card-elevated'; cardBars.style.padding='12px';
    const c2h = document.createElement('h4'); c2h.style.margin='0 0 6px 0'; c2h.textContent='技能薄弱条形图（历史统计）'; cardBars.appendChild(c2h);
    try {
        const profRaw = localStorage.getItem('listening:profile');
        if (profRaw) {
            const prof = JSON.parse(profRaw || '{}');
            if (prof && prof.skill) {
                const bars = document.createElement('div'); bars.className = 'skill-bars';
                const entries = Object.entries(prof.skill).map(([k,v])=>{
                    const tot = (v?.right||0) + (v?.wrong||0);
                    const errRate = tot>0 ? (v.wrong/tot) : 0;
                    return { name:k, tot, errRate };
                }).sort((a,b)=> (b.errRate - a.errRate) || (b.tot - a.tot)).slice(0,5);
                entries.forEach(e=>{
                    const row = document.createElement('div'); row.className = 'skill-bar';
                    const lab = document.createElement('div'); lab.className='skill-bar-label'; lab.textContent = `${e.name} (${Math.round(e.errRate*100)}%)`;
                    const track = document.createElement('div'); track.className='skill-bar-track';
                    const fill = document.createElement('div'); fill.className='skill-bar-fill'; fill.style.width = `${Math.round(e.errRate*100)}%`;
                    track.appendChild(fill);
                    row.appendChild(lab); row.appendChild(track);
                    bars.appendChild(row);
                });
                if (bars.childElementCount>0) cardBars.appendChild(bars); else { const p=document.createElement('p'); p.style.margin='0'; p.textContent='暂无数据'; cardBars.appendChild(p); }
            }
        }
    } catch(_){}
    grid.appendChild(cardBars);

    // 卡3：薄弱场景
    const cardTopic = document.createElement('div'); cardTopic.className='card-elevated'; cardTopic.style.padding='12px';
    const c3h = document.createElement('h4'); c3h.style.margin='0 0 6px 0'; c3h.textContent='薄弱场景'; cardTopic.appendChild(c3h);
    if (sortedTopic.length>0) {
        const box=document.createElement('div'); box.style.display='flex'; box.style.flexWrap='wrap'; box.style.gap='8px';
        sortedTopic.slice(0,2).forEach(([t])=>{ const ch=document.createElement('span'); ch.className='chip'; ch.textContent=t; box.appendChild(ch); });
        cardTopic.appendChild(box);
    } else { const p=document.createElement('p'); p.style.margin='0'; p.textContent='暂无明显场景薄弱'; cardTopic.appendChild(p); }
    grid.appendChild(cardTopic);

    // 卡4：要点清单
    const cardTips = document.createElement('div'); cardTips.className='card-elevated'; cardTips.style.padding='12px';
    const c4h = document.createElement('h4'); c4h.style.margin='0 0 6px 0'; c4h.textContent='要点清单'; cardTips.appendChild(c4h);
    if (synonymPairs.length>0 || numberNotes.length>0) {
        const ul = document.createElement('ul'); ul.style.margin='0 0 0 1.2rem';
        synonymPairs.slice(0,5).forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
        numberNotes.slice(0,5).forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
        cardTips.appendChild(ul);
    } else { const p=document.createElement('p'); p.style.margin='0'; p.textContent='暂无要点'; cardTips.appendChild(p); }
    grid.appendChild(cardTips);

    wrap.appendChild(grid);

    // 底部行动区：微练习 + 推荐
    const actions = document.createElement('div'); actions.className='grid-2'; actions.style.marginTop='10px';

    const cardMicro = document.createElement('div'); cardMicro.className='card-elevated'; cardMicro.style.padding='12px';
    const mH=document.createElement('h4'); mH.style.margin='0 0 6px 0'; mH.textContent='微练习'; cardMicro.appendChild(mH);
    const a = document.createElement('a');
    a.className = 'btn action-btn download-btn';
    a.href = `listening-micro.html?skills=${encodeURIComponent(weakSkills.join(','))}`;
    a.innerHTML = '<i class="fas fa-bolt"></i> 跳转到跨试卷微练习（已为你预选弱项）';
    cardMicro.appendChild(a);
    actions.appendChild(cardMicro);

    const recBox = document.createElement('div'); recBox.className='card-elevated'; recBox.style.padding='12px';
    const rH = document.createElement('h4'); rH.style.margin='0 0 6px 0'; rH.textContent='跨试卷推荐（含你的弱项技能）'; recBox.appendChild(rH);
    const rList = document.createElement('ul'); rList.style.margin='0 0 0 1.2rem'; recBox.appendChild(rList);
    try { buildCrossExamRecommendations(weakSkills, rList); } catch(_){ }
    actions.appendChild(recBox);

    wrap.appendChild(actions);

    return wrap;
}

function renderMicroPractice(section, detail, weakSkills, host) {
    // 策略：优先从当前 section 中选取错题的相同技能标签；若不足，从全部题中补齐
    const all = Array.isArray(section.questions) ? section.questions : [];
    const wrongIds = new Set(detail.filter(d=>!d.ok).map(d=>d.id));
    const pick = [];
    const hasSkill = (q, skills)=>{
        const ks = Array.isArray(q?.tags?.skill) ? q.tags.skill : [];
        return skills.some(s=>ks.includes(s));
    };
    // 先选错题同技能
    all.forEach(q=>{ if (wrongIds.has(q.id) && weakSkills.length && hasSkill(q, weakSkills)) pick.push(q); });
    // 再选其他同技能
    all.forEach(q=>{ if (!pick.includes(q) && weakSkills.length && hasSkill(q, weakSkills)) pick.push(q); });
    // 补足到最多5题
    all.forEach(q=>{ if (pick.length<5 && !pick.includes(q)) pick.push(q); });

    const box = document.createElement('div');
    box.className = 'listening-result';
    const h = document.createElement('h4'); h.style.margin='0 0 6px 0'; h.textContent = '微练习（最多5题）'; box.appendChild(h);
    const list = document.createElement('div'); list.className='listening-list'; list.style.display='grid'; list.style.gap='8px';
    box.appendChild(list);

    const makeCard = (q)=>{
        const card = document.createElement('div'); card.className='question';
        const p = document.createElement('p'); p.innerHTML = `<strong>${q.id}.</strong> ${q.stem||''}`; card.appendChild(p);
        const opts = document.createElement('div'); opts.className='options';
        const letters=['A','B','C','D'];
        (q.options||[]).forEach((txt,idx)=>{
            const lab=document.createElement('label'); lab.className='option'; lab.style.display='block';
            const input=document.createElement('input'); input.type='radio'; input.name=`mp_${q.id}`; input.value=letters[idx]; input.style.marginRight='8px';
            input.addEventListener('change',()=>{
                const isOk = String(input.value).toUpperCase() === String(q.answer||'').toUpperCase();
                markOptionState(opts, letters, q.answer, input.value);
                ensureExplain(card, q, isOk);
            });
            lab.appendChild(input);
            const span=document.createElement('span'); span.textContent=`${letters[idx]}) ${txt}`; lab.appendChild(span);
            opts.appendChild(lab);
        });
        card.appendChild(opts);
        return card;
    };
    pick.slice(0,5).forEach(q=> list.appendChild(makeCard(q)));
    host.appendChild(box);
}

async function buildCrossExamRecommendations(weakSkills, listEl) {
    if (!weakSkills || weakSkills.length===0) { listEl.innerHTML = '<li>暂无弱项推荐</li>'; return; }
    try {
        const [lResp, pResp] = await Promise.all([
            fetch('./listening.json', { cache: 'no-store' }),
            fetch('./papers.json', { cache: 'no-store' })
        ]);
        if (!lResp.ok) { listEl.innerHTML = '<li>无法读取题库</li>'; return; }
        const listening = await lResp.json();
        const papers = pResp.ok ? await pResp.json() : {};
        const curId = (new URLSearchParams(location.search)).get('id') || '';
        const recs = [];
        Object.entries(listening).forEach(([examId, payload])=>{
            if (examId === curId) return;
            const secs = Array.isArray(payload?.sections) ? payload.sections : [];
            let match = 0;
            secs.forEach(sec=>{
                (sec.questions||[]).forEach(q=>{
                    const ks = Array.isArray(q?.tags?.skill) ? q.tags.skill : [];
                    if (weakSkills.some(s=>ks.includes(s))) match++;
                });
            });
            if (match>0) recs.push({ examId, match });
        });
        recs.sort((a,b)=> b.match - a.match);
        const findTitle = (id)=>{
            const from = (papers?.cet4||[]).concat(papers?.cet6||[]);
            const hit = from.find(x=>x.id===id);
            return hit?.title || id;
        };
        listEl.innerHTML='';
        recs.slice(0,5).forEach(r=>{
            const li=document.createElement('li');
            const a=document.createElement('a'); a.href = `exam-detail.html?id=${encodeURIComponent(r.examId)}`; a.textContent = findTitle(r.examId);
            const span=document.createElement('span'); span.textContent = ` ｜ 相关题目数：${r.match}`; span.style.color='#555'; span.style.marginLeft='6px';
            li.appendChild(a); li.appendChild(span); listEl.appendChild(li);
        });
        if (recs.length===0) listEl.innerHTML = '<li>暂无匹配推荐，请先多做几套以完善画像</li>';
    } catch(e) {
        listEl.innerHTML = '<li>推荐加载失败</li>';
    }
}

// 历史成绩渲染/清理
function initListeningHistory(examId) {
    const section = document.getElementById('listening-history-section');
    const list = document.getElementById('listening-history-list');
    const clearBtn = document.getElementById('clear-history-btn');
    if (!section || !list || !clearBtn) return;
    const key = 'listening:history';
    function render() {
        list.innerHTML = '';
        let arr = [];
        try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch(_){}
        const id = examId || (new URLSearchParams(location.search)).get('id') || '';
        const filtered = arr.filter(x => x.id === id);
        if (filtered.length === 0) {
            section.style.display = 'none';
            return;
        }
        section.style.display = 'block';
        const ul = document.createElement('ul');
        ul.style.margin = '0 0 0 1.2rem';
        filtered.forEach(rec => {
            const li = document.createElement('li');
            const dt = new Date(rec.ts);
            const when = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
            li.textContent = `${when} ｜ 得分 ${rec.correct}/${rec.total}`;
            ul.appendChild(li);
        });
        list.appendChild(ul);
    }
    render();
    clearBtn.addEventListener('click', () => {
        try {
            const id = examId || (new URLSearchParams(location.search)).get('id') || '';
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            const left = arr.filter(x => x.id !== id);
            localStorage.setItem(key, JSON.stringify(left));
        } catch(_){}
        render();
    });
}

// 测试PDF链接是否可访问
async function testPdfUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        return true; // no-cors模式下无法读取状态，假设可访问
    } catch (error) {
        // 尝试使用GET方法测试
        try {
            const response = await fetch(url, { method: 'GET', mode: 'no-cors' });
            return true;
        } catch (e) {
            return false;
        }
    }
}

// PDF预览功能 - 使用embed和iframe组合，支持回退机制
async function previewExam(examId) {
    const panel = document.getElementById('pdf-preview-panel');
    if (!panel) {
        alert('预览功能不可用');
        return;
    }
    
    panel.style.display = 'block';
    const previewContent = document.getElementById('pdf-preview-content');
    if (!previewContent) {
        alert('预览容器不存在');
        return;
    }
    
    // 显示加载状态
    previewContent.innerHTML = '<div style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#007AFF;"></i><p style="margin-top:20px;">正在加载PDF...</p></div>';
    
    try {
        // 获取PDF URL（可能包含主链接和备用链接）
        const pdfResult = await resolvePdfUrlUnified(examId);
        
        if (!pdfResult || !pdfResult.url) {
            previewContent.innerHTML = '<div style="text-align:center; padding:40px; color:#999;"><i class="fas fa-exclamation-circle" style="font-size:2rem; margin-bottom:20px;"></i><p>未找到PDF文件</p><p style="font-size:0.9rem; margin-top:10px; color:#666;">请检查该试卷是否有对应的PDF资源</p></div>';
            return;
        }
        
        let pdfUrl = pdfResult.url;
        const fallbackUrl = pdfResult.fallback;
        
        // 确保使用HTTPS（如果是HTTP链接）
        if (pdfUrl.startsWith('http://')) {
            pdfUrl = pdfUrl.replace(/^http:\/\//, 'https://');
        }
        
        // 尝试加载PDF，如果失败则使用备用链接
        let finalUrl = pdfUrl;
        let loadAttempted = false;
        
        // 创建PDF预览容器
        const container = document.createElement('div');
        container.style.cssText = 'width:100%; position:relative;';
        
        // 添加操作按钮（先创建，以便在错误处理中更新）
        const linkContainer = document.createElement('div');
        linkContainer.style.cssText = 'margin-top:15px; text-align:center; padding:10px; background:#f8f9fa; border-radius:6px;';
        
        const openLink = document.createElement('a');
        openLink.href = finalUrl;
        openLink.target = '_blank';
        openLink.style.cssText = 'display:inline-block; padding:8px 16px; margin:0 5px; background:#007AFF; color:white; text-decoration:none; border-radius:6px; font-size:0.9rem;';
        openLink.innerHTML = '<i class="fas fa-external-link-alt"></i> 在新窗口打开';
        linkContainer.appendChild(openLink);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = finalUrl;
        downloadLink.download = `${examId}.pdf`;
        downloadLink.style.cssText = 'display:inline-block; padding:8px 16px; margin:0 5px; background:#10b981; color:white; text-decoration:none; border-radius:6px; font-size:0.9rem;';
        downloadLink.innerHTML = '<i class="fas fa-download"></i> 下载PDF';
        linkContainer.appendChild(downloadLink);
        
        // 如果有备用链接，添加备用下载按钮
        if (fallbackUrl && fallbackUrl !== finalUrl) {
            const fallbackDownloadLink = document.createElement('a');
            fallbackDownloadLink.href = fallbackUrl;
            fallbackDownloadLink.download = `${examId}.pdf`;
            fallbackDownloadLink.style.cssText = 'display:inline-block; padding:8px 16px; margin:0 5px; background:#f59e0b; color:white; text-decoration:none; border-radius:6px; font-size:0.9rem;';
            fallbackDownloadLink.innerHTML = '<i class="fas fa-download"></i> 备用下载';
            linkContainer.appendChild(fallbackDownloadLink);
        }
        
        // 使用iframe直接显示PDF（最可靠的方法）
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%; height:800px; border:none; border-radius:8px;';
        iframe.title = 'PDF预览';
        iframe.allow = 'fullscreen';
        iframe.src = finalUrl;
        
        // 加载超时处理
        let loadTimeout = setTimeout(() => {
            if (!loadAttempted && fallbackUrl) {
                loadAttempted = true;
                console.log('主PDF链接加载超时，尝试备用链接:', fallbackUrl);
                finalUrl = fallbackUrl;
                iframe.src = fallbackUrl;
                openLink.href = fallbackUrl;
                downloadLink.href = fallbackUrl;
            }
        }, 5000);
        
        // iframe加载成功
        iframe.onload = () => {
            clearTimeout(loadTimeout);
            console.log('PDF加载成功:', finalUrl);
        };
        
        // iframe加载失败
        iframe.onerror = () => {
            clearTimeout(loadTimeout);
            if (!loadAttempted && fallbackUrl) {
                loadAttempted = true;
                console.log('主PDF链接加载失败，尝试备用链接:', fallbackUrl);
                finalUrl = fallbackUrl;
                iframe.src = fallbackUrl;
                openLink.href = fallbackUrl;
                downloadLink.href = fallbackUrl;
            } else {
                // 所有链接都失败，显示错误
                showPdfError(previewContent, pdfUrl, fallbackUrl);
            }
        };
        
        // 检查iframe内容是否成功加载（延迟检查）
        setTimeout(() => {
            try {
                // 尝试访问iframe内容来判断是否加载成功
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!iframeDoc || iframeDoc.body?.textContent?.includes('404') || iframeDoc.body?.textContent?.includes('Not Found')) {
                    if (!loadAttempted && fallbackUrl) {
                        loadAttempted = true;
                        console.log('检测到404错误，尝试备用链接:', fallbackUrl);
                        finalUrl = fallbackUrl;
                        iframe.src = fallbackUrl;
                        openLink.href = fallbackUrl;
                        downloadLink.href = fallbackUrl;
                    }
                }
            } catch (e) {
                // 跨域情况下无法检查，假设已加载
            }
        }, 2000);
        
        container.appendChild(iframe);
        container.appendChild(linkContainer);
        
        previewContent.innerHTML = '';
        previewContent.appendChild(container);
        
        // 滚动到预览面板
        setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        
    } catch (error) {
        console.error('预览PDF失败:', error);
        previewContent.innerHTML = '<div style="text-align:center; padding:40px; color:#f00;"><i class="fas fa-times-circle" style="font-size:2rem; margin-bottom:20px;"></i><p>加载失败</p><p style="font-size:0.9rem; margin-top:10px; color:#666;">请刷新页面重试</p></div>';
    }
}

// 显示PDF错误信息
function showPdfError(container, mainUrl, fallbackUrl) {
    container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#999;">
            <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#f59e0b; margin-bottom:20px;"></i>
            <h3 style="color:#333; margin-bottom:10px;">PDF加载失败</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:20px;">无法从当前链接加载PDF文件</p>
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                <a href="${mainUrl}" target="_blank" style="display:inline-block; padding:10px 20px; background:#007AFF; color:white; text-decoration:none; border-radius:6px;">
                    <i class="fas fa-external-link-alt"></i> 尝试直接打开
                </a>
                ${fallbackUrl ? `
                <a href="${fallbackUrl}" download="${fallbackUrl.split('/').pop()}" style="display:inline-block; padding:10px 20px; background:#10b981; color:white; text-decoration:none; border-radius:6px;">
                    <i class="fas fa-download"></i> 下载PDF
                </a>
                ` : ''}
            </div>
        </div>
    `;
}

function printExamPdf(pdfUrl) {
    return new Promise((resolve, reject) => {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            let finished = false;
            const cleanup = () => { try { if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe); } catch(_) {} };
            const onLoad = () => {
                if (finished) return; finished = true;
                try {
                    setTimeout(() => {
                        try { iframe.contentWindow && iframe.contentWindow.focus(); } catch(_) {}
                        try { iframe.contentWindow && iframe.contentWindow.print(); } catch(_) {}
                        cleanup(); resolve();
                    }, 120);
                } catch (e) { cleanup(); reject(e); }
            };
            iframe.onload = onLoad;
            iframe.onerror = () => { if (finished) return; finished = true; cleanup(); reject(new Error('load error')); };
            document.body.appendChild(iframe);
            try { iframe.src = pdfUrl; } catch(e) { cleanup(); reject(e); return; }
            setTimeout(() => { if (finished) return; finished = true; cleanup(); reject(new Error('timeout')); }, 8000);
        } catch (e) { reject(e); }
    });
}

// 移除页面中绿色“真题说明”信息框
function removeExamInfoBoxes() {
    const root = document.getElementById('exam-content');
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll('*'));
    nodes.forEach(el => {
        const txt = (el.textContent || '').trim();
        if (!txt) return;
        if (/(^|\s)真题说明(\s|$)/.test(txt)) {
            // 向上寻找容器（最多 5 层），要求是 DIV/SECTION
            let box = el;
            let depth = 0;
            while (box && depth++ < 5) {
                if (box.tagName === 'DIV' || box.tagName === 'SECTION') {
                    const full = (box.textContent || '').trim();
                    // 确认该容器包含典型说明语句，避免误删
                    if (/本真题的完整内容|正在整理|即将上线|参考答案/i.test(full)) {
                        box.remove();
                        break;
                    }
                }
                box = box.parentElement;
            }
        }
    });
}

// 移除 Part I/II/III/IV 等整段展示块（删除对应 H2 及至下一个 H2 的内容）
function removePartSections() {
    const root = document.getElementById('exam-content');
    if (!root) return;
    const isPartText = (t)=>/\bPart\s+[IVXLC]+\b/i.test(String(t||'').replace(/\s+/g,' ').trim());
    const h2s = Array.from(root.querySelectorAll('h2'));
    h2s.forEach(h2 => {
        if (!isPartText(h2.textContent)) return;
        let node = h2;
        let guard = 0;
        while (node && guard++ < 500) {
            const next = node.nextElementSibling;
            node.remove();
            if (!next || next.tagName === 'H2') break;
            node = next;
        }
    });
    // 再次兜底：移除残留的 H3/H4 级别 Part 标题
    Array.from(root.querySelectorAll('h3, h4')).forEach(h => { if (isPartText(h.textContent)) h.remove(); });
}

// 删除 Part 介绍卡片（如 Directions、说明等）
function stripPartIntroCards() {
    const root = document.getElementById('exam-content');
    if (!root) return;
    
    // 查找包含 Part I/II/III/IV + Directions/说明 的元素
    const nodes = Array.from(root.querySelectorAll('*'));
    const partPattern = /\bPart\s+[IVXLC]+\b/i;
    const introPattern = /directions|说明|注意事项|instructions/i;
    
    nodes.forEach(el => {
        const txt = (el.textContent || '').trim();
        if (!txt) return;
        
        // 检查是否包含 Part 标识 + 介绍性内容
        if (partPattern.test(txt) && introPattern.test(txt)) {
            // 向上寻找容器（最多 5 层），要求是 DIV/SECTION/P
            let box = el;
            let depth = 0;
            while (box && depth++ < 5) {
                if (['DIV', 'SECTION', 'P', 'ARTICLE'].includes(box.tagName)) {
                    const full = (box.textContent || '').trim();
                    // 确认该容器是介绍性内容，避免误删题目
                    if (introPattern.test(full) && full.length < 500) {
                        box.remove();
                        break;
                    }
                }
                box = box.parentElement;
            }
        }
    });
}

// 在每个题型（H2）下方追加“本卷内容”小结，展示该题型下的 H3 小节
function annotateSectionSummaries() {
    const root = document.getElementById('exam-content');
    if (!root) return;

    const sections = Array.from(root.querySelectorAll('h2'));
    sections.forEach(h2 => {
        // 收集从当前 h2 到下一个 h2 之间的 h3 标题
        const items = [];
        let ptr = h2.nextElementSibling;
        while (ptr && ptr.tagName !== 'H2') {
            if (ptr.tagName === 'H3') {
                const t = (ptr.textContent || '').trim();
                if (t) items.push(t);
            }
            ptr = ptr.nextElementSibling;
        }

        // 没有小节则跳过
        if (items.length === 0) return;

        const box = document.createElement('div');
        box.className = 'section-summary-box';
        box.style.margin = '10px 0 14px 0';
        box.style.padding = '12px 12px 8px 12px';
        box.style.border = '1px solid #e6e6e6';
        box.style.borderRadius = '8px';
        box.style.background = '#f9fafb';

        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.marginBottom = '6px';
        title.textContent = '本卷内容';
        box.appendChild(title);

        const ul = document.createElement('ul');
        ul.style.margin = '0 0 0 1.2rem';
        items.slice(0, 12).forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            ul.appendChild(li);
        });
        box.appendChild(ul);

        // 将 box 插入到 h2 后面
        if (h2.parentNode) {
            h2.parentNode.insertBefore(box, h2.nextSibling);
        }
    });
}

// 从 papers.json 中解析出 CET6 PDF 链接（支持 cet6-YYYY-MM-setN）
async function resolveCet6PdfFromPapers() {
    const title = (document.getElementById('exam-title')?.textContent || '').trim();
    const urlParams = new URLSearchParams(window.location.search);
    const examId = (urlParams.get('id') || '').trim();

    let year = null, month = null, setNo = null;
    // 1) 优先从 examId 解析：cet6-2024-12-set2 或 cet6-2024-6-set2
    const idMatch = examId.match(/cet6-(20\d{2})-(\d{1,2})-set(\d+)/i);
    if (idMatch) {
        year = parseInt(idMatch[1], 10);
        month = idMatch[2].toString().padStart(2,'0');
        setNo = parseInt(idMatch[3], 10);
        // 直接返回编码后的标准文件名，避免 HEAD 探测被拦截
        const direct = `assets/cet6-pdf/CET-6 ${year}.${month} 第${setNo}套.pdf`;
        // 兼容少数未补零命名（极端兜底）
        const directAlt = `assets/cet6-pdf/CET-6 ${year}.${parseInt(month,10)} 第${setNo}套.pdf`;
        // 先返回标准命名，若失败由浏览器报错；papers 回退会继续尝试
        return encodeURI(direct);
    }
    // 2) 其次从标题解析：2024年12月、CET-6 2024.12、第2套
    if (!year) {
        const m1 = title.match(/(20\d{2})年(0?[1-9]|1[0-2])月/);
        if (m1) { year = parseInt(m1[1],10); month = m1[2].toString().padStart(2,'0'); }
        const m2 = title.match(/(20\d{2})\.(0?[1-9]|1[0-2])/);
        if (!year && m2) { year = parseInt(m2[1],10); month = m2[2].toString().padStart(2,'0'); }
        const s1 = title.match(/第(\d+)套/);
        if (s1) setNo = parseInt(s1[1],10);
    }

    if (!year) return null;

    const resp = await fetch('./papers.json');
    const data = await resp.json();
    const list = Array.isArray(data?.cet6) ? data.cet6 : [];
    const pdfs = list.filter(it => typeof it.url === 'string' && /\.pdf$/i.test(it.url));

    // 从条目推导元信息
    const deriveMeta = (it) => {
        let Y = it.year ? parseInt(it.year,10) : null;
        let M = it.month ? String(it.month).padStart(2,'0') : null;
        let S = null;
        const base = (it.url || '').split('/').pop();
        const byUrl = base && base.match(/(20\d{2})\.(0?[1-9]|1[0-2]).*?第(\d+)套/i);
        if (byUrl) {
            Y = Y ?? parseInt(byUrl[1],10);
            M = M ?? byUrl[2].toString().padStart(2,'0');
            S = parseInt(byUrl[3],10);
        }
        const t = String(it.title||'');
        if (!Y) {
            const yM = t.match(/(20\d{2})/);
            if (yM) Y = parseInt(yM[1],10);
        }
        if (!M) {
            const mM = t.match(/(0?[1-9]|1[0-2])月|\.(0?[1-9]|1[0-2])/);
            if (mM) {
                const mm = mM[1] || mM[2];
                if (mm) M = String(mm).padStart(2,'0');
            }
        }
        if (!S) {
            const sM = t.match(/第(\d+)套/);
            if (sM) S = parseInt(sM[1],10);
        }
        return {Y,M,S};
    };

    // 优先：年+月+套
    let found = pdfs.find(it => {
        const {Y,M,S} = deriveMeta(it);
        return (Y === year) && (month ? M === month : true) && (setNo ? S === setNo : true);
    });
    if (found) return found.url;

    // 次选：年+月
    if (month) {
        found = pdfs.find(it => {
            const {Y,M} = deriveMeta(it);
            return (Y === year) && (M === month);
        });
        if (found) return found.url;
    }

    // 兜底：年
    found = pdfs.find(it => {
        const {Y} = deriveMeta(it);
        return Y === year;
    });
    return found ? found.url : null;
}

// 真题加载器
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在真题详情页（支持带.html和不带.html的URL）
    const pathname = window.location.pathname.toLowerCase();
    if (!pathname.includes('exam-detail')) {
        return;
    }

    console.log("✓ 真题详情页初始化...", pathname);

    // 从 URL 获取真题 ID
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');

    if (!examId) {
        console.error('未指定真题ID');
        return;
    }

    console.log("加载真题:", examId);

    // 若 URL 自带 pdf 参数则在加载后自动预览
    const urlPdfParam = (new URLSearchParams(window.location.search)).get('pdf');

    // 加载真题内容
    loadExamContent(examId);

    // 设置下载和打印按钮（延迟执行确保DOM完全渲染）
    // 使用 setTimeout 确保按钮已经渲染到DOM中
    setTimeout(() => {
        setupActions(examId);
    }, 100);
    
    // 保障措施：在窗口完全加载后再次检查（防止某些情况下按钮未及时渲染）
    window.addEventListener('load', () => {
        const previewBtn = document.getElementById('preview-pdf-btn');
        if (previewBtn && !previewBtn.hasAttribute('data-listener-bound')) {
            console.log('🔧 窗口加载完成，重新检查预览按钮');
            setupActions(examId);
        }
    });

    try { initListeningEntry(examId); } catch (e) { console.warn('listening init failed', e); }
    try { initListeningHistory(examId); } catch (e) { console.warn('history init failed', e); }

    // 保障：若“下载原版PDF”链接尚未就绪，则用 examId 回退规则填充
    setTimeout(() => {
        try {
            const a = document.querySelector('.exam-header .exam-actions [data-role="pdf-download"]');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (href === '#' || href.trim().length === 0) {
                const m = (examId||'').match(/^cet4-(20\d{2})-(\d{2})-set(\d)$/i);
                if (m) {
                    a.setAttribute('href', `./assets/papers/cet4/${m[1]}-${m[2]}-S${m[3]}.pdf`);
                    a.setAttribute('target','_blank');
                    a.setAttribute('rel','noopener');
                }
            }
        } catch(_) {}
    }, 100);
});

// 全局缓存（避免重复加载大文件）
let examContentsDataCache = null;

// 加载真题内容（优化版：带缓存、日志和错误处理）
async function loadExamContent(examId) {
    console.log('📖 开始加载真题:', examId);
    
    try {
        // 1. 检查缓存
        if (!examContentsDataCache) {
            console.log('⏳ 首次加载 exam-contents.json...');
            const response = await fetch('./exam-contents.json', { 
                cache: 'force-cache' // 使用浏览器缓存
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 无法加载真题数据`);
            }
            
            examContentsDataCache = await response.json();
            console.log('✓ exam-contents.json 已缓存，包含', Object.keys(examContentsDataCache).length, '套试卷');
        } else {
            console.log('✓ 使用已缓存的 exam-contents.json');
        }

        // 2. 从缓存中获取指定试卷
        const examContent = examContentsDataCache[examId];

        if (!examContent) {
            console.error('❌ 试卷不存在:', examId);
            console.log('可用的试卷ID:', Object.keys(examContentsDataCache).slice(0, 10));
            throw new Error(`真题内容不存在 (ID: ${examId})`);
        }

        console.log('✓ 找到试卷:', examContent.title);
        console.log('📄 HTML内容长度:', (examContent.html || '').length, '字符');

        // 3. 显示真题信息
        displayExamContent(examContent);
        console.log('✓ 真题渲染完成');

    } catch (error) {
        console.error('❌ 加载真题失败:', error);
        showError('加载真题失败：' + error.message);
    }
}

// 显示真题内容
function displayExamContent(content) {
    // 更新页面标题
    document.getElementById('page-title').textContent = content.title + ' - 四六级学习站';
    document.getElementById('exam-title').textContent = content.title;
    
    // 更新真题信息
    document.getElementById('exam-date').textContent = content.date;
    document.getElementById('exam-type').textContent = content.type;

    // 设置下载PDF按钮的链接
    try {
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) {
            // 先用 examId 立即给一个 CET-4 回退直链，避免异步导致 href 为空
            try {
                const eid = (new URLSearchParams(location.search)).get('id') || '';
                const m = eid.match(/^cet4-(20\d{2})-(\d{2})-set(\d)$/i);
                if (m) {
                    downloadBtn.href = `./assets/papers/cet4/${m[1]}-${m[2]}-S${m[3]}.pdf`;
                    downloadBtn.rel = 'noopener';
                }
            } catch(_) {}
            // 预先解析并设置直达链接
            (async () => {
                try {
                    const examId = (new URLSearchParams(location.search)).get('id') || '';
                    const pdfResult = await resolvePdfUrlUnified(examId);
                    if (pdfResult && pdfResult.url) {
                        let pdfHref = pdfResult.url;
                        // 确保HTTPS
                        if (pdfHref.startsWith('http://')) {
                            pdfHref = pdfHref.replace(/^http:\/\//, 'https://');
                        }
                        downloadBtn.href = pdfHref;
                        downloadBtn.rel = 'noopener';
                        downloadBtn.title = '下载原版PDF';
                        // 存储备用链接
                        if (pdfResult.fallback) {
                            downloadBtn.setAttribute('data-fallback', pdfResult.fallback);
                        }
                    } else {
                        downloadBtn.title = '未找到对应PDF文件';
                    }
                } catch(_) {}
            })();
            // 下载按钮点击处理
            downloadBtn.addEventListener('click', async (e) => {
                // 如果href已设置且有效，直接使用
                if (downloadBtn.href && downloadBtn.href !== '#' && !downloadBtn.href.endsWith('#')) {
                    // 确保HTTPS
                    if (downloadBtn.href.startsWith('http://')) {
                        e.preventDefault();
                        const secureUrl = downloadBtn.href.replace(/^http:\/\//, 'https://');
                        // 尝试在新窗口打开，如果失败则尝试备用链接
                        const newWindow = window.open(secureUrl, '_blank');
                        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                            // 如果主链接失败，尝试备用链接
                            const fallback = downloadBtn.getAttribute('data-fallback');
                            if (fallback) {
                                window.open(fallback, '_blank');
                            }
                        }
                    }
                    return;
                }
                
                // 否则尝试解析PDF URL
                e.preventDefault();
                try {
                    const examId = (new URLSearchParams(location.search)).get('id') || '';
                    const pdfResult = await resolvePdfUrlUnified(examId);
                    if (pdfResult && pdfResult.url) {
                        let pdfHref = pdfResult.url;
                        // 确保HTTPS
                        if (pdfHref.startsWith('http://')) {
                            pdfHref = pdfHref.replace(/^http:\/\//, 'https://');
                        }
                        
                        // 尝试下载
                        const link = document.createElement('a');
                        link.href = pdfHref;
                        link.download = `${examId}.pdf`;
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // 如果主链接失败，尝试备用链接
                        setTimeout(() => {
                            if (pdfResult.fallback) {
                                const fallbackLink = document.createElement('a');
                                fallbackLink.href = pdfResult.fallback;
                                fallbackLink.download = `${examId}.pdf`;
                                fallbackLink.target = '_blank';
                                document.body.appendChild(fallbackLink);
                                fallbackLink.click();
                                document.body.removeChild(fallbackLink);
                            }
                        }, 1000);
                    } else {
                        alert('未找到对应PDF文件');
                    }
                } catch(error) {
                    console.error('下载PDF失败:', error);
                    alert('下载PDF失败，请稍后重试');
                }
            });
        }
    } catch (_) { }

    // 渲染实际题目内容 HTML
    const examContentDiv = document.getElementById('exam-content');
    if (!examContentDiv) {
        console.error('❌ 找不到 exam-content 元素');
        return;
    }
    
    const htmlContent = content.html || '';
    if (!htmlContent || htmlContent.length === 0) {
        console.error('❌ 试卷HTML内容为空');
        examContentDiv.innerHTML = '<div style="text-align: center; padding: 3rem; color: #999;"><i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i><h3>试卷内容为空</h3><p>请联系管理员检查数据</p></div>';
        return;
    }
    
    console.log('📝 渲染HTML内容...');
    examContentDiv.innerHTML = htmlContent;
    console.log('✓ HTML已渲染到页面');

    // 清理冗余说明，并追加小结与备考建议
    try { removeExamInfoBoxes(); } catch (e) { console.warn('removeExamInfoBoxes 失败', e); }
    try { stripPartIntroCards(); } catch (e) { console.warn('stripPartIntroCards 失败', e); }
    try { removeFourPartsStrict(); } catch (e) { console.warn('removeFourPartsStrict 失败', e); }

    console.log("真题内容加载完成并完成清理/小结追加");

    appendStudyAdvice(content);
    
    // 检查并添加听力测试板块
    const examId = (new URLSearchParams(location.search)).get('id') || '';
    if (examId) {
        initListeningTestSection(examId);
    }
}

// 在页面底部追加“本套题目概览 + 备考建议” - 优化版
function appendStudyAdvice(contentMeta) {
    const root = document.getElementById('exam-content');
    if (!root) return;

    // 提取本套卷子的“题目/小节”标题（h2/h3）
    const headings = Array.from(root.querySelectorAll('h2, h3'))
        .map(h => (h.textContent || '').trim())
        .filter(t => t && t.length > 0)
        .slice(0, 20); // 最多取前 20 条

    const isCET6 = /六级|CET-6/i.test(contentMeta?.type || '') || /六级|CET-6/i.test(contentMeta?.title || '');

    // 构建主容器
    const wrap = document.createElement('section');
    wrap.className = 'study-advice-section';
    wrap.style.cssText = 'margin-top: 3rem; display: grid; gap: 1.5rem;';

    // === 备考策略卡片 ===
    const adviceCard = document.createElement('div');
    adviceCard.className = 'advice-card';
    adviceCard.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 1.75rem 2rem;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        border: 1px solid #e8e8e8;
    `;
    
    const adviceHeader = document.createElement('div');
    adviceHeader.style.cssText = 'display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;';
    adviceHeader.innerHTML = `
        <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas fa-lightbulb" style="color: white; font-size: 1.25rem;"></i>
        </div>
        <div>
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1a1a1a;">备考策略</h3>
            <p style="margin: 0.25rem 0 0; font-size: 0.875rem; color: #888;">Study Tips</p>
        </div>
    `;
    adviceCard.appendChild(adviceHeader);

    const adviceData = [
        {
            icon: 'fas fa-clock',
            color: '#4facfe',
            title: '时间管理',
            content: '严格计时完成整套题，模拟真实考试节奏'
        },
        {
            icon: 'fas fa-bookmark',
            color: '#43e97b',
            title: '错题管理',
            content: '建立标签（题型/考点/原因），一周后二次回顾'
        },
        {
            icon: 'fas fa-book',
            color: '#fa709a',
            title: '词汇积累',
            content: '强化高频主题词汇与固定搭配，避免扣分短板'
        },
        {
            icon: 'fas fa-pen',
            color: '#667eea',
            title: '写作技巧',
            content: isCET6 
                ? '关注学术与社会议题，积累引言模板，注意段落逻辑与衔接'
                : '熟悉常见话题，准备三段式模板，练习句式多样化'
        },
        {
            icon: 'fas fa-headphones',
            color: '#f5576c',
            title: '听力训练',
            content: isCET6
                ? '精听长句与学术新闻，训练同义替换识别，先预测场景'
                : '日常对话与短新闻为主，先抓关键词，注意数字、人名信号'
        },
        {
            icon: 'fas fa-book-open',
            color: '#feca57',
            title: '阅读理解',
            content: isCET6
                ? '训练段落主旨概括与逻辑结构识别，遇生词先跳过'
                : '先通读段落抓主旨，再回题目定位关键词'
        },
        {
            icon: 'fas fa-language',
            color: '#48dbfb',
            title: '翻译方法',
            content: isCET6
                ? '重视文化/政策类表达，先意群断句，名词化与从句灵活运用'
                : '关注日常文化与社会现象，先直译再润色，注意时态'
        }
    ];

    const adviceGrid = document.createElement('div');
    adviceGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;';
    
    adviceData.forEach(item => {
        const adviceItem = document.createElement('div');
        adviceItem.style.cssText = `
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: default;
        `;
        adviceItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 36px; height: 36px; background: ${item.color}; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <i class="${item.icon}" style="color: white; font-size: 1rem;"></i>
                </div>
                <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #333;">${item.title}</h4>
            </div>
            <p style="margin: 0; font-size: 0.9rem; color: #666; line-height: 1.6;">${item.content}</p>
        `;
        adviceItem.addEventListener('mouseenter', () => {
            adviceItem.style.background = 'white';
            adviceItem.style.transform = 'translateY(-4px)';
            adviceItem.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
        });
        adviceItem.addEventListener('mouseleave', () => {
            adviceItem.style.background = '#f8f9fa';
            adviceItem.style.transform = 'translateY(0)';
            adviceItem.style.boxShadow = 'none';
        });
        adviceGrid.appendChild(adviceItem);
    });
    adviceCard.appendChild(adviceGrid);
    wrap.appendChild(adviceCard);

    root.appendChild(wrap);
}

// 显示错误信息
function showError(message) {
    const examContentDiv = document.getElementById('exam-content');
    // 清空并以安全方式创建节点，避免将 message 直接注入 innerHTML
    examContentDiv.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    wrapper.style.padding = '4rem 2rem';

    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-triangle';
    icon.style.fontSize = '4rem';
    icon.style.color = '#ff9500';
    icon.style.marginBottom = '1.5rem';

    const h3 = document.createElement('h3');
    h3.style.color = '#666';
    h3.style.marginBottom = '1rem';
    h3.textContent = message || '发生错误';

    const p = document.createElement('p');
    p.style.color = '#999';
    p.textContent = '请返回真题列表重新选择';

    const a = document.createElement('a');
    a.href = 'javascript:history.back()';
    a.className = 'btn';
    a.style.marginTop = '1.5rem';
    a.style.display = 'inline-block';
    a.innerHTML = '<i class="fas fa-arrow-left"></i> 返回';

    wrapper.appendChild(icon);
    wrapper.appendChild(h3);
    wrapper.appendChild(p);
    wrapper.appendChild(a);
    examContentDiv.appendChild(wrapper);
}

// 设置下载和打印功能
function setupActions(examId) {
    console.log('🔧 开始设置操作按钮，examId:', examId);
    
    // 打印功能
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        // 移除可能存在的旧事件监听器
        const newPrintBtn = printBtn.cloneNode(true);
        printBtn.parentNode.replaceChild(newPrintBtn, printBtn);
        newPrintBtn.addEventListener('click', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            let pdfUrl = urlParams.get('pdf');
            if (!(/\.pdf$/i.test(pdfUrl || ''))) {
                try { 
                    const pdfResult = await resolvePdfUrlUnified(examId);
                    pdfUrl = pdfResult ? pdfResult.url : null;
                } catch(_) { pdfUrl = null; }
            }
            if (!pdfUrl) { alert('未找到对应的 PDF 资源，暂无法打印。'); return; }
            // 确保HTTPS
            if (pdfUrl.startsWith('http://')) {
                pdfUrl = pdfUrl.replace(/^http:\/\//, 'https://');
            }
            // 直接在新窗口打开PDF，用户可使用Ctrl+P打印
            const printWindow = window.open(pdfUrl, '_blank');
            if (printWindow) {
                alert('PDF已在新窗口打开，请在新窗口中按 Ctrl+P 进行打印。');
            } else {
                alert('无法打开新窗口，请检查浏览器是否阻止了弹出窗口。');
            }
        });
        console.log('✓ 打印按钮已绑定');
    } else {
        console.warn('⚠️ 未找到打印按钮');
    }

    // 已移除"导出本页PDF/下载到桌面"功能

    // 分享功能
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        // 移除可能存在的旧事件监听器
        const newShareBtn = shareBtn.cloneNode(true);
        shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
        newShareBtn.addEventListener('click', () => {
            shareExam();
        });
        console.log('✓ 分享按钮已绑定');
    } else {
        console.warn('⚠️ 未找到分享按钮');
    }

    // PDF 预览按钮
    const setupPreviewBtn = () => {
        const previewBtn = document.getElementById('preview-pdf-btn');
        const closePreviewBtn = document.getElementById('close-preview-btn');
        
        if (previewBtn) {
            const newPreviewBtn = previewBtn.cloneNode(true);
            previewBtn.parentNode.replaceChild(newPreviewBtn, previewBtn);
            
            newPreviewBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const originalHTML = newPreviewBtn.innerHTML;
                newPreviewBtn.disabled = true;
                newPreviewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>加载中...</span>';
                
                try {
                    await previewExam(examId);
                } catch (error) {
                    console.error('预览PDF失败:', error);
                    alert('预览PDF失败：' + (error.message || '未知错误'));
                } finally {
                    newPreviewBtn.disabled = false;
                    newPreviewBtn.innerHTML = originalHTML;
                }
            });
            
            newPreviewBtn.disabled = false;
            console.log('✓ PDF预览按钮已绑定');
        }
        
        if (closePreviewBtn) {
            const newCloseBtn = closePreviewBtn.cloneNode(true);
            closePreviewBtn.parentNode.replaceChild(newCloseBtn, closePreviewBtn);
            newCloseBtn.addEventListener('click', () => {
                const panel = document.getElementById('pdf-preview-panel');
                if (panel) panel.style.display = 'none';
            });
            console.log('✓ 关闭预览按钮已绑定');
        }
    };
    
    setupPreviewBtn();
}
// 下载为PDF（通过打印对话框）

// 分享功能
function shareExam() {
    const title = document.getElementById('exam-title')?.textContent || '真题 PDF';
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('id') || 'exam';
    const tryShare = async () => {
        let pdfUrl = params.get('pdf');
        if (!(pdfUrl && /\.pdf$/i.test(pdfUrl))) {
            try { 
                const pdfResult = await resolvePdfUrlUnified(examId);
                pdfUrl = pdfResult ? pdfResult.url : null;
            } catch(_) { pdfUrl = null; }
        }
        if (!pdfUrl) {
            const pageUrl = window.location.href;
            if (navigator.share) {
                try { await navigator.share({ title, text: title, url: pageUrl }); return; } catch(_) {}
            }
            showPdfSharePanel(pageUrl, null, title);
            return;
        }
        const fileName = `${examId}.pdf`;
        if (navigator.canShare && navigator.canShare({ files: [new File([new Blob([""])], fileName, {type:'application/pdf'})] })) {
            try {
                const r = await fetch(pdfUrl, { cache: 'no-store' });
                const b = await r.blob();
                const f = new File([b], fileName, { type: 'application/pdf' });
                await navigator.share({ files: [f], title, text: title });
                return;
            } catch(_) {}
        }
        if (navigator.share) {
            try { await navigator.share({ title, text: title, url: pdfUrl }); return; } catch(_) {}
        }
        showPdfSharePanel(pdfUrl, pdfUrl, title);
    };
    tryShare();
}

// 备用分享方式（复制链接）
function fallbackShare(url) {
    // 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            alert('链接已复制到剪贴板！\n\n' + url);
        }).catch(() => {
            promptCopyLink(url);
        });
    } else {
        promptCopyLink(url);
    }
}

// 提示用户手动复制
function promptCopyLink(url) {
    const copyText = prompt('请复制以下链接分享给好友：', url);
}


function showPdfSharePanel(shareUrl, pdfUrl, title) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.35)';
    overlay.style.zIndex = '9999';

    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.left = '50%';
    box.style.top = '50%';
    box.style.transform = 'translate(-50%, -50%)';
    box.style.background = '#fff';
    box.style.borderRadius = '12px';
    box.style.padding = '16px';
    box.style.width = 'min(92vw, 520px)';
    box.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';

    const h = document.createElement('h3');
    h.textContent = '分享试卷';
    h.style.margin = '0 0 12px 0';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginBottom = '10px';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = shareUrl;
    input.readOnly = true;
    input.style.flex = '1';
    input.style.padding = '8px';
    input.style.border = '1px solid #e6e6e6';
    input.style.borderRadius = '8px';
    const btnCopy = document.createElement('button');
    btnCopy.className = 'action-btn';
    btnCopy.textContent = '复制链接';
    btnCopy.onclick = async () => {
        try { await navigator.clipboard.writeText(shareUrl); btnCopy.textContent = '已复制'; setTimeout(()=>btnCopy.textContent='复制链接',1200); } catch(_) { promptCopyLink(shareUrl); }
    };

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr 1fr';
    grid.style.gap = '10px';

    const btnOpen = document.createElement('button');
    btnOpen.className = 'action-btn';
    btnOpen.textContent = '在新标签打开PDF';
    btnOpen.disabled = !pdfUrl;
    btnOpen.onclick = () => { if (pdfUrl) window.open(pdfUrl, '_blank'); };

    const btnDownload = document.createElement('a');
    btnDownload.className = 'action-btn download-btn';
    btnDownload.textContent = '下载PDF';
    if (pdfUrl) { btnDownload.href = pdfUrl; btnDownload.download = (title||'paper') + '.pdf'; btnDownload.target = '_blank'; } else { btnDownload.href = 'javascript:void(0)'; btnDownload.style.opacity = '0.6'; }

    const qrWrap = document.createElement('div');
    qrWrap.style.display = 'flex';
    qrWrap.style.flexDirection = 'column';
    qrWrap.style.alignItems = 'center';
    qrWrap.style.justifyContent = 'center';
    qrWrap.style.gap = '6px';
    const qr = document.createElement('img');
    const qrData = encodeURIComponent(shareUrl);
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;
    qr.alt = 'QR';
    qr.style.width = '220px';
    qr.style.height = '220px';
    const tip = document.createElement('div');
    tip.textContent = '用微信/QQ 扫码分享给好友';
    tip.style.fontSize = '0.9rem';
    tip.style.color = '#666';
    qrWrap.appendChild(qr);
    qrWrap.appendChild(tip);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.gap = '10px';
    actions.style.marginTop = '12px';
    const btnClose = document.createElement('button');
    btnClose.className = 'action-btn';
    btnClose.textContent = '关闭';
    btnClose.onclick = () => { document.body.removeChild(overlay); };

    grid.appendChild(btnOpen);
    grid.appendChild(btnDownload);

    box.appendChild(h);
    box.appendChild(row);
    row.appendChild(input);
    row.appendChild(btnCopy);
    box.appendChild(grid);
    box.appendChild(qrWrap);
    actions.appendChild(btnClose);
    box.appendChild(actions);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// 创建类似B站的章节标记进度条
function createChapterMarks(questions, audioElement) {
    if (!questions || questions.length === 0 || !audioElement) return null;
    
    // 按passage分组题目
    const passages = new Map();
    try {
        questions.forEach(q => {
            const passageId = q.passage || 1;
            if (!passages.has(passageId)) {
                passages.set(passageId, {
                    id: passageId,
                    questions: [],
                    scenario: q.scenario || ''
                });
            }
            passages.get(passageId).questions.push(q);
        });
    } catch (e) {
        console.error('处理题目分组时出错:', e);
        return null;
    }
    
    const totalPassages = passages.size;
    if (totalPassages === 0) return null;
    
    const container = document.createElement('div');
    container.className = 'chapter-marks-container';
    container.style.cssText = `
        position: relative;
        width: 100%;
        height: 40px;
        background: #f5f5f7;
        border-radius: 8px;
        margin-top: 8px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 4px;
    `;
    
    const passageArray = Array.from(passages.values()).sort((a, b) => a.id - b.id);
    
    passageArray.forEach((passage, index) => {
        const mark = document.createElement('div');
        mark.className = 'chapter-mark';
        mark.dataset.passageId = passage.id;
        
        const widthPercent = 100 / totalPassages;
        const colors = ['#667eea', '#764ba2', '#fbbf24', '#34C759', '#FF9500'];
        const color = colors[index % colors.length];
        
        mark.style.cssText = `
            flex: 1;
            height: 24px;
            background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            overflow: hidden;
        `;
        
        // 标记文字
        const label = document.createElement('span');
        label.style.cssText = 'position: relative; z-index: 1; white-space: nowrap;';
        
        try {
            if (passage.scenario) {
                label.textContent = passage.scenario;
            } else if (passage.questions && passage.questions.length > 0) {
                const firstQ = passage.questions[0];
                const lastQ = passage.questions[passage.questions.length - 1];
                if (firstQ && lastQ && firstQ.id === lastQ.id) {
                    label.textContent = `Q${firstQ.id || '?'}`;
                } else if (firstQ && lastQ) {
                    label.textContent = `Q${firstQ.id || '?'}-${lastQ.id || '?'}`;
                } else {
                    label.textContent = `段落${passage.id}`;
                }
            } else {
                label.textContent = `段落${passage.id}`;
            }
        } catch (e) {
            label.textContent = `段落${passage.id}`;
        }
        
        mark.appendChild(label);
        
        // 悬停提示
        const tooltip = document.createElement('div');
        tooltip.className = 'chapter-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-8px);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 10;
        `;
        
        const tooltipContent = [];
        try {
            tooltipContent.push(`<strong>${passage.scenario || `段落 ${passage.id}`}</strong>`);
            if (passage.questions && passage.questions.length > 0) {
                tooltipContent.push(`题目: ${passage.questions.map(q => q.id || '?').join(', ')}`);
                if (passage.questions[0]?.stem) {
                    const stemPreview = (passage.questions[0].stem.substring(0, 30) || '') + '...';
                    tooltipContent.push(stemPreview);
                }
            }
            tooltip.innerHTML = tooltipContent.join('<br>');
        } catch (e) {
            tooltip.innerHTML = `段落 ${passage.id}`;
        }
        mark.appendChild(tooltip);
        
        // 悬停效果
        mark.addEventListener('mouseenter', () => {
            mark.style.transform = 'translateY(-2px)';
            mark.style.boxShadow = `0 4px 12px ${color}66`;
            tooltip.style.opacity = '1';
        });
        
        mark.addEventListener('mouseleave', () => {
            mark.style.transform = 'translateY(0)';
            mark.style.boxShadow = 'none';
            tooltip.style.opacity = '0';
        });
        
        // 点击跳转（估算时间）
        mark.addEventListener('click', () => {
            try {
                if (audioElement && audioElement.duration) {
                    // 根据passage位置估算时间点
                    const estimatedTime = (audioElement.duration / totalPassages) * index;
                    audioElement.currentTime = estimatedTime;
                    
                    // 尝试播放，但不强制（避免浏览器自动播放限制）
                    if (!audioElement.paused) {
                        audioElement.play().catch(() => {});
                    }
                    
                    // 视觉反馈
                    mark.style.background = `linear-gradient(135deg, ${color}ee 0%, ${color}cc 100%)`;
                    setTimeout(() => {
                        mark.style.background = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
                    }, 300);
                }
            } catch (e) {
                console.warn('跳转时间点失败:', e);
            }
        });
        
        container.appendChild(mark);
    });
    
    // 进度指示器
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'progress-indicator';
    progressIndicator.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 2px;
        height: 100%;
        background: #FF3B30;
        border-radius: 2px;
        transition: left 0.1s linear;
        pointer-events: none;
        z-index: 5;
    `;
    container.appendChild(progressIndicator);
    
    // 更新进度指示器位置
    audioElement.addEventListener('timeupdate', () => {
        try {
            if (audioElement.duration && !isNaN(audioElement.duration) && isFinite(audioElement.duration)) {
                const percent = (audioElement.currentTime / audioElement.duration) * 100;
                if (!isNaN(percent) && isFinite(percent)) {
                    progressIndicator.style.left = `calc(${percent}% - 1px)`;
                }
            }
        } catch (e) {
            // 静默处理错误，不影响音频播放
        }
    });
    
    return container;
}

// 创建听力测试专区横幅
function createListeningTestBanner(examId) {
    const banner = document.createElement('div');
    banner.className = 'listening-test-banner';
    banner.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 24px 32px;
        margin-bottom: 24px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    // 入场动画
    setTimeout(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0)';
    }, 100);
    
    // 背景装饰
    const deco = document.createElement('div');
    deco.style.cssText = `
        position: absolute;
        top: -50%;
        right: -10%;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
    `;
    banner.appendChild(deco);
    
    // 内容容器
    const content = document.createElement('div');
    content.style.cssText = `
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 24px;
    `;
    
    // 图标容器
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
        width: 72px;
        height: 72px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        flex-shrink: 0;
    `;
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-headphones-alt';
    icon.style.cssText = `
        font-size: 2rem;
        color: white;
    `;
    iconContainer.appendChild(icon);
    content.appendChild(iconContainer);
    
    // 文字容器
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
        flex: 1;
        color: white;
    `;
    
    const title = document.createElement('h3');
    title.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    title.innerHTML = `
        <span>🎧 听力测试专区</span>
        <span id="sync-badge" style="
            font-size: 0.7rem;
            font-weight: 600;
            background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            animation: pulse 2s ease-in-out infinite;
        ">真题同步</span>
    `;
    
    // 添加脉冲动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.5);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 0 0 6px rgba(6, 182, 212, 0);
            }
        }
    `;
    document.head.appendChild(style);
    
    const description = document.createElement('p');
    description.style.cssText = `
        margin: 0;
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;
    `;
    description.textContent = '本套真题配套听力测试 · 支持考试/练习模式 · 章节标记导航 · 实时计分反馈';
    
    textContainer.appendChild(title);
    textContainer.appendChild(description);
    content.appendChild(textContainer);
    
    // 功能标签
    const features = document.createElement('div');
    features.style.cssText = `
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 16px;
        position: relative;
        z-index: 1;
    `;
    
    const featureItems = [
        { icon: 'fa-clock', text: '计时答题' },
        { icon: 'fa-chart-line', text: '实时统计' },
        { icon: 'fa-redo', text: '无限重做' },
        { icon: 'fa-file-alt', text: '原文对照' }
    ];
    
    featureItems.forEach(item => {
        const tag = document.createElement('div');
        tag.style.cssText = `
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            color: white;
            display: flex;
            align-items: center;
            gap: 6px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        tag.innerHTML = `<i class="fas ${item.icon}" style="font-size: 0.75rem;"></i>${item.text}`;
        features.appendChild(tag);
    });
    
    banner.appendChild(content);
    banner.appendChild(features);
    
    // 响应式设计 - 移动端优化
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateBannerLayout = (e) => {
        if (e.matches) {
            // 移动端样式
            banner.style.padding = '20px 16px';
            content.style.flexDirection = 'column';
            content.style.alignItems = 'flex-start';
            iconContainer.style.width = '56px';
            iconContainer.style.height = '56px';
            icon.style.fontSize = '1.5rem';
            title.style.fontSize = '1.2rem';
            description.style.fontSize = '0.85rem';
        } else {
            // 桌面端样式
            banner.style.padding = '24px 32px';
            content.style.flexDirection = 'row';
            content.style.alignItems = 'center';
            iconContainer.style.width = '72px';
            iconContainer.style.height = '72px';
            icon.style.fontSize = '2rem';
            title.style.fontSize = '1.5rem';
            description.style.fontSize = '0.95rem';
        }
    };
    
    // 初始化和监听
    updateBannerLayout(mediaQuery);
    try {
        mediaQuery.addEventListener('change', updateBannerLayout);
    } catch (e) {
        // 旧版浏览器兼容
        mediaQuery.addListener(updateBannerLayout);
    }
    
    return banner;
}

// 初始化听力测试板块（在真题内容页面中）
async function initListeningTestSection(examId) {
    try {
        const resp = await fetch('./listening.json');
        if (!resp.ok) return;
        
        const listeningData = await resp.json();
        const examListeningData = listeningData[examId];
        
        if (!examListeningData || !examListeningData.sections) return;
        
        const examContentDiv = document.getElementById('exam-content');
        if (!examContentDiv) return;
        
        const listeningSection = document.createElement('div');
        listeningSection.id = 'listening-test-section';
        listeningSection.style.cssText = `
            margin-bottom: 32px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        
        const listeningCard = createListeningTestCard(examId, examListeningData);
        listeningSection.appendChild(listeningCard);
        examContentDiv.insertBefore(listeningSection, examContentDiv.firstChild);
        
        setTimeout(() => {
            listeningSection.style.opacity = '1';
            listeningSection.style.transform = 'translateY(0)';
        }, 100);
    } catch (e) {
        console.warn('初始化听力测试板块失败:', e);
    }
}

// 创建听力测试卡片
function createListeningTestCard(examId, listeningData) {
    const card = document.createElement('div');
    card.style.cssText = `background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid #f0f0f0;`;
    
    // 头部
    const header = document.createElement('div');
    header.style.cssText = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 32px; position: relative; overflow: hidden;`;
    header.innerHTML = `
        <div style="position: absolute; top: -100px; right: -100px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); border-radius: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">
                    <i class="fas fa-headphones" style="font-size: 1.5rem; color: white;"></i>
                </div>
                <div>
                    <h2 style="margin: 0 0 4px 0; font-size: 1.5rem; font-weight: 700; color: white;">🎧 听力测试</h2>
                    <p style="margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.85);">本套真题配套听力 · 完整测试体验</p>
                </div>
            </div>
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; animation: pulse 2s ease-in-out infinite; box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);">✨ 同步真题</div>
        </div>
    `;
    card.appendChild(header);
    
    // 统计信息
    const statsArea = document.createElement('div');
    statsArea.style.cssText = `padding: 24px 32px; background: linear-gradient(to bottom, #f8f9ff 0%, white 100%); border-bottom: 1px solid #f0f0f0;`;
    
    const totalQ = listeningData.totalQuestions || (listeningData.sections || []).reduce((sum, sec) => sum + (sec.questions || []).length, 0);
    const totalS = (listeningData.sections || []).length;
    
    const stats = [
        { icon: 'fa-list-ol', label: '题目数量', value: `${totalQ} 题`, color: '#667eea' },
        { icon: 'fa-layer-group', label: '听力部分', value: `${totalS} 个Section`, color: '#764ba2' },
        { icon: 'fa-clock', label: '建议时长', value: '25-30 分钟', color: '#f5576c' },
        { icon: 'fa-chart-line', label: '难度等级', value: examId.includes('cet6') ? 'CET-6' : 'CET-4', color: '#fbbf24' }
    ];
    
    const statsGrid = document.createElement('div');
    statsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;';
    
    stats.forEach(stat => {
        const si = document.createElement('div');
        si.style.cssText = `background: white; padding: 16px; border-radius: 12px; border: 2px solid #f0f0f0; text-align: center; transition: all 0.3s ease; cursor: pointer;`;
        si.innerHTML = `<div style="width: 40px; height: 40px; background: ${stat.color}15; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;"><i class="fas ${stat.icon}" style="font-size: 1.2rem; color: ${stat.color};"></i></div><div style="font-size: 0.75rem; color: #6e6e73; margin-bottom: 4px; font-weight: 600;">${stat.label}</div><div style="font-size: 1.1rem; color: #1d1d1f; font-weight: 700;">${stat.value}</div>`;
        si.addEventListener('mouseenter', () => { si.style.borderColor = stat.color; si.style.transform = 'translateY(-4px)'; si.style.boxShadow = `0 8px 20px ${stat.color}20`; });
        si.addEventListener('mouseleave', () => { si.style.borderColor = '#f0f0f0'; si.style.transform = 'translateY(0)'; si.style.boxShadow = 'none'; });
        statsGrid.appendChild(si);
    });
    
    statsArea.appendChild(statsGrid);
    card.appendChild(statsArea);
    
    // 按钮
    const btnArea = document.createElement('div');
    btnArea.style.cssText = 'padding: 24px 32px; display: flex; gap: 12px; flex-wrap: wrap;';
    
    const startBtn = document.createElement('button');
    startBtn.style.cssText = `flex: 1; min-width: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 16px 32px; border-radius: 12px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(102,126,234,0.3);`;
    startBtn.innerHTML = '<i class="fas fa-play-circle" style="margin-right: 8px;"></i>开始听力测试';
    startBtn.addEventListener('mouseenter', () => { startBtn.style.transform = 'translateY(-2px)'; startBtn.style.boxShadow = '0 8px 25px rgba(102,126,234,0.4)'; });
    startBtn.addEventListener('mouseleave', () => { startBtn.style.transform = 'translateY(0)'; startBtn.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)'; });
    startBtn.addEventListener('click', () => { window.location.href = `listening-micro.html?exam=${examId}`; });
    
    btnArea.appendChild(startBtn);
    card.appendChild(btnArea);
    
    return card;
}

