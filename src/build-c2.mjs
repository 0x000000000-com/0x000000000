// build-c2.mjs — CONTRACT0X_20260928：把合约靓号页、发币地址定制页各自拼成一个文件（跟首页 build-single.mjs 同一个做法）：
//   contract.html → 0x000000000-contract.html（0x000000000.com/contract）· token.html → 0x000000000-token.html（0x000000000.com/token）
//   网站上那一页 = 下载的那个文件 = GitHub 上公开的那个文件 —— 一个指纹对到底。可复现：不许有时间戳、随机数。
//   快讯只播投毒、假币、假网址、整体规模四类（构思 v3 第一章第 3 条）：js/news-c2.js 是从 js/news.js 挑出来的，
//     不手抄 —— 这里重新挑一遍，跟磁盘上那份逐字节比，不一样就停（node build-c2.mjs --news 重写它）。
//   NOKEYWORD 闸：这一单根本没有钥匙，成品里一个「私钥」、一个 private key 都不许有。
// 用法：node build-c2.mjs [源码目录] [输出目录]      node build-c2.mjs --news（只重写 js/news-c2.js）
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const DIR = ARGS[0] || HERE, OUTDIR = ARGS[1] || DIR;
const rd = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
export const PAGES = [['contract.html', '0x000000000-contract.html'], ['token.html', '0x000000000-token.html']];
const PARTS = [['css/fonts.css', 'style'], ['css/fonts-extra.css', 'style'], ['css/style.css', 'style'],
  ['js/news-c2.js', 'script'], ['js/salt.js', 'script'], ['js/c2app.js', 'script']];
// 一个字大小写都算：成品里一处都不许有（「钥匙」可以 —— 这两页说的是「不碰任何钥匙」）
const KEYWORD = String.fromCharCode(0x79c1, 0x94a5);                 // 就是个人靓号页上那个两个字的词；写成码点，这个文件自己也不带它
const NOKEY = [new RegExp(KEYWORD), /private[\s_-]*key/i, /seed phrase/i, /mnemonic/i, new RegExp(String.fromCharCode(0x52a9, 0x8bb0, 0x8bcd))];
const BANNED = [/挖/, /ECDLP/, /P\s*=\s*A\s*\+\s*b/, /\bmines?\b/i, /\bmining\b/i, /\bminers?\b/i];

// ── 快讯：从 news.js 挑四类，另外把正文里提到上面那几个词的也去掉 ──
export function newsC2(newsSrc = rd('js/news.js')) {
  const box = {};
  vm.runInNewContext(newsSrc, box, { filename: 'news.js' });
  const keep = box.NEWS.filter((n) => n.c !== 'key' && !NOKEY.some((re) => re.test(JSON.stringify(n))));
  const cat = {}; for (const k of ['poison', 'fake', 'site', 'scale']) cat[k] = box.NEWS_CAT[k];
  return '// news-c2.js — CONTRACT0X_20260928：合约靓号页、发币地址定制页的快讯（由 web/build-c2.mjs 从 js/news.js 挑出来：投毒、假币、假网址、整体规模四类）。\n'
    + '//   不要手改：改 news.js，再跑 node web/build-c2.mjs --news。打包时重新挑一遍逐字节比，对不上就不出包。\n'
    + 'var NEWS = ' + JSON.stringify(keep) + ';\nvar NEWS_CAT = ' + JSON.stringify(cat) + ';\n';
}

export function buildC2() {
  const out = [];
  const want = newsC2();
  if (rd('js/news-c2.js') !== want) throw new Error('js/news-c2.js 跟 news.js 挑出来的对不上（news.js 改过？跑 node web/build-c2.mjs --news）');
  for (const [src, dst] of PAGES) {
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
    // NOKEYWORD：这一单根本没有钥匙
    for (const re of NOKEY) { const m = html.match(re); if (m) throw new Error(`NOKEYWORD：${dst} 里出现了不该有的词（第 ${html.slice(0, m.index).split('\n').length} 行）`); }
    for (const re of BANNED) { const m = html.match(re); if (m) throw new Error(`禁用词：${dst} 里出现了「${m[0]}」`); }
    out.push({ src, dst, html, build, sha256: crypto.createHash('sha256').update(html).digest('hex'), bytes: Buffer.byteLength(html) });
  }
  // 量具自证：往成品里植一个那个词，闸必须抓到（不然「0 处」可能只是闸坏了）
  if (!NOKEY[0].test(out[0].html + KEYWORD)) throw new Error('NOKEYWORD 闸抓不到植进去的词 —— 尺子坏了');
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--news')) { fs.writeFileSync(path.join(DIR, 'js', 'news-c2.js'), newsC2()); console.log('js/news-c2.js 重写好了'); }
  else { fs.mkdirSync(OUTDIR, { recursive: true }); for (const r of buildC2()) { fs.writeFileSync(path.join(OUTDIR, r.dst), r.html); console.log(JSON.stringify({ out: r.dst, bytes: r.bytes, build: r.build, sha256: r.sha256 })); } }
}
