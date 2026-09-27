// fcheck.js — FREECHECK0X_20260928：首页正中间的免费查 + 安全快讯（构思 v3 第一章、第二章第 1 条；DSJ 09-28「构思定稿：定了」）。
//   判法是 judge.js 那一份（ZJ —— 服务器、店主取款工具跑的也是它）；快讯是 news.js 那一份（NEWS，66 宗真案子，每条带来源）。
//   联网只走 app.js 的 api()：全页唯一的出网口，发了什么都记在「这一页跟平台说过的每一句话」里（下载到电脑上那一份看得见）。
//   ★ 不存任何东西：查过的地址、「你自己的地址」都只在这一页的内存里，关掉页面就没了；「你自己的地址」单独查一次，
//     跟你要付钱的地址比，是在这里（你的浏览器里）用 judge.js 比的 —— 服务器不知道这两个地址是一起查的。
//   唯一记在浏览器里的：快讯细条被你点 × 关掉的时间（24 小时后再出现）。
(function () {
  if (typeof ZJ === 'undefined' || typeof NEWS === 'undefined') return;
  const TX = 'https://tronscan.org/#/transaction/';
  const BOT = 'OxOOOOOOOOObot';
  const S = {
    zh: {
      title: '免费查：这个地址有没有被投毒？',
      ph: ['贴一个波场地址 T…', '贴你要转钱过去的地址', '贴你自己的地址 —— 看谁在仿你'],
      go: '查一下', sub: '零九零自己的钱，就是这样防的。',
      subWhy: '我们自己的取款工具，每次往外转钱之前跑的就是同一份判法（judge.js，代码公开在 GitHub）：往我们收款地址塞过零头 / 0 元 / 假 USDT 的地址、跟上次用的地址头尾像 3 位以上的地址，一律拦下。',
      mineSum: '要付钱给别人？再填你自己的地址，拿你真的转过账的对象来比',
      minePh: '你自己的波场地址（只留在这一页里）',
      mineNote: '你自己的地址会单独查一次；两个地址的比对在你的浏览器里做 —— 我们不知道这两个是一起查的，也不存。',
      checking: '正在看链上记录……（十几秒）',
      evm: '以太坊类地址（0x…）的免费查还没开，先开的是波场。',
      bad: '这不是有效的波场地址（T 开头、34 位、校验码要对）—— 很可能抄错了一位。回到对方给你地址的原始地方，重新复制一次。',
      mineBad: '「你自己的地址」不是有效的波场地址，这一次只查了上面那一个。',
      same: '两个地址是同一个。',
      net: '这一次没查成：',
      h: { poisoner: '⛔ 这是投毒地址', targeted: '⚠ 有人在仿这个地址的转账对象', lookalike: '⚠ 这个地址的记录里有长得很像的地址', caution: '⚠ 小心：几乎没有真实往来', clean: '✅ 没发现投毒记录', empty: '✅ 链上还没有记录（新地址）' },
      poisoner: (p) => '它最近往 ' + p.microTo + ' 个不同的地址打过 0.01 USDT 以下的零头（' + p.micro + ' 笔）—— 骗子就是这样把假地址塞进别人的转账记录。不要往这个地址转钱。',
      targeted: (n, k) => n + ' 个假地址，仿了这个地址的 ' + k + ' 个转账对象。它们头尾跟真的对象一样、中间不一样 —— 只等你从转账记录里复制错。',
      lookalike: '其中一个可能是假的 —— 转账前核对整串地址。',
      caution: (p) => '它几乎没有真实的 USDT 往来，却跟 ' + p.zfPeers + ' 个地址有 0 元转账或假 USDT 记录。付钱之前，找对方用别的方式再核对一次。',
      clean: '在它最近的记录里，没看到有人往它这里塞零头 / 0 元 / 假 USDT 来仿它的转账对象；它自己也没有在群发零头。',
      empty: '这个地址在链上还没有任何记录。付钱前确认它真是对方给你的。',
      window: (w) => '看了最近 ' + w.n + ' 笔转账' + (w.complete ? '' : '（更早的没看）') + '。',
      spam: (s) => '另外有 ' + s.senders + ' 个地址往这里打过零头，但不像它的任何一个转账对象 —— 群发的垃圾，不用理。',
      fakeL: '假', realL: '真', paidL: '付过', thisL: '这个', pairWhy: '两个它都付过钱', recvWhy: '一个只打钱进来，却很像它付过钱的那个',
      sameTxt: (h, t) => '开头 ' + h + ' 位、结尾 ' + t + ' 位一样（绿色），其余不一样（红色）',
      types: { dust: '零头', zero: '0 元转账', 'zero-out': '伪造的「你转出」0 元记录', fake: '假 USDT', 'fake-out': '伪造的「你转出」假 USDT', trxdust: 'TRX 零头', trc10: 'TRC10 广告币' },
      more: (n) => '…还有 ' + n + ' 个，这里不一一列出',
      tx: '链上记录 ↗',
      mineH: { poison: '⛔ 先别转：它往你的地址塞过零头 / 假记录，而且像你转过账的对象', acted: '⛔ 先别转：它往你的地址塞过零头 / 假记录（正常的收款方不会这样做）', red: '⛔ 先别转：它长得很像你转过账的对象', yellow: '⚠ 有点像你转过账的对象，核对整串地址再转', known: '✓ 你跟这个地址转过账', none: '✓ 跟你转过账的对象都不像' },
      mineCmp: (n) => '（拿你最近的 ' + n + ' 个转账对象比过）',
      tip: '转账前：别从转账记录、聊天记录里复制地址 —— 从对方给你的原始地方复制，或者先贴到这里查一下。',
      watch: '想以后自动知道？在 Telegram 找 @' + BOT + '，私聊发「/watch 你的地址」—— 每周免费提醒；会记下什么，它开之前会先问你。',
      copyWatch: '复制这句', copied: '复制好了',
      caseH: '最像的一宗真案子', src: '来源',
      nsTag: '快讯', nsAll: '全部快讯', nsHide: '关掉 24 小时',
      cardsH: '安全快讯 · 真实发生过的', allBtn: '看全部 66 宗 →',
      modalT: '安全快讯 · 66 宗真案子，每一条都带来源', catAll: '全部',
    },
    en: {
      title: 'Free check: has this address been poisoned?',
      ph: ['Paste a TRON address T…', 'Paste the address you are about to pay', 'Paste your own address - see who is imitating you'],
      go: 'Check', sub: 'This is exactly how 0x000000000 protects its own money.',
      subWhy: 'Our own withdrawal tool runs the very same rules (judge.js, published on GitHub) before it sends any money out: it stops for any address that planted dust, zero-value or fake USDT on our payment addresses, and for any address whose start and end match the last one we used in 3 or more characters.',
      mineSum: 'Paying someone? Add your own address to compare against the people you have actually paid',
      minePh: 'Your own TRON address (stays on this page only)',
      mineNote: 'Your own address is checked separately, and the comparison happens here in your browser - we never learn that the two go together, and we store neither.',
      checking: 'Reading the chain history… (a few seconds)',
      evm: 'Free checks for EVM addresses (0x…) are not open yet - TRON comes first.',
      bad: 'This is not a valid TRON address (starts with T, 34 characters, the checksum must match) - one character was probably copied wrong. Copy it again from where the other person originally gave it to you.',
      mineBad: 'Your own address is not a valid TRON address, so only the address above was checked.',
      same: 'Both addresses are the same.',
      net: 'This check did not go through: ',
      h: { poisoner: '⛔ This is a poisoning address', targeted: '⚠ Someone is imitating the contacts of this address', lookalike: '⚠ This history contains addresses that look very alike', caution: '⚠ Careful: almost no real activity', clean: '✅ No poisoning found', empty: '✅ No history on chain yet (a new address)' },
      poisoner: (p) => 'It recently sent dust under 0.01 USDT to ' + p.microTo + ' different addresses (' + p.micro + ' transfers). That is how scammers plant fake addresses in other people\'s transfer history. Do not send money to it.',
      targeted: (n, k) => n + ' fake addresses imitate ' + k + ' of this address\'s contacts. Their start and end match the real contacts while the middle differs - waiting for a copy from the transfer history.',
      lookalike: 'One of them may be fake - compare the whole address before you send.',
      caution: (p) => 'It has almost no real USDT activity, yet has zero-value or fake-USDT records with ' + p.zfPeers + ' addresses. Before paying, confirm it with the other person through another channel.',
      clean: 'In its recent history nobody planted dust, zero-value or fake USDT to imitate its contacts, and it is not spraying dust itself.',
      empty: 'This address has no history on chain yet. Make sure it really came from the person you are paying.',
      window: (w) => 'Looked at the latest ' + w.n + ' transfers' + (w.complete ? '' : ' (older ones not checked)') + '.',
      spam: (s) => 'Also: ' + s.senders + ' addresses sent it dust but look like none of its contacts - mass spam, safe to ignore.',
      fakeL: 'fake', realL: 'real', paidL: 'paid', thisL: 'this', pairWhy: 'it paid both of them', recvWhy: 'one only sent money in, yet looks like one it paid',
      sameTxt: (h, t) => 'first ' + h + ' and last ' + t + ' characters match (green), the rest differs (red)',
      types: { dust: 'dust', zero: 'zero-value transfer', 'zero-out': 'forged zero-value "sent by you" record', fake: 'fake USDT', 'fake-out': 'forged fake-USDT "sent by you" record', trxdust: 'TRX dust', trc10: 'TRC10 spam token' },
      more: (n) => '…and ' + n + ' more, not all listed here',
      tx: 'on-chain record ↗',
      mineH: { poison: '⛔ Stop: it planted dust / fake records on your address and looks like one of your contacts', acted: '⛔ Stop: it planted dust / fake records on your address (a normal payee never does that)', red: '⛔ Stop: it looks very much like one of your contacts', yellow: '⚠ It looks a bit like one of your contacts - compare the whole address before sending', known: '✓ You have transferred with this address before', none: '✓ It looks like none of your contacts' },
      mineCmp: (n) => ' (compared with your latest ' + n + ' contacts)',
      tip: 'Before you send: never copy an address from your transfer history or a chat - copy it from where the other person originally gave it, or paste it here first.',
      watch: 'Want to know automatically? Find @' + BOT + ' on Telegram and send "/watch your address" in a private chat - a free weekly alert; it tells you exactly what it stores before it starts.',
      copyWatch: 'Copy this', copied: 'Copied',
      caseH: 'The closest real case', src: 'Source',
      nsTag: 'NEWS', nsAll: 'All news', nsHide: 'hide for 24 hours',
      cardsH: 'Security news · things that really happened', allBtn: 'See all 66 cases →',
      modalT: 'Security news · 66 real cases, each with its source', catAll: 'All',
    },
  };
  const T = (k) => S[lang === 'zh' ? 'zh' : 'en'][k];
  const LI = () => (lang === 'zh' ? 0 : 1);
  const $$ = (s) => document.getElementById(s);
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  // 波场地址校验（base58check，跟服务器 tronValid 同一个规则）。NOBLE 不在就只看样子，校验交给服务器（它会回 400）。
  function tronOk(a) {
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a)) return false;
    const sha = window.NOBLE && window.NOBLE.sha256;
    if (!sha) return true;
    let n = 0n; for (const c of a) n = n * 58n + BigInt(B58.indexOf(c));
    let hex = n.toString(16); if (hex.length > 50) return false; hex = hex.padStart(50, '0');
    if (!hex.startsWith('41')) return false;
    const b = new Uint8Array(25); for (let i = 0; i < 25; i++) b[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    const h = sha(sha(b.slice(0, 21)));
    for (let i = 0; i < 4; i++) if (h[i] !== b[21 + i]) return false;
    return true;
  }
  const errOf = (r) => (r && r.body && (lang === 'en' ? r.body.errorEn || r.body.error : r.body.error)) || ('HTTP ' + (r && r.code));
  const utc = (ts) => (ts ? new Date(ts).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '—');

  // 两条地址上下对齐：一样的位绿色、不一样的红色（波场开头的 T、以太坊类的 0x 是灰的 —— 每个地址都有）
  function marked(a, head, tail) {
    const p = ZJ.pre('tron'), n = a.length;
    return [...a].map((c, i) => '<i class="' + (i < p ? 'pf' : i < p + head || i >= n - tail ? 'ok' : 'no') + '">' + esc(c) + '</i>').join('');
  }
  function pair(top, topL, bot, botL, head, tail, extra) {
    return '<div class="fc-pair"><div class="fc-row"><b>' + esc(topL) + '</b><code>' + marked(top, head, tail) + '</code></div>'
      + '<div class="fc-row"><b>' + esc(botL) + '</b><code>' + marked(bot, head, tail) + '</code></div>'
      + '<div class="fc-why">' + esc(T('sameTxt')(head, tail)) + (extra ? ' · ' + extra : '') + '</div></div>';
  }
  const caseFind = (needle) => NEWS.find((x) => x.w[1].includes(needle) || x.a[1].includes(needle));
  function caseFor(r, own) {
    if (own && ['poison', 'acted', 'red'].includes(own.level)) return caseFind('OTC trades');
    if (r.verdict === 'poisoner' || r.verdict === 'targeted') return caseFind('THc…bu8');
    if (r.verdict === 'lookalike') return caseFind('twice within 3 hours');
    if (r.verdict === 'caution') return caseFind('posing as the FBI');
    return caseFind('A 50 USDT test went first');
  }
  function newsCard(x, cls) {
    const i = LI();
    return '<article class="nc ' + (cls || '') + '"><div class="nc-meta"><span class="nc-cat c-' + x.c + '">' + esc(NEWS_CAT[x.c][i]) + '</span> '
      + esc(x.d[i] + ' · ' + x.ch[i]) + '</div><div class="nc-amt">' + esc(x.a[i]) + '</div><p class="nc-w">' + esc(x.w[i]) + '</p>'
      + '<p class="nc-l">→ ' + esc(x.l[i]) + '</p><div class="nc-src">' + esc(T('src')) + ': '
      + x.s.map((s) => '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener noreferrer">' + esc(s[0]) + ' ↗</a>').join(' · ') + '</div></article>';
  }

  // ── 查询结果 ──
  function render(r, own, mineN, note) {
    const L = [], i = LI(), lvl = { poisoner: 'red', targeted: 'amber', lookalike: 'amber', caution: 'amber', clean: 'green', empty: 'green' };
    const v = r.verdict === 'clean' && !r.window.n ? 'empty' : r.verdict;
    if (own) {
      const ml = { poison: 'red', acted: 'red', red: 'red', yellow: 'amber', known: 'green', none: 'green' }[own.level] || 'green';
      L.push('<div class="fc-card lv-' + ml + '"><div class="fc-h">' + esc(T('mineH')[own.level] || '') + '<span class="fc-dim">' + esc(T('mineCmp')(mineN)) + '</span></div>'
        + (own.with && ['poison', 'red', 'yellow'].includes(own.level) ? pair(r.address, T('thisL'), own.with, T('paidL'), own.head, own.tail) : '') + '</div>');
    }
    L.push('<div class="fc-card lv-' + lvl[v] + '"><div class="fc-h">' + esc(T('h')[v]) + '</div><div class="fc-addr"><code>' + esc(r.address) + '</code></div>');
    if (v === 'poisoner') L.push('<p>' + esc(T('poisoner')(r.profile)) + '</p>');
    else if (v === 'targeted') {
      L.push('<p>' + esc(T('targeted')(r.poisonCount, new Set(r.poison.map((p) => p.imitates)).size)) + '</p>');
      for (const p of r.poison.slice(0, 5)) L.push(pair(p.address, T('fakeL'), p.imitates, T('realL'), p.head, p.tail,
        esc(p.types.map((x) => T('types')[x] || x).join(' / ') + ' · ' + utc(p.last)) + (p.tx && p.tx[0] ? ' · <a href="' + TX + esc(p.tx[0]) + '" target="_blank" rel="noopener noreferrer">' + esc(T('tx')) + '</a>' : '')));
      if (r.poisonCount > 5) L.push('<p class="fc-dim">' + esc(T('more')(r.poisonCount - 5)) + '</p>');
    } else if (v === 'lookalike') {
      L.push('<p>' + esc(T('lookalike')) + '</p>');
      for (const p of r.lookalikes.slice(0, 5)) L.push(pair(p.address, '?', p.imitates, T('paidL'), p.head, p.tail, esc(p.kind === 'pair' ? T('pairWhy') : T('recvWhy'))));
    } else if (v === 'caution') L.push('<p>' + esc(T('caution')(r.profile)) + '</p>');
    else L.push('<p>' + esc(T(v === 'empty' ? 'empty' : 'clean')) + '</p>');
    L.push('<p class="fc-dim">' + esc((r.window.n ? T('window')(r.window) : '') + (r.spam && r.spam.senders && v !== 'poisoner' ? ' ' + T('spam')(r.spam) : '')) + '</p>');
    if (note) L.push('<p class="fc-dim">' + esc(note) + '</p>');
    L.push('</div>');
    L.push('<p class="fc-tip">' + esc(T('tip')) + '</p>');
    const w = '/watch ' + r.address;
    L.push('<div class="fc-watch"><span>' + esc(T('watch')) + '</span> <code>' + esc(w) + '</code> <button type="button" class="peek" id="fcCopyW">' + esc(T('copyWatch')) + '</button></div>');
    const c = caseFor(r, own);
    if (c) L.push('<div class="fc-case"><div class="fc-case-h">' + esc(T('caseH')) + '</div>' + newsCard(c, 'in-result') + '</div>');
    const box = $$('fcResult');
    box.innerHTML = L.join('');
    box.hidden = false;
    const cb = $$('fcCopyW');
    if (cb) cb.addEventListener('click', () => {
      const done = () => { cb.textContent = T('copied'); };
      try { navigator.clipboard.writeText(w).then(done, () => {}); } catch (e) { /* 复制不了就算了：字就在旁边 */ }
    });
  }
  function msg(text, cls) { const box = $$('fcResult'); box.innerHTML = '<div class="fc-card lv-' + (cls || 'amber') + '"><p>' + esc(text) + '</p></div>'; box.hidden = false; }

  let busy = false, last = null;
  async function run(ev) {
    if (ev) ev.preventDefault();
    if (busy) return;
    const a = ($$('fcAddr').value || '').trim(), me = ($$('fcMine').value || '').trim();
    if (!a) { $$('fcAddr').focus(); return; }
    if (/^0x[0-9a-fA-F]{40}$/.test(a)) return msg(T('evm'));
    if (!tronOk(a)) return msg(T('bad'), 'red');
    busy = true; $$('fcGo').disabled = true; msg(T('checking'), 'dim');
    try {
      const r = await api('/api/check', 'POST', { address: a });
      if (r.code !== 200 || !r.body || !r.body.result) { msg(T('net') + errOf(r), 'amber'); return; }
      let own = null, mineN = 0, note = '';
      if (me && me === a) note = T('same');
      else if (me && !tronOk(me)) note = T('mineBad');
      else if (me) {
        const m = await api('/api/check', 'POST', { address: me });   // 你自己的地址：单独一次；两个比对就在下面这一行，在你的浏览器里
        if (m.code === 200 && m.body && m.body.result) {
          const ev = {}; for (const e of m.body.result.evidence || []) ev[e.address] = e;
          const known = (m.body.result.known || []).map((k) => k.address);
          own = ZJ.judge(a, known, ev, 'tron'); mineN = known.length;
        } else note = T('net') + errOf(m);
      }
      last = { r: r.body.result, own, mineN, note };
      render(last.r, own, mineN, note);
    } finally { busy = false; $$('fcGo').disabled = false; }
  }

  // ── 提示字像终端打字（设了「减少动态」就直接摆第一句）──
  const PH = { timer: null, gen: 0 };
  function phRestart() {
    const el = $$('fcAddr'); if (!el) return;
    clearTimeout(PH.timer); const gen = ++PH.gen, lines = T('ph');
    if (reducedMotion) { el.placeholder = lines[0]; return; }
    let li = 0, i = 0, back = false;
    const step = () => {
      if (gen !== PH.gen) return;
      if (document.hidden || el.value || document.activeElement === el) { el.placeholder = lines[li % lines.length]; PH.timer = setTimeout(step, 900); return; }
      const s = lines[li % lines.length];
      if (!back) { i += 1; el.placeholder = s.slice(0, i) + '▍'; if (i >= s.length) { back = true; PH.timer = setTimeout(step, 2200); return; } PH.timer = setTimeout(step, 45); }
      else { i = Math.max(0, i - 3); el.placeholder = s.slice(0, i) + '▍'; if (!i) { back = false; li += 1; PH.timer = setTimeout(step, 300); return; } PH.timer = setTimeout(step, 18); }
    };
    step();
  }
  // ── 代码流：随手编的地址，故意带一个「0」（波场地址里根本没有 0 这个字）—— 永远不可能是真地址，没人能照着转钱 ──
  function stream() {
    const pick = () => B58[Math.floor(Math.random() * 58)];
    const one = () => { let s = 'T'; for (let k = 0; k < 33; k++) s += pick(); const at = 3 + Math.floor(Math.random() * 28); return s.slice(0, at) + '0' + s.slice(at + 1); };
    for (const id of ['fcS1', 'fcS2']) { const el = $$(id); if (el) { const t = Array.from({ length: 8 }, one).join('   '); el.textContent = t + '   ' + t; } }
  }

  // ── 快讯细条（每页最顶上）：一次一条，6 秒换；鼠标放上去就停；× 关掉 24 小时 ──
  const OFF_KEY = '0xnews_off';
  const NS = { i: 0, timer: null, hover: false, order: [] };
  function nsShow() {
    const el = $$('nsText'); if (!el || !NS.order.length) return;
    const x = NEWS[NS.order[NS.i % NS.order.length]], i = LI();
    el.textContent = x.d[i] + ' · ' + x.ch[i] + ' · ' + x.a[i] + ' — ' + x.w[i];
    el.dataset.cat = x.c;
  }
  function nsTick() { clearTimeout(NS.timer); NS.timer = setTimeout(() => { if (!NS.hover && !document.hidden) { NS.i += 1; nsShow(); } nsTick(); }, 6000); }
  function nsInit() {
    const bar = $$('nStrip'); if (!bar) return;
    let off = 0; try { off = Number(localStorage.getItem(OFF_KEY) || 0); } catch (e) {}
    if (Date.now() - off < 24 * 3600e3) { bar.hidden = true; return; }
    const cats = ['poison', 'key', 'fake', 'site', 'scale'], by = cats.map((c) => NEWS.map((x, k) => (x.c === c ? k : -1)).filter((k) => k >= 0));
    for (let r = 0; NS.order.length < NEWS.length; r++) for (const l of by) if (r < l.length) NS.order.push(l[r]);   // 五类轮流播
    NS.i = Math.floor(Math.random() * NS.order.length);
    bar.hidden = false; nsShow();
    if (!reducedMotion) nsTick();
    bar.addEventListener('mouseenter', () => { NS.hover = true; });
    bar.addEventListener('mouseleave', () => { NS.hover = false; });
    $$('nsX').addEventListener('click', () => { bar.hidden = true; clearTimeout(NS.timer); try { localStorage.setItem(OFF_KEY, String(Date.now())); } catch (e) {} });
    $$('nsText').addEventListener('click', () => openNews($$('nsText').dataset.cat));
  }

  // ── 首页三张新闻卡 + 「全部快讯」──
  const FEATURED = ['THc…bu8', 'A 50 USDT test went first', 'One gang poisoned 15 people'];
  function cards() {
    const el = $$('ncWrap'); if (!el) return;
    el.innerHTML = FEATURED.map(caseFind).filter(Boolean).map((x) => newsCard(x)).join('');
  }
  let CAT = 'all';
  function drawNews() {
    const i = LI(), f = $$('newsFilter'), list = $$('newsList'); if (!f || !list) return;
    f.innerHTML = ['all', ...Object.keys(NEWS_CAT)].map((c) => '<button type="button" class="chip' + (c === CAT ? ' active' : '') + '" data-cat="' + c + '">'
      + esc(c === 'all' ? T('catAll') + ' ' + NEWS.length : NEWS_CAT[c][i] + ' ' + NEWS.filter((x) => x.c === c).length) + '</button>').join('');
    list.innerHTML = NEWS.filter((x) => CAT === 'all' || x.c === CAT).map((x) => newsCard(x)).join('');
  }
  function openNews(cat) {
    CAT = cat && NEWS_CAT[cat] ? cat : 'all';
    drawNews(); $$('newsModal').hidden = false;
  }
  function wireNews() {
    const m = $$('newsModal'); if (!m) return;
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]'); if (b) { CAT = b.dataset.cat; drawNews(); return; }
      if (e.target.closest('[data-close-news]')) m.hidden = true;
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') m.hidden = true; });
    const all = $$('newsAllBtn'); if (all) all.addEventListener('click', () => openNews('all'));
  }

  // 切语言：页面上写死的字由 app.js 的 data-i18n 换；这里重画自己画出来的部分
  window.fcLang = function () {
    const set = (id, k) => { const el = $$(id); if (el) el.textContent = T(k); };
    set('fcTitle', 'title'); set('fcGo', 'go'); set('fcSub', 'sub'); set('fcSubWhy', 'subWhy'); set('fcMineSum', 'mineSum'); set('fcMineNote', 'mineNote');
    set('nsTag', 'nsTag'); set('ncHead', 'cardsH'); set('newsAllBtn', 'allBtn'); set('newsTitle', 'modalT');
    const mi = $$('fcMine'); if (mi) mi.placeholder = T('minePh');
    const x = $$('nsX'); if (x) x.title = T('nsHide');
    phRestart(); nsShow(); cards(); drawNews();
    if (last) render(last.r, last.own, last.mineN, last.note);
  };

  const form = $$('fcForm'); if (!form) return;
  form.addEventListener('submit', run);
  stream(); nsInit(); wireNews(); window.fcLang();
})();
