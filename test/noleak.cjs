// noleak.cjs —— 私钥外发检查（公开，任何人都能自己跑）。
//
// 用真浏览器打开网站那【一个文件】，把 6 步走完（造钥匙 → 下单 → 付款 → 铸造 → 取货合钥匙 → 收条），
// 截下页面发出去的每一个请求，逐个对照【白名单】：只许是下面几种，而且每个字段都要跟重算出来的值逐字相等 ——
//   下单      POST /api/orders            正好 {chain,prefix,suffix,payChain}，值 = 用户选的
//   传公钥    POST /api/orders/:id/share   正好 {A,sig}：A = s·G；sig = RFC6979 确定性签名(s, 挑战串)
//   取货      GET  /api/orders/:id/download?sig=  只许一个 sig = 确定性签名(s, 挑战串)
//   收条      POST /api/orders/:id/receipt 正好 {sig} = 确定性签名(完整私钥 k, 回执原文)
//   其余      查目录 / 查状态 / 要收款地址 / 模拟付款：不许带任何内容
// 签名是确定性的（RFC6979），随机数那一格没有空间藏东西；A 由 s 唯一决定。于是请求内容里没有一个字节能夹带私钥（请求的次数和时间间隔不在这项检查的范围内）。
// 另外还查：断网也能造钥匙；页面只取它自己这一个文件；除了平台接口不连任何别的地方；请求头没有自定义项。
//
// 用法：cd test && npm ci && npx playwright install --with-deps chromium
//       node noleak.cjs ../0x000000000.html ./mock-platform.mjs ./node_modules
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PAGE_FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', '0x000000000.html'));
const SERVER = path.resolve(process.argv[3] || path.join(__dirname, 'mock-platform.mjs'));
const NM = path.resolve(process.argv[4] || path.join(__dirname, 'node_modules'));
const PAGE_DIR = fs.mkdtempSync(path.join(require('os').tmpdir(), 'page_'));
fs.copyFileSync(PAGE_FILE, path.join(PAGE_DIR, 'index.html'));
const DATA = fs.mkdtempSync('/tmp/noleak_');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0; const chk = (ok, m) => { if (!ok) { fail++; console.log('  ★ ' + m); } else console.log('  ✓ ' + m); };

