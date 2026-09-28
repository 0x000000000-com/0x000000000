// salt.js — CONTRACT0X_20260928：合约靓号 / 发币地址定制「地址是怎么算出来的」唯一一份。
//   合约地址 = 部署工厂 + 你的部署地址 + 盐（+ 合约代码的指纹）一起算出来的；我们只算「盐」—— 这一单不碰任何钥匙。
//   下载的合约靓号页、发币地址定制页（浏览器里断网核对）、平台（demo/c2order.mjs 用 vm 原样读进来复算每一个盐）、
//   铸造机的对拍向量（runpod-worker/gen-salt-vectors.mjs）用的都是【这同一个文件】—— 不抄第二份，所以不会分叉。
//   纯计算：不联网、不存东西、没有 import / export（经典脚本，浏览器直接引，单文件打包原样内联）。
//   Keccak-256 自己写在这里（跟 @noble/hashes 的 keccak_256 逐字节对拍过，demo/salt.test.mjs）：这两页里没有任何生成钥匙的代码。
var SALT = (function () {
  'use strict';
  // ── Keccak-256（以太坊用的那一种：填充 0x01 … 0x80，不是 SHA3 的 0x06）──────────────────────────────
  //   25 个 64 位的格子，每个拆成两半 32 位存（lo, hi 交替）。24 轮，每轮 θ ρ π χ ι 五步。
  var RC = [0x00000001, 0x00000000, 0x00008082, 0x00000000, 0x0000808a, 0x80000000, 0x80008000, 0x80000000,
    0x0000808b, 0x00000000, 0x80000001, 0x00000000, 0x80008081, 0x80000000, 0x00008009, 0x80000000,
    0x0000008a, 0x00000000, 0x00000088, 0x00000000, 0x80008009, 0x00000000, 0x8000000a, 0x00000000,
    0x8000808b, 0x00000000, 0x0000008b, 0x80000000, 0x00008089, 0x80000000, 0x00008003, 0x80000000,
    0x00008002, 0x80000000, 0x00000080, 0x80000000, 0x0000800a, 0x00000000, 0x8000000a, 0x80000000,
    0x80008081, 0x80000000, 0x00008080, 0x80000000, 0x80000001, 0x00000000, 0x80008008, 0x80000000];
  // 第 i 个格子（i = x + 5y）旋转几位；π 把它搬到哪一格
  var ROT = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
  var PI = [];
  for (var i0 = 0; i0 < 25; i0++) { var x0 = i0 % 5, y0 = (i0 / 5) | 0; PI[i0] = y0 + 5 * ((2 * x0 + 3 * y0) % 5); }
  function f1600(s) {                                     // s: Uint32Array(50)，第 i 格 = s[2i]（低 32 位）、s[2i+1]（高 32 位）
    var C = new Uint32Array(10), B = new Uint32Array(50);
    for (var r = 0; r < 24; r++) {
      var x, y, i, lo, hi, n;
      for (x = 0; x < 5; x++) {                           // θ：每一列的奇偶
        C[2 * x] = s[2 * x] ^ s[2 * x + 10] ^ s[2 * x + 20] ^ s[2 * x + 30] ^ s[2 * x + 40];
        C[2 * x + 1] = s[2 * x + 1] ^ s[2 * x + 11] ^ s[2 * x + 21] ^ s[2 * x + 31] ^ s[2 * x + 41];
      }
      for (x = 0; x < 5; x++) {
        var a = (x + 4) % 5, b = (x + 1) % 5;
        lo = C[2 * a] ^ ((C[2 * b] << 1) | (C[2 * b + 1] >>> 31));
        hi = C[2 * a + 1] ^ ((C[2 * b + 1] << 1) | (C[2 * b] >>> 31));
        for (y = 0; y < 25; y += 5) { s[2 * (x + y)] ^= lo; s[2 * (x + y) + 1] ^= hi; }
      }
      for (i = 0; i < 25; i++) {                          // ρ + π：旋转后搬家
        lo = s[2 * i]; hi = s[2 * i + 1]; n = ROT[i];
        var j = PI[i], L = lo, H = hi;
        if (n >= 32) { L = hi; H = lo; n -= 32; }
        if (n) { var t = (L << n) | (H >>> (32 - n)); H = (H << n) | (L >>> (32 - n)); L = t; }
        B[2 * j] = L; B[2 * j + 1] = H;
      }
      for (y = 0; y < 25; y += 5) {                       // χ：每一行里跟后两格比
        for (x = 0; x < 5; x++) {
          var p = 2 * (y + x), q = 2 * (y + (x + 1) % 5), u = 2 * (y + (x + 2) % 5);
          s[p] = B[p] ^ (~B[q] & B[u]);
          s[p + 1] = B[p + 1] ^ (~B[q + 1] & B[u + 1]);
        }
      }
      s[0] ^= RC[2 * r]; s[1] ^= RC[2 * r + 1];           // ι
    }
  }
  function keccak256(msg) {
    var m = msg instanceof Uint8Array ? msg : new Uint8Array(msg);
    var RATE = 136, s = new Uint32Array(50);
    var padded = new Uint8Array((Math.floor(m.length / RATE) + 1) * RATE);
    padded.set(m); padded[m.length] ^= 0x01; padded[padded.length - 1] ^= 0x80;
    for (var off = 0; off < padded.length; off += RATE) {
      for (var w = 0; w < RATE / 4; w++) {
        var k = off + 4 * w;
        s[w] ^= (padded[k] | (padded[k + 1] << 8) | (padded[k + 2] << 16) | (padded[k + 3] << 24)) >>> 0;
      }
      f1600(s);
    }
    var out = new Uint8Array(32);
    for (var z = 0; z < 32; z++) out[z] = (s[z >> 2] >>> (8 * (z & 3))) & 0xff;
    return out;
  }

  // ── 小工具 ─────────────────────────────────────────────────────────────────────────────────────
  function strip(h) { return String(h == null ? '' : h).trim().replace(/^0x/i, ''); }
  function isHex(h, bytes) { var x = strip(h); return /^[0-9a-fA-F]*$/.test(x) && (bytes == null ? x.length % 2 === 0 : x.length === 2 * bytes); }
  function hexToBytes(h) {
    var x = strip(h);
    if (!/^[0-9a-fA-F]*$/.test(x) || x.length % 2) throw new Error('not hex: ' + String(h).slice(0, 20));
    var out = new Uint8Array(x.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(x.substr(2 * i, 2), 16);
    return out;
  }
  function bytesToHex(b) { var s = ''; for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16); return s; }
  function concat() {
    var n = 0, i; for (i = 0; i < arguments.length; i++) n += arguments[i].length;
    var out = new Uint8Array(n), o = 0;
    for (i = 0; i < arguments.length; i++) { out.set(arguments[i], o); o += arguments[i].length; }
    return out;
  }
  // EIP-55：以太坊类地址大小写校验（钱包、浏览器上显示的就是这种写法）
  function checksum(addr) {
    var a = strip(addr).toLowerCase();
    if (!/^[0-9a-f]{40}$/.test(a)) throw new Error('not an address');
    var h = bytesToHex(keccak256(new TextEncoder().encode(a))), out = '0x';
    for (var i = 0; i < 40; i++) out += parseInt(h[i], 16) >= 8 ? a[i].toUpperCase() : a[i];
    return out;
  }
  // 地址格式对不对：40 位十六进制；大小写混写的话必须是正确的 EIP-55（抄错一个字大小写就对不上）
  function addrProblem(addr) {
    var a = strip(addr);
    if (!a) return 'empty';
    if (!/^[0-9a-fA-F]{40}$/.test(a)) return 'format';
    if (a !== a.toLowerCase() && a !== a.toUpperCase() && checksum(a) !== '0x' + a) return 'checksum';
    if (/^0{40}$/.test(a)) return 'zero';
    return null;
  }

  // ── CreateX：各条以太坊类链上地址相同、代码相同的部署工厂（github.com/pcaversaccio/createx）──────────────
  //   09-28 从 9 条链的公共节点读过：以太坊、BSC、Base、Arbitrum、Optimism、Polygon、Avalanche、Linea、zkSync Era 上
  //   这个地址的代码逐字节一样（11,838 字节）。salt.test.mjs 另外在这些链上只读模拟过部署，地址跟下面算的一样。
  var CREATEX = '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed';
  // CreateX 的 CREATE3 先用 CREATE2 放一个固定的小「中转合约」，再由它部署你的合约 —— 这是那个中转合约代码的指纹（CreateX 源码里写死的）
  var PROXY_HASH = '21c35dbe1b344a2488cf3321d6ce542f8e9f305544ff09e4993a62319a497c1f';

  // 盐 = 你的部署地址（20 字节）+ 00（1 字节：各条链地址相同）+ 11 字节我们算出来的数
  //   ① 开头 20 字节是你的部署地址：CreateX 只准这个地址用这个盐 —— 别人在任何一条链上都占不了你的地址
  //   ② 第 21 个字节是 00：CreateX 不把链的编号混进去 —— 各条链上算出来是同一个地址（01 就会每条链都不一样）
  function saltParts(salt) {
    var b = hexToBytes(salt);
    if (b.length !== 32) throw new Error('salt must be 32 bytes');
    return { owner: '0x' + bytesToHex(b.subarray(0, 20)), flag: b[20], rest: bytesToHex(b.subarray(21)) };
  }
  function saltProblem(salt, deployer) {
    if (!isHex(salt, 32)) return 'format';
    var p = saltParts(salt);
    if (p.owner.toLowerCase() !== '0x' + strip(deployer).toLowerCase()) return 'owner';
    if (p.flag !== 0) return 'flag';
    return null;
  }
  // CreateX 的 _guard（只准本人、各链相同那一种）：keccak256(左补零到 32 字节的部署地址 ‖ 盐)
  function guard(deployer, salt) {
    var d = new Uint8Array(32); d.set(hexToBytes(deployer), 12);
    return keccak256(concat(d, hexToBytes(salt)));
  }
  // CREATE2：keccak256(0xff ‖ 工厂 ‖ 盐 ‖ 代码指纹) 的后 20 字节
  function create2(factory, salt32, initHash) {
    var h = keccak256(concat([0xff], hexToBytes(factory), salt32 instanceof Uint8Array ? salt32 : hexToBytes(salt32), hexToBytes(initHash)));
    return '0x' + bytesToHex(h.subarray(12));
  }
  // CREATE3（CreateX 的写法）：先算中转合约的地址，再算「中转合约发出的第 1 笔部署」的地址 —— 跟你的合约代码无关
  function create3(factory, salt32) {
    var proxy = hexToBytes(create2(factory, salt32, PROXY_HASH));
    var h = keccak256(concat([0xd6, 0x94], proxy, [0x01]));
    return '0x' + bytesToHex(h.subarray(12));
  }
  // 一单的地址：mode = 'create2'（地址跟代码绑定，要代码指纹）或 'create3'（地址只看部署地址和盐）
  function addressOf(o) {
    var g = guard(o.deployer, o.salt);
    var a = o.mode === 'create3' ? create3(CREATEX, g) : create2(CREATEX, g, o.initHash);
    return checksum(a);
  }

  // ── 图案 ───────────────────────────────────────────────────────────────────────────────────────
  //   以太坊类地址只有 0-9、a-f 这 16 个字，不分大小写。所以「pepe」这种写不进去；能写的是 cafe、beef、c0ffee、8888……
  function normPat(p) { return strip(p).toLowerCase(); }
  function patProblem(prefix, suffix) {
    var a = normPat(prefix), b = normPat(suffix);
    if (!a && !b) return 'empty';
    if (!/^[0-9a-f]*$/.test(a) || !/^[0-9a-f]*$/.test(b)) return 'hex';
    if (a.length + b.length > 40) return 'long';
    return null;
  }
  function pinned(prefix, suffix) { return normPat(prefix).length + normPat(suffix).length; }
  function tries(prefix, suffix) { return Math.pow(16, pinned(prefix, suffix)); }       // 平均要试几次（每一位 16 种可能）
  function matches(addr, prefix, suffix) {
    var a = strip(addr).toLowerCase(), p = normPat(prefix), s = normPat(suffix);
    return a.length === 40 && a.slice(0, p.length) === p && (!s || a.slice(40 - s.length) === s);
  }
  // 地址开头有几个 0（「0 越多越好认、越省手续费」那一类）
  function leadingZeros(addr) { var a = strip(addr).toLowerCase(), n = 0; while (n < a.length && a[n] === '0') n++; return n; }

  // 一个盐从头核到尾：它是不是只归你用、各链相同、算出来的地址是不是你要的图案。返回 {ok, address, problems}
  function verify(o) {
    var problems = [], address = null;
    var sp = saltProblem(o.salt, o.deployer);
    if (sp) problems.push('salt_' + sp);
    if (addrProblem(o.deployer)) problems.push('deployer');
    if (o.mode !== 'create2' && o.mode !== 'create3') problems.push('mode');
    if (o.mode === 'create2' && !isHex(o.initHash, 32)) problems.push('inithash');
    if (!problems.length) {
      address = addressOf(o);
      if (!matches(address, o.prefix, o.suffix)) problems.push('pattern');
    }
    return { ok: !problems.length, address: address, problems: problems };
  }
  // 部署时要发的那一笔（发给 CreateX）：函数选择器 + 盐 + 你的合约代码（ABI 编码）。这里只给前 4 个字节 + 盐，代码由你的工具填
  var SELECTOR = { create2: 'deployCreate2(bytes32,bytes)', create3: 'deployCreate3(bytes32,bytes)' };
  function selectorOf(mode) { return bytesToHex(keccak256(new TextEncoder().encode(SELECTOR[mode]))).slice(0, 8); }

  return { keccak256: keccak256, hexToBytes: hexToBytes, bytesToHex: bytesToHex, isHex: isHex, checksum: checksum, addrProblem: addrProblem,
    CREATEX: CREATEX, PROXY_HASH: PROXY_HASH, saltParts: saltParts, saltProblem: saltProblem, guard: guard, create2: create2, create3: create3,
    addressOf: addressOf, normPat: normPat, patProblem: patProblem, pinned: pinned, tries: tries, matches: matches, leadingZeros: leadingZeros,
    verify: verify, SELECTOR: SELECTOR, selectorOf: selectorOf };
})();
