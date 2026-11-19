// patrol.cjs —— 内部巡检接口 GET /api/internal/patrol 的门禁与回话（参考实现，平台服务器照这个接）。
// 公开的 /api/health 不动：只回 ok / mode / payChains。要人处理的事（attention）只在这里、且必须带令牌。
// 规矩：令牌只认 Authorization: Bearer <令牌>（不收网址参数，免得进日志）；没带、带错、服务器没配令牌（或太短）
// 一律同一个 401，内容一样，不泄露任何内部情况；比较用定长哈希 + timingSafeEqual。
'use strict';
const crypto = require('node:crypto');
const MIN_TOKEN = 32;
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

function tokenOk(header, secret) {
  if (typeof secret !== 'string' || secret.length < MIN_TOKEN) return false;   // 没配或太短：一律拒绝（不会因为没配而放行）
  const m = /^Bearer ([^\s]+)$/.exec(typeof header === 'string' ? header : '');
  if (!m) return false;
  return crypto.timingSafeEqual(sha(m[1]), sha(secret));
}
const send = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};
// getAttention(): 平台自己的函数，返回要人处理的事（数组）。只有令牌对了才会被调用。
function handlePatrol(req, res, { token, getAttention }) {
  if (!tokenOk(req.headers['authorization'], token)) return send(res, 401, { error: 'unauthorized' });
  if (req.method !== 'GET') return send(res, 405, { error: 'method not allowed' });
  return send(res, 200, { ok: true, attention: getAttention() });
}
module.exports = { handlePatrol, tokenOk, PATROL_PATH: '/api/internal/patrol' };
