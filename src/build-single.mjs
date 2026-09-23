// build-single.mjs — ONEFILE0X_20260923
// 把首页 index.html 和它引用的 css / js【原样】拼成一个文件：0x000000000.html。
//   网站首页 = 这个文件 = 客户下载的那个文件 = GitHub 上公开的那个文件 —— 一个指纹对到底。
//   任何人拿同一份源码跑这个脚本，得到的字节必须一模一样（可复现构建），所以这里不许有时间戳、随机数。
// 用法：node build-single.mjs [源码目录] [输出文件]
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const DIR = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[3] || path.join(DIR, '0x000000000.html');
const rd = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
const PARTS = [['css/style.css', 'style'], ['js/noble.js', 'script'], ['js/keycore.js', 'script'], ['js/app.js', 'script']];

export function buildSingle() {
  let html = rd('index.html');
  // 版本号 = 源码内容的 sha256 前 12 位。只看源码、不看成品，所以不会「自己算自己」。
  const h = crypto.createHash('sha256');
  h.update(html); for (const [rel] of PARTS) h.update(rd(rel));
  const build = h.digest('hex').slice(0, 12);
  for (const [rel, kind] of PARTS) {
    const tag = kind === 'style' ? `<link rel="stylesheet" href="${rel}">` : `<script src="${rel}"></script>`;
    const n = html.split(tag).length - 1;
    if (n !== 1) throw new Error(`index.html 里 ${tag} 出现 ${n} 次（要 1 次）`);
    const body = rd(rel).replace(/\n+$/, '');
    if (/<\/(script|style)/i.test(body)) throw new Error(rel + ' 里有 </script 或 </style，不能原样内联');
    // 用函数当替换值：JS 源码里的 $& $1 之类不许被当成替换模式
    html = html.replace(tag, () => (kind === 'style' ? `<style>\n${body}\n</style>` : `<script>\n${body}\n</script>`));
  }
  const n = html.split('<!--BUILD_ID-->').length - 1;
  if (n !== 1) throw new Error(`index.html 里 <!--BUILD_ID--> 出现 ${n} 次（要 1 次）`);
  html = html.replace('<!--BUILD_ID-->', build);
  // 自证 ①：script / style 体之外不许再有任何资源外链（图片、脚本、样式、iframe）
  const shell = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
  const ext = [...shell.matchAll(/<(?:script|link|img|iframe)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)/g)]
    .map((m) => m[1]).filter((u) => !u.startsWith('data:'));
  if (ext.length) throw new Error('单文件里还有外链：' + ext.join(', '));
  // 自证 ②：每一份源文件逐字节在成品里出现且只出现一次
  for (const [rel] of PARTS) {
    const body = rd(rel).replace(/\n+$/, '');
    if (html.split(body).length - 1 !== 1) throw new Error(rel + ' 在成品里不是恰好出现一次');
  }
  return { html, build };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { html, build } = buildSingle();
  fs.writeFileSync(OUT, html);
  const sha = crypto.createHash('sha256').update(html).digest('hex');
  console.log(JSON.stringify({ out: OUT, bytes: Buffer.byteLength(html), build, sha256: sha }));
}