const srv = spawn(process.execPath, [SERVER], {
  cwd: DATA,
  env: { ...process.env, PORT: '8787', ALLOW_LOCAL_MASTER: '1', TRON_MODE: 'sim', RUNPOD_ENDPOINT_ID: '', RUNPOD_API_KEY: '',
         PRICE_JSON: JSON.stringify({ evm: { prefix: { 3: 1 } }, tron: { prefix: { 2: 1 }, suffix: { 2: 1 }, both: { 2: 1 } } }) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let slog = ''; srv.stdout.on('data', (d) => { slog += d; }); srv.stderr.on('data', (d) => { slog += d; });
const web = spawn('python3', ['-m', 'http.server', '8080', '--bind', '127.0.0.1'], { cwd: PAGE_DIR, stdio: 'ignore' });

function keyFromKeystore(ks, pw) {
  const c = ks.crypto || ks.Crypto, p = c.kdfparams;
  const dk = crypto.scryptSync(Buffer.from(pw), Buffer.from(p.salt, 'hex'), p.dklen, { N: p.n, r: p.r, p: p.p, maxmem: 512 * 1024 * 1024 });
  const d = crypto.createDecipheriv('aes-128-ctr', dk.subarray(0, 16), Buffer.from(c.cipherparams.iv, 'hex'));
  return Buffer.concat([d.update(Buffer.from(c.ciphertext, 'hex')), d.final()]).toString('hex');
}
const STD_HEADERS = new Set(['accept', 'accept-language', 'accept-encoding', 'content-type', 'content-length', 'origin', 'referer',
  'user-agent', 'connection', 'host', 'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-fetch-user',
  'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform', 'upgrade-insecure-requests', 'cache-control', 'pragma', 'priority']);

// DLONLY0X_20260924：同一个文件两种用法 —— 在 0x000000000.com 上打开只给下载、不许有 6 步；
//   下载到电脑上（file://）双击打开才有 6 步，而且一开始就断网也要能选 TRON、能造钥匙。
//   网站模式用 route 把这一个文件当成 https://0x000000000.com/ 送进浏览器，接口转给本机的平台 —— 一个字节都不碰真网站。
async function modes(browser) {
  const html = fs.readFileSync(path.join(PAGE_DIR, 'index.html'), 'utf8');
  const ctx1 = await browser.newContext();
  await ctx1.route('https://0x000000000.com/**', async (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/' || u.pathname === '/index.html') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
    if (u.pathname.startsWith('/api/')) return route.fulfill({ response: await route.fetch({ url: 'http://127.0.0.1:8787' + u.pathname + u.search }) });
    return route.abort();
  });
  const p1 = await ctx1.newPage(); const errs = []; p1.on('pageerror', (e) => errs.push(e.message));
  await p1.goto('https://0x000000000.com/'); await sleep(1500);
  const site = await p1.evaluate(() => ({ gate: !document.querySelector('#dlGate').hidden, flow: !document.querySelector('#flowWrap').hidden,
    genShown: !!(document.querySelector('#btnGen') && document.querySelector('#btnGen').offsetParent),
    dl: document.querySelector('#dlPage2') ? document.querySelector('#dlPage2').getAttribute('href') : null }));
  await ctx1.close();
  const f = path.join(DATA, 'offline-copy.html'); fs.writeFileSync(f, html);
  const ctx2 = await browser.newContext({ acceptDownloads: true, offline: true });
  const p2 = await ctx2.newPage(); p2.on('pageerror', (e) => errs.push(e.message));
  await p2.goto('file://' + f); await sleep(1500);
  const file = await p2.evaluate(() => ({ gate: !document.querySelector('#dlGate').hidden, flow: !document.querySelector('#flowWrap').hidden,
    chains: [...document.querySelectorAll('#chainPick [data-chain]')].map((b) => b.dataset.chain),
    nets: document.querySelectorAll('#steps .netline').length }));
  let secChain = null;
  try {
    await p2.click('#chainPick [data-chain="tron"]'); await sleep(200);
    await p2.fill('#orderPat', 'TX'); await p2.dispatchEvent('#orderPat', 'input');
    const [d] = await Promise.all([p2.waitForEvent('download', { timeout: 15000 }), p2.click('#btnGen')]);
    secChain = JSON.parse(fs.readFileSync(await d.path(), 'utf8')).chain || null;
  } catch (e) { errs.push('断网造 TRON 钥匙没做成：' + e.message.split('\n')[0]); }
  await ctx2.close();
  return { site, file, secChain, errs };
}

// NETSYNC0X_20260924：下载版【断网打开、后来联网】—— 付款链要补全、第 3 步要换成真收款字样，而且不许只靠浏览器的 online 事件
//   （Windows 上有虚拟网卡时，拔了网浏览器也以为自己在线，事件根本不来 —— 20260924 实测第 2 步只剩 TRON）。
//   silent = 网是断的但浏览器以为在线（没有事件）· event = 浏览器知道断网，连上时有 online 事件 · up = 一直在线。
//   /api/health 在线路上改成 live：测的是页面怎么补拿，不是平台。
async function netsync(browser) {
  const html = fs.readFileSync(path.join(PAGE_DIR, 'index.html'), 'utf8');
  const res = [], ctxs = []; const ok = (c, m) => res.push([!!c, m]);
  const open = async (net) => {
    const st = { NET: net === 'up', orders: [] };
    const c = await browser.newContext({ acceptDownloads: true, offline: net === 'event' }); ctxs.push(c);
    await c.addInitScript(() => { try { localStorage.setItem('0xlang', 'zh'); } catch (e) {} });
    await c.route('https://0x000000000.com/**', async (r) => {
      const u = new URL(r.request().url());
      if (!st.NET || !u.pathname.startsWith('/api/')) return r.abort('internetdisconnected');
      if (u.pathname === '/api/orders' && r.request().method() === 'POST') st.orders.push(JSON.parse(r.request().postData() || '{}'));
      let resp; try { resp = await r.fetch({ url: 'http://127.0.0.1:8787' + u.pathname + u.search }); } catch (e) { return r.abort('connectionrefused'); }
      if (u.pathname === '/api/health') { const j = await resp.json(); j.mode = 'live'; return r.fulfill({ response: resp, body: JSON.stringify(j) }); }
      return r.fulfill({ response: resp });
    });
    const f = path.join(DATA, 'netsync-' + net + '-' + ctxs.length + '.html'); fs.writeFileSync(f, html);
    const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + f); await sleep(1200);
    await p.click('#chainPick [data-chain="tron"]'); await p.fill('#orderPat', 'TXo'); await p.dispatchEvent('#orderPat', 'input');
    await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.click('#btnGen')]); await sleep(300);
    return { p, st, errs,
      up: async () => { st.NET = true; if (net === 'event') await c.setOffline(false); },
      pays: () => p.$$eval('#payChain option', (os) => os.map((o) => o.value).join(' / ')),
      out2: async () => (await p.textContent('#out2')) || '',
      btnPay: async () => (await p.textContent('#btnPay')) || '',
      paid: () => p.evaluate(() => !document.querySelector('#payInfo').hidden),
      placed: () => p.waitForFunction(() => !document.querySelector('#payInfo').hidden, null, { timeout: 15000 }).catch(() => {}) };
  };
  const run = async (name, fn) => { try { await fn(); } catch (e) { ok(false, name + ' 没走完：' + String(e.message).split('\n')[0].slice(0, 100)); } };
  await run('断网打开 · 没有 online 事件 · 直接点下单', async () => {
    const x = await open('silent');
    ok((await x.pays()) === 'tron' && /还没联网/.test(await x.p.textContent('#payChainNote')), '断网打开：付款链只有缺省那一条，并且写明要联网才看得全');
    await x.up(); await x.p.click('#btnCreate'); await sleep(1500);
    ok(/付款方式刚取到/.test(await x.out2()) && x.st.orders.length === 0, '连上网（浏览器没发 online 事件）直接点下单：先补拿付款链、不建单、叫他先选');
    ok((await x.pays()) === 'tron / bsc', '补拿之后付款链有 TRON 和 BSC（' + (await x.pays()) + '）');
    ok(/我转好了/.test(await x.btnPay()), '第 3 步换成了真收款字样（' + (await x.btnPay()) + '）');
    await x.p.selectOption('#payChain', 'bsc', { timeout: 3000 }); await x.p.click('#btnCreate'); await x.placed();
    ok(x.st.orders.length === 1 && x.st.orders[0].payChain === 'bsc' && await x.paid(), '选了 BSC 再点下单：建单用的就是 BSC，付款信息出来了');
    ok(x.errs.length === 0, '页面没有报错' + (x.errs.length ? '：' + x.errs.join(' | ') : ''));
  });
  await run('断网打开 · 没有 online 事件 · 先点付款链', async () => {
    const x = await open('silent'); await x.up();
    await x.p.click('#payChain'); await x.p.keyboard.press('Escape'); await sleep(1500);
    ok((await x.pays()) === 'tron / bsc', '连上网后点一下付款链：TRON 和 BSC 都出来了（' + (await x.pays()) + '）');
    await x.p.selectOption('#payChain', 'bsc', { timeout: 3000 }); await x.p.click('#btnCreate'); await x.placed();
    ok(x.st.orders.length === 1 && x.st.orders[0].payChain === 'bsc' && !/付款方式刚取到/.test(await x.out2()) && await x.paid(), '选好 BSC 点下单：一次就建单，不再多问');
  });
  await run('一直在线', async () => {
    const x = await open('up');
    ok((await x.pays()) === 'tron / bsc', '一直在线：付款链一打开就是 TRON 和 BSC');
    await x.p.click('#btnCreate'); await x.placed();
    ok(x.st.orders.length === 1 && !/付款方式刚取到/.test(await x.out2()) && await x.paid(), '一直在线点下单：直接建单，不多问一句');
  });
  await run('断网打开 · 有 online 事件', async () => {
    const x = await open('event'); await x.up(); await sleep(1500);
    ok((await x.pays()) === 'tron / bsc' && /我转好了/.test(await x.btnPay()), '浏览器知道断网又连上：自己补到 TRON 和 BSC，第 3 步是真收款字样');
    await x.p.click('#btnCreate'); await sleep(800);
    ok(/付款方式刚取到/.test(await x.out2()) && x.st.orders.length === 0, '付款链是背后补到的、他还没看过：点下单先叫他选一次');
  });
  for (const c of ctxs) await c.close().catch(() => {});
  return res;
}

