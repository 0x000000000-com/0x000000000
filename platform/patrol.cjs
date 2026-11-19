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
const send = (res, code, body, extra) => {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, extra));
  res.end(JSON.stringify(body));
};
// getAttention(): 平台自己的函数，返回要人处理的事（数组）。只有令牌对了才会被调用。
async function handlePatrol(req, res, { token, getAttention }) {
  if (!tokenOk(req.headers['authorization'], token)) return send(res, 401, { error: 'unauthorized' }, { 'WWW-Authenticate': 'Bearer' });
  if (req.method !== 'GET') return send(res, 405, { error: 'method not allowed' }, { Allow: 'GET' });
  try {
    // 取数函数出错（抛错或异步失败）只回统一的 500，不把错误内容、堆栈带出去，也不让进程因未捕获异常挂掉
    const attention = await getAttention();
    return send(res, 200, { ok: true, attention: Array.isArray(attention) ? attention : [] });
  } catch (e) {
    return send(res, 500, { error: 'internal error' });
  }
}
module.exports = { handlePatrol, tokenOk, PATROL_PATH: '/api/internal/patrol' };
