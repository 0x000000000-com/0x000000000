# 内部巡检接口：真服务器接入与定时任务配令牌

接口：`GET /api/internal/patrol`，参考实现 `platform/patrol.cjs`（`handlePatrol`）。公开的 `/api/health` 不动，仍只回 ok、mode、payChains。

## 一、真服务器接入（平台服务器一侧）
1. 生成令牌（至少 32 位，越随机越好）：`openssl rand -hex 32`。令牌只放服务器的环境变量/密钥管理里，不写进代码、不进仓库、不进聊天。
2. 在平台服务器的路由里加一条，照 `platform/patrol.cjs` 接：
   `if (pathname === PATROL_PATH) return handlePatrol(req, res, { token: process.env.PATROL_TOKEN, getAttention })`
   `getAttention()` 由平台自己写，返回「要人处理的事」数组（退款卡住、待人工审核等）。
3. 服务器没配令牌或令牌少于 32 位时，接口对所有人都回 401（不会因为没配就放行）。
4. 反向代理/网关不要把 `Authorization` 头写进访问日志，也不要对这个路径做缓存。
5. 上线后自检：不带令牌访问应得 401；带令牌应得 200 和 attention；`/api/health` 仍只有三样。

## 二、定时任务配令牌（巡检一侧）
1. 在定时任务所在处（如 GitHub 仓库 Settings → Secrets 里新建 `PATROL_TOKEN`，值与服务器一致）存令牌。
2. 任务里用请求头带令牌，不要放网址参数（网址会进日志，且接口不认）：
   `curl -fsS -H "Authorization: Bearer $PATROL_TOKEN" https://<平台域名>/api/internal/patrol`
3. 返回 200 且 `attention` 非空 → 「要你处理」提醒；401 → 令牌配错；500 → 平台取数出错（只回「内部错误」，细节看服务器自己的日志）。
4. 令牌泄露或换人时：服务器和定时任务两边同时换新令牌。

注意：以上两步需在真服务器与定时任务平台上操作，开发室不碰线上，所以尚未做。
