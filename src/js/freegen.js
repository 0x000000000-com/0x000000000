// freegen.js — FREEGEN0X_20260928：免费生成（短靓号在你自己的电脑上算）的计算核心。
//   DSJ 2026-09-28：「5. 免费生成 + 零之榜（+ 安全豹子号，如果你要）……」—— 构思 v3 第二章第 8 条「免费、当场出；私钥从头到尾只在你的电脑上」。
//   · 算的那一段（下面的 WORKER）原样变成几个 Web Worker（用这一页自己的文字生成，Blob 网址），页面一个请求都不发：
//     私钥外发检查（GitHub 公开那项）用真浏览器生成一次，数页面发出去的请求 —— 必须是 0 个。
//   · 怎么算：每个 Worker 随机取一个起点钥匙 k0，512 条「车道」各自从 k0+i 出发，每一轮每条车道都加上同一个 512·G ——
//     512 个加法共用一次求逆（批量求逆），再算 keccak（以太坊类）/ 加校验码转 base58（波场）看图案对不对。
//   · 算出来的钥匙 = k0 + 车道号 + 轮数 × 512。交出去之前在页面里用 keycore.js 的 addrOf（noble 那一套，跟个人靓号同一份）
//     从这把钥匙重新算一遍地址，对得上图案才算数 —— 这里算错了只会「找不到」，不会给出一把对不上的钥匙。
//   · 只钉一头（开头或结尾）：两头都钉就是仿别人地址的工具（投毒要的是头尾都像）。上限：以太坊类 7 位、波场 5 位（不算 T）。
//   经典脚本，没有 import / export；单文件打包原样内联。不碰 DOM。
(function (root) {
  'use strict';

  // ── ① 在 Worker 里跑的那一段（不碰页面、不联网；收到 go 就一直算，页面要停就直接关掉 Worker）─────────────────────
  function WORKER() {
    'use strict';
    var P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2Fn;
    var M256 = (1n << 256n) - 1n, C = 0x1000003D1n, M32 = 0xffffffffn;
    var GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798n;
    var GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8n;
    function red(a) { var h = a >> 256n; a = (a & M256) + h * C; h = a >> 256n; a = (a & M256) + h * C; return a >= P ? a - P : a; }
    function sub(a, b) { var r = a - b; return r < 0n ? r + P : r; }
    function inv(a) { var t = 0n, nt = 1n, r = P, nr = a % P, q, x; while (nr !== 0n) { q = r / nr; x = t - q * nt; t = nt; nt = x; x = r - q * nr; r = nr; nr = x; } return t < 0n ? t + P : t; }
    function addG(x, y) { var l = red(sub(GY, y) * inv(sub(GX, x))); var x3 = sub(sub(red(l * l), x), GX); return [x3, sub(red(l * sub(x, x3)), y)]; }

    // keccak-f[1600]：50 个 32 位半格（偶数 = 低 32 位，奇数 = 高 32 位），整段展开。
    //   这一段是 demo/freegen.test.mjs 里的 genKf() 生成的，测试会重新生成一遍逐字比，再拿 500 组随机输入跟 noble 的 keccak_256 对拍。
    var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649, 0, 2147516545, 2147483648, 32777, 2147483648,
      138, 0, 136, 0, 2147516425, 0, 2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771, 2147483648, 32770, 2147483648,
      128, 2147483648, 32778, 0, 2147483658, 2147483648, 2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
    function kf(s) {
      var a0 = s[0], a1 = s[1], a2 = s[2], a3 = s[3], a4 = s[4], a5 = s[5], a6 = s[6], a7 = s[7], a8 = s[8], a9 = s[9], a10 = s[10], a11 = s[11], a12 = s[12], a13 = s[13], a14 = s[14], a15 = s[15], a16 = s[16], a17 = s[17], a18 = s[18], a19 = s[19], a20 = s[20], a21 = s[21], a22 = s[22], a23 = s[23], a24 = s[24], a25 = s[25], a26 = s[26], a27 = s[27], a28 = s[28], a29 = s[29], a30 = s[30], a31 = s[31], a32 = s[32], a33 = s[33], a34 = s[34], a35 = s[35], a36 = s[36], a37 = s[37], a38 = s[38], a39 = s[39], a40 = s[40], a41 = s[41], a42 = s[42], a43 = s[43], a44 = s[44], a45 = s[45], a46 = s[46], a47 = s[47], a48 = s[48], a49 = s[49];
      var b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
      var c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, d0, d1, n;
      for (n = 0; n < 48; n += 2) {
        c0 = a0 ^ a10 ^ a20 ^ a30 ^ a40;
        c1 = a1 ^ a11 ^ a21 ^ a31 ^ a41;
        c2 = a2 ^ a12 ^ a22 ^ a32 ^ a42;
        c3 = a3 ^ a13 ^ a23 ^ a33 ^ a43;
        c4 = a4 ^ a14 ^ a24 ^ a34 ^ a44;
        c5 = a5 ^ a15 ^ a25 ^ a35 ^ a45;
        c6 = a6 ^ a16 ^ a26 ^ a36 ^ a46;
        c7 = a7 ^ a17 ^ a27 ^ a37 ^ a47;
        c8 = a8 ^ a18 ^ a28 ^ a38 ^ a48;
        c9 = a9 ^ a19 ^ a29 ^ a39 ^ a49;
        d0 = c8 ^ ((c2 << 1) | (c3 >>> 31)); d1 = c9 ^ ((c3 << 1) | (c2 >>> 31));
        a0 ^= d0; a1 ^= d1; a10 ^= d0; a11 ^= d1; a20 ^= d0; a21 ^= d1; a30 ^= d0; a31 ^= d1; a40 ^= d0; a41 ^= d1;
        d0 = c0 ^ ((c4 << 1) | (c5 >>> 31)); d1 = c1 ^ ((c5 << 1) | (c4 >>> 31));
        a2 ^= d0; a3 ^= d1; a12 ^= d0; a13 ^= d1; a22 ^= d0; a23 ^= d1; a32 ^= d0; a33 ^= d1; a42 ^= d0; a43 ^= d1;
        d0 = c2 ^ ((c6 << 1) | (c7 >>> 31)); d1 = c3 ^ ((c7 << 1) | (c6 >>> 31));
        a4 ^= d0; a5 ^= d1; a14 ^= d0; a15 ^= d1; a24 ^= d0; a25 ^= d1; a34 ^= d0; a35 ^= d1; a44 ^= d0; a45 ^= d1;
        d0 = c4 ^ ((c8 << 1) | (c9 >>> 31)); d1 = c5 ^ ((c9 << 1) | (c8 >>> 31));
        a6 ^= d0; a7 ^= d1; a16 ^= d0; a17 ^= d1; a26 ^= d0; a27 ^= d1; a36 ^= d0; a37 ^= d1; a46 ^= d0; a47 ^= d1;
        d0 = c6 ^ ((c0 << 1) | (c1 >>> 31)); d1 = c7 ^ ((c1 << 1) | (c0 >>> 31));
        a8 ^= d0; a9 ^= d1; a18 ^= d0; a19 ^= d1; a28 ^= d0; a29 ^= d1; a38 ^= d0; a39 ^= d1; a48 ^= d0; a49 ^= d1;
        b0 = a0; b1 = a1;
        b32 = (a11 << 4) | (a10 >>> 28); b33 = (a10 << 4) | (a11 >>> 28);
        b14 = (a20 << 3) | (a21 >>> 29); b15 = (a21 << 3) | (a20 >>> 29);
        b46 = (a31 << 9) | (a30 >>> 23); b47 = (a30 << 9) | (a31 >>> 23);
        b28 = (a40 << 18) | (a41 >>> 14); b29 = (a41 << 18) | (a40 >>> 14);
        b20 = (a2 << 1) | (a3 >>> 31); b21 = (a3 << 1) | (a2 >>> 31);
        b2 = (a13 << 12) | (a12 >>> 20); b3 = (a12 << 12) | (a13 >>> 20);
        b34 = (a22 << 10) | (a23 >>> 22); b35 = (a23 << 10) | (a22 >>> 22);
        b16 = (a33 << 13) | (a32 >>> 19); b17 = (a32 << 13) | (a33 >>> 19);
        b48 = (a42 << 2) | (a43 >>> 30); b49 = (a43 << 2) | (a42 >>> 30);
        b40 = (a5 << 30) | (a4 >>> 2); b41 = (a4 << 30) | (a5 >>> 2);
        b22 = (a14 << 6) | (a15 >>> 26); b23 = (a15 << 6) | (a14 >>> 26);
        b4 = (a25 << 11) | (a24 >>> 21); b5 = (a24 << 11) | (a25 >>> 21);
        b36 = (a34 << 15) | (a35 >>> 17); b37 = (a35 << 15) | (a34 >>> 17);
        b18 = (a45 << 29) | (a44 >>> 3); b19 = (a44 << 29) | (a45 >>> 3);
        b10 = (a6 << 28) | (a7 >>> 4); b11 = (a7 << 28) | (a6 >>> 4);
        b42 = (a17 << 23) | (a16 >>> 9); b43 = (a16 << 23) | (a17 >>> 9);
        b24 = (a26 << 25) | (a27 >>> 7); b25 = (a27 << 25) | (a26 >>> 7);
        b6 = (a36 << 21) | (a37 >>> 11); b7 = (a37 << 21) | (a36 >>> 11);
        b38 = (a47 << 24) | (a46 >>> 8); b39 = (a46 << 24) | (a47 >>> 8);
        b30 = (a8 << 27) | (a9 >>> 5); b31 = (a9 << 27) | (a8 >>> 5);
        b12 = (a18 << 20) | (a19 >>> 12); b13 = (a19 << 20) | (a18 >>> 12);
        b44 = (a29 << 7) | (a28 >>> 25); b45 = (a28 << 7) | (a29 >>> 25);
        b26 = (a38 << 8) | (a39 >>> 24); b27 = (a39 << 8) | (a38 >>> 24);
        b8 = (a48 << 14) | (a49 >>> 18); b9 = (a49 << 14) | (a48 >>> 18);
        a0 = b0 ^ (~b2 & b4); a1 = b1 ^ (~b3 & b5);
        a2 = b2 ^ (~b4 & b6); a3 = b3 ^ (~b5 & b7);
        a4 = b4 ^ (~b6 & b8); a5 = b5 ^ (~b7 & b9);
        a6 = b6 ^ (~b8 & b0); a7 = b7 ^ (~b9 & b1);
        a8 = b8 ^ (~b0 & b2); a9 = b9 ^ (~b1 & b3);
        a10 = b10 ^ (~b12 & b14); a11 = b11 ^ (~b13 & b15);
        a12 = b12 ^ (~b14 & b16); a13 = b13 ^ (~b15 & b17);
        a14 = b14 ^ (~b16 & b18); a15 = b15 ^ (~b17 & b19);
        a16 = b16 ^ (~b18 & b10); a17 = b17 ^ (~b19 & b11);
        a18 = b18 ^ (~b10 & b12); a19 = b19 ^ (~b11 & b13);
        a20 = b20 ^ (~b22 & b24); a21 = b21 ^ (~b23 & b25);
        a22 = b22 ^ (~b24 & b26); a23 = b23 ^ (~b25 & b27);
        a24 = b24 ^ (~b26 & b28); a25 = b25 ^ (~b27 & b29);
        a26 = b26 ^ (~b28 & b20); a27 = b27 ^ (~b29 & b21);
        a28 = b28 ^ (~b20 & b22); a29 = b29 ^ (~b21 & b23);
        a30 = b30 ^ (~b32 & b34); a31 = b31 ^ (~b33 & b35);
        a32 = b32 ^ (~b34 & b36); a33 = b33 ^ (~b35 & b37);
        a34 = b34 ^ (~b36 & b38); a35 = b35 ^ (~b37 & b39);
        a36 = b36 ^ (~b38 & b30); a37 = b37 ^ (~b39 & b31);
        a38 = b38 ^ (~b30 & b32); a39 = b39 ^ (~b31 & b33);
        a40 = b40 ^ (~b42 & b44); a41 = b41 ^ (~b43 & b45);
        a42 = b42 ^ (~b44 & b46); a43 = b43 ^ (~b45 & b47);
        a44 = b44 ^ (~b46 & b48); a45 = b45 ^ (~b47 & b49);
        a46 = b46 ^ (~b48 & b40); a47 = b47 ^ (~b49 & b41);
        a48 = b48 ^ (~b40 & b42); a49 = b49 ^ (~b41 & b43);
        a0 ^= RC[n]; a1 ^= RC[n + 1];
      }
      s[0] = a0; s[1] = a1; s[2] = a2; s[3] = a3; s[4] = a4; s[5] = a5; s[6] = a6; s[7] = a7; s[8] = a8; s[9] = a9; s[10] = a10; s[11] = a11; s[12] = a12; s[13] = a13; s[14] = a14; s[15] = a15; s[16] = a16; s[17] = a17; s[18] = a18; s[19] = a19; s[20] = a20; s[21] = a21; s[22] = a22; s[23] = a23; s[24] = a24; s[25] = a25; s[26] = a26; s[27] = a27; s[28] = a28; s[29] = a29; s[30] = a30; s[31] = a31; s[32] = a32; s[33] = a33; s[34] = a34; s[35] = a35; s[36] = a36; s[37] = a37; s[38] = a38; s[39] = a39; s[40] = a40; s[41] = a41; s[42] = a42; s[43] = a43; s[44] = a44; s[45] = a45; s[46] = a46; s[47] = a47; s[48] = a48; s[49] = a49;
    }
    var S = new Int32Array(50), AW = new Int32Array(5);
    function bswap(w) { return ((w & 0xff) << 24) | ((w & 0xff00) << 8) | ((w >>> 8) & 0xff00) | (w >>> 24); }
    // 公钥 (x, y) → keccak256(x‖y) 的后 20 个字节 = 地址，放进 AW（5 个大端 32 位字）
    function hashXY(x, y) {
      var i;
      for (i = 7; i >= 0; i--) { S[i] = bswap(Number(x & M32)); x >>= 32n; }
      for (i = 15; i >= 8; i--) { S[i] = bswap(Number(y & M32)); y >>= 32n; }
      for (i = 16; i < 50; i++) S[i] = 0;
      S[16] = 1; S[33] = -2147483648;                           // 补位：第 64 字节 0x01，第 135 字节 0x80
      kf(S);
      AW[0] = bswap(S[3]); AW[1] = bswap(S[4]); AW[2] = bswap(S[5]); AW[3] = bswap(S[6]); AW[4] = bswap(S[7]);
    }

    // SHA-256（只用来算波场地址的校验码：两次，各一块）
    var KK = [1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278,
      1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692,
      1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372,
      1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492,
      -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815,
      -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998];
    var WW = new Int32Array(64), B1 = new Int32Array(16), B2 = new Int32Array(16), H1 = new Int32Array(8), H2 = new Int32Array(8);
    function sha(w, out) {
      var i, x, y, t1, t2, a = 1779033703, b = -1150833019, c = 1013904242, d = -1521486534, e = 1359893119, f = -1694144372, g = 528734635, h = 1541459225;
      for (i = 0; i < 16; i++) WW[i] = w[i];
      for (i = 16; i < 64; i++) {
        x = WW[i - 15]; y = WW[i - 2];
        WW[i] = ((((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + WW[i - 7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10)) + WW[i - 16]) | 0;
      }
      for (i = 0; i < 64; i++) {
        t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + KK[i] + WW[i]) | 0;
        t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      out[0] = (a + 1779033703) | 0; out[1] = (b - 1150833019) | 0; out[2] = (c + 1013904242) | 0; out[3] = (d - 1521486534) | 0;
      out[4] = (e + 1359893119) | 0; out[5] = (f - 1694144372) | 0; out[6] = (g + 528734635) | 0; out[7] = (h + 1541459225) | 0;
    }
    B1[15] = 168; B2[8] = -2147483648; B2[15] = 256;
    // 波场地址 = base58(41 ‖ 地址 20 字节 ‖ 校验码 4 字节)；校验码 = sha256(sha256(41 ‖ 地址)) 的前 4 个字节
    function tronChk() {
      B1[0] = (0x41 << 24) | (AW[0] >>> 8); B1[1] = (AW[0] << 24) | (AW[1] >>> 8); B1[2] = (AW[1] << 24) | (AW[2] >>> 8);
      B1[3] = (AW[2] << 24) | (AW[3] >>> 8); B1[4] = (AW[3] << 24) | (AW[4] >>> 8); B1[5] = (AW[4] << 24) | 0x800000;
      sha(B1, H1);
      for (var i = 0; i < 8; i++) B2[i] = H1[i];
      sha(B2, H2);
      return H2[0];
    }
    function hBig() { var v = 0n; for (var i = 0; i < 5; i++) v = (v << 32n) | BigInt(AW[i] >>> 0); return v; }

    // 图案：以太坊类按 16 进制位比；波场开头按「25 字节的数落在哪个区间」比（多数时候不用算校验码），结尾按「这个数除以 58^位数 的余数」比
    var B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', BASE = 0x41n << 160n;
    var mode, eT, eSh, eMask, tA, tB, HA, HB, noLo, noHi, never = false, tM, tR;
    function b58v(s) { var v = 0n; for (var i = 0; i < s.length; i++) v = v * 58n + BigInt(B58.indexOf(s[i])); return v; }
    function words5(v) { var o = []; for (var i = 4; i >= 0; i--) o.push(Number((v >> BigInt(32 * i)) & M32)); return o; }
    function cmp5(T) { for (var i = 0; i < 5; i++) { var x = AW[i] >>> 0; if (x !== T[i]) return x < T[i] ? -1 : 1; } return 0; }
    function setup(m) {
      var pat = m.pat;
      if (m.chain === 'evm') {
        mode = m.where === 'prefix' ? 'ep' : 'es';
        eT = parseInt(pat, 16); eSh = 32 - 4 * pat.length; eMask = pat.length >= 8 ? -1 : (1 << (4 * pat.length)) - 1;
      } else if (m.where === 'prefix') {
        mode = 'tp';
        var pad = 34 - pat.length;
        tA = b58v(pat + '1'.repeat(pad)); tB = b58v(pat + 'z'.repeat(pad)) + 1n;
        var ha = (tA >> 32n) - BASE, hb = ((tB - 1n) >> 32n) - BASE;
        never = ha >= (1n << 160n) || hb < 0n;                    // 整段都在波场地址的范围外（页面出题时已经拦了，这里再兜一次）
        noLo = ha < 0n; noHi = hb >= (1n << 160n);
        HA = words5(noLo || never ? 0n : ha); HB = words5(noHi || never ? 0n : hb);
      } else {
        mode = 'ts'; tM = Math.pow(58, pat.length); tR = Number(b58v(pat));
      }
    }
    function tronN() { return (((BASE | hBig()) << 32n) | BigInt(tronChk() >>> 0)); }
    function hit() {
      if (mode === 'ep') return (AW[0] >>> eSh) === eT;
      if (mode === 'es') return eMask === -1 ? (AW[4] >>> 0) === eT : (AW[4] & eMask) === eT;
      if (mode === 'tp') {
        if (never) return false;
        var lo = noLo ? 1 : cmp5(HA), hi = noHi ? -1 : cmp5(HB);
        if (lo > 0 && hi < 0) return true;
        if (lo < 0 || hi > 0) return false;
        var N = tronN(); return N >= tA && N < tB;              // 正好落在边上：算上校验码再比一次
      }
      var c = tronChk(), r = 0x41, i, w;                         // 结尾：25 个字节从高到低，一边读一边取余（余数 < 2^30，乘 256 也不会丢精度）
      for (i = 0; i < 5; i++) { w = AW[i]; r = (r * 256 + (w >>> 24)) % tM; r = (r * 256 + ((w >>> 16) & 255)) % tM; r = (r * 256 + ((w >>> 8) & 255)) % tM; r = (r * 256 + (w & 255)) % tM; }
      r = (r * 256 + (c >>> 24)) % tM; r = (r * 256 + ((c >>> 16) & 255)) % tM; r = (r * 256 + ((c >>> 8) & 255)) % tM; r = (r * 256 + (c & 255)) % tM;
      return r === tR;
    }

    function run(m) {
      setup(m);
      var L = m.L, X = new Array(L), Y = new Array(L), D = new Array(L), Cp = new Array(L), i, st, acc, iv, ii, l, x3, y3, xy;
      var qx = BigInt('0x' + m.qx), qy = BigInt('0x' + m.qy);
      X[0] = BigInt('0x' + m.x0); Y[0] = BigInt('0x' + m.y0);
      for (i = 1; i < L; i++) { xy = addG(X[i - 1], Y[i - 1]); X[i] = xy[0]; Y[i] = xy[1]; }
      var n = 0, last = Date.now();
      postMessage({ t: 'up' });
      for (st = 1; ; st++) {
        acc = 1n;
        for (i = 0; i < L; i++) { D[i] = sub(qx, X[i]); acc = red(acc * D[i]); Cp[i] = acc; }
        if (acc === 0n) { postMessage({ t: 'err' }); return; }        // 碰上 x 相同的点（概率约 2^-247）：这个 Worker 停下，页面换一个起点
        iv = inv(acc);
        for (i = L - 1; i >= 0; i--) {
          ii = i > 0 ? red(iv * Cp[i - 1]) : iv;
          iv = red(iv * D[i]);
          l = red(sub(qy, Y[i]) * ii);
          x3 = sub(sub(red(l * l), X[i]), qx);
          y3 = sub(red(l * sub(X[i], x3)), Y[i]);
          X[i] = x3; Y[i] = y3;
          hashXY(x3, y3);
          if (hit()) { postMessage({ t: 'hit', lane: i, step: st, n: n + (L - i) }); return; }
        }
        n += L;
        if (Date.now() - last >= 250) { postMessage({ t: 'n', n: n }); n = 0; last = Date.now(); }
      }
    }
    onmessage = function (e) { if (e.data && e.data.cmd === 'go') run(e.data); };
  }

  // ── ② 页面这一边：出题、开 Worker、收结果、复核 ────────────────────────────────────────────────────────
  var NB = root.NOBLE, KC = root.KeyCore;
  var LANES = 512;
  var CAP = { evm: 7, tron: 5 };                        // 以太坊类最多 7 位、波场最多 5 位（不算 T）；个人靓号从以太坊类 10 位、波场 6 位起卖
  var B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  function b58v(s) { var v = 0n; for (var i = 0; i < s.length; i++) v = v * 58n + BigInt(B58.indexOf(s[i])); return v; }

  // 图案规范化：以太坊类转小写；波场开头自动补上 T（只钉一头 —— where 只能是 prefix 或 suffix）
  function norm(chain, where, raw) {
    var s = String(raw || '').trim();
    if (chain === 'evm') return s.replace(/^0x/i, '').toLowerCase();
    if (where === 'prefix') return s.charAt(0) === 'T' ? s : 'T' + s;
    return s;
  }
  // 不行的原因（{zh, en}）或 null。字表跟 keycore.js 的 TOOL_CHAINS 同一套（测试逐个对照 patProblem）
  var TRON2 = '9ABCDEFGHJKLMNPQRSTUVWXYZ';               // 波场地址第 2 位只可能是这几个（开头那个字节是 0x41）
  function problem(chain, where, pat) {
    if (chain !== 'evm' && chain !== 'tron') return { zh: '只支持以太坊类（0x…）和波场（T…）', en: 'Only EVM (0x...) and TRON (T...) addresses' };
    if (where !== 'prefix' && where !== 'suffix') return { zh: '免费版只钉一头：开头或结尾', en: 'The free version pins one end only: the start or the end' };
    var body = chain === 'tron' && where === 'prefix' ? pat.slice(1) : pat, i;
    if (chain === 'tron' && where === 'prefix' && pat.charAt(0) !== 'T') return { zh: '波场地址都是 T 开头', en: 'TRON addresses always start with T' };
    if (body.length < 1) return { zh: '图案至少要 1 位', en: 'The pattern needs at least 1 character' };
    if (body.length > CAP[chain]) return { zh: '免费版最多 ' + CAP[chain] + ' 位 —— 更长的交给显卡算（个人靓号）', en: 'The free version goes up to ' + CAP[chain] + ' characters - longer ones are for the GPU (Vanity Wallet)' };
    if (chain === 'evm') return /^[0-9a-f]+$/.test(body) ? null : { zh: '以太坊类地址只有 0-9、a-f 这 16 个字', en: 'EVM addresses only use the 16 characters 0-9 and a-f' };
    for (i = 0; i < body.length; i++) if (B58.indexOf(body[i]) < 0)
      return { zh: '波场地址里不可能有「' + body[i] + '」（没有 0、O、I、l 这四个字，区分大小写）', en: 'A TRON address can never contain "' + body[i] + '" (there is no 0, O, I or l, and case matters)' };
    if (where === 'prefix' && TRON2.indexOf(body[0]) < 0)
      return { zh: '波场地址 T 后面那一位只可能是：' + TRON2, en: 'The character right after the T can only be one of: ' + TRON2 };
    if (where === 'prefix' && !isFinite(expected(chain, where, pat)))
      return { zh: '没有这样开头的波场地址（波场地址从 T9yD… 排到 TZJo…）', en: 'No TRON address starts like that (they run from T9yD... to TZJo...)' };
    return null;
  }
  // 平均要试多少个（精确到这一种图案）
  function expected(chain, where, pat) {
    if (chain === 'evm') return Math.pow(16, pat.length);
    if (where === 'suffix') return Math.pow(58, pat.length);
    var pad = 34 - pat.length, A = b58v(pat + '1'.repeat(pad)), B = b58v(pat + 'z'.repeat(pad)) + 1n;
    var lo = 0x41n << 192n, hi = 0x42n << 192n, a = A > lo ? A : lo, b = B < hi ? B : hi;
    if (b <= a) return Infinity;
    return Number(1n << 192n) / Number(b - a);
  }
  function randK() {
    var n = NB.CURVE.n, k = 0n, b = crypto.getRandomValues(new Uint8Array(32));
    for (var i = 0; i < 32; i++) k = (k << 8n) | BigInt(b[i]);
    return k % (n - (1n << 64n)) + 1n;                 // 离 n 远一点：k0 + 车道 + 轮数 × 512 一辈子也碰不到 n
  }

  var RUN = null;
  function stop() { if (!RUN) return; RUN.ws.forEach(function (w) { try { w.terminate(); } catch (e) { /* 已经停了 */ } }); try { URL.revokeObjectURL(RUN.url); } catch (e) { /* 撤不撤都行 */ } RUN = null; }
  // o = { chain, where, pat, workers }；cb = { up(n), rate(tried, perSec), found({k, addr, tried, ms}), fail(msg) }
  function start(o, cb) {
    stop();
    var chain = o.chain, where = o.where, pat = norm(chain, where, o.pat), why = problem(chain, where, pat);
    if (why) throw new Error(why.en);
    var nW = Math.max(1, Math.min(32, o.workers || Math.max(1, (navigator.hardwareConcurrency || 2) - 1)));
    var url = URL.createObjectURL(new Blob(['(' + WORKER.toString() + ')()'], { type: 'text/javascript' }));
    var G = NB.ProjectivePoint.BASE, Q = G.multiply(BigInt(LANES)).toAffine();
    var run = RUN = { ws: [], tried: 0, t0: Date.now(), up: 0, bad: 0, url: url };
    var pre = where === 'prefix' ? pat : '', suf = where === 'suffix' ? pat : '';
    function spawn() {
      var k0 = randK(), P0 = G.multiply(k0).toAffine(), w = new Worker(url);
      w.onmessage = function (e) {
        if (RUN !== run) return;
        var m = e.data || {};
        if (m.t === 'up') { run.up++; if (cb.up) cb.up(run.up); return; }
        if (m.t === 'n') { run.tried += m.n; if (cb.rate) cb.rate(run.tried, run.tried / Math.max(0.001, (Date.now() - run.t0) / 1000)); return; }
        if (m.t === 'err') { w.terminate(); run.ws.splice(run.ws.indexOf(w), 1); run.ws.push(spawn()); return; }
        if (m.t === 'hit') {
          run.tried += m.n || 0;
          var k = (k0 + BigInt(m.lane) + BigInt(m.step) * BigInt(LANES)) % NB.CURVE.n, addr = KC.addrOf(chain, k);
          if (KC.addrHit(chain, pre, suf, addr)) { var ms = Date.now() - run.t0, tried = run.tried; stop(); cb.found({ k: k, addr: addr, tried: tried, ms: ms, chain: chain, where: where, pat: pat }); }
          else { run.bad++; w.terminate(); run.ws.splice(run.ws.indexOf(w), 1); run.ws.push(spawn()); if (cb.fail) cb.fail('recheck'); }   // 复核没过：这把不交，换个起点接着算
        }
      };
      w.onerror = function () { if (RUN === run && cb.fail) cb.fail('worker'); };
      w.postMessage({ cmd: 'go', chain: chain, where: where, pat: pat, L: LANES, x0: P0.x.toString(16), y0: P0.y.toString(16), qx: Q.x.toString(16), qy: Q.y.toString(16) });
      return w;
    }
    for (var i = 0; i < nW; i++) run.ws.push(spawn());
    return { workers: nW, expected: expected(chain, where, pat), pat: pat };
  }

  root.FreeGen = { CAP: CAP, LANES: LANES, norm: norm, problem: problem, expected: expected, start: start, stop: stop, WORKER: WORKER };
})(window);