// MINTLIVE4_20260924：DSJ「付了钱但是没反应」。第 4 步要一直有一行在动：等到账（等了多久）→ 正在铸造（算了多久）→ 铸好了。
//   订单状态在线路上按 FAKE 改（平台是什么不重要，测的是页面怎么显示）；只报「已经多久」，不许出现「还要多久」。
async function mint4(browser) {
  const html = fs.readFileSync(path.join(PAGE_DIR, 'index.html'), 'utf8');
  const res = []; const ok = (c, m) => res.push([!!c, m]);
  const FAKE = { status: null, paidAt: null, found: null };
  const open = async (lang) => {
    const c = await browser.newContext({ acceptDownloads: true });
    await c.addInitScript((l) => { try { localStorage.setItem('0xlang', l); } catch (e) {} }, lang);
    await c.route('https://0x000000000.com/**', async (r) => {
      const u = new URL(r.request().url());
      if (!u.pathname.startsWith('/api/')) return r.abort();
      let resp; try { resp = await r.fetch({ url: 'http://127.0.0.1:8787' + u.pathname + u.search }); } catch (e) { return r.abort('connectionrefused'); }
      if (u.pathname === '/api/health') { const j = await resp.json(); j.mode = 'live'; return r.fulfill({ response: resp, body: JSON.stringify(j) }); }
      if (/^\/api\/orders\/[0-9a-f]{8}$/.test(u.pathname) && r.request().method() === 'GET' && FAKE.status) {
        const j = await resp.json(); j.status = FAKE.status; j.paidAt = FAKE.paidAt;
        if (FAKE.found) { j.foundAddress = FAKE.found; j.ready = true; }
        return r.fulfill({ response: resp, body: JSON.stringify(j) });
      }
      return r.fulfill({ response: resp });
    });
    const f = path.join(DATA, 'mint4-' + lang + '.html'); fs.writeFileSync(f, html);
    const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + f); await sleep(1200);
    return { c, p, errs };
  };
  const run = async (name, fn) => { try { await fn(); } catch (e) { ok(false, name + ' 没走完：' + String(e.message).split('\n')[0].slice(0, 100)); } };
  await run('第 4 步在动的那一行', async () => {
    const { c, p, errs } = await open('zh');
    await p.click('#chainPick [data-chain="tron"]'); await p.fill('#orderPat', 'TXo'); await p.dispatchEvent('#orderPat', 'input');
    await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.click('#btnGen')]); await sleep(300);
    await p.click('#btnCreate');
    await p.waitForFunction(() => !document.querySelector('#payInfo').hidden, null, { timeout: 15000 });
    ok(/我们正在开始铸造/.test(await p.textContent('#steps > li:nth-child(4) .step-head')), '第 4 步标题是「我们正在开始铸造」');
    ok(await p.evaluate(() => { const b = document.querySelector('#mintLive'); return !!b && b.hidden; }), '还没付款时第 4 步那一行藏着');
    FAKE.status = 'share_uploaded';
    await p.click('#btnPay'); await sleep(2800);
    const w1 = (await p.textContent('#mintText')) || '';
    ok(/等你的付款到账/.test(w1), '点了「我转好了」：第 4 步马上出现「等你的付款到账」（' + w1.slice(0, 24) + '）');
    await sleep(1600);
    ok(((await p.textContent('#mintText')) || '') !== w1, '「已经等了多久」每秒在走');
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.mint-anim i')).animationName) === 'mintdot', '小动画在跳');
    await p.evaluate(() => { MINT.since = Date.now() - 11 * 60 * 1000; }); await sleep(1300);
    ok(await p.evaluate(() => !document.querySelector('#mintNote').hidden && /订单号/.test(document.querySelector('#mintNote').textContent)),
      '等了 10 分钟以上：出现「核对链、地址、金额，别再转，把订单号发给我们」');
    FAKE.status = 'mining'; FAKE.paidAt = Date.now() - 95 * 1000; await sleep(3500);
    const r1 = (await p.textContent('#mintText')) || '';
    ok(/正在铸造 · 已经算了 1 分/.test(r1), '钱到了：变成「正在铸造 · 已经算了 1 分多」（' + r1 + '）');
    ok(!/还要|剩下|预计|大约还/.test(r1 + ((await p.textContent('#mintNote')) || '')), '铸造时只报「已经多久」，没有「还要多久」');
    ok(/铸造中/.test((await p.textContent('#ordersBody')) || ''), '最下面「我的订单」跟着变成「铸造中」（不用重新打开页面）');
    FAKE.status = 'found'; FAKE.found = 'TXoAbCdEfGhJkLmNpQrStUvWxYz1234567'; await sleep(3500);
    const d1 = (await p.textContent('#mintText')) || '';
    ok(/铸好了/.test(d1) && /第 5 步/.test((await p.textContent('#mintNote')) || '') && !(await p.isDisabled('#btnDownload')),
      '铸好了：「铸好了 ✓」+ 叫他去第 5 步 + 取货按钮能点（' + d1 + '）');
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.mint-anim')).display) === 'none', '铸好了之后小动画收起');
    await sleep(1300);
    ok(((await p.textContent('#mintText')) || '') === d1, '铸好了之后不再计时');
    ok(/已铸出/.test((await p.textContent('#ordersBody')) || ''), '「我的订单」跟着变成「已铸出」');
    ok(errs.length === 0, '第 4 步这一段页面没报错' + (errs.length ? '：' + errs.join(' | ') : ''));
    FAKE.status = null; FAKE.paidAt = null; FAKE.found = null;
    await c.close();
  });
  await run('英文界面的付款说明', async () => {
    const { c, p, errs } = await open('en');
    await p.waitForFunction(() => document.querySelectorAll('#payChain option').length > 1, null, { timeout: 8000 }).catch(() => {});
    const note = (await p.textContent('#payChainNote')) || '';
    ok(/confirmations/.test(note) && !/[一-鿿]/.test(note), '英文界面第 2 步付款方式下面那行没有中文（' + note.slice(0, 50) + '）');
    ok(/starting to mint/.test((await p.textContent('#steps > li:nth-child(4) .step-head')) || ''), '英文界面第 4 步标题');
    ok(errs.length === 0, '英文界面页面没报错');
    await c.close();
  });
  return res;
}

