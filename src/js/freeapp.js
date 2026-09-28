// freeapp.js — FREEGEN0X_20260928：免费生成页（0x000000000.com/free）的页面逻辑。
//   算的那一段在 freegen.js（Web Worker），钥匙 → 地址、钱包文件在 keycore.js（跟个人靓号同一份）。
//   ★ 这一页一个请求都不发：没有 fetch、没有接口、不从别处取任何东西（私钥外发检查用真浏览器数一遍，必须是 0 个）。
//     钥匙只在这一页的内存里；存成钱包文件（密码上锁）是在你电脑上生成、直接存到你电脑上。
//   经典脚本，没有 import / export；单文件打包原样内联。
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var LANG_KEY = '0xlang2';                                  // 跟别的页同一个：在哪一页选的语言，换一页照样
  var lang = (function () { try { var v = localStorage.getItem(LANG_KEY); return v === 'zh' || v === 'en' ? v : 'en'; } catch (e) { return 'en'; } })();
  var FG = window.FreeGen, KC = window.KeyCore;
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };

  // ── 字 ───────────────────────────────────────────────────────────────────────────────────────────
  var D = {
    zh: {
      title: '0x000000000 — 免费生成',
      here: '你现在在：免费生成（短靓号在你自己的电脑上算）',
      hereSub: '免费、当场出。整把钥匙在你这台电脑上生成 —— 可以先断网再算。',
      navVanity: '个人靓号', navContract: '合约靓号', navToken: '发币地址定制', navFree: '免费生成', navWp: '白皮书',
      trust: '私钥只在你手里 · 这一页一个请求都不发（GitHub 上的检查每次都用真浏览器数一遍）· 页面代码公开在 GitHub',
      genH: '在你自己的电脑上算',
      genSteps: ['先断网：拔网线或者关掉 Wi-Fi。这一页已经整个在你电脑上了，断网照样能算。',
        '选哪条链、钉开头还是钉结尾，填图案（以太坊类最多 7 位，波场最多 5 位）。',
        '点「开始算」。用的是这台电脑的 CPU，随时可以停。',
        '算出来之后设一个密码，存成钱包文件（MetaMask / TronLink 都能导入）。',
        '存好了，先关掉这一页，再联网。'],
      netOn: '🌐 现在还连着网 —— 最稳的做法是先断网再点「开始算」（不断也能算：这一页本来就不发任何请求）。',
      netOff: '🔌 已经断网 ✓ —— 放心算。',
      chainL: '哪条链', chEvm: '以太坊类（0x…，以太坊、BSC、Base 等同一个地址）', chTron: '波场（T…）',
      whereL: '钉哪一头', wPre: '钉开头', wSuf: '钉结尾',
      patL: '图案',
      hintEvm: '只能用 0-9、a-f（不分大小写），最多 7 位。比如 0000000、888888、c0ffee。',
      hintTron: '区分大小写；没有 0、O、I、l 这四个字；最多 5 位（不算 T）。钉开头时 T 后面那一位只能是 9、A-Z。',
      prev: '地址会长这样：',
      odds: function (n) { return '平均要试 ' + n + ' 个地址才碰上一个。'; },
      noBrowser: '这个浏览器太旧，算不了（要新版的 Chrome、Edge、Firefox 或 Safari）。',
      go: '开始算', stop: '停', stopped: '停了。',
      cores: function (n) { return '用 ' + n + ' 个核在算'; },
      warm: '正在准备……',
      live: function (r, t, e) { return '每秒 ' + r + ' 个 · 已经试了 ' + t + ' 个 · 按这个速度平均要 ' + e; },
      liveNote: '每一个都是重新抽的：已经试过的，不会让剩下的变少。运气好更快，运气差可能要两三倍 —— 照实说。',
      found: function (t, s) { return '算出来了：试了 ' + t + ' 个，用了 ' + s + '。'; },
      addrL: '你的新地址（钉住的那几位标出来了）：',
      recheck: '页面用另一套代码（跟个人靓号同一份 keycore.js）把这把钥匙重新算了一遍：地址对得上 ✓',
      tronTwin: function (a) { return '同一把钥匙在 MetaMask 里看到的是这个 0x 写法：' + a; },
      failRecheck: '有一个结果复核没过，没有交给你，换个起点接着算了（这不该发生；要是经常看到，请告诉我们）。',
      failWorker: '后台计算出错了，停了。刷新页面再试一次。',
      ksH: '存成钱包文件', pwLbl: '给钱包文件设个密码（至少 8 位）', pwPh: '密码', pw2Ph: '再输一次', ksBtn: '存钱包文件',
      pwShort: '密码至少 8 位。', pwDiff: '两次输的不一样。', noSubtle: '这个浏览器不能加密（要用 https 打开这一页，或者用 Chrome / Edge 打开下载下来的文件）。',
      ksWork: '正在上锁…… ', ksOk: function (n, tron) { return '存好了：' + n + (tron ? '（TronLink 只收 .txt）' : '') + '。'; }, ksFail: '没存成：',
      ksGuideH: '怎么导进钱包？',
      ksGuide: [['0x 开头的地址', 'MetaMask：添加账户或硬件钱包 → 导入账户 → 选择类型「JSON 文件」→ 选 my-keystore.json → 输密码。'],
        ['T 开头的地址', 'TronLink：添加钱包 → TRON-导入钱包 → 通过 Keystore 文件导入 → 选 my-keystore.txt（TronLink 只收 .txt）→ 输密码。'],
        ['密码忘了怎么办', '这个文件就打不开了 —— 谁都帮不了你，我们也不行：我们根本没有这把钥匙。'],
        ['还有别的备份吗', '没有。页面一关，内存里那一份就没了。先存好文件、记住密码，再关页面。']],
      afterH: '存好之后',
      after: ['先关掉这一页，再联网。', '想要更长、更稀有的？交给显卡算 → 个人靓号（以太坊类 10 位起、波场 6 位起，私钥一样只在你手里）。'],
      toZero: function (n) { return '开头 ' + n + ' 个 0 —— 可以上零之榜（要从这个地址在 BSC 上转一笔零头，证明它是你的）。'; },
      toZeroLink: '去零之榜', toVanityLink: '去个人靓号',
      cert: '下载证书图', again: '再算一个', againSure: '还没存钱包文件 —— 这把钥匙会丢。确定就再点一次。',
      certNote: '图上只有地址和它有多难得，没有钥匙。',
      certTitle: '零九零 · 免费版', certSub: '在自己的电脑上算的 —— 整把钥匙从没离开过那台电脑',
      certOdds: function (n) { return '大约 ' + n + ' 个地址里才有一个'; },
      certPin: function (n, w) { return (w === 'prefix' ? '钉开头 ' : '钉结尾 ') + n + ' 位'; },
      unsaved: '你算出来的钥匙还没存成钱包文件，关掉就没了。',
      cmpH: '免费生成 vs 个人靓号',
      cmpRows: [['', '免费生成', '个人靓号'],
        ['谁来算', '你这台电脑的 CPU', '我们的显卡'],
        ['多长', '以太坊类最多 7 位、波场最多 5 位', '以太坊类 10~12 位、波场 6~8 位'],
        ['钉哪头', '只钉一头（开头或结尾）', '开头、结尾、两头都行'],
        ['钥匙', '整把都在你电脑上生成', '你造一半、我们算另一半，合起来只在你电脑上'],
        ['价格', '免费', '100 USDT 起']],
      whyH: '为什么要用这个',
      why: ['想要一个好看点的地址，但不想花钱、也不敢信陌生网站', '「私钥不经过我们」不是嘴上说：断网也能算，你亲眼看得到', '页面代码公开在 GitHub，线上这一份每小时自动核对'],
      riskH: '不用会有什么风险（真实例子）',
      risk: ['2022-09 做市商 Wintermute 被盗 1.6 亿美元：它的靓号地址用 Profanity 生成，那个工具随机数太少，私钥能被反推出来',
        '2024-07 imToken 安全月报第 28 期：有人卖「66666」这类靓号但自己留着私钥，买家转钱进去几天后被转走',
        '2026-07-30 Coldcard Mk3 旧固件跳过了硬件随机数，约 1,816 个 BTC 被批量清空 —— 私钥是怎么生成的，决定它安不安全'],
      honestH: '照实说',
      honest: ['浏览器里算，比显卡慢几十万倍：再长就交给显卡（个人靓号）。',
        '免费版只钉一头：两头都钉，正是仿别人地址（投毒）要的样子。两头都钉的走个人靓号 —— 那边下单前会查是不是在仿链上的活跃地址。',
        '随机数用的是浏览器自带的 crypto.getRandomValues（跟个人靓号第 1 步同一个）。',
        '我们没查到「恶意在线生成器偷私钥」被证实的案子 —— 所以不说「别人都在偷」，只说：你用不着信任任何人。'],
      dlHead: '想更放心：下载这一页，断网双击打开也能算',
      dlWhy: '下载下来的这个文件，以后我们改不了；它跟 GitHub 上公开的那一份逐字节相同，你可以自己比。',
      dlBtn: '下载这一页', dlGh: '在 GitHub 上核对',
      footNever: '零九零永远不会让你连接钱包、不会让你在钱包 App 里给我们签名或授权、不会让你转钱给我们来「验证」。凡是这样要求你的，一定是假的。',
      footOne: '官方网址只有一个：0x 000 000 000 .com（0x 后面 9 个 0）· 零九零没有发行任何代币 · 收藏官网，以后只从收藏夹进。',
      footLinks: '常见问题 · 招商 · 认证 · 付费提醒 · 零之榜',
      newsTag: '快讯', newsX: '隐藏 24 小时',
      sec: '秒', min: '分钟', hr: '小时', day: '天'
    },
    en: {
      title: '0x000000000 — Free Generator',
      here: 'You are on: Free Generator (short vanity addresses, computed on your own computer)',
      hereSub: 'Free, and ready on the spot. The whole key is made on this computer - you can unplug the internet first.',
      navVanity: 'Vanity Wallet', navContract: 'Vanity Contract', navToken: 'Token Address', navFree: 'Free Generator', navWp: 'White paper',
      trust: 'Only you hold the private key · this page sends no requests at all (the check on GitHub counts them in a real browser every time) · the page code is public on GitHub',
      genH: 'Compute it on your own computer',
      genSteps: ['Go offline first: unplug the cable or turn off Wi-Fi. This whole page is already on your computer and works offline.',
        'Pick the chain, pin the start or the end, and type the pattern (up to 7 characters for EVM, 5 for TRON).',
        'Click "Start". It uses this computer\'s CPU, and you can stop at any time.',
        'When it is found, set a password and save a wallet file (MetaMask and TronLink can import it).',
        'Once it is saved, close this page first, then go back online.'],
      netOn: '🌐 You are still online - the safest way is to go offline before clicking "Start" (it also works online: this page never sends any request).',
      netOff: '🔌 Offline ✓ - go ahead.',
      chainL: 'Chain', chEvm: 'EVM (0x..., the same address on Ethereum, BSC, Base and more)', chTron: 'TRON (T...)',
      whereL: 'Which end', wPre: 'Pin the start', wSuf: 'Pin the end',
      patL: 'Pattern',
      hintEvm: 'Only 0-9 and a-f (case does not matter), up to 7 characters. For example 0000000, 888888, c0ffee.',
      hintTron: 'Case matters; there is no 0, O, I or l; up to 5 characters (not counting the T). When pinning the start, the character after T can only be 9 or A-Z.',
      prev: 'The address will look like: ',
      odds: function (n) { return 'On average ' + n + ' addresses are tried before one matches.'; },
      noBrowser: 'This browser is too old for this (use a recent Chrome, Edge, Firefox or Safari).',
      go: 'Start', stop: 'Stop', stopped: 'Stopped.',
      cores: function (n) { return 'Computing on ' + n + (n === 1 ? ' core' : ' cores'); },
      warm: 'Getting ready...',
      live: function (r, t, e) { return r + ' per second · ' + t + ' tried so far · at this speed about ' + e + ' on average'; },
      liveNote: 'Every try is a fresh draw: the ones already tried do not make the rest shorter. With luck it is faster; without, it can take two or three times as long - that is the honest answer.',
      found: function (t, s) { return 'Found: ' + t + ' tried, ' + s + '.'; },
      addrL: 'Your new address (the pinned characters are marked):',
      recheck: 'The page rebuilt the address from this key with separate code (keycore.js, the same one the Vanity Wallet uses): it matches ✓',
      tronTwin: function (a) { return 'The same key shows up in MetaMask as this 0x address: ' + a; },
      failRecheck: 'One result failed the recheck and was not handed to you; the search continued from a new starting point (this should not happen - please tell us if you see it often).',
      failWorker: 'The background computation failed and stopped. Reload the page and try again.',
      ksH: 'Save it as a wallet file', pwLbl: 'Set a password for the wallet file (at least 8 characters)', pwPh: 'password', pw2Ph: 'type it again', ksBtn: 'Save the wallet file',
      pwShort: 'The password needs at least 8 characters.', pwDiff: 'The two passwords are different.', noSubtle: 'This browser cannot encrypt here (open this page over https, or open the downloaded file in Chrome or Edge).',
      ksWork: 'Locking... ', ksOk: function (n, tron) { return 'Saved: ' + n + (tron ? ' (TronLink only accepts .txt)' : '') + '.'; }, ksFail: 'Not saved: ',
      ksGuideH: 'How do I import it?',
      ksGuide: [['Addresses starting with 0x', 'MetaMask: Add account or hardware wallet - Import account - Select type: JSON File - pick my-keystore.json - enter the password.'],
        ['Addresses starting with T', 'TronLink: Add Wallet - TRON - Import Wallet - Import via Keystore File - pick my-keystore.txt (TronLink only accepts .txt) - enter the password.'],
        ['What if I forget the password', 'Then the file cannot be opened - nobody can help, not even us: we never had this key.'],
        ['Is there another copy', 'No. When the page is closed, the copy in memory is gone. Save the file and remember the password before closing the page.']],
      afterH: 'After you have saved it',
      after: ['Close this page first, then go back online.', 'Want a longer, rarer one? Let the GPU do it - Vanity Wallet (EVM from 10 characters, TRON from 6; the private key is still only yours).'],
      toZero: function (n) { return n + ' zeros at the start - it can go on the Zero board (send a tiny random amount from this address on BSC to prove it is yours).'; },
      toZeroLink: 'Go to the Zero board', toVanityLink: 'Go to Vanity Wallet',
      cert: 'Download the certificate picture', again: 'Make another one', againSure: 'The wallet file is not saved yet - this key will be lost. Click again if you are sure.',
      certNote: 'The picture only shows the address and how rare it is - no key.',
      certTitle: '0x000000000 · Free edition', certSub: 'Computed on its owner\'s own computer - the key never left it',
      certOdds: function (n) { return 'about one in ' + n + ' addresses'; },
      certPin: function (n, w) { return (w === 'prefix' ? 'start pinned: ' : 'end pinned: ') + n + (n === 1 ? ' character' : ' characters'); },
      unsaved: 'The key you found is not saved as a wallet file yet - it is gone if you close this page.',
      cmpH: 'Free Generator vs Vanity Wallet',
      cmpRows: [['', 'Free Generator', 'Vanity Wallet'],
        ['Who computes', 'the CPU of your own computer', 'our GPUs'],
        ['How long', 'EVM up to 7 characters, TRON up to 5', 'EVM 10-12 characters, TRON 6-8'],
        ['Which end', 'one end only (the start or the end)', 'the start, the end, or both'],
        ['The key', 'made entirely on your computer', 'you make one half, we compute the other; they are combined only on your computer'],
        ['Price', 'free', 'from 100 USDT']],
      whyH: 'Why use it',
      why: ['You want a nicer-looking address, but do not want to pay or trust a strange website', '"The private key never passes through us" is not just words: it works offline, and you can watch it', 'The page code is public on GitHub, and the live copy is checked against it every hour'],
      riskH: 'What can go wrong without it (real cases)',
      risk: ['2022-09: the market maker Wintermute lost 160 million dollars. Its vanity address was made with Profanity, which used too little randomness, so the private key could be worked out',
        '2024-07, imToken security report no. 28: someone sold "66666"-style vanity addresses but kept the private keys; buyers\' money was taken days later',
        '2026-07-30: old Coldcard Mk3 firmware skipped the hardware random numbers, and about 1,816 BTC were swept - how a private key is made decides whether it is safe'],
      honestH: 'Honestly',
      honest: ['Computing in a browser is hundreds of thousands of times slower than a GPU: longer patterns are for the GPU (Vanity Wallet).',
        'The free version pins one end only: pinning both ends is exactly what copying someone else\'s address (poisoning) needs. Both ends go through Vanity Wallet - it checks before every order whether the pattern imitates an active address on the chain.',
        'The randomness is the browser\'s own crypto.getRandomValues (the same as step 1 of the Vanity Wallet).',
        'We found no confirmed case of a malicious online generator stealing keys - so we do not say "everyone else steals"; we say: you do not need to trust anyone.'],
      dlHead: 'Want to be even surer: download this page and open it offline',
      dlWhy: 'Once downloaded, this file cannot be changed by us; it is byte-for-byte the same as the copy published on GitHub, and you can compare them yourself.',
      dlBtn: 'Download this page', dlGh: 'Verify on GitHub',
      footNever: '0x000000000 will never ask you to connect your wallet, to sign or approve anything for us in a wallet app, or to send us money to "verify". Anyone who asks is fake.',
      footOne: 'The only official website: 0x 000 000 000 .com (nine zeros after 0x) · 0x000000000 has not issued any token · bookmark it and always come in from the bookmark.',
      footLinks: 'FAQ · Partners · Verification · Paid alerts · Zero board',
      newsTag: 'NEWS', newsX: 'hide for 24 hours',
      sec: 's', min: 'min', hr: 'h', day: 'days'
    }
  };
  var T = function () { return D[lang]; };
  function dur(s) {
    var t = T(); if (!isFinite(s)) return '—';
    if (s < 90) return Math.max(1, Math.round(s)) + (lang === 'zh' ? ' ' : ' ') + t.sec;
    if (s < 5400) return Math.round(s / 60) + ' ' + t.min;
    if (s < 172800) return (s / 3600).toFixed(1) + ' ' + t.hr;
    return Math.round(s / 86400) + ' ' + t.day;
  }

  // ── 状态 ────────────────────────────────────────────────────────────────────────────────────────
  var CH = 'evm', WH = 'prefix', R = null, SAVED = false, RUNNING = null, AGAIN = 0;
  var OK = typeof BigInt === 'function' && typeof Worker === 'function' && !!(window.crypto && crypto.getRandomValues) && !!FG && !!KC;
  function pat() { return FG ? FG.norm(CH, WH, $('#patIn').value) : ''; }
  function zeros(addr) { var m = /^0x(0*)/.exec(addr || ''); return m ? m[1].length : 0; }

  // ── 顶部快讯细条 ────────────────────────────────────────────────────────────────────────────────
  var NK = 'fg_newsHide';
  function news() {
    var strip = $('#nStrip'); if (!strip || typeof NEWS === 'undefined' || !NEWS.length) return;
    var hid = 0; try { hid = Number(localStorage.getItem(NK) || 0); } catch (e) {}
    if (Date.now() - hid < 24 * 3600e3) { strip.hidden = true; return; }
    strip.hidden = false;
    var i = Math.floor(Math.random() * NEWS.length), paused = false, L = lang === 'en' ? 1 : 0;
    var show = function () { var n = NEWS[i % NEWS.length]; $('#nsTag').textContent = T().newsTag; $('#nsText').textContent = n.d[L] + ' · ' + n.ch[L] + ' · ' + n.a[L] + ' — ' + n.w[L]; $('#nsText').title = n.l[L]; };
    show();
    strip.onmouseenter = function () { paused = true; }; strip.onmouseleave = function () { paused = false; };
    $('#nsX').title = T().newsX;
    $('#nsX').onclick = function () { try { localStorage.setItem(NK, String(Date.now())); } catch (e) {} strip.hidden = true; };
    clearInterval(news.t); news.t = setInterval(function () { if (!paused) { i++; L = lang === 'en' ? 1 : 0; show(); } }, 6000);
  }

  // ── 画页面 ──────────────────────────────────────────────────────────────────────────────────────
  function txt(id, s) { var e = document.getElementById(id); if (e) e.textContent = s; }
  function list(id, arr, tag) { var e = document.getElementById(id); if (e) e.innerHTML = arr.map(function (x) { return '<' + (tag || 'li') + '>' + esc(x) + '</' + (tag || 'li') + '>'; }).join(''); }
  function renderStatic() {
    var t = T();
    document.documentElement.lang = lang;
    document.title = t.title; txt('ttl', t.title); txt('hereBig', t.here); txt('hereSub', t.hereSub);
    txt('navVanity', t.navVanity); txt('navContract', t.navContract); txt('navToken', t.navToken); txt('navFree', t.navFree); txt('navWp', t.navWp);
    txt('trustBar', t.trust); txt('genH', t.genH); list('genSteps', t.genSteps);
    txt('chainL', t.chainL); txt('chEvm', t.chEvm); txt('chTron', t.chTron); txt('whereL', t.whereL); txt('wPre', t.wPre); txt('wSuf', t.wSuf); txt('patL', t.patL);
    txt('btnGo', t.go); txt('btnStop', t.stop);
    txt('ksH', t.ksH); txt('pwLbl', t.pwLbl); $('#ksPw').placeholder = t.pwPh; $('#ksPw2').placeholder = t.pw2Ph; txt('btnKs', t.ksBtn);
    txt('ksGuideH', t.ksGuideH);
    $('#ksGuideL').innerHTML = t.ksGuide.map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join('');
    txt('afterH', t.afterH); txt('btnCert', t.cert); txt('btnAgain', t.again); txt('certNote', t.certNote);
    txt('cmpH', t.cmpH);
    $('#fcTable').innerHTML = t.cmpRows.map(function (r, ri) {
      return '<tr>' + r.map(function (c, ci) { var tag = ri === 0 || ci === 0 ? 'th' : 'td'; return '<' + tag + (ci === 1 ? ' class="cur"' : '') + '>' + esc(c) + '</' + tag + '>'; }).join('') + '</tr>';
    }).join('');
    txt('whyH', t.whyH); list('whyL', t.why); txt('riskH', t.riskH); list('riskL', t.risk); txt('honestH', t.honestH); list('honestL', t.honest);
    txt('dlHead', t.dlHead); txt('dlWhy', t.dlWhy); txt('dlBtn', t.dlBtn); txt('dlGh', t.dlGh);
    txt('footNever', t.footNever); txt('footOne', t.footOne);
    var fl = t.footLinks.split(' · ');
    document.querySelectorAll('#footLinks a').forEach(function (a, i) { if (fl[i]) a.textContent = fl[i]; });
    $('#btnZh').classList.toggle('active', lang === 'zh'); $('#btnEn').classList.toggle('active', lang === 'en');
    KC && KC.setLang(lang);
    renderNet(); renderForm(); renderResult(); news();
  }
  function renderNet() { txt('netState', navigator.onLine === false ? T().netOff : T().netOn); $('#netState').classList.toggle('ok', navigator.onLine === false); }
  function renderForm() {
    var t = T();
    document.querySelectorAll('#chainPick [data-chain]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-chain') === CH); });
    document.querySelectorAll('#wherePick [data-where]').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-where') === WH); });
    txt('patFix', CH === 'evm' ? (WH === 'prefix' ? '0x' : '0x…') : (WH === 'prefix' ? 'T' : 'T…'));
    txt('patHint', CH === 'evm' ? t.hintEvm : t.hintTron);
    $('#patIn').maxLength = FG ? FG.CAP[CH] : 7;
    if (!OK) { txt('patErr', t.noBrowser); $('#btnGo').disabled = true; return; }
    var p = pat(), raw = $('#patIn').value.trim();
    var why = raw ? FG.problem(CH, WH, p) : null;
    txt('patErr', why ? why[lang] : '');
    if (!raw || why) { txt('patPrev', ''); txt('patOdds', ''); $('#btnGo').disabled = true; return; }
    var body = CH === 'tron' && WH === 'prefix' ? p.slice(1) : p;
    var dots = '…';
    txt('patPrev', t.prev + (CH === 'evm' ? '0x' + (WH === 'prefix' ? body + dots : dots + body) : (WH === 'prefix' ? 'T' + body + dots : 'T' + dots + body)));
    txt('patOdds', t.odds(fmt(FG.expected(CH, WH, p))));
    $('#btnGo').disabled = !!RUNNING;
  }
  function markAddr(r) {
    var a = r.addr, p = r.pat, i;
    if (r.chain === 'evm') { var b = a.slice(2); i = r.where === 'prefix' ? 0 : b.length - p.length; return '0x' + esc(b.slice(0, i)) + '<b class="fg-pin">' + esc(b.slice(i, i + p.length)) + '</b>' + esc(b.slice(i + p.length)); }
    i = r.where === 'prefix' ? 0 : a.length - p.length;
    return esc(a.slice(0, i)) + '<b class="fg-pin">' + esc(a.slice(i, i + p.length)) + '</b>' + esc(a.slice(i + p.length));
  }
  function renderResult() {
    var t = T(), out = $('#genOut');
    if (!R) { out.hidden = true; $('#ksBox').hidden = true; $('#afterBox').hidden = true; return; }
    var h = '<div class="ok">' + esc(t.found(fmt(R.tried), dur(R.ms / 1000))) + '</div>'
      + '<div class="lbl">' + esc(t.addrL) + '</div><div class="fg-addr"><code>' + markAddr(R) + '</code></div>'
      + '<div class="ok">' + esc(t.recheck) + '</div>';
    if (R.chain === 'tron') h += '<div class="dim">' + esc(t.tronTwin(KC.addrOf('evm', R.k))) + '</div>';
    out.innerHTML = h; out.hidden = false;
    $('#ksBox').hidden = false;
    var ab = $('#afterBox'); ab.hidden = !SAVED;
    var al = t.after.slice(), links = '';
    if (R.chain === 'evm' && zeros(R.addr) >= 5) links += '<li>' + esc(t.toZero(zeros(R.addr))) + ' <a href="https://0x000000000.com/zero#' + esc(R.addr) + '">' + esc(t.toZeroLink) + '</a></li>';
    $('#afterL').innerHTML = '<li>' + esc(al[0]) + '</li><li>' + esc(al[1]) + ' <a href="https://0x000000000.com/">' + esc(t.toVanityLink) + '</a></li>' + links;
  }

  // ── 算 ──────────────────────────────────────────────────────────────────────────────────────────
  function stopRun(msg) {
    if (FG) FG.stop();
    RUNNING = null;
    $('#btnStop').hidden = true; $('#genLive').hidden = true; $('#genLiveNote').hidden = true;
    document.querySelectorAll('#genForm .chip, #patIn').forEach(function (e) { e.disabled = false; });
    if (msg) { var out = $('#genOut'); out.hidden = false; out.innerHTML = '<div class="dim">' + esc(msg) + '</div>'; }
    renderForm();
  }
  function go() {
    if (!OK || RUNNING) return;
    if (R && !SAVED) { if (AGAIN < 1) { AGAIN++; var o = $('#genOut'); o.hidden = false; o.insertAdjacentHTML('beforeend', '<div class="warn">' + esc(T().againSure) + '</div>'); return; } }
    var p = pat(), why = FG.problem(CH, WH, p);
    if (why) { txt('patErr', why[lang]); return; }
    R = null; SAVED = false; AGAIN = 0; renderResult();
    $('#ksPw').value = ''; $('#ksPw2').value = ''; txt('ksMsg', '');
    var exp = FG.expected(CH, WH, p), started;
    $('#genLive').hidden = false; $('#genLiveNote').hidden = false; txt('genLiveNote', T().liveNote); txt('genLiveTxt', T().warm);
    $('#btnGo').disabled = true; $('#btnStop').hidden = false;
    document.querySelectorAll('#genForm .chip, #patIn').forEach(function (e) { e.disabled = true; });
    try {
      started = FG.start({ chain: CH, where: WH, pat: p }, {
        up: function () {},
        rate: function (tried, per) { if (!RUNNING) return; txt('genLiveTxt', T().cores(RUNNING.workers) + ' · ' + T().live(fmt(per), fmt(tried), dur(exp / Math.max(1, per)))); },
        found: function (r) { RUNNING = null; R = r; SAVED = false; stopRun(); renderResult(); },
        fail: function (why) { if (why === 'recheck') { var o = $('#genOut'); o.hidden = false; o.innerHTML = '<div class="warn">' + esc(T().failRecheck) + '</div>'; } else stopRun(T().failWorker); }
      });
    } catch (e) { stopRun(e.message); return; }
    RUNNING = started;
    txt('genLiveTxt', T().cores(started.workers) + ' · ' + T().warm);
  }

  // ── 钱包文件 ─────────────────────────────────────────────────────────────────────────────────────
  function dl(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type || 'application/octet-stream' })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function saveKs() {
    if (!R) return;
    var t = T(), msg = $('#ksMsg'), pw = $('#ksPw').value || '', pw2 = $('#ksPw2').value || '';
    if (pw.length < 8) { msg.className = 'step-desc warn'; msg.textContent = t.pwShort; return; }
    if (pw !== pw2) { msg.className = 'step-desc warn'; msg.textContent = t.pwDiff; return; }
    if (!crypto.subtle) { msg.className = 'step-desc warn'; msg.textContent = t.noSubtle; return; }
    var btn = $('#btnKs'); btn.disabled = true; msg.className = 'step-desc';
    var r = R;
    KC.keystore(r.k, r.addr, r.chain, pw, function (p) { msg.textContent = T().ksWork + Math.round(p * 100) + '%'; }).then(function (ks) {
      var name = KC.keystoreName(r.chain);
      dl(name, JSON.stringify(ks, null, 2));
      msg.className = 'step-desc ok'; msg.textContent = T().ksOk(name, r.chain === 'tron'); btn.disabled = false;
      SAVED = true; $('#ksGuide').open = true; renderResult();
    }, function (e) { msg.className = 'step-desc warn'; msg.textContent = T().ksFail + e.message; btn.disabled = false; });
  }

  // ── 证书图（在这一页里画，不带钥匙）───────────────────────────────────────────────────────────────
  function cert() {
    if (!R) return;
    var t = T(), r = R, cv = document.createElement('canvas'), W = 1200, H = 630;
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d'), F = '"0x Mono", "JetBrains Mono", monospace';
    var draw = function () {
      g.fillStyle = '#06070c'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#8f6f1a'; g.lineWidth = 3; g.strokeRect(24, 24, W - 48, H - 48);
      g.fillStyle = '#ebc65c'; g.font = '700 34px ' + F; g.fillText(t.certTitle, 64, 104);
      g.fillStyle = '#9aa0ab'; g.font = '400 22px ' + F; g.fillText(t.certSub, 64, 146);
      var a = r.addr, p = r.pat, pre = r.where === 'prefix', size = a.length > 40 ? 30 : 34;
      g.font = '700 ' + size + 'px ' + F;
      var i = r.chain === 'evm' ? (pre ? 2 : a.length - p.length) : (pre ? 0 : a.length - p.length), j = i + p.length, x = 64, y = 300;
      [[a.slice(0, i), '#e9e5d9'], [a.slice(i, j), '#ebc65c'], [a.slice(j), '#e9e5d9']].forEach(function (s) { g.fillStyle = s[1]; g.fillText(s[0], x, y); x += g.measureText(s[0]).width; });
      g.fillStyle = '#e9e5d9'; g.font = '400 26px ' + F;
      g.fillText(t.certPin(r.chain === 'tron' && pre ? p.length - 1 : p.length, r.where) + ' · ' + t.certOdds(fmt(FG.expected(r.chain, r.where, p))), 64, 380);
      if (r.chain === 'evm' && zeros(a) >= 5) { g.fillStyle = '#ebc65c'; g.fillText((lang === 'zh' ? '开头 ' + zeros(a) + ' 个 0' : zeros(a) + ' zeros at the start'), 64, 430); }
      g.fillStyle = '#5d6470'; g.font = '400 22px ' + F; g.fillText('0x000000000.com/free', 64, H - 64);
      cv.toBlob(function (b) {
        if (!b) return;
        var url = URL.createObjectURL(b), el = document.createElement('a');
        el.href = url; el.download = '0x000000000-free-' + a.slice(-6) + '.png'; document.body.appendChild(el); el.click(); el.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      }, 'image/png');
    };
    if (document.fonts && document.fonts.load) document.fonts.load('700 34px "0x Mono"').then(draw, draw); else draw();
  }

  // ── 开页 ─────────────────────────────────────────────────────────────────────────────────────────
  $('#btnZh').addEventListener('click', function () { lang = 'zh'; try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} renderStatic(); });
  $('#btnEn').addEventListener('click', function () { lang = 'en'; try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} renderStatic(); });
  document.querySelectorAll('#chainPick [data-chain]').forEach(function (b) { b.addEventListener('click', function () { if (RUNNING) return; CH = b.getAttribute('data-chain'); $('#patIn').value = ''; renderForm(); }); });
  document.querySelectorAll('#wherePick [data-where]').forEach(function (b) { b.addEventListener('click', function () { if (RUNNING) return; WH = b.getAttribute('data-where'); renderForm(); }); });
  $('#patIn').addEventListener('input', renderForm);
  $('#patIn').addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  $('#btnGo').addEventListener('click', go);
  $('#btnStop').addEventListener('click', function () { stopRun(T().stopped); });
  $('#btnKs').addEventListener('click', saveKs);
  $('#btnCert').addEventListener('click', cert);
  $('#btnAgain').addEventListener('click', function () { R = null; SAVED = false; AGAIN = 0; $('#genOut').hidden = true; renderResult(); $('#patIn').focus(); });
  window.addEventListener('online', renderNet); window.addEventListener('offline', renderNet);
  window.addEventListener('beforeunload', function (e) { if (R && !SAVED) { e.preventDefault(); e.returnValue = T().unsaved; return T().unsaved; } });
  // 从推荐链接进来的（?ref=）：跟首页记在同一个地方（这个浏览器里），去个人靓号下单时首页自己会带上；地址栏洗干净
  try {
    var q = new URLSearchParams(location.search).get('ref');
    if (q && /^[2-9A-HJ-NP-Z]{6}$/i.test(q)) { try { localStorage.setItem('zn_ref', q.toUpperCase()); } catch (e) {} }
    if (location.search && /^https?:$/.test(location.protocol) && history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
  } catch (e) { /* 不影响算 */ }
  if (location.protocol === 'file:') { var dlp = $('#dlPage'); if (dlp) dlp.hidden = true; }
  setInterval(function () { txt('utcClock', new Date().toISOString().slice(11, 19) + ' UTC'); }, 1000);
  renderStatic();
})();
