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
  await page.waitForFunction(() => /合成成功/.test(document.querySelector('#out5').textContent), null, { timeout: 15000 });
  await page.fill('#ksPw', 'test-password-123');
  const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('#btnKs')]);
  const ksPath = path.join(DATA, chain + pos + '-ks.json'); await dl2.saveAs(ksPath);
  const k = keyFromKeystore(JSON.parse(fs.readFileSync(ksPath, 'utf8')), 'test-password-123');
  await page.click('#btnReceipt');
  await page.waitForFunction(() => /收条收到了/.test(document.querySelector('#out6').textContent), null, { timeout: 15000 });
  await sleep(500);
  await ctx.close();
  return { s, k, wire, resp, offlineReq, errs };
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