// NETSYNCALL0X_20260924：「断网打开、后来联网」不再一样一样地查，而是整页对照：
//   A = 一直在线打开 · B = 断网打开（浏览器以为自己在线、没有 online 事件）→ 联网 → 碰一下第 2 步和「我的订单」。
//   两份页面上每一步的字、选项、价格提示、付款说明、「我的订单」必须逐项一样。以后页面再加一样开机时才拿的东西，
//   它没补拿就会在这里对不上 —— 不用再等用户撞到。
async function offlineAll(browser) {
  const html = fs.readFileSync(path.join(PAGE_DIR, 'index.html'), 'utf8');
  const res = []; const ok = (c, m) => res.push([!!c, m]);
  const mk = await (await fetch('http://127.0.0.1:8787/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chain: 'tron', prefix: 'TXo', suffix: '', payChain: 'tron' }) })).json();
  const oid = mk.orderId;
  ok(/^[0-9a-f]{8}$/.test(oid || ''), '先在平台上建一张单，放进两份页面的「我的订单」（' + oid + '）');
  const snap = () => ({
    heads: [...document.querySelectorAll('#steps > li .step-head')].map((e) => e.textContent),
    nets: [...document.querySelectorAll('#steps > li .netline')].map((e) => e.textContent),
    descs: [...document.querySelectorAll('#steps > li > .step-desc')].map((e) => e.textContent),
    hint: (document.querySelector('#patHint') || {}).textContent || '',
    chains: [...document.querySelectorAll('#chainPick [data-chain]')].map((b) => b.dataset.chain),
    pos: [...document.querySelectorAll('#orderPos option')].map((o) => o.value),
    pay: [...document.querySelectorAll('#payChain option')].map((o) => o.value + ':' + o.textContent),
    payNote: (document.querySelector('#payChainNote') || {}).textContent || '',
    btnPay: (document.querySelector('#btnPay') || {}).textContent || '',
    orders: ((document.querySelector('#ordersBody') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
  });
  const open = async (silent) => {
    const st = { NET: !silent };
    const c = await browser.newContext({ acceptDownloads: true });
    await c.addInitScript((id) => { try { localStorage.setItem('0xlang', 'zh'); localStorage.setItem('0x_myorders', JSON.stringify([id])); } catch (e) {} }, oid);
    await c.route('https://0x000000000.com/**', async (r) => {
      const u = new URL(r.request().url());
      if (!st.NET || !u.pathname.startsWith('/api/')) return r.abort('internetdisconnected');
      let resp; try { resp = await r.fetch({ url: 'http://127.0.0.1:8787' + u.pathname + u.search }); } catch (e) { return r.abort('connectionrefused'); }
      if (u.pathname === '/api/health') { const j = await resp.json(); j.mode = 'live'; return r.fulfill({ response: resp, body: JSON.stringify(j) }); }
      return r.fulfill({ response: resp });
    });
    const f = path.join(DATA, 'offall-' + (silent ? 'b' : 'a') + '.html'); fs.writeFileSync(f, html);
    const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + f); await sleep(1500);
    return { c, p, st, errs };
  };
  try {
    const A = await open(false); await sleep(800);
    const a = await A.p.evaluate(snap);
    const B = await open(true);
    B.st.NET = true;
    await B.p.click('#payChain'); await B.p.keyboard.press('Escape');
    await B.p.click('#secOrders'); await sleep(2500);
    const b = await B.p.evaluate(snap);
    const diff = Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    ok(diff.length === 0, '断网打开、联网后碰一下：整页跟一直在线那份逐项一样' + (diff.length ? '（不一样的：' + diff.map((k) => k + ' → ' + JSON.stringify(b[k]).slice(0, 60)).join(' ｜ ') + '）' : ''));
    ok(a.orders.includes(oid) && a.pay.length >= 2 && a.nets.length === 6, '对照的那份本身是完整的（订单在、付款方式 ' + a.pay.length + ' 条、6 步都有联网说明）');
    ok(A.errs.length === 0 && B.errs.length === 0, '两份页面都没报错' + ([...A.errs, ...B.errs].length ? '：' + [...A.errs, ...B.errs].join(' | ') : ''));
    await A.c.close(); await B.c.close();
  } catch (e) { ok(false, '整页对照没走完：' + String(e.message).split('\n')[0].slice(0, 100)); }
  return res;
}

async function walk(browser, N, chain, pos, pre, suf) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { localStorage.setItem('0xlang', 'zh'); } catch (e) {} });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  const wire = [], resp = [];
  page.on('request', async (r) => { const x = { url: r.url(), method: r.method(), body: r.postData() || '', headers: null }; wire.push(x);
    try { x.headers = await r.allHeaders(); } catch (e) { x.headers = r.headers(); } });
  page.on('response', async (r) => { if (new URL(r.url()).port === '8787') { try { resp.push(await r.json()); } catch (e) {} } });
  page.on('websocket', (ws) => { wire.push({ url: ws.url(), method: 'WS', body: '', headers: {} }); });
  await page.goto('http://127.0.0.1:8080/#secOrder'); await sleep(1500);
  if (chain === 'tron') { await page.click('#chainPick [data-chain="tron"]'); await sleep(300); }
  await page.selectOption('#orderPos', pos); await page.dispatchEvent('#orderPos', 'change');
  await page.fill('#orderPat', pos === 'suffix' ? suf : pre); await page.dispatchEvent('#orderPat', 'input');
  if (pos === 'both') { await page.fill('#orderPat2', suf); await page.dispatchEvent('#orderPat2', 'input'); }
  const before = wire.length;
  await ctx.setOffline(true);
  const [dl1] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('#btnGen')]);
  const secPath = path.join(DATA, chain + pos + '-secret.json'); await dl1.saveAs(secPath);
  const offlineReq = wire.length - before;
  await ctx.setOffline(false);
  const s = JSON.parse(fs.readFileSync(secPath, 'utf8')).s;
  await page.click('#btnCreate');
  await page.waitForFunction(() => !document.querySelector('#payInfo').hidden, null, { timeout: 15000 });
  await page.click('#btnPay');
  await page.waitForFunction(() => /可以取货/.test(document.querySelector('#out4').textContent), null, { timeout: 90000 });
  await page.click('#btnDownload');
  await page.waitForFunction(() => /拿到了/.test(document.querySelector('#out5').textContent), null, { timeout: 15000 });
  // MERGESPLIT0X_20260924：拿到另一半之后断网，再合成、再导出钱包 —— 这两步期间页面一个请求都不许发
  const before2 = wire.length;
  await ctx.setOffline(true);
  await page.click('#btnMerge');
  await page.waitForFunction(() => /合成成功/.test(document.querySelector('#out5').textContent), null, { timeout: 15000 });
  await page.fill('#ksPw', 'test-password-123');
  const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('#btnKs')]);
  const ksPath = path.join(DATA, chain + pos + '-ks.json'); await dl2.saveAs(ksPath);
  const offlineReq2 = wire.length - before2;
  await ctx.setOffline(false);
  const k = keyFromKeystore(JSON.parse(fs.readFileSync(ksPath, 'utf8')), 'test-password-123');
  await page.click('#btnReceipt');
  await page.waitForFunction(() => /收条收到了/.test(document.querySelector('#out6').textContent), null, { timeout: 15000 });
  await sleep(500);
  await ctx.close();
  return { s, k, wire, resp, offlineReq, offlineReq2, errs };
}

