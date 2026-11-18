#!/usr/bin/env bash
# 真浏览器外发检查一键运行（只在本机 127.0.0.1 上跑，不访问任何线上网址）。
# 在仓库任意位置执行：bash test/run-browser-checks.sh
# 步骤：装依赖和浏览器（第一次要联网下载）→ 重新构建核对 → 安全回归 → 四个真浏览器检查。任何一步失败即退出非 0。
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "== 1/4 指纹校验"; sha256sum -c SHA256SUMS
echo "== 2/4 安全回归"; node test/secfix.cjs src wp.html ppt.html README.md README.zh-CN.md | tail -n 1
if [ -f devroom-tests/card-validation.cjs ]; then node devroom-tests/card-validation.cjs; fi
cd test
if [ ! -d node_modules/playwright ]; then
  echo "== 装依赖（版本按 package-lock.json）"; npm ci --no-audit --no-fund
fi
# 系统库需要管理员权限时：INSTALL_DEPS=1 bash test/run-browser-checks.sh
if [ "${INSTALL_DEPS:-0}" = 1 ]; then npx playwright install --with-deps chromium; else npx playwright install chromium; fi
echo "== 3/4 私钥外发：走完 6 步，核对每个请求"; node noleak.cjs ../0x000000000.html ./mock-platform.mjs ./node_modules
echo "== 4/4 窄屏 + 免费生成页零外发"
node narrow.cjs ../0x000000000.html ./mock-platform.mjs
node noleak-free.cjs ../0x000000000-free.html ./node_modules
echo "全部通过"
