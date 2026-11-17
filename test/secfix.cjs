// secfix.cjs — security regression for the page code (two outside reviews, 2026-11-17)
// 安全回归：两轮外部安全检查（2026-11-17）里复现成功过的每一招，原样再打一次 —— 必须拦得住；
// 每一招都配一条正常的情况 —— 必须照样能过（只验「拦住了」不验「好的还能过」，一刀切成全拒也是全绿）。
// Every attack an outside review reproduced is replayed and must stay blocked; each comes with a normal case that must still pass.
//
// Usage · 用法:  node test/secfix.cjs <src dir> [files whose wording is checked ...]
//   CI:      node test/secfix.cjs src wp.html README.md README.zh-CN.md
// Node built-ins only, no network, no wallet, synthetic random keys. · 只用 Node 自带模块，不联网、不碰钱包，钥匙全是随机合成的。
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const ROOT = path.resolve(process.argv[2] || 'src');
const DOCS = process.argv.slice(3).map((f) => path.resolve(f));
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let good = 0, bad = 0, finished = false;
// A step that never returns would let Node exit with code 0 (looks like a pass). Treat it as a failure. · 某一步一直不回来，Node 会安静地以 0 退出（看起来像过了）——当成没过。
process.on('beforeExit', () => { if (!finished) { console.log('  ★ the test did not finish (a step never returned) · 测试没跑完（有一步一直没回来）'); process.exitCode = 1; finished = true; } });
const ok = (c, m) => { if (c) good++; else bad++; console.log((c ? '  ✓ ' : '  ★ ') + m); };
// a may be a list: the current anchor first, then the old one — so the same test also runs against the code before the fix (gauge)
// a 可以是一组：先找现在的写法，找不到再找改之前的 —— 同一份测试拿改之前的代码也跑得起来（量具自证：改之前必须红）
const slice = (src, a, b, optional) => {
  const i = [].concat(a).map((x) => src.indexOf(x)).find((x) => x >= 0) ?? -1, j = i < 0 ? -1 : src.indexOf(b, i + 1);
  if (i < 0 || j < 0) { if (optional) return ''; throw new Error('not found in source · 源码里找不到: ' + (i < 0 ? [].concat(a)[0] : b)); }
  return src.slice(i, j);
};
const section = async (name, fn) => { try { await fn(); } catch (e) { ok(false, name + ' could not run · 跑不下去: ' + (e && e.stack || e)); } };
const keyCtx = () => {
  const ctx = { TextEncoder, Uint8Array, crypto: crypto.webcrypto }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['js/noble.js', 'js/keycore.js']) vm.runInContext(rd(f), ctx, { filename: f });
  return ctx;
};
const rnd = () => BigInt('0x' + crypto.randomBytes(31).toString('hex')) + 1n;
const APP = rd('js/app.js');

