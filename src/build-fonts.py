# -*- coding: utf-8 -*-
"""build-fonts.py —— FONTS0X_20260924：生成 web/css/fonts.css（全站的「代码风」字体，内嵌成 data: 网址）。

DSJ：「把网页的字体全部换成代码风，中英文数字也要代码风感字体。」
  · 英文 / 数字 / 符号：JetBrains Mono（等宽代码字体，SIL OFL 1.1）
  · 中文：Noto Sans SC（SIL OFL 1.1），每个汉字和全角标点的宽度改成正好两个英文字符宽（1.2em），
    字形居中 —— 跟终端里一样，中英文落在同一张等宽格子上。这就是「代码风」的中文。
  两个合成一个字体族「0x Mono」，按 unicode-range 分工。

为什么内嵌而不是从 Google Fonts 拉：下载到电脑上的铸造页要能断网打开（第 1 步、第 5 步建议断网做），
  而且「这一页只从自己的来源取 1 个文件、不连任何别的地方」是私钥外发检查的一条（noleak 闸会查）。

为什么裁字：完整的 Noto Sans SC 有 17 MB。这里只留【页面上和平台回话里真的会出现的字】——
  扫 web/ 下每一个 .html / .js（noble.js 是密码学库，跳过）和平台代码里的字符串；扫到的字全部进字体。
  以后页面加了新字，重新跑一次就好；漏掉的字不会变成方块，只会退回系统字体。

可复现：同样的源字体 + 同样的文字 + 同样版本的 fontTools/brotli，产出逐字节相同（没有时间戳，没有随机）。
  源字体（Google Fonts 官方仓库，SIL OFL 1.1；钉在固定的提交上，以后官方更新字体也不影响核对）：
    https://raw.githubusercontent.com/google/fonts/2e05c1cf00a6e4f40a4b931600a90881c26e15cd/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf
    https://raw.githubusercontent.com/google/fonts/2894aab31764f10f29c421bdfd2340d3b382d384/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
  两个文件的 sha256 完整值写在下面 SRC_SHA256 —— 不对就停，不许拿别的字体凑数。

跑法：python3 web/build-fonts.py <JetBrainsMono[wght].ttf> <NotoSansSC[wght].ttf> [--rescan [目录...]]
  不带 --rescan：按 css/fonts-chars.txt 里记下的那些字生成 —— 公开仓库里的人拿同样的源字体，能得到逐字节相同的 fonts.css。
  带 --rescan：重新扫一遍页面（web/ 下的 .html/.js）和后面给的目录（部署时传平台代码 demo/，让平台回话里的中文也进字体），
    把扫到的字写回 css/fonts-chars.txt，再生成。
  版本：fontTools 4.62.1 + brotli 1.2.0（woff2 压缩），Python 3.11。换了版本，压出来的字节可能不一样。
"""
import glob
import hashlib
import io
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "css", "fonts.css")
CHARS = os.path.join(HERE, "css", "fonts-chars.txt")
SRC_SHA256 = {   # 完整值（20260924 从上面两个钉住的网址下载实测）；改了源字体这里要一起改
    "JetBrainsMono": "48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda",
    "NotoSansSC": "a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da",
}
FAMILY = "0x Mono"
CELL = 1200          # 汉字宽度 = 两个 JetBrains Mono 字符（600 + 600，单位 1/1000 em）


def is_cjk(cp):
    return (0x2E80 <= cp <= 0x2FFF or 0x3000 <= cp <= 0x303F or 0x3040 <= cp <= 0x30FF or 0x3400 <= cp <= 0x4DBF
            or 0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF or 0xFE30 <= cp <= 0xFE4F or 0xFF00 <= cp <= 0xFFEF)


def collect(dirs):
    files = []
    for d in dirs:
        for ext in ("*.html", "*.js", "*.mjs", "css/*.css"):
            files += glob.glob(os.path.join(d, ext)) + glob.glob(os.path.join(d, "js", ext))
    files = sorted({f for f in files if not f.endswith(("noble.js", ".test.mjs", "fonts.css")) and ".bak" not in f})
    chars = set()
    for f in files:
        chars |= set(io.open(f, encoding="utf-8").read())
    return files, chars


def ranges(cps):
    cps = sorted(cps)
    out, a = [], None
    for i, c in enumerate(cps):
        if a is None:
            a = b = c
        elif c == b + 1:
            b = c
        else:
            out.append((a, b)); a = b = c
    if a is not None:
        out.append((a, b))
    return ", ".join("U+%X" % a if a == b else "U+%X-%X" % (a, b) for a, b in out)


def widen_cjk(font, cps):
    """把汉字和全角标点改成正好两格宽（CELL），字形往右挪一半差值 —— 居中。只动原来就是 1000 宽的。"""
    cmap, glyf, hmtx = font.getBestCmap(), font["glyf"], font["hmtx"]
    names = {cmap[c] for c in cps if c in cmap}
    done = 0
    for g in sorted(names):
        adv, lsb = hmtx[g]
        if adv != 1000:
            continue
        dx = (CELL - adv) // 2
        gl = glyf[g]
        if gl.isComposite():
            for comp in gl.components:
                if comp.glyphName not in names:
                    comp.x += dx
        elif gl.numberOfContours > 0:
            gl.coordinates.translate((dx, 0))
        gl.recalcBounds(glyf)
        hmtx[g] = (CELL, lsb + dx)
        done += 1
    return done