(async () => {
  let browser;
  try {
    const { pathToFileURL } = require('url');
    const N = await import(pathToFileURL(path.join(NM, '@noble/secp256k1/index.js')).href);
    const { keccak_256 } = await import(pathToFileURL(path.join(NM, '@noble/hashes/sha3.js')).href);
    const { hmac } = await import(pathToFileURL(path.join(NM, '@noble/hashes/hmac.js')).href);
    const { sha256 } = await import(pathToFileURL(path.join(NM, '@noble/hashes/sha256.js')).href);
    N.etc.hmacSha256Sync = (key, ...m) => hmac(sha256, key, N.etc.concatBytes(...m));
    const hex = (u) => Buffer.from(u).toString('hex');
    const detSig = (priv, msg) => hex(N.sign(keccak_256(Buffer.from(msg, 'utf8')), Buffer.from(priv, 'hex')).toCompactRawBytes());
    const pubOf = (priv) => hex(N.getPublicKey(Buffer.from(priv, 'hex'), false));
    for (let i = 0; i < 40; i++) { await sleep(250); try { const r = await fetch('http://127.0.0.1:8787/api/health'); if (r.ok) break; } catch (e) {} }
    browser = await chromium.launch();
    const CASES = process.env.ONLY_ONE ? [['evm', 'prefix', 'abc', '']]
      : [['evm', 'prefix', 'abc', ''], ['tron', 'suffix', '', 'oo'], ['tron', 'both', 'TX', 'o']];
    for (const [chain, pos, pre, suf] of CASES) {
      console.log(`== ${chain} ${pos} ${pre}…${suf} ==`);
      const w = await walk(browser, N, chain, pos, pre, suf);
      chk(w.offlineReq === 0, `断网点「造钥匙」照样成功，期间请求 ${w.offlineReq} 个`);
      chk(w.offlineReq2 === 0, `拿到另一半后断网：「合成我的钥匙」「导出钱包」照样成功，期间请求 ${w.offlineReq2} 个`);
      const challenge = (w.resp.find((j) => j && typeof j.challenge === 'string') || {}).challenge;
      const receiptMsg = (w.resp.find((j) => j && typeof j.receiptChallenge === 'string') || {}).receiptChallenge;
      chk(!!challenge && !!receiptMsg, '从平台回包里拿到了挑战串和回执原文（重算签名要用）');
      const pageReq = w.wire.filter((x) => new URL(x.url).port === '8080');
      chk(pageReq.length === 1, `页面本身只取了 ${pageReq.length} 个文件（要 1 个：单文件）`);
      const other = w.wire.filter((x) => !['8080', '8787'].includes(new URL(x.url).port) || new URL(x.url).hostname !== '127.0.0.1');
      chk(other.length === 0, '除了页面自己和平台接口，没连任何别的地方' + (other.length ? '：' + other.map((x) => x.url).join(', ') : ''));
      let bad = 0, n = 0; const kinds = {};
      const no = (m) => { bad++; console.log('     ✗ ' + m); };
      for (const x of w.wire.filter((y) => new URL(y.url).port === '8787')) {
        n++;
        const u = new URL(x.url), p = u.pathname, q = [...u.searchParams.keys()];
        let body = null; if (x.body) { try { body = JSON.parse(x.body); } catch (e) { no('请求体不是 JSON：' + x.body.slice(0, 80)); continue; } }
        const keys = body ? Object.keys(body).sort().join(',') : '';
        const hdr = Object.keys(x.headers || {}).map((h) => h.toLowerCase()).filter((h) => !STD_HEADERS.has(h));
        if (hdr.length) no(`${x.method} ${p} 带了非标准请求头：${hdr.join(',')}`);
        let kind = null;
        if (x.method === 'OPTIONS') kind = 'preflight';
        else if (x.method === 'GET' && (p === '/api/catalog' || p === '/api/health')) kind = p.slice(5);
        else if (x.method === 'POST' && p === '/api/orders') {
          kind = 'create';
          if (keys !== 'chain,payChain,prefix,suffix') no('下单带了多余/缺少的字段：' + keys);
          else if (body.chain !== chain || body.prefix !== pre || body.suffix !== suf || body.payChain !== 'tron') no('下单字段值跟用户选的不一致：' + x.body);
        } else if (/^\/api\/orders\/[0-9a-f]{8}\/share$/.test(p) && x.method === 'POST') {
          kind = 'share';
          if (keys !== 'A,sig') no('传影子带了多余/缺少的字段：' + keys);
          else {
            if (body.A.replace(/^0x/, '').toLowerCase() !== pubOf(w.s)) no('A 不等于 s·G');
            if (body.sig !== detSig(w.s, challenge.trim())) no('传影子的签名不是确定性签名（随机数那一格可能在夹带）');
          }
        } else if (/^\/api\/orders\/[0-9a-f]{8}\/download$/.test(p) && x.method === 'GET') {
          kind = 'download';
          if (q.join(',') !== 'sig') no('取货带了别的参数：' + q.join(','));
          else if (u.searchParams.get('sig') !== detSig(w.s, challenge.trim())) no('取货签名不是确定性签名');
        } else if (/^\/api\/orders\/[0-9a-f]{8}\/receipt$/.test(p) && x.method === 'POST') {
          kind = 'receipt';
          if (keys !== 'sig') no('收条带了多余/缺少的字段：' + keys);
          else if (body.sig !== detSig(w.k, receiptMsg.replace(/\r\n/g, '\n').replace(/\s+$/, ''))) no('收条签名不是用合出来的 k 做的确定性签名');
        } else if (/^\/api\/orders\/[0-9a-f]{8}(\/payment)?$/.test(p) && x.method === 'GET') kind = p.endsWith('payment') ? 'payment' : 'status';
        else if (/^\/api\/orders\/[0-9a-f]{8}\/pay-sim$/.test(p) && x.method === 'POST') kind = 'paysim';
        if (!kind) { no('不认识的请求：' + x.method + ' ' + x.url); continue; }
        if (['catalog', 'health', 'status', 'payment', 'paysim', 'preflight'].includes(kind) && (x.body || q.length)) no(kind + ' 不该带任何内容，却带了：' + (x.body || u.search));
        kinds[kind] = (kinds[kind] || 0) + 1;
      }
      chk(bad === 0 && n >= 8 && kinds.share === 1 && kinds.download >= 1 && kinds.receipt === 1 && kinds.create === 1,
        `白名单：打平台的 ${n} 个请求逐个核对，不合格 ${bad} 个 · ${JSON.stringify(kinds)}`);
      chk(w.errs.length === 0, '页面没有报错' + (w.errs.length ? '：' + w.errs.join(' | ') : ''));
    }
    console.log('== 网站模式 / 下载到电脑模式 ==');
    const m = await modes(browser);
    chk(m.site.gate && !m.site.flow && !m.site.genShown && m.site.dl === '0x000000000.html',
      '当成 https://0x000000000.com/ 打开：只有「下载铸造页面」，6 步不显示 · ' + JSON.stringify(m.site));
    chk(!m.file.gate && m.file.flow && m.file.nets === 6, '下载到电脑上打开（file://）：6 步都在，每一步都标了断网/联网（' + m.file.nets + ' 条）');
    chk(m.file.chains.includes('evm') && m.file.chains.includes('tron'), '一开始就断网也能选 TRON（' + m.file.chains.join(' / ') + '）');
    chk(m.secChain === 'tron', '断网选 TRON 造出来的钥匙备份就是 TRON 的（' + m.secChain + '）');
    chk(m.errs.length === 0, '两种打开方式页面都没有报错' + (m.errs.length ? '：' + m.errs.join(' | ') : ''));
    console.log('== 下载版断网打开、后来联网 ==');
    for (const [c, msg] of await netsync(browser)) chk(c, msg);
    console.log('== 第 4 步：等到账 / 正在铸造 / 铸好了 ==');
    for (const [c, msg] of await mint4(browser)) chk(c, msg);
    console.log('== 下载版断网打开：整页跟一直在线那份对照 ==');
    for (const [c, msg] of await offlineAll(browser)) chk(c, msg);
  } catch (e) {
    fail++; console.log('  ★ 走到一半炸了：' + e.message.split('\n')[0]); console.log(slog.slice(-800));
  } finally {
    if (browser) await browser.close();
    srv.kill('SIGKILL'); web.kill('SIGKILL');
    fs.rmSync(DATA, { recursive: true, force: true });
    console.log(`  ---- 不合格 ${fail} 处 ----`);
    process.exit(fail ? 1 : 0);
  }
})();