(async () => {
  // ── 1 · Payment fields from the server cannot break out of HTML attributes · 收款信息里的引号跳不出 HTML 属性 ──────────────
  console.log('== 1 · payment fields · 收款信息');
  await section('1', async () => {
    const escDecl = APP.split('\n').find((l) => l.startsWith('function esc(s)'));
    const payDecl = slice(APP, '  function payShapeOk(p) {', '  // ── VOUCHER0X');
    const run = (pay) => {
      const el = { hidden: true, textContent: '', html: null, set innerHTML(x) { this.html = x; } }, btn = { disabled: false };
      const ctx = { orderState: { pay }, $: (s) => (s === '#payInfo' ? el : btn), f: { payInfo2: (a) => 'pay ' + a, copyAddr: 'Copy', payBad: 'PAYBAD' } };
      vm.createContext(ctx);
      return { r: vm.runInContext(escDecl + '\n' + payDecl + '\ndrawPay();', ctx), el, btn };
    };
    const evil = { address: '0x1111111111111111111111111111111111111111" onclick="this.dataset.audit=\'x\'" data-n="', amountUsdt: 100, confirmationsRequired: 15, chain: 'BSC', network: 'BEP20' };
    const a = run(evil);
    ok(a.r === false && a.el.html === null && a.el.textContent === 'PAYBAD' && a.btn.disabled === true, '1 attack: address with " onclick= → not drawn, pay button off · 地址里塞 " onclick= → 不画、不让付');
    ok(run({ ...evil, address: '0x1111111111111111111111111111111111111111', amountUsdt: '1<img src=x onerror=alert(1)>' }).r === false, '1 attack: amount is not a number → not drawn · 金额不是数字 → 不画');
    const fine = run({ ...evil, address: '0x1111111111111111111111111111111111111111', amountUsdt: '100' });
    ok(fine.r === true && /data-copycmd="0x1111111111111111111111111111111111111111"/.test(fine.el.html || ''), '1 normal: a clean BSC address is drawn · 正常地址照样画出来');
    const esc = vm.runInContext(escDecl + '\nesc', vm.createContext({}));
    ok(esc('a"b\'c<d>&') === 'a&quot;b&#39;c&lt;d&gt;&amp;', '1 esc() replaces all five characters · 五个字符都换');
  });

  // ── 2 · The receipt is signed only with the key that was merged and checked in step 5 · 收条只用第 5 步核对过的那把钥匙签 ──
  console.log('== 2 · receipt · 收条');
  const KCX = keyCtx(), KC = KCX.KeyCore, N = KCX.NOBLE, enc = new TextEncoder();
  const receipt = (order, pattern, address) => ['0x000000000 delivery receipt', 'order: ' + order, 'pattern: ' + pattern, 'address: ' + address, 'nonce: ' + 'ab'.repeat(16)].join('\n');
  await section('2', async () => {
    // a pattern only variant 0 matches, so "another candidate" really is a different key · 只有变体 0 命中的图案
    let s, b, sec, cands, merged;
    for (let t = 0; t < 50; t++) {
      s = rnd(); b = rnd(); cands = KC.mergeCandidates(s, b, 'evm');
      sec = { s, chain: 'evm', prefix: cands[0].addr.slice(2, 6).toLowerCase(), suffix: '' };
      if (cands.filter((c) => KC.addrHit('evm', sec.prefix, '', c.addr)).length === 1) break;
    }
    merged = KC.merge(sec, b);
    const real = receipt('d8bde638', '0x' + sec.prefix + '…', merged.addr);
    const r1 = KC.signReceipt(sec, b, real, { orderId: 'd8bde638', merged });
    const pub = N.getPublicKey(KC.u8(KC.pad64(merged.k)), false);
    ok(r1.ok && r1.addr === merged.addr && N.verify(r1.sig, N.keccak_256(enc.encode(real)), pub), '2 normal: the platform\'s 5-line receipt is signed and verifies · 平台那种 5 行收条照样签得出、验得过');
    // review 1: another site's sign-in text (EIP-191 / Sign-In with Ethereum) carrying your address · 第一轮：别家网站的登录原文
    const addr = merged.addr, body = 'example.invalid wants you to sign in with your Ethereum account:\n' + addr + '\n\nURI: https://example.invalid\nVersion: 1\nChain ID: 1\nNonce: 12345678\nIssued At: 2026-11-17T00:00:00.000Z';
    const siwe = KC.signReceipt(sec, b, '\x19Ethereum Signed Message:\n' + enc.encode(body).length + body, { orderId: 'd8bde638', merged });
    ok(!siwe.ok && !siwe.sig, '2 attack (review 1): another site\'s sign-in text → not signed · 别家网站的登录原文 → 不签');
    // review 2 (R1): same order and pattern, address of another GLV candidate · 第二轮：单号、图案都对，地址是另一个候选
    const other = cands.find((c) => c.addr.toLowerCase() !== merged.addr.toLowerCase());
    const r2 = KC.signReceipt(sec, b, receipt('d8bde638', '0x' + sec.prefix + '…', other.addr), { orderId: 'd8bde638', merged });
    ok(!r2.ok && !r2.sig && !KC.addrHit('evm', sec.prefix, '', other.addr), '2 attack (review 2): receipt for another candidate key (it does not even match the pattern) → not signed · 另一个候选钥匙的收条 → 不签');
    ok(!KC.signReceipt(sec, b, real, { orderId: 'd8bde638' }).ok, '2 attack: no checked merge result handed in → not signed · 没交第 5 步核对过的结果 → 不签');
    ok(!KC.signReceipt(sec, b, real, { orderId: 'd8bde638', merged: { ...merged, k: (merged.k + 1n) % KC.n } }).ok, '2 attack: a different key with the same address claim → not signed · 钥匙不是合出来的那把 → 不签');
    ok(!KC.signReceipt(sec, b, real, { orderId: 'ffffffff', merged }).ok, '2 attack: another order number → not signed · 单号不是这张单 → 不签');
    ok(!KC.signReceipt(sec, b, real + '\nextra: 1', { orderId: 'd8bde638', merged }).ok, '2 attack: one extra line → not signed · 多夹一行 → 不签');
    ok(KC.signReceipt(sec, b, real.replace(addr, addr.toUpperCase().replace('0X', '0x')), { orderId: 'd8bde638', merged }).ok, '2 normal: EVM address in other letter case still accepted · 大小写不同照样认');
    // TRON
    let ts, tb, tsec, tm;
    for (let t = 0; t < 50; t++) {
      ts = rnd(); tb = rnd(); const tc = KC.mergeCandidates(ts, tb, 'tron');
      tsec = { s: ts, chain: 'tron', prefix: tc[0].addr.slice(0, 4), suffix: '' };
      if (tc.filter((c) => KC.addrHit('tron', tsec.prefix, '', c.addr)).length === 1) break;
    }
    tm = KC.merge(tsec, tb);
    ok(KC.signReceipt(tsec, tb, receipt('0a1b2c3d', tsec.prefix + '…', tm.addr), { orderId: '0a1b2c3d', merged: tm }).ok, '2 normal: TRON receipt is signed · 波场收条照样签得出');
    const tother = KC.mergeCandidates(ts, tb, 'tron').find((c) => c.addr !== tm.addr);
    ok(!KC.signReceipt(tsec, tb, receipt('0a1b2c3d', tsec.prefix + '…', tother.addr), { orderId: '0a1b2c3d', merged: tm }).ok, '2 attack: TRON receipt for another candidate → not signed · 波场另一个候选 → 不签');
    // repeat-tail orders: the address must really end in N equal characters · 豹子号：地址末尾必须真是 N 个一样的字
    let rs, rb, rm;
    for (let t = 0; t < 4000; t++) {
      rs = rnd(); rb = rnd(); rm = KC.merge({ s: rs, chain: 'tron', prefix: '', suffix: '' }, rb);
      if (rm.addr.slice(-1) === rm.addr.slice(-2, -1)) break;
    }
    const rsec = { s: rs, chain: 'tron', prefix: '', suffix: '' };
    ok(rm.addr.slice(-1) === rm.addr.slice(-2, -1) && KC.signReceipt(rsec, rb, receipt('0a1b2c3d', 'last 2 characters all the same', rm.addr), { orderId: '0a1b2c3d', merged: rm }).ok, '2 normal: repeat-tail receipt whose address really ends in 2 equal characters · 豹子号：末尾真是 2 个一样的字 → 签');
    ok(!KC.signReceipt(rsec, rb, receipt('0a1b2c3d', 'last 9 characters all the same', rm.addr), { orderId: '0a1b2c3d', merged: rm }).ok, '2 attack: repeat-tail claim the address does not meet → not signed · 地址末尾不满足豹子号 → 不签');
  });

  // ── 3 · Contract delivery: no trusted order record → no deploy command · 合约交货：没有可信的下单记录就不给部署命令 ────
  console.log('== 3 · contract delivery · 合约交货');
  await section('3', async () => {
    const C2 = rd('js/c2app.js');
    const box = { TextEncoder, Uint8Array, Uint32Array }; vm.createContext(box); vm.runInContext(rd('js/salt.js'), box);
    const SALT = box.SALT;
    const decl = slice(C2, '  function reqOk(q) {', '  function reqOf(id)') + slice(C2, '  function showDelivery() {', '  function renderMine()') + slice(C2, '  function reqAgainHtml(t) {', '  function resume(id, code) {', true);
    let html = '', click = null; const errs = {}, inputs = {}, saved = []; let mode = null;
    const T = () => ({ checks: ['owner', 'chain', 'address', 'pattern'], ocH: 'oc', ocPending: 'pending', deployH: 'deploy', deploy: (d) => ['factory=' + d.factory, 'call=' + d.call, 'deployer=' + d.deployer],
      deployWarn: 'warn', regAfter: 'reg', regAfterLink: 'reg', reqSame: 'REQSAME', reqDiff: 'REQDIFF', reqNone: 'REQNONE', reqStop: 'REQSTOP', reqGo: 'GO', reqBadIn: 'BADIN', reqTypedDiff: 'TYPEDDIFF',
      modeH: 'mode', m3: 'c3', m2: 'c2', depH: 'dep', depPh: '0x', ihH: 'ih', ihPh: '0x', preLbl: 'pre', sufLbl: 'suf', copy: 'copy',
      reqShow: (d) => 'show ' + d.deployer });   // reqShow: only the code before the fix uses it · 只有改之前的代码用它（量具自证时才用得上）
    Object.assign(box, {
      $: (q) => (q === '#c2rqGo' ? { addEventListener: (e, fn) => { click = fn; } } : { set innerHTML(x) { html = x; }, get innerHTML() { return html; } }),
      T, esc: (x) => String(x == null ? '' : x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])), lang: 'en', pick: (x) => x, fixLinks: () => {},
      txt: (id, s) => { errs[id] = s; }, remember: (id, code, q) => saved.push({ id, code, q }),
      document: { getElementById: (id) => (id in inputs ? { value: inputs[id] } : null), querySelector: () => (mode ? { value: mode } : null) },
    });
    vm.runInContext(decl, box);
    const show = (req, delivery) => { box.S = { req, delivery, order: { orderId: 'c0a1b2c3d' }, code: 'ab'.repeat(16) }; html = ''; click = null; for (const k of Object.keys(errs)) delete errs[k]; vm.runInContext('showDelivery()', box); return html; };
    const fake = { deployer: '0x2222222222222222222222222222222222222222', mode: 'create3', salt: '0x' + '22'.repeat(20) + '00' + '00'.repeat(11), prefix: '', suffix: '', factory: '0x3333333333333333333333333333333333333333', call: 'untrusted' };
    fake.address = SALT.addressOf(fake); fake.prefix = fake.address.slice(2, 10).toLowerCase();
    const requested = { deployer: '0x1111111111111111111111111111111111111111', mode: 'create2', initHash: '0x' + '11'.repeat(32), prefix: '00000000', suffix: '' };
    const h1 = show(requested, fake);
    ok(h1.includes('REQDIFF') && h1.includes('REQSTOP') && !h1.includes('cast send'), '3 attack (review 1): self-consistent delivery that is not what was ordered → no deploy command · 自洽但不是你要的 → 不给命令');
    const same = { mode: fake.mode, deployer: SALT.checksum(fake.deployer), prefix: fake.prefix, suffix: '' };
    const h2 = show(same, fake);
    ok(h2.includes('REQSAME') && h2.includes('cast send ' + SALT.CREATEX) && !h2.includes(fake.factory) && !h2.includes('untrusted'), '3 normal: matching delivery → command with the fixed CreateX only · 对得上 → 命令里只有写死的 CreateX');
    const h3 = show(null, fake);
    ok(h3.includes('REQNONE') && !h3.includes('cast send') && typeof click === 'function', '3 attack (review 2): no order record on this computer → no deploy command, asks to re-enter the order · 没有下单记录 → 不给命令，请他把下单时填的再填一遍');
    ok(!h3.includes(fake.deployer) && !h3.includes(fake.deployer.toLowerCase()), '3 the re-entry form is not pre-filled from the delivery · 不拿交货里的值预填');
    // re-entry that matches, written differently (no 0x, upper case) · 重填对得上（写法不同：不带 0x、大写）
    mode = 'create3'; Object.assign(inputs, { c2rqDep: fake.deployer.slice(2).toUpperCase(), c2rqIh: '', c2rqPre: '0x' + fake.prefix.toUpperCase(), c2rqSuf: '' });
    click();
    ok(!errs.c2rqErr && html.includes('REQSAME') && html.includes('cast send ' + SALT.CREATEX) && saved.length === 1 && saved[0].q.deployer === SALT.checksum(fake.deployer), '3 normal: re-entered order matches → command, record saved in one normalized form · 重填对上 → 给命令，按统一写法记下');
    // re-entry that does not match · 重填对不上
    show(null, fake); mode = 'create3'; Object.assign(inputs, { c2rqDep: '0x1111111111111111111111111111111111111111', c2rqPre: fake.prefix });
    click();
    ok(errs.c2rqErr === 'TYPEDDIFF' && !html.includes('cast send') && !box.S.req, '3 attack: re-entered order differs from the delivery → no command · 重填的跟交货对不上 → 不给命令');
    show(null, fake); mode = null; Object.assign(inputs, { c2rqDep: 'nonsense', c2rqPre: 'zz' });
    click();
    ok(errs.c2rqErr === 'BADIN' && !html.includes('cast send'), '3 malformed re-entry → says what is wrong · 填得不对 → 说清楚');
    ok(!show(same, { ...fake, salt: '0x' + '33'.repeat(20) + '00' + '00'.repeat(11) }).includes('cast send'), '3 attack: salt not owned by this deployer → no command · 盐不是这个部署地址的 → 不给命令');
    const nq = vm.runInContext('typeof normReq === "function" ? normReq : () => null', box);
    const n1 = nq({ mode: 'create2', deployer: fake.deployer.slice(2), initHash: 'AB'.repeat(32), prefix: '0xC0FFEE', suffix: '' });
    ok(n1 && n1.deployer === SALT.checksum(fake.deployer) && n1.initHash === '0x' + 'ab'.repeat(32) && n1.prefix === 'c0ffee', '3 inputs are normalized once: deployer 0x+checksum, code hash 0x+lower, pattern lower · 所有入口统一写法');
    ok(/S\.req = normReq\(/.test(C2) && /deployer: q\.deployer/.test(C2), '3 the order sent and the record kept are the same normalized values · 发出去的和记下来的是同一份');
  });

  // ── 4 · Collect → merge → receipt act on one checked result · 取货、合成、签收认同一份核对过的结果 ──────────────
  console.log('== 4 · collect / merge / receipt · 取货 / 合成 / 签收');
  await section('4', async () => {
    const code = 'let MERGED_K = null;\n' + slice(APP, ['  let MERGED = null, DL_GEN = 0;', '  let MERGED = null;'], '  // KSONLY0X')
      + slice(APP, "  $('#btnReceipt').addEventListener('click', async () => {", "\n    setStatus('settled');") + "\n    setStatus('settled');\n  });\n";
    const make = () => {
      const ctx = keyCtx();
      const el = {}, on = {}, calls = [], lines = [], status = [];
      const $ = (id) => el[id] || (el[id] = { id, hidden: true, disabled: true, innerHTML: '', addEventListener: (e, fn) => { on[id] = fn; } });
      Object.assign(ctx, {
        $, KC: () => ctx.KeyCore, renderSent: () => {}, outLine: (o, text, cls) => lines.push({ text, cls }), setStatus: (x) => status.push(x),
        showApiError: (o, r) => lines.push({ text: 'APIERR ' + r.code, cls: 'err' }),
        f: { needSecForTake: 'NEEDSEC', gotB: 'GOTB', mergeBad: () => 'MERGEBAD', mergeOk: 'MERGEOK', hitWord: 'hit', addrMatch: 'MATCH', addrDiff: (a) => 'MISMATCH ' + a, addrStop: 'STOP', evmTwin: (a) => 'twin ' + a,
          noReceipt: 'NORECEIPT', receiptNeedMerge: 'NEEDMERGE', receiptOdd: 'ODD', receiptBad: 'BAD', receiptOk: 'RECEIPTOK', perkOk: 'perk', perkLink: 'perk' },
        api: (url, method, body) => new Promise((resolve) => calls.push({ url, method, body, resolve })),
      });
      vm.runInContext(code, ctx);
      const click = (id, force) => { const x = $(id); return (!x.disabled || force) && on[id] ? on[id]() : null; };
      return { ctx, el, on, calls, lines, status, click, $ };
    };
    const tick = () => new Promise((r) => setTimeout(r, 0));
    const setup = (w) => {
      let s, b, sec, m;
      for (let t = 0; t < 50; t++) {
        s = rnd(); b = rnd(); const c = w.ctx.KeyCore.mergeCandidates(s, b, 'evm');
        sec = { s, chain: 'evm', prefix: c[0].addr.slice(2, 6).toLowerCase(), suffix: '' };
        if (c.filter((x) => w.ctx.KeyCore.addrHit('evm', sec.prefix, '', x.addr)).length === 1) break;
      }
      m = w.ctx.KeyCore.merge(sec, b);
      w.ctx.orderState = { sec, orderId: 'ab12cd34', challenge: 'challenge-1', receiptChallenge: receipt('ab12cd34', '0x' + sec.prefix + '…', m.addr) };
      w.$('#btnDownload').disabled = false;
      return { s, b, sec, m };
    };
    // normal path · 正常一整圈
    {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); await tick();
      ok(w.$('#btnDownload').disabled && w.$('#btnMerge').disabled && w.calls.length === 1, '4 the collect button locks at once (not when the reply comes back) · 一按就锁，不等回包');
      w.click('#btnDownload'); await tick();
      ok(w.calls.length === 1, '4 attack (review 2): a double click sends only one request · 连点两下只发一个请求');
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.click('#btnMerge');
      ok(!w.$('#btnReceipt').disabled && !w.$('#ksBox').hidden && w.status.includes('delivered'), '4 normal: merge matches → wallet file and receipt open · 对上 → 钱包文件、收条放出来');
      w.click('#btnReceipt'); await tick();
      const post = w.calls.find((c) => /\/receipt$/.test(c.url));
      const pub = w.ctx.NOBLE.getPublicKey(w.ctx.KeyCore.u8(w.ctx.KeyCore.pad64(k.m.k)), false);
      ok(post && w.ctx.NOBLE.verify(post.body.sig, w.ctx.NOBLE.keccak_256(new TextEncoder().encode(w.ctx.orderState.receiptChallenge)), pub), '4 normal: the receipt is signed with the checked key · 收条用核对过的那把钥匙签');
    }
    // review 1: the first merge does not match the delivered address → stop there · 第一轮：第一次合成就对不上交货地址 → 停在这一步
    {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); await tick();
      const other = w.ctx.KeyCore.mergeCandidates(k.s, k.b, 'evm').find((c) => c.addr.toLowerCase() !== k.m.addr.toLowerCase());
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: other.addr } }); await tick();
      w.click('#btnMerge');
      ok(w.lines.some((l) => /^MISMATCH/.test(l.text)) && w.$('#btnReceipt').disabled && w.$('#ksBox').hidden && !w.status.includes('delivered'), '4 attack (review 1): merged address differs from the delivered one → no wallet file, no receipt, not "delivered" · 合出来的跟交货地址对不上 → 不做钱包文件、不放收条、不标已交货');
    }
    // stale reply arriving after a newer one is ignored · 晚回来的旧回包不认
    {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); w.click('#btnDownload', true); await tick();
      const other = w.ctx.KeyCore.mergeCandidates(k.s, k.b, 'evm').find((c) => c.addr.toLowerCase() !== k.m.addr.toLowerCase());
      w.calls[1].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: other.addr } }); await tick();
      ok(w.ctx.orderState.deliveredAddr === k.m.addr && w.lines.filter((l) => l.text === 'GOTB').length === 1, '4 attack (review 2): an older reply that comes back late is dropped · 先发后到的旧回包整个丢掉');
    }
    // the reviewer's sequence: merge OK, then a different delivery, merge fails → receipt must be gone · 复查那一串：合成成功 → 换了交货 → 再合成失败
    {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); await tick();
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.click('#btnMerge');
      const other = w.ctx.KeyCore.mergeCandidates(k.s, k.b, 'evm').find((c) => c.addr.toLowerCase() !== k.m.addr.toLowerCase());
      w.click('#btnDownload', true); await tick();
      ok(w.$('#btnReceipt').disabled && w.$('#ksBox').hidden && w.status[w.status.length - 1] === 'found', '4 a new delivery takes back the wallet file, the receipt and "delivered" · 新交货一来就把钱包文件、收条、已交货收回');
      w.calls[w.calls.length - 1].resolve({ code: 200, body: { b: String(k.b), address: other.addr } }); await tick();
      w.click('#btnMerge');
      ok(w.lines.some((l) => /^MISMATCH/.test(l.text)) && w.$('#btnReceipt').disabled && w.$('#ksBox').hidden, '4 attack (review 2): merge does not match the new delivery → stays stopped · 合成对不上新交货 → 停住');
      const n0 = w.calls.length;
      w.click('#btnReceipt', true); await tick(); await tick();
      ok(w.calls.length === n0 && w.lines.some((l) => l.text === 'NEEDMERGE'), '4 attack (review 2): the receipt handler itself refuses without a checked merge (not only a grey button) · 签收自己核：没有核对过的合成结果 → 不签、不发');
    }
    // checked merge exists, but the receipt names another candidate · 有核对过的合成，收条却写另一个候选
    {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); await tick();
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.click('#btnMerge');
      const other = w.ctx.KeyCore.mergeCandidates(k.s, k.b, 'evm').find((c) => c.addr.toLowerCase() !== k.m.addr.toLowerCase());
      w.ctx.orderState.receiptChallenge = receipt('ab12cd34', '0x' + k.sec.prefix + '…', other.addr);
      const n0 = w.calls.length;
      w.click('#btnReceipt'); await tick(); await tick();
      ok(w.calls.length === n0 && w.lines.some((l) => l.text === 'BAD'), '4 attack (review 2): receipt for another candidate → not signed, nothing sent · 收条写的是另一个候选 → 不签、不发');
    }
  });

  // ── 5 · Wording matches what the code does · 说法跟代码一致 ─────────────────────────────────────────
  console.log('== 5 · wording · 说法');
  await section('5', async () => {
    const FC = rd('js/fcheck.js');
    const mp = [...FC.matchAll(/^ {6}minePh: '([^']+)'/gm)].map((m) => m[1]);
    ok(mp.length === 3 && !mp.some((p) => /只留在这一页|stays on this page|hanya ada di halaman ini/.test(p)), '5 the free check no longer says your own address stays on the page · 免费查不再说自己的地址只留在这一页');
    ok(/'\/api\/check', 'POST', \{ address: me \}/.test(FC), '5 (gauge) this fcheck.js really sends your own address · 量具自证：这份确实会把自己的地址发出去');
    const banned = [
      [/你自己的地址只留在你的浏览器里|Your own address stays in your browser|Alamat Anda sendiri tetap di browser Anda/, 'own address stays in the browser · 自己的地址只留在浏览器里'],
      [/cannot be deleted|删不掉|Commit history itself cannot be edited|提交记录本身改不了/, 'public record cannot be deleted · 公开记录删不掉'],
      [/GitHub’s machines, not ours|run by GitHub, not by us|不在我们的|bukan di mesin kami|dijalankan GitHub, bukan kami/, 'checks are not ours · 检查不归我们管'],
      [/(?<!按计划)每小时(巡检|一次|再拿)|(?<!terjadwal |jadwal )setiap jam, mesin/, 'hourly checks without "scheduled" · 每小时却不说按计划'],
      [/(?<!on an |a scheduled )(?:every hour|hourly tamper)/i, 'hourly checks without "scheduled" (en) · 英文每小时却不说按计划'],
    ];
    for (const f of DOCS) {
      const s = fs.readFileSync(f, 'utf8');
      const hits = banned.filter(([re]) => re.test(s)).map(([, m]) => m);
      ok(hits.length === 0, '5 ' + path.basename(f) + ': ' + (hits.length ? hits.join(' / ') : 'none of the overstated claims · 没有说过头的话'));
    }
  });

  console.log(`  total ${good} passed · ${bad} not · 合计 ${good} 条对 · ${bad} 条不对 ${bad ? '★' : '✓'}`);
  process.exitCode = bad ? 1 : 0; finished = true;
})();
