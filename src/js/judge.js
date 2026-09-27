// judge.js — FREECHECK0X_20260928：「长得像」和「该不该拦」的唯一一份判法（构思 v3 第二章第 1 条）。
//   首页（浏览器里比「你自己的地址」和「你要转过去的地址」）、服务器（demo/poison-check.mjs 用 vm 原样读进来）、
//   店主一键取款（demo/withdraw-tron.mjs）跑的都是【这同一个文件】—— 不抄第二份，所以不会分叉。
//   纯计算：不联网、不存东西、没有 import / export（经典脚本，浏览器直接引，单文件打包原样内联）。
var ZJ = (function () {
  // 起步门槛（推断，上线后拿真数据回测再定）：act = 它做过投毒动作时，像几位就算 ⛔；red / yellow = 只看长相
  var TH = { tron: { act: 3, red: 5, yellow: 3 }, evm: { act: 4, red: 7, yellow: 5 } };
  function pre(chain) { return chain === 'tron' ? 1 : 2; }                  // 波场去掉开头的 T，以太坊类去掉 0x
  function norm(a, chain) { return chain === 'tron' ? String(a) : String(a).toLowerCase(); }   // 以太坊类不分大小写

  // 头尾各对上几位
  function match(a, b, chain) {
    var p = pre(chain), x = norm(a, chain), y = norm(b, chain);
    if (x === y) return { head: x.length - p, tail: 0, sum: x.length - p, same: true };
    var h = 0;
    while (p + h < x.length && p + h < y.length && x[p + h] === y[p + h]) h++;
    var t = 0;
    while (t < x.length - p - h && t < y.length - p - h && x[x.length - 1 - t] === y[y.length - 1 - t]) t++;
    return { head: h, tail: t, sum: h + t, same: false };
  }

  // 一个地址跟一组地址比：最像的那个（像的位数一样时取头更长的）；一模一样的跳过
  function best(addr, list, chain) {
    var top = null, a = norm(addr, chain);
    for (var i = 0; i < (list || []).length; i++) {
      if (norm(list[i], chain) === a) continue;
      var m = match(addr, list[i], chain);
      if (!top || m.sum > top.sum || (m.sum === top.sum && m.head > top.head)) top = { head: m.head, tail: m.tail, sum: m.sum, same: false, with: list[i] };
    }
    return top;
  }

  // 要转过去的地址 to，该不该拦：
  //   known    = 你真的来往过的地址（取款工具里就是「上次用的那个」）
  //   evidence = 往你的记录里塞过零头 / 0 元 / 假币的地址（键是地址；对象或 Map 都行）
  // 结果 level：known 同一个 · poison ⛔ 做过投毒动作而且像你的对象 · acted 做过投毒动作（不像谁，也不正常）
  //             red 很像 · yellow 有点像（只在结果页显示，不推送）· none 不像
  function judge(to, known, evidence, chain) {
    var th = TH[chain] || TH.tron, t = norm(to, chain), ks = [];
    for (var i = 0; i < (known || []).length; i++) {
      if (norm(known[i], chain) === t) return { level: 'known', with: known[i] };
      ks.push(known[i]);
    }
    var m = best(to, ks, chain);
    var ev = evidence ? (typeof evidence.get === 'function' ? evidence.get(t) : evidence[t]) : null;
    var r = m ? { head: m.head, tail: m.tail, sum: m.sum, with: m.with } : {};
    if (ev) { r.evidence = ev; r.level = m && m.sum >= th.act ? 'poison' : 'acted'; return r; }
    if (!m) return { level: 'none' };
    r.level = m.sum >= th.red ? 'red' : m.sum >= th.yellow ? 'yellow' : 'none';
    return r;
  }

  return { TH: TH, match: match, best: best, judge: judge, norm: norm, pre: pre };
})();
