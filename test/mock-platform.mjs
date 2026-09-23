// mock-platform.mjs —— 给「私钥外发检查」用的模拟平台（公开）。
// 只做一件事：按网站真实接口的形状回话，让页面能把 6 步走完。它不碰任何真钱、不连任何链。
// 平台的真服务器代码不在这个仓库里 —— 它不需要在这里：页面发给它什么，test/noleak.cjs 在线路上逐个核对，
// 跟服务器是真是假无关。
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ProjectivePoint } from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { sha256 } from '@noble/hashes/sha256';

const FIX = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url), 'utf8'));
const PORT = Number(process.env.PORT || 8787);
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const hex = (u) => Buffer.from(u).toString('hex');
function b58(buf) { let v = 0n; for (const x of buf) v = (v << 8n) | BigInt(x); let s = ''; while (v > 0n) { s = B58[Number(v % 58n)] + s; v /= 58n; } return s; }
function addrOf(chain, P) {
  const h = keccak_256(P.toRawBytes(false).subarray(1)).subarray(12);
  if (chain === 'evm') return '0x' + hex(h);
  const p = Buffer.concat([Buffer.from([0x41]), Buffer.from(h)]);
  return b58(Buffer.concat([p, Buffer.from(sha256(sha256(p)).subarray(0, 4))]));
}
const hit = (chain, a, pre, suf) => { const body = chain === 'evm' ? a.slice(2) : a; return (!pre || body.startsWith(pre)) && (!suf || body.endsWith(suf)); };
const orders = new Map();
const pub = (o) => ({ id: o.id, pattern: o.prefix, status: o.status, chain: o.chain, payChain: o.payChain, prefix: o.prefix, suffix: o.suffix,
  patternText: (o.prefix + '…' + o.suffix).replace(/^…$/, ''), foundAddress: o.found || null, mineMs: o.found ? 1 : null,
  address: 'TQKVqVrjBFHjUo7HjcuPMMYbDVSSNumHR9', amountUsdt: 1, ready: !!o.found, challenge: o.challenge,
  downloadsLeft: o.found ? 50 : null, settled: !!o.settled, settledAt: o.settled || null,
  receiptChallenge: o.found ? ['0x000000000 delivery receipt', 'order: ' + o.id, 'pattern: ' + (o.chain === 'evm' ? '0x' : '') + (o.prefix + '…' + o.suffix).replace(/^…$/, ''), 'address: ' + o.found, 'nonce: ' + o.nonce].join('\n') : null });
function mint(o) {
  const G = ProjectivePoint.BASE; let P = ProjectivePoint.fromHex(o.A), b = 0n;
  for (;;) { P = P.add(G); b++; const a = addrOf(o.chain, P); if (hit(o.chain, a, o.prefix, o.suffix)) { o.b = b; o.found = a; return; } }
}
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(body)); };
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'); const p = url.pathname;
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); return res.end(); }
  let body = null;
  if (req.method === 'POST') { const ch = []; for await (const c of req) ch.push(c); const t = Buffer.concat(ch).toString(); body = t ? JSON.parse(t) : null; }
  if (p === '/api/health') return json(res, 200, FIX.health);
  if (p === '/api/catalog') return json(res, 200, FIX.catalog);
  if (p === '/api/orders' && req.method === 'POST') {
    const id = randomBytes(4).toString('hex');
    const o = { id, chain: body.chain, prefix: body.prefix || '', suffix: body.suffix || '', payChain: body.payChain || 'tron',
      challenge: randomBytes(32).toString('hex'), nonce: randomBytes(16).toString('hex'), status: 'created' };
    orders.set(id, o);
    return json(res, 200, { orderId: id, challenge: o.challenge, status: 'created', chain: o.chain, kind: o.prefix && o.suffix ? 'both' : o.suffix ? 'suffix' : 'prefix',
      prefix: o.prefix, suffix: o.suffix, pattern: o.prefix, amountUsdt: 1, payChain: o.payChain, mintTimeText: '1.0 小时', refundDeadlineText: '1.0 小时' });
  }
  const m = p.match(/^\/api\/orders\/([0-9a-f]{8})(\/[a-z-]+)?$/);
  const o = m && orders.get(m[1]);
  if (!o) return json(res, 404, { error: 'not found' });
  const act = m[2] || '';
  if (act === '/share' && req.method === 'POST') { o.A = body.A; o.status = 'share_uploaded'; return json(res, 200, { status: 'share_uploaded' }); }
  if (act === '/payment') return json(res, 200, { chain: 'TRON', payChain: 'tron', network: 'TRC20', contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', address: 'TQKVqVrjBFHjUo7HjcuPMMYbDVSSNumHR9', amountUsdt: 1, confirmationsRequired: 19 });
  if (act === '/pay-sim' && req.method === 'POST') { o.status = 'mining'; setTimeout(() => { mint(o); o.status = 'found'; }, 500); return json(res, 200, { status: 'watching', sim: true, queue: false, confirmationsRequired: 19 }); }
  if (act === '/download' && req.method === 'GET') {
    if (!url.searchParams.get('sig') || !o.found) return json(res, 403, { error: 'need signature' });
    return json(res, 200, { b: o.b.toString(), variant: 0, address: o.found, pattern: o.prefix, downloadsLeft: 49, note: '' });
  }
  if (act === '/receipt' && req.method === 'POST') { o.settled = Date.now(); o.status = 'settled'; return json(res, 200, { status: 'settled', address: o.found, note: '' }); }
  if (!act && req.method === 'GET') return json(res, 200, pub(o));
  return json(res, 400, { error: 'unknown' });
}).listen(PORT, '127.0.0.1');
