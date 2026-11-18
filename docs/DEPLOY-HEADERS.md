# 部署说明：防被别的网页嵌套（点击劫持）· Anti-framing deployment note

## 为什么要写这份
网页自己拦不住「被别人的页面用 iframe 套住、再诱骗访客点击」。这件事只有**服务器的响应头**管得住：
`<meta>` 标签里写 `frame-ancestors` 会被浏览器忽略，页面里的脚本防嵌套可以被绕过。
所以仓库里**没有也不应有**这项设置，必须由**部署端（托管 / CDN / 反向代理）**来设。

## 谁来设什么
| 项 | 由谁 | 内容 |
|---|---|---|
| 响应头 `Content-Security-Policy: frame-ancestors 'none'` | **部署端** | 所有 HTML 页面（0x000000000*.html、card.html、wp.html、ppt.html、zero.html）都加。需要被自家页面嵌入的，改成 `frame-ancestors 'self'` |
| 响应头 `X-Frame-Options: DENY` | **部署端** | 给老浏览器的兜底，与上一条同时设 |
| 响应头 `X-Content-Type-Options: nosniff`、`Referrer-Policy: no-referrer` | 部署端（建议） | 减少类型误判和来源泄露 |
| 仓库里的页面源码 | 开发方 | 已做：不需要改；**不要**在页面里加 meta 版 frame-ancestors（无效） |

## 示例
nginx：
```
add_header Content-Security-Policy "frame-ancestors 'none'" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
```
Cloudflare Pages / Netlify 的 `_headers`：
```
/*
  Content-Security-Policy: frame-ancestors 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
```

## 上线后自查（对自己的站点，不是别人的）
`curl -sI https://<你的域名>/ | grep -i -E 'frame-ancestors|x-frame-options'` 必须两行都有。
注意：设了这两个头之后，别把完整 CSP 的 `default-src` 之类一并加得太严——页面是单文件、内联脚本和样式，随手加 `script-src 'self'` 会让页面整个不能用。

## 真浏览器检查
运行脚本：`bash test/run-browser-checks.sh`（第一次要联网装依赖和 Chromium；检查本身只连本机 127.0.0.1）。
该脚本验证的是**页面不外发私钥**，不验证响应头——响应头只能在真实部署后用上面的 curl 查。
