// narrow.cjs —— 窄屏检查（公开，任何人都能自己跑）· Narrow-screen check (public; anyone can run it).
//
// DLNARROW0X_20260929：320 像素宽的手机上，页面不许横着多出来 —— 这个仓库公开的每一页都量：
//   铸造页（在 0x000000000.com 上打开、下载下来打开，两种都量）、白皮书、说明书、收款名片、零之榜、免费生成、合约靓号、发币地址定制；
//   英文、中文、印尼文各量一次，折叠的全部打开再量。代码流这种装饰（框是 overflow: hidden）不算；能横着划的框里东西比框宽，
//   也算不过 —— 除非那个框标了 data-wide（本来就宽的对照表、价目表）。一长串不断行的字（地址）超出了自己的框，也算。
// On a 320-pixel-wide phone no page may scroll sideways - every page this repository publishes is checked (the minting page both on
//   0x000000000.com and as the downloaded file, the white paper, the slides, the payment card, the zero board, the Free Generator,
//   Vanity Contract and Token Address), in English, Chinese and Indonesian, with every fold opened. A scroll box whose content is wider
//   than the box also counts, unless the box is marked data-wide (comparison and price tables are wide on purpose); so does a long
//   unbroken string (an address) running past its own box.
// 为什么要一道机器闸：09-29 量到「我的订单」表头、合约页的工厂地址、白皮书页脚、说明书底栏都在 320 宽上多出来一截 ——
//   改一句话就可能再出来，人眼每次都看不到。
// 量具自证：往页面里塞一个 400 像素宽的块，这道检查必须报出来；报不出来就是尺子坏了，整个检查算不过。
// 字体跟网站上一样（src/css 里的 fonts.css —— 换成系统字的话，宽度量得不准）。
// 用法 · Usage：cd test && npm ci && npx playwright install --with-deps chromium
//              node narrow.cjs ../0x000000000.html ./mock-platform.mjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PAGE_FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', '0x000000000.html'));
const SERVER = path.resolve(process.argv[3] || path.join(__dirname, 'mock-platform.mjs'));
const ROOT = path.resolve(process.argv[4] || path.dirname(PAGE_FILE));           // 仓库根：各页 + src/css
const OTHERS = ['wp.html', 'ppt.html', 'card.html', 'zero.html', '0x000000000-free.html', '0x000000000-contract.html', '0x000000000-token.html'];
const W = 320, API = 'http://127.0.0.1:8789', WEB = 'http://127.0.0.1:8082';
const HTML = fs.readFileSync(PAGE_FILE);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0; const chk = (ok, m) => { if (!ok) { fail++; console.log('  ★ ' + m); } else console.log('  ✓ ' + m); };

const srv = spawn(process.execPath, [SERVER], { env: { ...process.env, PORT: '8789' }, stdio: 'ignore' });
// 本机只放这个仓库里的文件：/index.html = 铸造页（下载版），/css/… = src/css/…，别的 = 仓库根里的同名文件
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const web = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = u === '/index.html' ? PAGE_FILE : path.join(ROOT, u.startsWith('/css/') ? path.join('src', u) : u);
  if (f !== PAGE_FILE && !f.startsWith(ROOT + path.sep)) { res.statusCode = 403; return res.end(); }
  fs.readFile(f, (e, b) => { if (e) { res.statusCode = 404; return res.end('nf'); } res.setHeader('content-type', TYPES[path.extname(f)] || 'application/octet-stream'); res.end(b); });
});

