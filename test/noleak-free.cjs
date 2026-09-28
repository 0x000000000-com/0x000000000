// noleak-free.cjs —— 免费生成页的私钥外发检查（公开，任何人都能自己跑）。FREEGEN0X_20260928
// Private-key leak check for the Free Generator page (public; anyone can run it).
//
// 用真浏览器打开网站上那【一个文件】（0x000000000-free.html），真的生成几个地址，逐个核对：
//   ① 页面发出去的请求：除了打开页面那一次，一个都没有（没有接口、没有图片、没有字体、没有 WebSocket）
//   ② 断网也能生成：先打开再断网；另一种是下载下来、一开始就断网双击打开
//   ③ 存下来的钱包文件，用你设的密码解开，得到的钥匙算出来的地址 = 页面上显示的那个地址，而且对得上图案
//   ④ 只钉开头、最多 5 位（FREEPRE0X_20260928：钉结尾拿掉了，不给 7 位）：页面上没有「钉哪一头」的选项；超过 5 位的打不进去，判法也不认
// 用法：cd test && npm ci && npx playwright install --with-deps chromium
//       node noleak-free.cjs ../0x000000000-free.html ./node_modules
const { chromium } = require('playwright');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const PAGE_FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', '0x000000000-free.html'));
const NM = path.resolve(process.argv[3] || path.join(__dirname, 'node_modules'));
const html = fs.readFileSync(PAGE_FILE, 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0; const chk = (ok, m) => { if (!ok) { fail++; console.log('  ★ ' + m); } else console.log('  ✓ ' + m); };
const PW = 'a long test password 42';
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(buf) { let n = BigInt('0x' + buf.toString('hex')), s = ''; while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n; } for (const b of buf) { if (b === 0) s = '1' + s; else break; } return s; }