def build(src, cps, wght, widen=False):
    f = TTFont(src, lazy=False)
    o = subset.Options()
    o.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"]
    o.name_IDs = ["*"]
    o.notdef_outline = True
    o.hinting = False
    s = subset.Subsetter(o)
    s.populate(unicodes=cps)
    s.subset(f)
    n = widen_cjk(f, cps) if widen else 0
    f = instancer.instantiateVariableFont(f, {"wght": wght})
    # 可复现：fontTools 存盘时默认把 head.modified 改成【现在】—— 每跑一次字节都不一样（20260924 连跑两次实测）。
    #   关掉重算，并钉成源字体自己的创建时间。
    f.recalcTimestamp = False
    f["head"].modified = f["head"].created
    f.flavor = "woff2"
    buf = io.BytesIO()
    f.save(buf)
    have = set(f.getBestCmap())
    return buf.getvalue(), have, n


def main(argv):
    if len(argv) < 3:
        print(__doc__); return 2
    jbm, noto = argv[1], argv[2]
    rescan = "--rescan" in argv
    extra = argv[argv.index("--rescan") + 1:] if rescan else []
    for p, key in ((jbm, "JetBrainsMono"), (noto, "NotoSansSC")):
        h = hashlib.sha256(open(p, "rb").read()).hexdigest()
        print("  源字体 %s sha256 %s" % (os.path.basename(p), h))
        if h != SRC_SHA256[key]:
            print("★ 源字体指纹对不上（要 %s），停 —— 不许拿别的字体凑数" % SRC_SHA256[key]); return 2
    if rescan:
        files, chars = collect([HERE] + extra)
        print("  扫了 %d 个文件，%d 个不同的字 → 写进 %s" % (len(files), len(chars), os.path.relpath(CHARS, HERE)))
        if len(files) < 5 or len(chars) < 300:
            print("★ 扫到的太少 —— 路径不对，停（扫不到 != 没有字）"); return 2
        io.open(CHARS, "w", encoding="utf-8", newline="\n").write("".join(sorted(c for c in chars if c not in "\r\n")) + "\n")
    if not os.path.exists(CHARS):
        print("★ 没有 %s —— 第一次要带 --rescan" % os.path.relpath(CHARS, HERE)); return 2
    chars = set(io.open(CHARS, encoding="utf-8").read().rstrip("\n"))
    print("  按 %s 生成：%d 个不同的字" % (os.path.relpath(CHARS, HERE), len(chars)))
    jc = TTFont(jbm).getBestCmap()
    nc = TTFont(noto).getBestCmap()
    lat = sorted(ord(c) for c in chars if ord(c) in jc and not is_cjk(ord(c)) and ord(c) >= 0x20)
    cjk = sorted(ord(c) for c in chars if ord(c) in nc and ord(c) not in jc)
    lat_b, lat_have, _ = build(jbm, lat, (400, 800))
    cjk_b, cjk_have, widened = build(noto, cjk, (400, 700), widen=True)
    lat_cp = sorted(set(lat) & lat_have)
    cjk_cp = sorted(set(cjk) & cjk_have)
    miss = sorted(ord(c) for c in chars if ord(c) >= 0x20 and ord(c) not in lat_have and ord(c) not in cjk_have and not c.isspace())
    import base64
    css = []
    css.append("/* fonts.css —— 由 web/build-fonts.py 生成，别手改。FONTS0X_20260924")
    css.append("   「%s」= JetBrains Mono（英文 / 数字 / 符号）+ Noto Sans SC（中文，每个字两格宽）。两个都是 SIL OFL 1.1 开源字体，" % FAMILY)
    css.append("   只留页面上用到的 %d + %d 个字，内嵌在这里 —— 断网打开也是这套字，也不连任何字体网站。 */" % (len(lat_cp), len(cjk_cp)))
    # ★ 两个 @font-face 的 font-weight 必须写【同一个范围】。Chrome 先按粗细把同名字体分桶、只在选中的那一桶里
    #   按 unicode-range 分工 —— 写成 400 700 / 400 800 两个桶，英文那一套整个被跳过，英文字全退回系统字体
    #   （20260924 真浏览器量出来的：document.fonts 里英文那套一直是 unloaded）。中文字体最粗只有 700，要 800 时自动封顶。
    for data, cps, wr in ((cjk_b, cjk_cp, "400 800"), (lat_b, lat_cp, "400 800")):
        css.append("@font-face{font-family:\"%s\";font-style:normal;font-weight:%s;font-display:block;" % (FAMILY, wr))
        css.append("  src:url(data:font/woff2;base64,%s) format(\"woff2\");" % base64.b64encode(data).decode("ascii"))
        css.append("  unicode-range:%s}" % ranges(cps))
    body = "\n".join(css) + "\n"
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(body)
    print("  英文字体 %d 字 %d 字节 · 中文字体 %d 字（%d 个改成两格宽）%d 字节" % (len(lat_cp), len(lat_b), len(cjk_cp), widened, len(cjk_b)))
    print("  两套字体都没有、会退回系统字体的：%s" % ("".join(chr(c) for c in miss) or "（没有）"))
    print("  写出 %s  %d 字节  sha256 %s" % (os.path.relpath(OUT, HERE), len(body.encode()), hashlib.sha256(body.encode()).hexdigest()[:16]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
