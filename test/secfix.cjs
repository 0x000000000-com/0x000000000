// secfix.cjs — security regression for the page code (outside reviews 2026-11-17 and 2026-11-18)
// 安全回归：外部安全检查（2026-11-17 两轮、2026-11-18 一轮）在这些入口上复现过的招数，原样再打一次 —— 必须拦得住：
//   付款框和订单列表（HTML 转义）· 收条签名 · 合约交货核对、重填，下单 / 续单 / 查进度只认这一张单 · 取货 → 合成 → 收条、导出钱包文件 ·
//   个人靓号的付款信息 / 进度 / 续单只认这一张单 · 收款名片页 · 免费生成页「存好了」· 页面和文档的说法。
// 每一招都配一条正常的情况 —— 必须照样能过（只验「拦住了」不验「好的还能过」，一刀切成全拒也是全绿）。
// 每个修复都拿改之前的写法放回去试过：这份测试必须变红（变异对照）。它只管上面这些入口，不是所有可能的攻击。
// Attacks the outside reviews reproduced on the entry points listed above are replayed and must stay blocked; each comes with a normal case
// that must still pass; every fix was checked by putting the old code back (this test must turn red). It covers these paths, not every attack.
//
// Usage · 用法:  node test/secfix.cjs <src dir> [files whose wording is checked ...]
//   CI:      node test/secfix.cjs src wp.html ppt.html README.md README.zh-CN.md   (card.html is found next to <src dir> · card.html 在 <src dir> 旁边找)
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
// A promise that fails with nobody handling it is a failure here (old code can crash inside a callback) · 没人接的 Promise 失败也算没过（旧代码会在回调里出错）
process.on('unhandledRejection', (e) => ok(false, 'a promise failed with no handler · 有一个 Promise 失败了没人接: ' + (e && e.message || e)));
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

  // ── 1b · The order list ("my orders") escapes every field from the server · 订单列表里服务器给的每个字段都过 esc ──
  //   Review 3 put the old line back (amount without esc) and this test stayed green — this section closes that gap. · 第三轮复查把旧写法放回去，原来的测试照样全绿 —— 这一段补上
  console.log('== 1b · order list · 订单列表');
  await section('1b', async () => {
    const escDecl = APP.split('\n').find((l) => l.startsWith('function esc(s)'));
    const code = escDecl + '\nvar ORDERS_DOWN = false;\n' + slice(APP, 'async function renderOrders() {', '\n/* ---- ');
    const run = async (o) => {
      const body = { html: '', set innerHTML(x) { this.html = x; }, get innerHTML() { return this.html; } };
      const ctx = { $: (s) => (s === '#ordersBody' ? body : null), myOrders: () => [String(o.id)], forgetOrder: () => {}, api: async () => ({ code: 200, body: o }),
        t: (k) => k, STATUS_CLASS: { paid: 'st-paid' }, statusLabel: (s) => 'S:' + s };
      vm.createContext(ctx); vm.runInContext(code, ctx); await vm.runInContext('renderOrders()', ctx);
      return body.html;
    };
    const tags = (h) => h.replace(/<\/?(tr|td|span|button)\b[^>]*>/g, '');
    const evil = await run({ id: 'ab12cd34', pattern: '0x0000', status: 'paid', amountUsdt: '1<img src=x onerror=alert(1)>' });
    ok(!/<img/i.test(evil) && evil.includes('&lt;img'), '1b attack (review 3): an amount with HTML in it shows as plain text in the order list · 金额里塞 HTML → 订单列表照字显示');
    const evil2 = await run({ id: 'ab12cd34" data-x="1', pattern: '<i>p</i>', patternText: '<u>t</u>', status: 'paid', amountUsdt: 5 });
    ok(!/[<>]/.test(tags(evil2)) && !evil2.includes('data-x="1"'), '1b attack: order number / pattern with HTML → plain text, the resume button attribute does not break · 单号、图案塞 HTML → 照字显示，「接着做」的属性不被撑破');
    const fine = await run({ id: 'ab12cd34', pattern: '0x0000', status: 'paid', amountUsdt: 100 });
    ok(fine.includes('>100<') && fine.includes('data-resume="ab12cd34"'), '1b normal: amount and the resume button show as usual · 正常金额和「接着做」照常显示');
  });

  // ── 1c · The payment step itself: "I have paid" stays off for malformed details; a late reply for another order is dropped ──
  //   1c · 付款那一步本身：样子不对就不让点「我转好了」；换了单以后才回来的付款信息整个丢掉
  console.log('== 1c · payment step · 付款那一步');
  await section('1c', async () => {
    const escDecl = APP.split('\n').find((l) => l.startsWith('function esc(s)'));
    const code = escDecl + '\nvar ORDER_GEN = 1;\n' + slice(APP, '  async function showPayment(o) {', '  function payShapeOk(p) {') + slice(APP, '  function payShapeOk(p) {', '  // ── VOUCHER0X');
    const make = () => {
      const el = {}, calls = [];
      const $ = (id) => el[id] || (el[id] = { id, hidden: true, disabled: false, textContent: '', html: null, set innerHTML(x) { this.html = x; } });
      const ctx = { $, orderState: { orderId: 'ab12cd34' }, f: { payInfo2: (a) => 'pay ' + a, copyAddr: 'Copy', payBad: 'PAYBAD' },
        api: (url) => new Promise((resolve) => calls.push({ url, resolve })), showLeave: () => {}, vchShow: () => {}, vchSeen: () => null, vchOpenFor: () => false };
      vm.createContext(ctx); vm.runInContext(code, ctx);
      return { ctx, $, calls };
    };
    const good = { address: '0x1111111111111111111111111111111111111111', amountUsdt: 100, confirmationsRequired: 15, chain: 'BSC', network: 'BEP20' };
    const tick = () => new Promise((r) => setTimeout(r, 0));
    {
      const w = make(); const p = vm.runInContext('showPayment()', w.ctx); await tick();
      w.calls[0].resolve({ code: 200, body: { ...good, address: good.address + '" onclick="x' } }); await p;
      ok(w.$('#btnPay').disabled === true, '1c attack: malformed payment details from the server → the "I have paid" button stays off (not only inside drawPay) · 收款信息样子不对 → 「我转好了」一直不能点');
    }
    {
      const w = make(); const p = vm.runInContext('showPayment()', w.ctx); await tick();
      w.calls[0].resolve({ code: 200, body: good }); await p;
      ok(w.$('#btnPay').disabled === false && /data-copycmd="0x1{40}"/.test(w.$('#payInfo').html || ''), '1c normal: clean details → drawn, button on · 正常 → 画出来、可以点');
    }
    {
      const w = make(); const p = vm.runInContext('showPayment()', w.ctx); await tick();
      vm.runInContext("ORDER_GEN++; orderState.orderId = 'ffff0000';", w.ctx);
      w.calls[0].resolve({ code: 200, body: good }); await p;
      ok(!w.ctx.orderState.pay && w.ctx.orderState.address === undefined && w.$('#payInfo').html === null, '1c attack (review 3, U1): payment details that come back after switching to another order are dropped · 换了单以后才回来的付款信息整个丢掉');
    }
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

  // ── 3b · Contract orders: placing, resuming and polling act on one order at a time · 合约单：下单、续单、查进度都只认这一张单 ──
  //   Review 3 (U1): replies that come back after switching orders used to overwrite the current order. · 第三轮复查：换单以后才回来的回包会盖掉当前这张单
  console.log('== 3b · contract: switching orders · 合约：换单');
  await section('3b', async () => {
    const C2 = rd('js/c2app.js');
    const box = { TextEncoder, Uint8Array, Uint32Array }; vm.createContext(box); vm.runInContext(rd('js/salt.js'), box);
    const SALT = box.SALT;
    const decl = slice(C2, '  var MY_KEY = ', '  function newCode()')
      + slice(C2, '  function placeOrder() {', '  function pollStatus() {') + slice(C2, '  function pollStatus() {', '  // 核对：只用 salt.js')
      + slice(C2, '  function resume(id, code) {', '\n  // ');
    const make = () => {
      const store = {}, calls = [], seen = { collect: 0, steps: 0, errs: [] };
      Object.assign(box, {
        localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
        PRODUCT: 'contract', lang: 'en', S: { step: 1, mode: 'create3', deployer: '', initHash: '', prefix: '', suffix: '', payChain: 'bsc', code: 'ab'.repeat(16), order: null, payment: null, delivery: null, poll: null, req: null },
        api: (url, method, body) => new Promise((resolve) => calls.push({ url, method, body, resolve })),
        T: () => ({ payWait: 'wait', payGot: () => 'got', status: {} }), errOf: (r) => 'ERR' + r.code, txt: (id, s) => seen.errs.push([id, s]),
        orderOf: (x) => ({ orderId: x.orderId || x.id, status: x.status, amountUsdt: x.amountUsdt, depositAddress: x.depositAddress, payChain: x.payChain }),
        vchReset: () => {}, vchKey: () => '', renderSteps: () => { seen.steps++; }, renderMine: () => {}, codeHash: () => '0x' + '00'.repeat(32),
        $: () => null, setTimeout: () => 0, clearTimeout: () => {},
      });
      vm.runInContext(decl, box);
      return { calls, seen, store, picks: (id) => calls.filter((c) => c.url === '/api/c2/orders/' + id + '/pickup') };
    };
    const tick = () => new Promise((r) => setTimeout(r, 0));
    const reqA = { mode: 'create3', deployer: SALT.checksum('0x' + '1a'.repeat(20)), initHash: '', prefix: 'c0ffee', suffix: '' };
    // resuming an order this computer never placed must not keep the previous order's record · 续一张这台电脑没下过的单，不能沿用上一张单的记录
    {
      const w = make(); box.S.req = reqA;
      vm.runInContext("resume('c0a1b2c3d', '" + 'cd'.repeat(16) + "')", box);
      ok(box.S.req === null, '3b attack: resuming an order with no record here → no order requirement (not the previous order\'s) · 续单找不到本机记录 → 不沿用上一张单的要求');
    }
    // two resumes: only the last one counts · 连续续两张单，只认最后一次
    {
      const w = make();
      vm.runInContext("resume('c0000000a', '" + 'aa'.repeat(16) + "'); resume('c0000000b', '" + 'bb'.repeat(16) + "')", box);
      w.calls[1].resolve({ code: 200, body: { orderId: 'c0000000b', status: 'created', amountUsdt: '10', depositAddress: '0x' + '22'.repeat(20), payChain: 'bsc' } }); await tick();
      w.calls[0].resolve({ code: 200, body: { orderId: 'c0000000a', status: 'found', amountUsdt: '10', depositAddress: '0x' + '33'.repeat(20), payChain: 'bsc' } }); await tick();
      ok(box.S.order && box.S.order.orderId === 'c0000000b' && box.S.code === 'bb'.repeat(16) && w.picks('c0000000a').length === 0, '3b attack (review 3, U1): the first resume coming back late does not take over the second · 先续的单晚回来，不把后续的那张盖掉');
    }
    // a progress reply for the previous order is dropped · 上一张单的进度回包不写进这一张
    {
      const w = make(); box.S.order = { orderId: 'c0000000a' }; box.S.step = 3;
      vm.runInContext('pollStatus()', box);
      vm.runInContext("resume('c0000000b', '" + 'bb'.repeat(16) + "')", box);
      const n0 = w.seen.steps;
      w.calls[0].resolve({ code: 200, body: { orderId: 'c0000000a', status: 'found' } }); await tick();
      ok(box.S.order.orderId === 'c0000000b' && w.picks('c0000000a').length === 0 && w.seen.steps === n0 && box.S.step !== 5, '3b attack (review 3, U1): a late progress reply for the previous order does not move this order to "collect" · 上一张单晚回来的进度，不把这张单推到取货');
    }
    // collecting: a double click or a reply after switching orders never replaces the current delivery · 取货：连点两下、换单以后才回来的回包，都不换掉当前这份交货
    {
      const w = make(); box.S.order = { orderId: 'c0000000a' }; box.S.code = 'aa'.repeat(16);
      vm.runInContext('collect(); collect()', box);
      const [p1, p2] = w.picks('c0000000a');
      p2.resolve({ code: 200, body: { delivery: { salt: 'NEW' } } }); await tick();
      p1.resolve({ code: 200, body: { delivery: { salt: 'OLD' } } }); await tick();
      ok(box.S.delivery && box.S.delivery.salt === 'NEW', '3b attack (review 2): of two pickups, only the latest reply counts · 连点两下取货，只认最后一次的回包');
    }
    {
      const w = make(); box.S.order = { orderId: 'c0000000a' }; box.S.code = 'aa'.repeat(16);
      vm.runInContext('collect()', box);
      vm.runInContext("resume('c0000000b', '" + 'bb'.repeat(16) + "')", box);
      w.picks('c0000000a')[0].resolve({ code: 200, body: { delivery: { salt: 'A' } } }); await tick();
      ok(!box.S.delivery && box.S.order.orderId === 'c0000000b', '3b attack (review 2/3): a pickup reply for the previous order is dropped · 上一张单的取货回包整个丢掉');
    }
    // placing an order: what is sent and what is kept are the same normalized values (run, not read) · 下单：发出去的和记下来的是同一份（真跑，不是读源码）
    {
      const w = make(); Object.assign(box.S, { mode: 'create2', deployer: '1a'.repeat(20), initHash: 'AB'.repeat(32), prefix: '0xC0FFEE', suffix: '' });
      vm.runInContext('placeOrder()', box);
      const sent = w.calls[0] && w.calls[0].body;
      ok(sent && sent.deployer === SALT.checksum('0x' + '1a'.repeat(20)) && sent.initHash === '0x' + 'ab'.repeat(32) && sent.prefix === 'c0ffee', '3b normal: the order request carries the normalized deployer, code hash and pattern · 下单请求里是统一写法的部署地址、代码指纹、图案');
      w.calls[0].resolve({ code: 200, body: { order: { orderId: 'c0000000c', status: 'created' }, payment: { address: '0x' + '44'.repeat(20) } } }); await tick();
      const rec = JSON.parse(w.store.c2_orders || '[]').find((x) => x.id === 'c0000000c');
      ok(rec && rec.req && rec.req.deployer === sent.deployer && rec.req.initHash === sent.initHash && rec.req.prefix === 'c0ffee' && box.S.order.orderId === 'c0000000c', '3b normal: the record kept on this computer equals what was sent · 记在这台电脑上的跟发出去的一样');
    }
    {
      const w = make(); Object.assign(box.S, { mode: 'create3', deployer: '0x' + '1a'.repeat(20), prefix: 'c0ffee', suffix: '' });
      vm.runInContext('placeOrder()', box);
      vm.runInContext("resume('c0000000b', '" + 'bb'.repeat(16) + "')", box);
      w.calls[0].resolve({ code: 200, body: { order: { orderId: 'c0000000d', status: 'created' }, payment: {} } }); await tick();
      const rec = JSON.parse(w.store.c2_orders || '[]').find((x) => x.id === 'c0000000d');
      ok(box.S.order.orderId === 'c0000000b' && !!rec, '3b (U1): an order placed before switching is still kept in "my orders", but does not take over the screen · 换单前下好的单照样记进「我的订单」，但不抢回界面');
    }
  });

  // ── 4 · Collect → merge → receipt act on one checked result · 取货、合成、签收认同一份核对过的结果 ──────────────
  console.log('== 4 · collect / merge / receipt · 取货 / 合成 / 签收');
  await section('4', async () => {
    const code = 'let MERGED_K = null;\n' + slice(APP, ['  let MERGED = null, DL_GEN = 0;', '  let MERGED = null;'], '  // ── [6/6]')
      + slice(APP, "  $('#btnReceipt').addEventListener('click', async () => {", "\n    setStatus('settled');") + "\n    setStatus('settled');\n  });\n";
    const make = () => {
      const ctx = keyCtx();
      const el = {}, on = {}, calls = [], lines = [], status = [], dls = [];
      const $ = (id) => el[id] || (el[id] = { id, hidden: true, disabled: true, innerHTML: '', addEventListener: (e, fn) => { on[id] = fn; } });
      Object.assign(ctx, {
        $, KC: () => ctx.KeyCore, renderSent: () => {}, outLine: (o, text, cls) => lines.push({ text, cls }), setStatus: (x) => status.push(x),
        showApiError: (o, r) => lines.push({ text: 'APIERR ' + r.code, cls: 'err' }),
        f: { needSecForTake: 'NEEDSEC', gotB: 'GOTB', mergeBad: () => 'MERGEBAD', mergeOk: 'MERGEOK', hitWord: 'hit', addrMatch: 'MATCH', addrDiff: (a) => 'MISMATCH ' + a, addrStop: 'STOP', evmTwin: (a) => 'twin ' + a,
          noReceipt: 'NORECEIPT', receiptNeedMerge: 'NEEDMERGE', receiptOdd: 'ODD', receiptBad: 'BAD', receiptOk: 'RECEIPTOK', perkOk: 'perk', perkLink: 'perk',
          pwShort: 'PWSHORT', pwDiff: 'PWDIFF', noSubtle: 'NOSUBTLE', ksWork: 'KSWORK ', ksOk: (n) => 'KSOK ' + n, ksFail: 'KSFAIL ' },
        dl: (name) => dls.push(name),
        api: (url, method, body) => new Promise((resolve) => calls.push({ url, method, body, resolve })),
      });
      vm.runInContext(code, ctx);
      const click = (id, force) => { const x = $(id); return (!x.disabled || force) && on[id] ? on[id]() : null; };
      return { ctx, el, on, calls, lines, status, dls, click, $ };
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
    // a receipt text that is not the fixed format is refused with its own message · 收条原文不是固定格式 → 用它自己那句话拒绝
    {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); await tick();
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.click('#btnMerge');
      w.ctx.orderState.receiptChallenge = 'Sign in to example.com\nnonce: 1';
      const n0 = w.calls.length; w.click('#btnReceipt'); await tick(); await tick();
      ok(w.calls.length === n0 && w.lines.some((l) => l.text === 'ODD'), '4 attack: a receipt text in another format → not signed, told it is not the fixed format · 收条原文不是固定格式 → 不签，并说清楚是格式不对');
    }
    // review 2/3: merging again and failing takes the wallet file and the receipt back · 再合成一次失败（合不出来 / 交货坏了）→ 钱包文件、收条收回
    for (const bad of ['nohit', 'throws']) {
      const w = make(), k = setup(w);
      w.click('#btnDownload'); await tick();
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.click('#btnMerge');
      const opened = !w.$('#btnReceipt').disabled && !w.$('#ksBox').hidden;
      w.ctx.orderState.b = bad === 'nohit' ? String(rnd()) : 'not-a-number';
      w.click('#btnMerge', true);
      ok(opened && w.$('#btnReceipt').disabled && w.$('#ksBox').hidden && w.status[w.status.length - 1] === 'found', '4 attack (review 2/3): a later merge that ' + (bad === 'nohit' ? 'finds no matching key' : 'cannot even run') + ' takes back the wallet file, the receipt and "delivered" · 后来再合成' + (bad === 'nohit' ? '合不出来' : '直接出错') + ' → 钱包文件、收条、已交货一起收回');
    }
    // a new order starts clean (code check: renderSteps rebuilds the whole page) · 新单从干净的状态开始（renderSteps 重画整页，这里读源码）
    {
      const rs = slice(APP, 'function renderSteps() {', '  mintStop();');
      ok(/orderState\.deliveredAddr = null/.test(rs) && /orderState\.receiptChallenge = null/.test(rs) && /MERGED_K = null/.test(rs) && /ORDER_GEN\+\+/.test(rs), '4 a new order clears the previous delivery, receipt text and merged key, and bumps the order generation (code check) · 新单清掉上一单的交货、收条原文、合出来的钥匙，并换一代（读源码）');
    }
    // review 3 (U2): the wallet-file export fixes the merged result when locking starts · 第三轮 U2：导出钱包文件，开始上锁时就固定那一份合成结果
    for (const revoke of [true, false]) {
      const w = make(), k = setup(w), pend = [];
      w.ctx.KC = () => Object.assign(Object.create(w.ctx.KeyCore), { keystore: (kk, addr, chain) => new Promise((res, rej) => pend.push({ res, rej, kk, addr, chain })), keystoreName: (c) => 'my-keystore.' + (c === 'tron' ? 'txt' : 'json') });
      w.click('#btnDownload'); await tick();
      w.calls[0].resolve({ code: 200, body: { b: String(k.b), address: k.m.addr } }); await tick();
      w.click('#btnMerge');
      w.$('#ksPw').value = 'correct horse 1'; w.$('#ksPw2').value = 'correct horse 1';
      w.on['#btnKs'].call(w.$('#btnKs')); await tick();
      const started = pend.length === 1 && pend[0].addr === k.m.addr && pend[0].kk === k.m.k;
      if (revoke) w.click('#btnDownload', true);   // a new delivery arrives while locking · 上锁的时候来了新交货
      await tick();
      pend[0].res({ version: 3, address: 'x' }); await tick(); await tick();
      if (revoke) ok(started && w.dls.length === 0 && w.$('#btnKs').disabled === false, '4 attack (review 3, U2): the merged result is taken back while locking → no wallet file is downloaded, and the button comes back · 上锁期间结果被收回 → 不下载钱包文件、按钮恢复');
      else ok(started && w.dls.length === 1 && w.dls[0] === 'my-keystore.json' && w.$('#btnKs').disabled === false, '4 normal: nothing changed while locking → the wallet file is downloaded · 上锁期间没变 → 照常下载钱包文件');
    }
  });

  // ── 4b · Personal orders: progress and resume replies act on one order at a time · 个人靓号：查进度、续单的回包只认这一张单 ──
  //   Review 3 (U1): the payment info, progress and resume replies had no order check (only collecting had one). · 第三轮复查：付款信息、进度、续单的回包原来都不核是哪张单
  console.log('== 4b · personal orders: switching orders · 个人靓号：换单');
  await section('4b', async () => {
    const tick = () => new Promise((r) => setTimeout(r, 0));
    const el = {};
    const gen$ = (id) => el[id] || (el[id] = { id, hidden: true, disabled: true, textContent: '', innerHTML: '', value: '', classList: { toggle: () => {} }, scrollIntoView: () => {}, addEventListener: () => {} });
    const base = () => {
      for (const k of Object.keys(el)) delete el[k];
      const calls = [], seen = { steps: 0, pay: [], lines: [] };
      const ctx = { $: gen$, ORDER_GEN: 1, RESUME_GEN: 0, RESUME: null, PICKED: 'evm', reducedMotion: true, IS_LIVE: false,
        api: (url) => new Promise((resolve) => calls.push({ url, resolve })),
        f: { badId: 'BADID', noSuchOrder: 'NOSUCH', resumeHint: () => '', resuming: () => '', pickSecForResume: 'PICKSEC', watchingAgain: '', mineHit: 'HIT ', readyToTake: 'READY', orderClosed: () => 'CLOSED' },
        L: (o, k) => o[k], MINT: { phase: null, got: 0, want: 0 }, mintView: () => {}, mintStop: () => {}, renderOrders: () => {}, vchShow: () => {}, vchSeen: () => null, vchOpenFor: () => false,
        setStatus: () => {}, outLine: (o, t) => seen.lines.push(t), statusLabel: (s) => s, rememberOrder: () => {}, uploadShare: async () => true,
        showPayment: async (o) => { seen.pay.push(ctx.orderState.orderId); return true; }, stepsEl: { querySelectorAll: () => [] }, setInterval: () => 0, clearInterval: () => {},
      };
      ctx.renderSteps = () => { ctx.ORDER_GEN++; seen.steps++; ctx.orderState = { orderId: null, challenge: null, sec: null }; };
      ctx.orderState = { orderId: null, challenge: null, sec: null };
      vm.createContext(ctx);
      return { ctx, calls, seen };
    };
    // progress · 进度
    {
      const code = slice(APP, '  const pollStatus = () => {', "  $('#btnPay').addEventListener('click'");
      for (const sw of [true, false]) {
        const w = base(); vm.runInContext(code, w.ctx);
        w.ctx.orderState = { orderId: 'aaaaaaaa', challenge: null, poll: null, lastSeen: null, pay: null };
        vm.runInContext('pollStatus()', w.ctx);
        if (sw) vm.runInContext("ORDER_GEN++; orderState = { orderId: 'bbbbbbbb', challenge: null, poll: null, lastSeen: null, pay: null };", w.ctx);
        w.calls[0].resolve({ code: 200, body: { status: 'found', ready: true, challenge: 'CH-A', receiptChallenge: 'RC-A', foundAddress: '0xa' } }); await tick();
        if (sw) ok(w.ctx.orderState.challenge === null && w.ctx.orderState.receiptChallenge === undefined && gen$('#btnDownload').disabled === true, '4b attack (review 3, U1): a progress reply for the previous order does not set this order\'s collect challenge or open "collect" · 上一张单的进度回包不写进这张单、不打开取货');
        else ok(w.ctx.orderState.challenge === 'CH-A' && w.ctx.orderState.receiptChallenge === 'RC-A' && gen$('#btnDownload').disabled === false, '4b normal: the same order → collect opens · 还是这张单 → 打开取货');
      }
    }
    ok(/^let ORDER_GEN = 0, RESUME_GEN = 0;$/m.test(APP), '4b the order generation counters exist at the top of the page code (code check) · 换单计数器在页面代码最外层（读源码）');
    // resume · 续单
    {
      const code = slice(APP, '  RESUME = async (id, quiet) => {', '  // 通用复制');
      const w = base(); vm.runInContext(code, w.ctx);
      const pA = vm.runInContext("RESUME('aaaaaaaa', true)", w.ctx), pB = vm.runInContext("RESUME('bbbbbbbb', true)", w.ctx);
      w.calls[1].resolve({ code: 200, body: { id: 'bbbbbbbb', status: 'share_uploaded', chain: 'evm', prefix: '0000', challenge: 'CH-B', pattern: '0x0000' } }); await pB;
      w.calls[0].resolve({ code: 200, body: { id: 'aaaaaaaa', status: 'found', chain: 'evm', prefix: '1111', challenge: 'CH-A', pattern: '0x1111', foundAddress: '0xa' } }); await pA;
      ok(w.ctx.orderState.orderId === 'bbbbbbbb' && w.ctx.orderState.challenge === 'CH-B' && w.seen.steps === 1 && w.seen.pay.join() === 'bbbbbbbb', '4b attack (review 3, U1): of two resumes, the first coming back late does not take over the second · 连续续两张单，先续的晚回来不盖掉后续的');
      {
        const w2 = base(); vm.runInContext(code, w2.ctx); let ivs = 0, release;
        w2.ctx.setInterval = () => { ivs++; return 1; };
        w2.ctx.showPayment = () => new Promise((r) => { release = r; });
        const pA = vm.runInContext("RESUME('aaaaaaaa', true)", w2.ctx);
        w2.calls[0].resolve({ code: 200, body: { id: 'aaaaaaaa', status: 'paid', chain: 'evm', prefix: '1111', challenge: 'CH-A', pattern: '0x1111' } }); await tick();
        vm.runInContext("renderSteps(); orderState.orderId = 'bbbbbbbb';", w2.ctx);   // he switched to another order meanwhile · 这期间换了单
        const disabledBefore = gen$('#btnPay').disabled = false;
        release(true); await pA;
        ok(ivs === 0 && gen$('#btnPay').disabled === false && w2.ctx.orderState.orderId === 'bbbbbbbb', '4b attack (review 3, U1): an order switch while a resume is still waiting stops that resume (no progress polling, no button changes for the old order) · 续单还在等的时候换了单 → 那一次续单就此停下（不给旧单开轮询、不动按钮）');
      }
      {
        const w3 = base(); vm.runInContext(code, w3.ctx); let release; const keep = { s: 1n, chain: 'evm' };
        w3.ctx.orderState.sec = keep; w3.ctx.renderSteps = () => { w3.ctx.ORDER_GEN++; w3.seen.steps++; w3.ctx.orderState = { orderId: null, challenge: null, sec: keep }; };
        w3.ctx.uploadShare = () => new Promise((r) => { release = r; });
        const pA = vm.runInContext("RESUME('aaaaaaaa', true)", w3.ctx);
        w3.calls[0].resolve({ code: 200, body: { id: 'aaaaaaaa', status: 'created', chain: 'evm', prefix: '1111', challenge: 'CH-A', pattern: '0x1111' } }); await tick();
        vm.runInContext("renderSteps(); orderState.orderId = 'bbbbbbbb';", w3.ctx);
        release(true); await pA;
        ok(w3.seen.pay.length === 0, '4b attack (review 3, U1): an order switch while the old order\'s share upload is still going → no payment info is fetched for the old order · 旧单还在交份额时换了单 → 不再给旧单取付款信息');
      }
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

  // ── 5b · Wording on the pages themselves (not only the documents) · 页面本身的说法（不只是文档）──
  //   Review 3: the earlier wording check only read wp / ppt / README; the home page, the Free Generator, the workflows and the FAQ were not read. · 第三轮复查：原来只查白皮书 / 说明书 / README
  console.log('== 5b · wording on the pages · 页面上的说法');
  await section('5b', async () => {
    const banned = [
      [/你自己的地址只留在你的浏览器里|Your own address stays in your browser|Alamat Anda sendiri tetap di browser Anda|stays on this page only|只留在这一页|hanya ada di halaman ini/, 'own address stays local · 自己的地址只留在本地'],
      [/cannot be deleted|删不掉|Commit history itself cannot be edited|提交记录本身改不了/, 'public record cannot be deleted · 公开记录删不掉'],
      [/GitHub’s machines, not ours|run by GitHub, not by us|不在我们的|bukan di mesin kami|dijalankan GitHub, bukan kami/, 'checks are not ours · 检查不归我们管'],
      [/检查我们插不上手|我们碰不到：|we cannot touch them|kami tidak bisa menyentuhnya|the platform cannot touch it|平台插不上手|平台写不进来|which the platform cannot write/, 'the platform cannot touch the checks · 说平台碰不到检查'],
      [/stays public in the history|改动都公开留在历史里|tetap publik di riwayat/, 'the change history stays public forever · 改动永远公开'],
      [/sends nothing anywhere|不往任何地方发送任何东西|tidak mengirim apa pun ke mana pun/, 'sends nothing at all · 什么都不发'],
      [/two checks run on GitHub all the time|两项检查一直在跑|dua pemeriksaan terus berjalan/, 'checks run all the time · 检查一直在跑'],
      [/(?<!按计划)每小时(巡检|一次|再拿|自动|下载)|(?<!terjadwal |jadwal )setiap jam(, mesin| dan| dicek|'|\.)/, 'hourly checks without "scheduled" · 每小时却不说按计划'],
      [/服务器不知道这两个地址是一起查的/, 'the server does not know the two addresses were checked together · 说服务器不知道两个地址一起查'],
      [/(?<!on an |a scheduled )(?:every hour|hourly tamper)/i, 'hourly checks without "scheduled" (en) · 英文每小时却不说按计划'],
    ];
    const here = (f) => [path.join(ROOT, f), path.join(ROOT, '..', f)].find((p) => fs.existsSync(p));
    const files = ['js/app.js', 'index.html', 'js/freeapp.js', 'free.html', 'js/c2app.js', 'contract.html', 'token.html', 'js/fcheck.js', 'faq.html',
      '.github/workflows/noleak.yml', '.github/workflows/tamper-check.yml', '.github/workflows/fonts.yml'].map(here).filter(Boolean);
    ok(files.length >= 8, '5b (gauge) found the page files to read: ' + files.length + ' · 量具自证：找得到要读的页面文件');
    for (const f of files) {
      const s = fs.readFileSync(f, 'utf8'), hits = banned.filter(([re]) => re.test(s)).map(([, m]) => m);
      ok(hits.length === 0, '5b ' + path.relative(path.join(ROOT, '..'), f) + ': ' + (hits.length ? hits.join(' / ') : 'none of the overstated claims · 没有说过头的话'));
    }
    // the unencrypted backup is said plainly, in all three languages · 「备份文件没有加密」三种语言都照实写
    const gen = [...APP.matchAll(/^ {6}genOk: '([^']+)'/gm)].map((m) => m[1]);
    ok(gen.length === 3 && /没有加密/.test(gen[0]) && /not encrypted/.test(gen[1]) && /tidak dienkripsi/.test(gen[2]), '5b the step-1 message says my-secret-s.json is not encrypted (zh / en / id) · 第 1 步那句三种语言都说备份没有加密');
    const C2S = rd('js/c2app.js'), three = (src, k) => (src.match(new RegExp('^ +' + k + ": ['(]", 'gm')) || []).length === 3;
    const appKeys = ['payBad', 'addrStop', 'receiptOdd', 'receiptNeedMerge'], c2Keys = ['reqSame', 'reqDiff', 'reqNone', 'reqStop', 'reqGo', 'reqBadIn', 'reqTypedDiff'];
    const missing = appKeys.filter((k) => !three(APP, k)).concat(c2Keys.filter((k) => !three(C2S, k)));
    ok(missing.length === 0, '5b the stop / refuse messages these paths show exist in all three languages' + (missing.length ? ': missing ' + missing.join(', ') : '') + ' · 这些地方停下来时说的话三种语言都有');
    const KCS = rd('js/keycore.js');
    ok(/warning: '[^']*NOT encrypted/.test(KCS) && /warning_zh: '[^']*没有加密/.test(KCS) && /warning_id: '[^']*TIDAK dienkripsi/.test(KCS), '5b the warning inside my-secret-s.json says it is not encrypted (en / zh / id) · 备份文件里的提醒三种语言都说没有加密');
    const IDX = rd('index.html'), mine = /id="fcMine"[^>]*placeholder="([^"]*)"/.exec(IDX);
    ok(!/href="admin\.html"/.test(IDX), '5b the public home page does not link to the admin page · 公开首页不再链到管理后台');
    ok(mine && /sent to us/.test(mine[1]) && !/stays on this page/.test(mine[1]), '5b the home page\'s built-in placeholder for "your own address" says it is sent to us · 首页自带的那句占位字照实说会发给我们');
  });

  // ── 6 · Payment card page (card.html): fields from the API never become HTML; links only in the expected shape ──
  //   6 · 收款名片页：接口给的字不会变成 HTML；能点的链接只认该有的样子（第三轮复查 N2 / S6 / U3）
  console.log('== 6 · payment card page · 收款名片页');
  await section('6', async () => {
    const CARD = [path.join(ROOT, 'card.html'), path.join(ROOT, '..', 'card.html')].find((p) => fs.existsSync(p));
    if (!CARD) throw new Error('card.html not found next to ' + ROOT);
    const page = fs.readFileSync(CARD, 'utf8'), js = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).pop();
    const region = slice(js, '  const T = {', '  const LANG_KEY');
    const ctx = vm.createContext({});
    const g = vm.runInContext('(() => {\n' + region + '\nreturn { T, esc, imitateOk: typeof imitateOk === "function" ? imitateOk : null, httpsUrl: typeof httpsUrl === "function" ? httpsUrl : null, tidy: typeof tidy === "function" ? tidy : null, hostOk: typeof hostOk === "function" ? hostOk : null, handleOk: typeof handleOk === "function" ? handleOk : null };\n})()', ctx);
    const only = (h) => !/</.test(h.replace(/<\/?b>/g, ''));   // the only tags we write ourselves are <b></b> · 我们自己写的只有 <b></b>
    const evil = { pattern: '<img src=x onerror=alert(1)>', checkText: '"><svg onload=alert(1)>', end: 'tail', days: 3, usd: 9 };
    let all = true, n = 0;
    for (const L of ['zh', 'en', 'id']) for (const fn of ['hard', 'hardSuf']) { n++; if (!only(g.T[L][fn](evil))) all = false; }
    ok(n === 6 && all, '6 attack (review 3, N2): the "how hard to fake" line with HTML in the pattern / other end → plain text, all three languages, both kinds · 「仿一个要多久」那句：图案、另一头塞 HTML → 照字显示（三种语言、两种图案）');
    const fine = g.T.en.hard({ pattern: '0x00000000', checkText: 'c0ffee', end: 'tail', days: 3, usd: 9 });
    ok(fine.includes('0x00000000') && fine.includes('c0ffee') && /<b>[^<]+<\/b>/.test(fine), '6 normal: the line still shows the pattern, the other end and the bold numbers · 正常的照样显示图案、另一头、加粗的数');
    const addr = '0x00000000' + 'ab'.repeat(13) + 'c0ffee';
    const io = g.imitateOk;
    ok(!!io && io({ chain: 'evm', address: addr, imitate: { pattern: '0x00000000', checkText: 'c0ffee', end: 'tail', days: 1, usd: 2 } })
      && !io({ chain: 'evm', address: addr, imitate: { pattern: '0x0000<b>', checkText: 'c0ffee', end: 'tail', days: 1, usd: 2 } })
      && !io({ chain: 'evm', address: addr, imitate: { pattern: '0x11111111', checkText: 'c0ffee', end: 'tail', days: 1, usd: 2 } })
      && !io({ chain: 'evm', address: addr, imitate: { pattern: '0x00000000', checkText: 'c0ffee', end: 'tail', days: 'x', usd: 2 } }),
      '6 the imitate fields are checked before use: only address characters that really are at that end, numbers as numbers · 用之前先核样子：只能是地址里真有的那一头、数字就是数字');
    const hu = g.httpsUrl;
    ok(!!hu && hu('https://0x000000000.com') && hu('https://github.com/0x000000000-com/0x000000000') && !hu('javascript:alert(1)') && !hu('http://x.com') && !hu('https://x.com/"onmouseover=1'), '6 attack (review 3, S6): links on the card only take https addresses (javascript: and friends are not links) · 名片上的链接只认 https 网址');
    ok(/httpsUrl\(data\.site\)/.test(js) && /httpsUrl\(data\.github\)/.test(js) && !/kv\(L\.oSite, data\.site, data\.site\)/.test(js), '6 the official card uses that check for its links (code check) · 官方名片的链接走这个检查（读源码）');
    const td = g.tidy;
    ok(!!td && td({ status: 'live', expiresAt: Date.now() - 1000, addresses: [] }).status === 'expired' && td({ status: 'live', owner: true, expiresAt: Date.now() - 1000, addresses: [] }).status === 'live', '6 (review 3, U3/S5) a card whose time is up shows as expired on an open page (owner cards never expire) · 到期时间一过，开着的页面也变「已过期」（店主名片不会到期）');
    {
      const card = { status: 'live', addresses: [{ chain: 'evm', address: addr, imitate: { pattern: '<img src=x>', checkText: 'c0ffee', end: 'tail', days: 1, usd: 2 } }, { chain: 'evm', address: addr, imitate: { pattern: '0x00000000', checkText: 'c0ffee', end: 'tail', days: 1, usd: 2 } }] };
      const t2 = td ? td(card) : null;
      ok(!!t2 && t2.addresses[0].imitate === null && !!t2.addresses[1].imitate, '6 the check runs on what the API returns before anything is drawn (a bad imitate block is dropped, a good one kept) · 接口回来、画之前就核（坏的那块丢掉、好的留着）');
    }
    const ho = g.hostOk, hd = g.handleOk;
    ok(!!ho && !!hd && ho('example.com') && !ho('evil.com/x') && !ho('a@evil.com') && !ho('javascript:alert(1)') && hd('user_1', 15) && !hd('a"b', 15) && !hd('x'.repeat(16), 15), '6 a personal card links its site / X / TG only when they look right; otherwise they show as text · 个人名片的官网 / X / TG 样子对了才做成链接，不对只显示字');
    ok(/hostOk\(c\.domain\) \?/.test(js) && /handleOk\(c\.x\.handle, 15\) \?/.test(js) && /handleOk\(c\.tg\.channel, 32\) \?/.test(js), '6 the personal card uses those checks for its links (code check) · 个人名片的链接走这些检查（读源码）');
    ok(/c\.status === 'live' && \/\^\[a-z0-9_\]\{3,40\}\$\/\.test\(n\)/.test(js) && /encodeURIComponent\(c\.name\) \+ '\.png/.test(js), '6 the badge HTML (pasted into the owner\'s own site) is only offered for a well-formed name; the picture link encodes the name (code check) · 要贴进他自己网站的那段 HTML 只给样子对的名字；存图链接把名字编码（读源码）');
    ok(/let state = [^\n]*fetchedAt = 0/.test(js) && /const FRESH_MS = /.test(js) && /async function copy\(text, btn, isAddr\)/.test(js) && /copy\(a\.address, cb, true\)/.test(js)
      && /data = tidy\(j\)/.test(js) && /fetchedAt = Date\.now\(\)/.test(js) && /if \(NAME\) loadCard\(\);/.test(js), '6 (review 3, U3/S5) the re-read is wired in: one loader that checks what it gets and stamps the time, address buttons ask for the re-check (code check) · 重新读名片接上了：同一个读取口、读到就核、记时间，复制地址的按钮要求先核（读源码）');
    ok(/isAddr && NAME && Date\.now\(\) - fetchedAt > FRESH_MS/.test(js) && /visibilitychange'[^\n]*loadCard\(\)/.test(js), '6 (review 3, U3/S5) the card is read again when the page comes back after a while and before copying an address (code check) · 隔一阵回来、复制地址之前都重新读名片（读源码）');
  });

  // ── 7 · Free Generator: the "saved" mark belongs to the result whose wallet file was saved · 免费生成页：「存好了」只属于真存了钱包文件的那一个结果 ──
  //   Review 3 (N3): while one wallet file was still being locked, a new address could be generated, and the old save then marked the new one "saved".
  //   第三轮复查：上一个钱包文件还在上锁，就能再算出一个新地址；旧的锁完，新的被当成「存好了」（关页面不再提醒）
  console.log('== 7 · Free Generator saved mark · 免费生成页「存好了」');
  await section('7', async () => {
    const FA = rd('js/freeapp.js');
    const tick = () => new Promise((r) => setTimeout(r, 0));
    const el = {}, on = {}, win = {}, starts = [], pend = [], dls = [];
    const mk = (id) => el[id] || (el[id] = { id, hidden: false, disabled: false, value: '', textContent: '', innerHTML: '', className: '', placeholder: '', maxLength: 0, open: false, style: {},
      classList: { toggle: () => {}, add: () => {}, remove: () => {} }, addEventListener: (e, fn) => { on[id + ':' + e] = fn; }, insertAdjacentHTML: function (w, h) { this.innerHTML += h; },
      focus: () => {}, getAttribute: () => null, click: () => {}, remove: () => {}, appendChild: () => {} });
    const document = { querySelector: (s) => mk(s), getElementById: (id) => mk('#' + id), querySelectorAll: () => [], documentElement: {}, title: '', body: mk('body'),
      createElement: () => { const a = mk('a' + Math.random()); a.click = () => dls.push(a.download); return a; } };
    const FG = { norm: (c, w, v) => String(v || '').trim(), CAP: { evm: 10, tron: 10 }, problem: () => null, expected: () => 16, stop: () => {},
      start: (o, cb) => { starts.push(cb); return { workers: 2 }; } };
    const KC = { setLang: () => {}, keystoreName: () => 'my-keystore.json', addrOf: () => '0x' + '0'.repeat(40),
      keystore: (k, addr) => new Promise((res, rej) => pend.push({ res, rej, addr })) };
    const ctx = { document, window: win, navigator: { onLine: true }, localStorage: { getItem: () => null, setItem: () => {} }, location: { protocol: 'https:', search: '', pathname: '/free', hash: '' },
      history: { replaceState: () => {} }, URL: { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} }, Blob: function () {}, Worker: function () {}, BigInt,
      crypto: { getRandomValues: (a) => a, subtle: {} }, setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0, clearTimeout: () => {}, Promise, Date, Math, JSON, String, Number, Object };
    win.FreeGen = FG; win.KeyCore = KC; win.crypto = ctx.crypto; win.addEventListener = (e, fn) => { on['win:' + e] = fn; };
    vm.createContext(ctx); vm.runInContext(FA, ctx);
    const click = (id) => on[id + ':click'] && on[id + ':click']();
    const leaveWarns = () => { const e = { p: false, preventDefault() { this.p = true; } }; on['win:beforeunload'](e); return e.p; };
    const R = (n) => ({ addr: '0x' + String(n).repeat(40).slice(0, 40), k: BigInt(n), chain: 'evm', where: 'prefix', pat: '00', tried: 10, ms: 5 });
    mk('#patIn').value = '00';
    click('#btnGo'); starts[0] && starts[0].found(R(1));
    mk('#ksPw').value = 'correct horse 1'; mk('#ksPw2').value = 'correct horse 1';
    click('#btnKs');
    ok(starts.length === 1 && pend.length === 1 && pend[0].addr === R(1).addr, '7 (setup) one address found, its wallet file is being locked · 算出一个地址，正在给它的钱包文件上锁');
    click('#btnAgain'); click('#btnGo'); if (starts[1]) starts[1].found(R(2));
    const blocked = starts.length === 1;
    pend[0].res({ version: 3 }); await tick(); await tick();
    ok(blocked, '7 attack (review 3, N3): while a wallet file is being locked, "make another" and "generate" do nothing · 上锁的时候，「再算一个」「生成」都不动');
    ok(blocked ? !leaveWarns() && !mk('#afterBox').hidden : leaveWarns(), '7 attack (review 3, N3): the "saved" mark only belongs to the address whose wallet file was saved (leaving the page warns for an unsaved one) · 「存好了」只属于存了文件的那个地址（没存的关页面照样提醒）');
    // normal: after saving, generating again works, and the new one is "not saved" until its own file is saved · 正常：存好之后可以再算；新的那个在自己存好之前都算「没存」
    click('#btnGo'); const n1 = starts.length; if (starts[n1 - 1] && n1 >= 2) starts[n1 - 1].found(R(3));
    const warnNew = leaveWarns();
    mk('#ksPw').value = 'correct horse 2'; mk('#ksPw2').value = 'correct horse 2';   // generating again clears the password boxes · 再算一次会清掉密码框
    const np = pend.length; click('#btnKs'); const last = pend.length > np ? pend[pend.length - 1] : null; if (last) last.res({ version: 3 }); await tick(); await tick();
    ok(n1 >= 2 && warnNew && !!last && !leaveWarns() && dls.length >= 2, '7 normal: after saving, a new address can be generated; it warns until its own wallet file is saved · 存好之后能再算；新地址自己存好之前关页面会提醒');
  });

  console.log(`  total ${good} passed · ${bad} not · 合计 ${good} 条对 · ${bad} 条不对 ${bad ? '★' : '✓'}`);
  process.exitCode = bad ? 1 : 0; finished = true;
})();