(async () => {
  const N = await import(pathToFileURL(path.join(NM, '@noble/secp256k1/index.js')).href);
  const { keccak_256 } = await import(pathToFileURL(path.join(NM, '@noble/hashes/sha3.js')).href);
  const sha = (b) => crypto.createHash('sha256').update(b).digest();
  function addrOfKey(hexKey, chain) {
    const pub = N.getPublicKey(Buffer.from(hexKey, 'hex'), false);
    const h20 = Buffer.from(keccak_256(pub.subarray(1))).subarray(12);
    if (chain === 'evm') return '0x' + h20.toString('hex');
    const body = Buffer.concat([Buffer.from([0x41]), h20]);
    return b58(Buffer.concat([body, sha(sha(body)).subarray(0, 4)]));
  }
  function openKeystore(ks) {
    const c = ks.crypto, p = c.kdfparams;
    const dk = crypto.scryptSync(Buffer.from(PW), Buffer.from(p.salt, 'hex'), p.dklen, { N: p.n, r: p.r, p: p.p, maxmem: 512 * 1024 * 1024 });
    const mac = Buffer.from(keccak_256(Buffer.concat([dk.subarray(16, 32), Buffer.from(c.ciphertext, 'hex')]))).toString('hex');
    const d = crypto.createDecipheriv('aes-128-ctr', dk.subarray(0, 16), Buffer.from(c.cipherparams.iv, 'hex'));
    return { key: Buffer.concat([d.update(Buffer.from(c.ciphertext, 'hex')), d.final()]).toString('hex'), macOk: mac === c.mac };
  }
  const browser = await chromium.launch();
  const all = [];
  async function generate(page, chain, where, pat) {
    await page.click(`#chainPick [data-chain="${chain}"]`);   // FREEPRE0X：只钉开头，没有「钉哪一头」可点
    await page.fill('#patIn', pat); await sleep(100);
    await page.click('#btnGo');
    await page.waitForSelector('#ksBox:not([hidden])', { timeout: 120000 });
    const shown = (await page.textContent('.fg-addr code')).trim();
    await page.fill('#ksPw', PW); await page.fill('#ksPw2', PW);
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('#btnKs')]);
    const ks = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    const { key, macOk } = openKeystore(ks);
    const derived = addrOfKey(key, chain);
    const body = chain === 'evm' ? shown.slice(2) : shown;
    const hit = where === 'prefix' ? body.startsWith(chain === 'tron' ? 'T' + pat : pat) : body.endsWith(pat);
    await page.click('#btnAgain');
    return { shown, derived, macOk, hit, name: dl.suggestedFilename() };
  }
  try {
    // ── 网站模式：https://0x000000000.com/free 送这一个文件（本机，不碰真网站），打开之后断网 ──
    const ctx = await browser.newContext({ acceptDownloads: true });
    ctx.on('request', (r) => all.push(r.url()));
    await ctx.route('**/*', (route) => {
      const u = route.request().url();
      if (u === 'https://0x000000000.com/free') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
      return route.abort();
    });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    let ws = 0; page.on('websocket', () => { ws++; });
    await page.goto('https://0x000000000.com/free'); await sleep(800);
    await ctx.setOffline(true); await sleep(300);
    const where = await page.$$eval('#wherePick [data-where]', (b) => b.length);
    chk(where === 0, '只钉开头：页面上没有「钉哪一头」的选项（找到 ' + where + ' 个）');
    for (const [c, w, p] of [['evm', 'prefix', 'abc'], ['tron', 'prefix', 'Xo'], ['tron', 'prefix', 'X']]) {
      const r = await generate(page, c, w, p);
      chk(r.macOk && r.derived === r.shown && r.hit, `${c} ${w} 「${p}」：页面显示 ${r.shown}；钱包文件（${r.name}）用密码解开 → 钥匙算出来的地址一样、对得上图案`);
    }
    // 超过上限：输入框最多收 5 个字，多的打不进去；页面里的判法也不认（有人改输入框也没用）：6 位、钉结尾、两头都钉
    await page.click('#chainPick [data-chain="evm"]'); await page.fill('#patIn', '1234567'); await sleep(100);
    const v1 = await page.inputValue('#patIn');
    await page.click('#chainPick [data-chain="tron"]'); await page.fill('#patIn', 'Abcdefg'); await sleep(100);
    const v2 = await page.inputValue('#patIn');
    const rule = await page.evaluate(() => [FreeGen.problem('evm', 'prefix', '123456'), FreeGen.problem('tron', 'prefix', 'TAbcdef'), FreeGen.problem('evm', 'suffix', 'ab'), FreeGen.problem('tron', 'suffix', 'oo'), FreeGen.problem('evm', 'both', 'ab')].every((x) => x !== null));
    chk(v1.length <= 5 && v2.length <= 5 && rule, `超过上限打不进去（以太坊类只收下 ${v1.length} 位、波场 ${v2.length} 位）；判法也不认 6 位 / 钉结尾 / 两头都钉`);
    chk(errs.length === 0, '页面没有报错' + (errs.length ? '：' + errs.slice(0, 2).join(' | ') : ''));
    chk(ws === 0, '没有 WebSocket');
    await ctx.close();
    // ── 下载模式：一开始就断网，双击打开下载下来的文件 ──
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fg_')), f = path.join(dir, '0x000000000-free.html');
    fs.writeFileSync(f, html);
    const ctx2 = await browser.newContext({ acceptDownloads: true, offline: true });
    ctx2.on('request', (r) => all.push(r.url()));
    const p2 = await ctx2.newPage();
    await p2.goto(pathToFileURL(f).href); await sleep(800);
    const r2 = await generate(p2, 'evm', 'prefix', 'ff');
    chk(r2.macOk && r2.derived === r2.shown && r2.hit, `下载下来、一开始就断网打开：evm prefix 「ff」→ ${r2.shown}，钱包文件解开对得上`);
    await ctx2.close();
    const net = all.filter((u) => !/^(blob:|data:)/.test(u) && u !== 'https://0x000000000.com/free' && u !== pathToFileURL(f).href);
    chk(net.length === 0, `页面发出去的请求：除了打开页面那一次，${net.length} 个` + (net.length ? '：' + net.slice(0, 5).join(' | ') : ''));
  } catch (e) { fail++; console.log('  ★ 炸了：' + (e && e.message)); }
  finally { await browser.close(); }
  console.log(fail ? `★ ${fail} 条不对` : '✓ 全部通过：这一页一个请求都不发，钥匙只在这台电脑上');
  process.exit(fail ? 1 : 0);
})();
