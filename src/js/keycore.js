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

  // I18N0X_20260924：这个文件里的每一句提示都会被页面原样印出来 —— 原来全是中文，
  //   页面默认英文之后（DSJ「把网页默认成英文…每改一字都必须同时翻译双语」），英文界面就会冒中文。
  //   页面切语言时调 setLang；没调过就是英文。
  var LANG = 'en';
  function M(zh, en) { return LANG === 'zh' ? zh : en; }
  function setLang(l) { LANG = l === 'zh' ? 'zh' : 'en'; }

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
    if (!t) throw new Error(M('b 是空的', 'b is empty'));
    var isHex = /^0x/i.test(t) || /[a-f]/i.test(t);
    if (!isHex && !/^[0-9]+$/.test(t)) throw new Error(M('b 里有不认识的字符', 'b contains characters that do not belong in it'));
    if (isHex && !/^(0x)?[0-9a-f]+$/i.test(t)) throw new Error(M('b 里有不认识的字符', 'b contains characters that do not belong in it'));
    return BigInt(isHex ? (/^0x/i.test(t) ? t : '0x' + t) : t);
  }

  var TOOL_CHAINS = {
    evm:  { label: 'EVM 地址', labelEn: 'EVM address', alphabet: '0123456789abcdef', pos: [],
            addrLen: 40, lower: true },
    tron: { label: 'TRON 地址', labelEn: 'TRON address', alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
            pos: ['T', '9ABCDEFGHJKLMNPQRSTUVWXYZ'], addrLen: 34, lower: false }
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
    return cands.map(function (c) { return M('  候选 ', '  candidate ') + c.v + ': ' + c.addr; }).join('\n');
  }

  // ── 链元数据：跟后端 chains.mjs 同一套 ──────────────────────────────
  var CHAINS = TOOL_CHAINS;

  function patProblem(chain, pre, suf) {
    var c = CHAINS[chain] || CHAINS.evm, i;
    if (!pre && !suf) return M('前缀和后缀都是空的 —— 至少要钉一头。', 'Both the start and the end are empty - pin at least one of them.');
    if (pre.length + suf.length > c.addrLen)
      return M(c.label + '一共 ' + c.addrLen + ' 位，前 ' + pre.length + ' + 后 ' + suf.length + ' 放不下。',
               'A ' + c.labelEn + ' has ' + c.addrLen + ' characters - ' + pre.length + ' at the start plus ' + suf.length + ' at the end do not fit.');
    for (i = 0; i < pre.length; i++) {
      var allowed = c.pos[i] || c.alphabet;
      if (allowed.indexOf(pre[i]) < 0)
        return M(c.label + '的第 ' + (i + 1) + ' 位不可能是「' + pre[i] + '」—— 这一位只可能是：' + allowed,
                 'Character ' + (i + 1) + ' of a ' + c.labelEn + ' can never be "' + pre[i] + '" - it can only be one of: ' + allowed);
    }
    for (i = 0; i < suf.length; i++)
      if (c.alphabet.indexOf(suf[i]) < 0)
        return M(c.label + '的后缀里不可能有「' + suf[i] + '」—— 只能用：' + c.alphabet,
                 'The end of a ' + c.labelEn + ' can never contain "' + suf[i] + '" - only: ' + c.alphabet);
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
        warning: 'Your secret half of the key. Lose it and this address is gone forever - nobody can recover it. Never share it; keep an offline backup.',
        warning_zh: '这是你的秘密份额(第一半)。丢了=靓号永久死亡, 平台无法找回。绝不外传, 离线备份。',
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
    if (!j.s || !/^[0-9a-f]{64}$/i.test(j.s)) throw new Error(M('这个文件里没有合法的 s —— 选错文件了？', 'This file has no valid s in it - wrong file?'));
    var s = BigInt('0x' + j.s);
    if (s <= 0n || s >= n) throw new Error(M('文件里的 s 不在合法范围内', 'The s in this file is out of range'));
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
    if (!msg) throw new Error(M('挑战串是空的。', 'The challenge phrase is empty.'));
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
    if (!msg) throw new Error(M('回执原文是空的。', 'The receipt text is empty.'));
    var cands = mergeCandidates(sec.s, b, secShape(sec).chain);
    var hit = pickByOracle(cands, function (a) { return msg.indexOf(a) >= 0; });
    if (!hit) return { ok: false, cands: cands };
    return { ok: true, addr: hit.addr,
             sig: hex(N.sign(N.keccak_256(enc.encode(msg)), u8(pad64(hit.k))).toCompactRawBytes()) };
  }

  // keystore v3（web3 secret storage）。故意算得慢：暴力猜密码也得这么慢。
  // KSIMPORT0X_20260924：DSJ 拿 TRON 的钱包文件导不进 TronLink —— 原来 address 那一栏写的是 T 开头的地址。
  //   TronLink 4.11 导入 keystore 的那段代码（扩展包 3725.js 的 ve()）：address 开头的 41 换成 0x、否则前面补 0x，
  //   交给 ethers 按 0x 地址核对，再用 TronWeb.address.fromHex 换回 T 地址跟私钥算出来的比。
  //   写 T… 在第一步就被判「地址不合法」，而它把异常吞掉了 —— 用户看到的只是「导入不了」。
  //   现在：TRON 写 41 + 40 位十六进制（同一个地址的另一种写法，TronLink 读得懂），EVM 写 40 位十六进制（MetaMask 的写法）。
  //   ★ 写之前当场核对：这一栏换回原来的写法必须等于合出来的那个地址，对不上就不写文件。
  //   另外文件最上面放一段 readme（英文 + 中文）：DSJ「我打开时是不需要输入密码的…里面一堆不懂是什么…哪个是私钥？」——
  //   在他打开文件的那一刻就用人话说清楚。
  function readme(chain, addr) {
    var tron = chain === 'tron';
    return {
      en: 'This is your wallet file (the standard Web3 keystore format, version 3). Your private key is inside, locked with the password you set - it is the "ciphertext" line. '
        + 'The file opens without a password because the file itself is plain text; only the key inside is locked, and without the password it is useless. '
        + '"iv", "salt", "mac" and "id" are random numbers the lock uses - they are not addresses and not keys. '
        + (tron
          ? '"address" is your TRON address ' + addr + ', written in hex (41 + 40 hex digits) - the same address, spelled the way TronLink reads it. '
            + 'To use it: TronLink - Add Wallet - TRON - Import Wallet - Import via Keystore File (TronLink only accepts .txt files) - enter your password.'
          : '"address" is your address ' + addr + ' without the 0x. '
            + 'To use it: MetaMask - Add account or hardware wallet - Import account - Select type: JSON File - pick this file - enter your password.'),
      zh: '这是你的钱包文件（通用的 Web3 keystore 格式，第 3 版）。你的私钥就在里面，用你设的密码锁着 —— 就是 ciphertext 那一行。'
        + '文件本身是普通文字，所以不用密码也能打开；锁住的是里面的私钥，没有密码它就没用。'
        + 'iv、salt、mac、id 是上锁用的随机数 —— 不是地址，也不是私钥。'
        + (tron
          ? 'address 是你的 TRON 地址 ' + addr + '，写成了十六进制（41 + 40 位）—— 同一个地址，换成 TronLink 读得懂的写法。'
            + '怎么用：TronLink → 添加钱包 → TRON-导入钱包 → 通过 Keystore 文件导入（TronLink 只收 .txt 文件）→ 输入你的密码。'
          : 'address 是你的地址 ' + addr + '（去掉了开头的 0x）。'
            + '怎么用：MetaMask → 添加账户或硬件钱包 → 导入账户 → 选择类型「JSON 文件」→ 选这个文件 → 输入你的密码。')
    };
  }
  function keystore(k, addr, chain, pw, onp) {
    var h20 = hash20FromPriv(k), body = hex(h20);
    var want = chain === 'tron' ? tronFromHash20(h20) : '0x' + body;
    if (String(addr || '') !== want)
      return Promise.reject(new Error(M('钱包文件里的地址跟合出来的钥匙对不上，没有写文件。',
                                        'The address for the wallet file does not match the key that was built - no file was written.')));
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
              readme: readme(chain, want),
              version: 3,
              id: (crypto.randomUUID ? crypto.randomUUID() : hex(rnd(16))),
              address: chain === 'tron' ? '41' + body : body,
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
  // 钱包文件的名字：TronLink 的「通过 Keystore 文件导入」只收 .txt（扩展包里 accept=".txt" 且判 endsWith(".txt")）
  function keystoreName(chain) { return chain === 'tron' ? 'my-keystore.txt' : 'my-keystore.json'; }

  root.KeyCore = {
    CHAINS: CHAINS, n: n,
    hex: hex, u8: u8, pad64: pad64, rnd: rnd,
    addrOf: addrOf, addrBody: addrBody, addrHit: addrHit,
    secShape: secShape, patProblem: patProblem, parseB: parseB,
    variantK: variantK, mergeCandidates: mergeCandidates, pickByOracle: pickByOracle, candList: candList,
    makeShare: makeShare, readSecretJson: readSecretJson,
    signChallenge: signChallenge, merge: merge, signReceipt: signReceipt,
    keystore: keystore, keystoreName: keystoreName, setLang: setLang
  };
})(window);
