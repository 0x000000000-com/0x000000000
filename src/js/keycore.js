// KEYCORE0X_20260923 —— 密钥运算的【唯一事实来源】。
//
// 为什么要有这个文件：原来这一套只存在于 tool.html 里，于是首页想做同样的事
//   就只能叫用户跳过去、来回切标签页。要让首页自己会做，只有两条路：
//   把代码抄一份到 app.js（两份必然分叉，今天已经吃过三次同族的亏），
//   或者抽成一份大家共用。这里选后者。
//
// 交付有两种形态，但源头只有这一个文件：
//   · 首页  index.html  ->  <script src="js/keycore.js">
//   · 工具页 tool.html  ->  打包时把这个文件【原样内联】进去（它必须是单文件、
//     能下载下来离线双击打开，这是「私钥不出这台电脑」那条承诺的载体）
//   _mk0xdep.py 的 KEYINLINE0X 闸会逐字节比对内联的那份跟这个文件，分叉就拒绝出包。
//
// 这个文件【不碰 DOM、不联网】。所有判据跟后端 chains.mjs 逐例对照，
//   由 demo/tron-tool.test.mjs 把函数从本文件里抠出来跑。
(function (root) {
  'use strict';
  var N = root.NOBLE;
  var G = N.ProjectivePoint.BASE, n = N.CURVE.n;
  var enc = new TextEncoder();

  function hex(u) { var s = '', i; for (i = 0; i < u.length; i++) s += (u[i] < 16 ? '0' : '') + u[i].toString(16); return s; }

  function u8(h) { h = h.replace(/^0x/i, ''); var a = new Uint8Array(h.length / 2), i;
    for (i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }

  function pad64(x) { var s = x.toString(16); while (s.length < 64) s = '0' + s; return s; }

  function rnd(k) { return crypto.getRandomValues(new Uint8Array(k)); }

  var B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  function b58enc(bytes) {
    var num = 0n, i;
    for (i = 0; i < bytes.length; i++) num = num * 256n + BigInt(bytes[i]);
    var out = '';
    while (num > 0n) { out = B58[Number(num % 58n)] + out; num = num / 58n; }
    for (i = 0; i < bytes.length && bytes[i] === 0; i++) out = '1' + out;   // 前导零 -> '1'
    return out;
  }

  function tronFromHash20(h20) {
    var body = new Uint8Array(21); body[0] = 0x41; body.set(h20, 1);
    var chk = N.sha256(N.sha256(body)).subarray(0, 4);
    var full = new Uint8Array(25); full.set(body, 0); full.set(chk, 21);
    return b58enc(full);
  }

  function hash20FromPriv(k) {
    return N.keccak_256(N.getPublicKey(u8(pad64(k)), false).subarray(1)).subarray(12);
  }

  function addrFromPriv(k) { return '0x' + hex(N.keccak_256(N.getPublicKey(u8(pad64(k)), false).subarray(1)).subarray(12)); }

  function addrOf(chain, k) {
    return chain === 'tron' ? tronFromHash20(hash20FromPriv(k)) : addrFromPriv(k);
  }

  function addrBody(chain, addr) { return chain === 'tron' ? addr : addr.replace(/^0x/i, ''); }

  function addrHit(chain, pre, suf, addr) {
    var body = addrBody(chain, addr);
    if (!pre && !suf) return false;
    if (pre && body.indexOf(pre) !== 0) return false;
    if (suf && body.slice(body.length - suf.length) !== suf) return false;
    return true;
  }

  function secShape(sec) {
    return {
      chain:  sec.chain  || 'evm',
      prefix: sec.prefix !== undefined ? sec.prefix : (sec.pattern || ''),
      suffix: sec.suffix || ''
    };
  }

  // b 的格式跟 CLI 一模一样：纯数字=十进制，0x 开头或带 a-f 字母=十六进制
  function parseB(t) {
    t = String(t || '').trim();
    if (!t) throw new Error('b 是空的');
    var isHex = /^0x/i.test(t) || /[a-f]/i.test(t);
    if (!isHex && !/^[0-9]+$/.test(t)) throw new Error('b 里有不认识的字符');
    if (isHex && !/^(0x)?[0-9a-f]+$/i.test(t)) throw new Error('b 里有不认识的字符');
    return BigInt(isHex ? (/^0x/i.test(t) ? t : '0x' + t) : t);
  }

  var TOOL_CHAINS = {
    evm:  { label: 'EVM 地址', alphabet: '0123456789abcdef', pos: [],
            addrLen: 40, lower: true,
            rule: '十六进制，只能用 0-9 a-f（开头的 0x 不用写）' },
    tron: { label: 'TRON 地址', alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
            pos: ['T', '9ABCDEFGHJKLMNPQRSTUVWXYZ'], addrLen: 34, lower: false,
            rule: '第 1 位一定是 T，第 2 位只能是 9 或 A-Z（没有 I O 0），其余用 base58（没有 0 O I l）' }
  };

  // ---------- GLV 变体（GLV0X_20260923）----------
  // GPU 内核用 GLV 自同态，一个点派生 6 个候选地址。命中来自哪一个，还原公式就不一样：
  //   k = variantK((s+b) mod n, variant)，variant ∈ 0..5，不是恒等的 (s+b)。
  // 这里【不让你选】变体 —— 六个全算出来，用「地址对不对得上」自己挑。挑不出就拒，不猜。
  var GLV_LAM = BigInt('0x5363AD4CC05C30E0A5261C028812645A122E22EA20816678DF02967C1B23BD72');
  function variantK(base, v) {
    var t = base % n;
    if (v % 3 === 1) t = (t * GLV_LAM) % n;
    else if (v % 3 === 2) t = ((t * GLV_LAM) % n * GLV_LAM) % n;
    return v >= 3 ? (n - t) % n : t;
  }
  function mergeCandidates(sv, b, chain) {
    var base = (sv + b) % n, out = [], v;
    for (v = 0; v < 6; v++) { var k = variantK(base, v); out.push({ v: v, k: k, addr: addrOf(chain || 'evm', k) }); }
    return out;
  }
  function pickByOracle(cands, test) {
    for (var i = 0; i < cands.length; i++) if (test(cands[i].addr)) return cands[i];
    return null;
  }
  function candList(cands) {
    return cands.map(function (c) { return '  变体 ' + c.v + ': ' + c.addr; }).join('\n');
  }

  // ── 链元数据：跟后端 chains.mjs 同一套 ──────────────────────────────
  var CHAINS = TOOL_CHAINS;

  function patProblem(chain, pre, suf) {
    var c = CHAINS[chain] || CHAINS.evm, i;
    if (!pre && !suf) return '前缀和后缀都是空的 —— 至少要钉一头。';
    if (pre.length + suf.length > c.addrLen)
      return c.label + '一共 ' + c.addrLen + ' 位，前 ' + pre.length + ' + 后 ' + suf.length + ' 放不下。';
    for (i = 0; i < pre.length; i++) {
      var allowed = c.pos[i] || c.alphabet;
      if (allowed.indexOf(pre[i]) < 0)
        return c.label + '的第 ' + (i + 1) + ' 位不可能是「' + pre[i] + '」—— 这一位只可能是：' + allowed;
    }
    for (i = 0; i < suf.length; i++)
      if (c.alphabet.indexOf(suf[i]) < 0)
        return c.label + '的后缀里不可能有「' + suf[i] + '」—— 只能用：' + c.alphabet;
    return null;
  }

  // ── 上面是判据，下面是四件事：造钥匙 / 签挑战 / 合钥匙 / 签回执 ──────
  // 每一件都是纯函数：进什么出什么，不读页面、不写页面。

  // ① 造钥匙：随机一个 s，算出影子 A，顺便把两个要保存的 JSON 也拼好
  function makeShare(chain, pre, suf) {
    var why = patProblem(chain, pre, suf);
    if (why) throw new Error(why);
    var s;
    do { s = BigInt('0x' + hex(rnd(32))); } while (s === 0n || s >= n);
    var A = hex(G.multiply(s).toRawBytes(false));
    return {
      s: s, A: A, chain: chain, prefix: pre, suffix: suf,
      secret: JSON.stringify({
        warning: '这是你的秘密份额(第一半)。丢了=靓号永久死亡, 平台无法找回。绝不外传, 离线备份。',
        chain: chain, prefix: pre, suffix: suf,
        pattern: pre,
        s: pad64(s)
      }, null, 2),
      upload: JSON.stringify({ chain: chain, prefix: pre, suffix: suf, A: A }, null, 2)
    };
  }

  // 读 my-secret-s.json 的文本。老文件只有 pattern（一定是 EVM 小写），
  // 所以只在【没写 chain】的时候才沿用小写那套 —— TRON 的 base58 区分大小写。
  function readSecretJson(text) {
    var j = JSON.parse(text);
    if (!j.s || !/^[0-9a-f]{64}$/i.test(j.s)) throw new Error('这个文件里没有合法的 s —— 选错文件了？');
    var s = BigInt('0x' + j.s);
    if (s <= 0n || s >= n) throw new Error('文件里的 s 不在合法范围内');
    var ch = j.chain === 'tron' ? 'tron' : 'evm';
    var keep = function (v) { var x = String(v || ''); return ch === 'tron' ? x : x.toLowerCase(); };
    return {
      s: s, chain: ch,
      prefix: keep(j.prefix !== undefined ? j.prefix : j.pattern),
      suffix: keep(j.suffix),
      pattern: keep(j.pattern !== undefined ? j.pattern : j.prefix)
    };
  }

  // ② 签挑战：用 s 给挑战串签名，证明 s 在你手上（防白嫖算力）
  function signChallenge(s, challenge) {
    var msg = String(challenge || '').trim();
    if (!msg) throw new Error('挑战串是空的。');
    return {
      sig: hex(N.sign(N.keccak_256(enc.encode(msg)), u8(pad64(s))).toCompactRawBytes()),
      A: hex(G.multiply(s).toRawBytes(false))
    };
  }

  // ③ 合钥匙：六个 GLV 变体里，按地址挑出对的那一个
  function merge(sec, b) {
    var sh = secShape(sec);
    var cands = mergeCandidates(sec.s, b, sh.chain);
    var hit = (sh.prefix || sh.suffix)
      ? pickByOracle(cands, function (a) { return addrHit(sh.chain, sh.prefix, sh.suffix, a); })
      : cands[0];
    var want = (sh.prefix || '') + (sh.suffix ? '…' + sh.suffix : '');
    if (!hit) return { ok: false, want: want, chain: sh.chain, cands: cands };
    return { ok: true, k: hit.k, addr: hit.addr, variant: hit.v, want: want, chain: sh.chain, cands: cands };
  }

  // ④ 签回执：用合出来的完整 k 给回执原文签名。平台没有 s，造不出这个签名。
  function signReceipt(sec, b, message) {
    var msg = String(message || '').replace(/\r\n/g, '\n').replace(/\s+$/, '');
    if (!msg) throw new Error('回执原文是空的。');
    var cands = mergeCandidates(sec.s, b, secShape(sec).chain);
    var hit = pickByOracle(cands, function (a) { return msg.indexOf(a) >= 0; });
    if (!hit) return { ok: false, cands: cands };
    return { ok: true, addr: hit.addr,
             sig: hex(N.sign(N.keccak_256(enc.encode(msg)), u8(pad64(hit.k))).toCompactRawBytes()) };
  }

  // keystore v3（web3 secret storage）。故意算得慢：暴力猜密码也得这么慢。
  // ★ address 那一栏按链分开 —— 原来一律 addr.slice(2)，TRON 地址会被啃掉开头的两位。
  function keystore(k, addr, chain, pw, onp) {
    var salt = rnd(32), iv = rnd(16);
    return N.scryptAsync(enc.encode(pw), salt, { N: 131072, r: 8, p: 1, dkLen: 32, maxmem: 300 * 1024 * 1024, onProgress: onp })
      .then(function (dk) {
        return crypto.subtle.importKey('raw', dk.slice(0, 16), { name: 'AES-CTR' }, false, ['encrypt'])
          .then(function (key) {
            return crypto.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 128 }, key, u8(pad64(k)));
          })
          .then(function (buf) {
            var ct = new Uint8Array(buf);
            var macIn = new Uint8Array(16 + ct.length);
            macIn.set(dk.subarray(16, 32), 0); macIn.set(ct, 16);
            return {
              version: 3,
              id: (crypto.randomUUID ? crypto.randomUUID() : hex(rnd(16))),
              address: chain === 'tron' ? addr : addr.replace(/^0x/i, '').toLowerCase(),
              chain: chain,
              crypto: {
                cipher: 'aes-128-ctr',
                cipherparams: { iv: hex(iv) },
                ciphertext: hex(ct),
                kdf: 'scrypt',
                kdfparams: { dklen: 32, n: 131072, r: 8, p: 1, salt: hex(salt) },
                mac: hex(N.keccak_256(macIn))
              }
            };
          });
      });
  }

  root.KeyCore = {
    CHAINS: CHAINS, n: n,
    hex: hex, u8: u8, pad64: pad64, rnd: rnd,
    addrOf: addrOf, addrBody: addrBody, addrHit: addrHit,
    secShape: secShape, patProblem: patProblem, parseB: parseB,
    variantK: variantK, mergeCandidates: mergeCandidates, pickByOracle: pickByOracle, candList: candList,
    makeShare: makeShare, readSecretJson: readSecretJson,
    signChallenge: signChallenge, merge: merge, signReceipt: signReceipt,
    keystore: keystore
  };
})(window);
