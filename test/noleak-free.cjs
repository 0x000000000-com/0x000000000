// noleak-free.cjs —— /free 那一页的外发检查（公开，任何人都能自己跑）。FREEGEN0X_20260928 · FREEGENOFF0X_20261120
// Leak check for the /free page (public; anyone can run it).
//
// 2026-11-20 起免费生成下线，/free（0x000000000-free.html）只剩一页说明。这一份核的是：
//   ① 网站上打开（中文 / English / Indonesia 各一次）、下载下来断网双击打开：除了打开页面那一次，一个请求都不发
//   ② 页面里没有任何算钥匙的东西：没有输入框、没有密码框、没有 getRandomValues / FreeGen / KeyCore
//   ③ 每种语言都看得见「已下线」那句话和回首页的链接；切语言不发请求；页面不报错
// Since 2026-11-20 the Free Generator is retired and /free is a short notice. This checks: no requests besides loading the page
// (on the site in all three languages, and as a downloaded file opened offline), no key-making code, the notice visible in each language.
// 用法 · usage：cd test && npm ci && npx playwright install --with-deps chromium
//              node noleak-free.cjs ../0x000000000-free.html ./node_modules
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

const PAGE_FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', '0x000000000-free.html'));
const html = fs.readFileSync(PAGE_FILE, 'utf8');
let fail = 0; const chk = (ok, m) => { if (!ok) { fail++; console.log('  ★ ' + m); } else console.log('  ✓ ' + m); };
const SAY = { zh: '免费生成已下线', en: 'The Free Generator is retired', id: 'Generator Gratis sudah dihentikan' };
const KEYCODE = [/getRandomValues/, /\bFreeGen\b/, /\bKeyCore\b/, /privateKey|secretKey/, /<input\b/i, /\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\b/, /sendBeacon/, /\bnew\s+Worker\s*\(/];

(async () => {
  // ② 先看字：这一页的字节里不许有算钥匙、发请求的写法（拿一段植进去的代码先验这把尺子抓得到）
  const hits = (s) => KEYCODE.filter((re) => re.test(s)).map(String);
  chk(hits('crypto.getRandomValues(a); fetch("/x")').length === 2, '尺子自证：植进去的算钥匙、发请求的代码抓得到 · the detector catches planted code');
  chk(hits(html).length === 0, '页面里没有输入框、没有算钥匙或发请求的代码 · no inputs, no key-making or request code' + (hits(html).length ? '（' + hits(html).join(' ') + '）' : ''));

  const srv = http.createServer((q, s) => { s.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); s.end(html); });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const SITE = 'http://127.0.0.1:' + srv.address().port + '/free';
  const browser = await chromium.launch();
  let cases = 0, extra = 0;
  async function flow(name, url, lang, offline) {
    const ctx = await browser.newContext();
    if (offline) await ctx.setOffline(true);
    if (lang) await ctx.addInitScript((l) => { try { localStorage.setItem('0xlang2', l); } catch (e) {} }, lang);
    const page = await ctx.newPage();
    const reqs = [], errs = [];
    page.on('request', (r) => reqs.push(r.url()));
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const want = lang || 'en';
    const shown = await page.evaluate(() => document.body.innerText);
    const home = await page.$('a[href="https://0x000000000.com/"]');
    // 切一圈语言：每种都看得见自己那一句，切的时候不发请求
    let sw = true;
    for (const l of ['zh', 'en', 'id']) {
      await page.click('.lang button[data-lang="' + l + '"]');
      sw = sw && (await page.evaluate(() => document.body.innerText)).includes(SAY[l]);
    }
    await page.waitForTimeout(300);
    const others = reqs.filter((u) => u !== url);
    extra += others.length; cases++;
    chk(shown.includes(SAY[want]) && !!home && sw && !errs.length && others.length === 0,
      `${name}：看得见「${SAY[want]}」、有回首页的链接、切三种语言都对，页面没报错，除了打开页面那一次请求 ${others.length} 个`
      + (others.length ? '（' + others.slice(0, 3).join(' ') + '）' : '') + (errs.length ? ' · 报错 ' + errs[0] : ''));
    await ctx.close();
  }
  try {
    for (const l of ['zh', 'en', 'id']) await flow('网站上 · on the site · ' + l, SITE, l, false);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'freeoff-'));
    const f = path.join(dir, '0x000000000-free.html'); fs.writeFileSync(f, html);
    await flow('下载下来、一开始就断网 · downloaded, opened offline', pathToFileURL(f).href, null, true);
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    fail++; console.log('  ★ 走到一半炸了：' + e.message);
  } finally {
    await browser.close(); srv.close();
  }
  console.log(`  流程 ${cases} 个 · 打开页面之外的请求 ${extra} 个`);
  console.log(`  ---- 不合格 ${fail} 处 ----`);
  process.exitCode = fail ? 1 : 0;
})();