// 页面上每个看得见的东西：右边缘超过屏幕、又不在一个自己能横着划的框里（html / body 不算框）→ 记下来；
// 能横着划的框（overflow-x: auto / scroll）里的东西比框宽 = 手机上要横着划才看得全 —— 只有标了 data-wide 的可以；
// 一长串不断行的字超出了自己的框（框没超、字超了）—— 也算
function measure(Wd) {
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : '');
  const boxOf = (el) => { for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
    const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') return a; } return null; };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.checkVisibility && !el.checkVisibility()) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const box = boxOf(el), right = Math.round((box || el).getBoundingClientRect().right);
    if (right > Wd + 1) out.push(name(el) + ' → ' + right + 'px');
    const ox = getComputedStyle(el).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1 && !el.closest('[data-wide]'))
      out.push(name(el) + ' 要横着划 · needs a sideways swipe（' + el.scrollWidth + ' > ' + el.clientWidth + 'px）');
  }
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const el = n.parentElement; if (!n.textContent.trim() || !el || (el.checkVisibility && !el.checkVisibility())) continue;
    let boxed = false; for (let a = el; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') { boxed = true; break; }
    if (boxed) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rc = rg.getBoundingClientRect();
    if (rc.width && rc.right > Wd + 1) out.push(name(el) + ' 的字 → ' + Math.round(rc.right) + 'px「' + n.textContent.trim().slice(0, 30) + '」');
  }
  return { sw: document.documentElement.scrollWidth, over: [...new Set(out)].slice(0, 6) };
}

(async () => {
  await new Promise((r) => web.listen(8082, '127.0.0.1', r));
  for (let i = 0; i < 50; i++) { try { if ((await fetch(API + '/api/health')).ok) break; } catch (e) {} await sleep(200); }
  const browser = await chromium.launch();
  let probed = false;
  const runs = [['0x000000000.html', 'site'], ['0x000000000.html', 'download'], ...OTHERS.filter((f) => fs.existsSync(path.join(ROOT, f))).map((f) => [f, 'file'])];
  chk(runs.length === 2 + OTHERS.length, `要量的页面：${runs.length} 种（铸造页两种打开方式 + ${runs.length - 2} 页）`);
  for (const [page, mode] of runs) {
    for (const lang of ['en', 'zh', 'id']) {
      const ctx = await browser.newContext({ viewport: { width: W, height: 800 } });
      await ctx.addInitScript((l) => { try { localStorage.setItem('0xlang2', l); } catch (e) {} }, lang);
      await ctx.route('https://0x000000000.com/**', async (r) => {
        const u = new URL(r.request().url());
        if (mode === 'site' && u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: HTML });
        if (u.pathname.startsWith('/api/')) { try { return r.fulfill({ response: await r.fetch({ url: API + u.pathname + u.search }) }); } catch (e) { return r.abort(); } }
        return r.abort();
      });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
      await p.goto(mode === 'site' ? 'https://0x000000000.com/' : mode === 'download' ? WEB + '/index.html' : WEB + '/' + page, { waitUntil: 'load' });
      await p.waitForTimeout(2000);
      await p.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));   // 折叠的全打开再量：用户会点开
      await p.waitForTimeout(300);
      const m = await p.evaluate(measure, W);
      const where = mode === 'site' ? '网站上 · on the site' : mode === 'download' ? '下载版 · downloaded file' : page;
      chk(m.sw <= W && m.over.length === 0 && errs.length === 0,
        `${where} · ${lang} · ${W}px：页面宽 ${m.sw}px` + (m.over.length ? '，超出屏幕的：' + m.over.join('，') : '，没有东西超出屏幕 · nothing sticks out') + (errs.length ? '；页面报错：' + errs[0].slice(0, 120) : ''));
      if (!probed) {   // 量具自证：塞一个 400 宽的块，必须被抓到
        probed = true;
        await p.evaluate(() => { const d = document.createElement('div'); d.id = 'narrowProbe'; d.style.cssText = 'width:400px;height:4px';
          (document.querySelector('main') || document.body).appendChild(d); });
        const bad = await p.evaluate(measure, W);
        chk(bad.over.some((s) => s.startsWith('div#narrowProbe')), '尺子自证 · self-test：塞进去一个 400 像素宽的块，被抓到了 · a 400px block was caught');
      }
      await ctx.close();
    }
  }
  await browser.close();
  console.log(`  合计不合格 ${fail} 处 · ${fail} problem(s) ${fail ? '★' : '✓'}`);
  process.exitCode = fail ? 1 : 0;
})().catch((e) => { console.log('  ★ ' + (e && e.stack || e)); process.exitCode = 1; }).finally(() => { srv.kill(); web.close(); });
