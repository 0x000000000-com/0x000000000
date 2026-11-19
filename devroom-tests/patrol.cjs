// 内部巡检接口回归：没带令牌、令牌错、服务器没配令牌都被拒绝且不泄露；令牌对才给 attention；公开 health 仍只有三样。
'use strict';
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { handlePatrol, PATROL_PATH } = require(path.resolve(__dirname, '..', 'platform', 'patrol.cjs'));
let good = 0, bad = 0;
const ok = (c, m) => { c ? good++ : bad++; console.log((c ? '  ✓ ' : '  ★ ') + m); };
const SECRET = 'test-' + 'a'.repeat(40);
const SENTINEL = 'REFUND-ORDER-SECRET-123';
let called = 0;
const attention = () => { called++; return [{ kind: 'refund', note: SENTINEL }]; };
const PUBLIC = { ok: true, mode: 'live', payChains: ['bsc'] };
let mode = 'ok';
function serve(token) {
  return http.createServer((req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (p === '/api/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(PUBLIC)); }
    if (p === PATROL_PATH) return handlePatrol(req, res, { token, getAttention: () => { if (mode === 'throw') throw new Error('DB-PASSWORD-LEAK'); if (mode === 'reject') return Promise.reject(new Error('DB-PASSWORD-LEAK')); return attention(); } });
    res.writeHead(404); res.end('{}');
  });
}
const req = (port, method, p, headers) => new Promise((resolve, reject) => {
  const r = http.request({ host: '127.0.0.1', port, method, path: p, headers }, (res) => { let b = ''; res.on('data', (c) => b += c); res.on('end', () => resolve({ code: res.statusCode, body: b, h: res.headers })); });
  r.on('error', reject); r.end();
});
(async () => {
  const s = serve(SECRET); await new Promise((r) => s.listen(0, '127.0.0.1', r)); const port = s.address().port;
  const bads = [
    ['没带令牌', {}], ['令牌错', { Authorization: 'Bearer wrong' }], ['令牌只差一位', { Authorization: 'Bearer ' + SECRET.slice(0, -1) + 'b' }],
    ['令牌多一位', { Authorization: 'Bearer ' + SECRET + 'x' }], ['不是 Bearer', { Authorization: SECRET }], ['Basic', { Authorization: 'Basic ' + SECRET }],
    ['空令牌', { Authorization: 'Bearer ' }], ['小写 bearer', { Authorization: 'bearer ' + SECRET }],
  ];
  let first = null;
  for (const [n, h] of bads) {
    const r = await req(port, 'GET', PATROL_PATH, h); first = first || r.body;
    ok(r.code === 401 && !r.body.includes(SENTINEL) && !/attention/.test(r.body) && r.body === first, n + '：拒绝（401），内容一律相同、不含内部情况');
  }
  const q = await req(port, 'GET', PATROL_PATH + '?token=' + SECRET, {});
  ok(q.code === 401, '令牌放网址参数里不认');
  const pst = await req(port, 'POST', PATROL_PATH, {});
  ok(pst.code === 401 && !pst.body.includes(SENTINEL), '没令牌用 POST 也是 401，不暴露别的');
  ok(called === 0, '令牌不对时，取 attention 的函数一次都没被调用');
  const good1 = await req(port, 'GET', PATROL_PATH, { Authorization: 'Bearer ' + SECRET });
  let j = {}; try { j = JSON.parse(good1.body); } catch (e) {}
  ok(good1.code === 200 && j.ok === true && Array.isArray(j.attention) && j.attention[0].note === SENTINEL && /no-store/.test(good1.h['cache-control'] || ''), '令牌对：200，返回 attention，且不许缓存');
  const pg = await req(port, 'POST', PATROL_PATH, { Authorization: 'Bearer ' + SECRET });
  ok(pg.code === 405, '令牌对但不是 GET：405');
  for (const m of ['throw', 'reject']) {
    mode = m; const e = await req(port, 'GET', PATROL_PATH, { Authorization: 'Bearer ' + SECRET });
    ok(e.code === 500 && !e.body.includes('LEAK') && !e.body.includes('Error'), '取数函数出错（' + m + '）：统一 500，不泄露错误内容、服务不挂');
  }
  mode = 'ok';
  const h = await req(port, 'GET', '/api/health', {}); const hj = JSON.parse(h.body);
  ok(JSON.stringify(Object.keys(hj).sort()) === '["mode","ok","payChains"]' && !h.body.includes(SENTINEL), '公开 /api/health 仍只有 ok、mode、payChains 三样');
  s.close();
  for (const [n, t] of [['服务器没配令牌', undefined], ['服务器令牌为空', ''], ['服务器令牌太短', 'short']]) {
    const s2 = serve(t); await new Promise((r) => s2.listen(0, '127.0.0.1', r)); const p2 = s2.address().port;
    const a = await req(p2, 'GET', PATROL_PATH, {}), b = await req(p2, 'GET', PATROL_PATH, { Authorization: 'Bearer ' + (t || '') }), c = await req(p2, 'GET', PATROL_PATH, { Authorization: 'Bearer short' });
    ok(a.code === 401 && b.code === 401 && c.code === 401, n + '：一律拒绝，不会因为没配就放行'); s2.close();
  }
  // 模拟平台（浏览器检查用的）的公开 health 夹具也不许带 attention 之类的内部字段
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'test', 'fixtures.json'), 'utf8')).health;
  ok(!('attention' in fx), '测试夹具的公开 health 里没有 attention');
  console.log(`  total ${good} passed · ${bad} not ${bad ? '★' : '✓'}`);
  process.exit(bad ? 1 : 0);
})();
