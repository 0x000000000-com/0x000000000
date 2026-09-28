// build-free.mjs — FREEGEN0X_20260928：把免费生成页拼成一个文件：free.html → 0x000000000-free.html（0x000000000.com/free）。
//   跟首页 build-single.mjs、合约页 build-c2.mjs 同一个做法：网站上那一页 = 下载的那个文件 = GitHub 上公开的那个文件，一个指纹对到底。
//   可复现：不许有时间戳、随机数。
//   NONET 闸：这一页一个请求都不发 —— 成品里不许出现任何发请求的写法（fetch、XMLHttpRequest、WebSocket、EventSource、sendBeacon、importScripts、
//     <img>/<iframe>/<link>/<script> 外链）。这是「不看运行、只看字」的那一半；另一半是私钥外发检查用真浏览器数请求（必须 0 个）。
// 用法：node build-free.mjs [源码目录] [输出目录]
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const DIR = ARGS[0] || HERE, OUTDIR = ARGS[1] || DIR;
const rd = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
export const PAGE = ['free.html', '0x000000000-free.html'];
const PARTS = [['css/fonts.css', 'style'], ['css/fonts-extra.css', 'style'], ['css/style.css', 'style'],
  ['js/news.js', 'script'], ['js/noble.js', 'script'], ['js/keycore.js', 'script'], ['js/freegen.js', 'script'], ['js/freeapp.js', 'script']];
const NONET = [/\bfetch\s*\(/, /XMLHttpRequest/, /\bWebSocket\b/, /\bEventSource\b/, /sendBeacon/, /importScripts/, /\bnew\s+Image\s*\(/, /\.src\s*=/];
const BANNED = [/挖/, /ECDLP/, /P\s*=\s*A\s*\+\s*b/, /\bmines?\b/i, /\bmining\b/i, /\bminers?\b/i];

export function buildFree() {
  const [src, dst] = PAGE;
  let html = rd(src);
  const h = crypto.createHash('sha256');
  h.update(html); for (const [rel] of PARTS) h.update(rd(rel));
  const build = h.digest('hex').slice(0, 12);
  for (const [rel, kind] of PARTS) {
    const tag = kind === 'style' ? `<link rel="stylesheet" href="${rel}">` : `<script src="${rel}"></script>`;
    const n = html.split(tag).length - 1;
    if (n !== 1) throw new Error(`${src} 里 ${tag} 出现 ${n} 次（要 1 次）`);
    const body = rd(rel).replace(/\n+$/, '');
    if (/<\/(script|style)/i.test(body)) throw new Error(rel + ' 里有 </script 或 </style，不能原样内联');
    html = html.replace(tag, () => (kind === 'style' ? `<style>\n${body}\n</style>` : `<script>\n${body}\n</script>`));
  }
  if (html.split('<!--BUILD_ID-->').length - 1 !== 1) throw new Error(src + ' 里 <!--BUILD_ID--> 不是恰好 1 次');
  html = html.replace('<!--BUILD_ID-->', build);
  // 自证 ①：script / style 体之外不许有任何资源外链
  const shell = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
  const ext = [...shell.matchAll(/<(?:script|link|img|iframe)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)/g)].map((m) => m[1]).filter((u) => !u.startsWith('data:'));
  if (ext.length) throw new Error(dst + ' 里还有外链：' + ext.join(', '));
  // 自证 ②：每一份源文件逐字节在成品里出现且只出现一次
  for (const [rel] of PARTS) if (html.split(rd(rel).replace(/\n+$/, '')).length - 1 !== 1) throw new Error(rel + ' 在 ' + dst + ' 里不是恰好出现一次');
  // NONET：成品里不许有发请求的写法（样式表里的 url(data:…) 不算请求）
  for (const re of NONET) { const m = html.match(re); if (m) throw new Error(`NONET：${dst} 里出现了发请求的写法「${m[0]}」（第 ${html.slice(0, m.index).split('\n').length} 行）`); }
  for (const re of BANNED) { const m = html.match(re); if (m) throw new Error(`禁用词：${dst} 里出现了「${m[0]}」`); }
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  const css = styles.match(/url\(\s*(?!["']?(?:data:|#|%23))[^)]*\)/);      // 样式表里的 url()：只许 data:（字体）或页内 #引用
  if (css) throw new Error('NONET：样式表里有不是 data: 的 url()：' + css[0]);
  // 量具自证：往成品里植一个 fetch(，闸必须抓到（不然「0 处」可能只是闸坏了）
  if (!NONET.some((re) => re.test(html + '\nfetch("/x")'))) throw new Error('NONET 闸抓不到植进去的 fetch —— 尺子坏了');
  return { src, dst, html, build, sha256: crypto.createHash('sha256').update(html).digest('hex'), bytes: Buffer.byteLength(html) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const r = buildFree();
  fs.writeFileSync(path.join(OUTDIR, r.dst), r.html);
  console.log(JSON.stringify({ out: r.dst, bytes: r.bytes, build: r.build, sha256: r.sha256 }));
}
