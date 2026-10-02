// c2app.js — CONTRACT0X_20260928：合约靓号页、发币地址定制页共用的页面逻辑（同一套下载铸造页面，名字、主色、页首都不一样）。
//   这一单根本没有钥匙 —— 我们只算「盐」，地址是 CreateX + 你的部署地址 + 盐（+ 代码指纹）算出来的。所以这两页只说「钥匙」，
//   不出现个人靓号页上那个词（打包闸 web/build-c2.mjs 的 NOKEYWORD 逐字扫成品）。
//   地址怎么算只有 salt.js 一份（下载的页面里断网也能核）。全页唯一的出网口是下面的 api()，每一次都记进「这一页跟平台说过的每一句话」。
//   经典脚本，没有 import / export；单文件打包原样内联。
(function () {
  'use strict';
  var PRODUCT = document.body.getAttribute('data-product') === 'token' ? 'token' : 'contract';
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var LANG_KEY = '0xlang2';                                  // 跟首页同一个：在哪一页选的语言，换一页照样
  var lang = (function () { try { var v = localStorage.getItem(LANG_KEY); return v === 'zh' || v === 'en' || v === 'id' ? v : 'en'; } catch (e) { return 'en'; } })();   // IDLANG0X_20260928：多一种印尼文 id
  var ON_SITE = /(^|\.)0x000000000\.com$/i.test(location.hostname);
  var API_BASE = location.protocol === 'file:' ? 'https://0x000000000.com'
    : (location.hostname === '127.0.0.1' || location.hostname === 'localhost') ? (window.C2_API_BASE || 'http://127.0.0.1:8787') : '';
  var FILE = PRODUCT === 'token' ? '0x000000000-token.html' : '0x000000000-contract.html';

  // ── 字 ───────────────────────────────────────────────────────────────────────────────────────────
  var D = {
    zh: {
      title: { contract: '0x000000000 — 合约靓号', token: '0x000000000 — 发币地址定制' },
      here: { contract: '你现在在：合约靓号（给项目方）', token: '你现在在：发币地址定制（给发币的人）' },
      hereSub: { contract: '合约地址好认、各条链同一个地址。我们只算「盐」—— 这一单不碰任何钥匙。', token: '代币合约地址带上你的币名或吉利号，贴在群里一眼认出是真币。我们只算「盐」—— 这一单不碰任何钥匙。' },
      navVanity: '个人靓号', navContract: '合约靓号', navToken: '发币地址定制', navFree: '免费生成', navWp: '白皮书',
      trust: '页面代码公开在 GitHub · 这一单不碰任何钥匙 · 零九零自己的钱也是这样防的',
      cmpHead: '三个铸造页，别走错：',
      cmpRows: [['', '个人靓号', '合约靓号', '发币地址定制'],
        ['是什么', '你自己的钱包地址', '你部署的合约的地址', '你发的币的合约地址'],
        ['给谁', '个人、商家', '项目方', '发币的人、发币平台'],
        ['钥匙', '钥匙只在你手里（你造一半、我们算另一半）', '不碰任何钥匙（只算盐）', '不碰任何钥匙（只算盐）'],
        ['以太坊类各条链', '同一个地址（同一把钥匙）', '同一个地址（CreateX）', '同一个地址（CreateX）'],
        ['去哪', '0x000000000.com', '0x000000000.com/contract', '0x000000000.com/token']],
      whatH: '这是什么',
      what: { contract: '部署合约时，合约的地址是算出来的：部署工厂（CreateX）+ 你的部署地址 + 一个数（叫「盐」）+ 合约代码的指纹。换一个盐，地址就换一个 —— 我们用显卡把「让地址长成你要的样子」的那个盐算出来交给你，你自己部署，地址当场对得上。',
        token: '发币就是部署一个代币合约。代币合约的地址也是算出来的：部署工厂（CreateX）+ 你的部署地址 + 一个数（叫「盐」）。我们用显卡把「让地址带上你的币名或吉利号」的那个盐算出来交给你，你自己发币，地址当场对得上。' },
      moreH: '为什么要、真实例子、照实说',
      whyH: '为什么要',
      why: { contract: ['好认：地址开头一串 0，用户一眼认出官方合约', '各条链同一个地址：以太坊、BSC、Base……用户只要记一个', '省一点手续费：别人调用时，地址里每两个 0（一个「零字节」）省一点 gas —— 高频交易才有感，照实说', '零钥匙风险：根本没有钥匙这回事，也就没有钥匙可以泄露'],
        token: ['一眼认出真币：同名假币满天飞时，地址结尾是你的吉利号', '发币平台都拿地址结尾当招牌：four.meme 结尾 4444，Flap.sh 结尾 8888 / 7777', '各条链同一个地址：多链发币，用户只核一个', '零钥匙风险：根本没有钥匙这回事'] },
      casesH: '真实例子',
      cases: { contract: ['Uniswap 第四版核心合约 0x000000000004444c…：专门办了三周全网比赛挑出来的（2024-11-10 至 12-01）', 'OpenSea 的交易合约 Seaport 1.6：0x0000000000000068F116…，各条链地址相同', '1inch 路由合约第六版：0x111111125421cA6d…，各条链同一个地址', 'Multicall3：0xcA11…（念起来像 call），250 多条链同一个地址'],
        token: ['2025-01 TRUMP 上线那个周末：带 Trump 名字的代币从 3,300 个涨到 6,800 个（Blockaid）', '2023-08 PayPal 宣布 PYUSD 后一天之内：冒出近 30 个假 PYUSD 交易对，最大一个成交约 260 万美元', '2025-02 知名交易员误买假 LIBRA 币，约 17 万美元，很快跌到约 6.2 万', '2026-03 Blockaid：1,700 多万个新代币里查出 5.4 万多个假稳定币，冒充 USDT 的 3.4 万多个'] },
      riskH: '不用会怎样',
      risk: { contract: '地址是一串乱码，用户分不清哪个是官方的；每条链地址不一样，更难核对。反面教材：Multicall3 当年用生成器造部署用的钥匙，钥匙泄露后，攻击者在另一条链上占了它的地址 —— 算盐的办法没有钥匙可以泄露。',
        token: '同名假币满天飞，买家只能靠一串乱码分真假。照实说：结尾只有 4 个字的，骗子也能便宜地仿 —— 所以图案要够长，再配上黄勾认证页（付钱的人查得到哪个才是你登记的官方合约）。' },
      honestH: '照实说',
      honest: ['免费的开源工具也能算（有工程师的团队可以自己算）。我们的价值：不用自己租显卡、算好马上交、盐只归你用、各条链同一个地址、交货前在 9 条链上只读模拟过一遍', '以太坊类地址只有 0-9、a-f 这 16 个字，不分大小写 —— 「pepe」写不进去；能写的是 cafe、beef、c0ffee、8888……', '价格 = 合计成本（显卡按实测速度算的时间 + 每单一次的归集手续费）× 20，再进位'],
      priceH: '价格（按 09-28 在 RTX 5090 上实测的速度算）',
      priceCols: ['开头 + 结尾一共', 'CREATE3 · 价格', 'CREATE3 · 铸造耗时', 'CREATE2 · 价格', 'CREATE2 · 铸造耗时'],
      priceNote: '铸造耗时按「100 单里 95 单在这个时间内铸好」报；过了退款时限还没铸好就全额退。图案位数一样，价格就一样 —— 0x0000 跟 0xbeef 一样难。',
      priceOffline: '联网之后这里显示价格（价格只从平台取，页面里不留第二份）',
      chainsH: '以太坊类各条链同一个地址',
      chains: 'CreateX 这个部署工厂在各条以太坊类链上地址相同、代码相同。09-28 我们在下面 9 条链上只读模拟过部署（不上链、不花钱）：同一个部署地址 + 同一个盐，每条链算出来都是同一个地址；别人拿你的盐，得到的是别的地址；盐的第 21 个字节改成 01，每条链就都不一样了（所以我们交的盐这一位永远是 00）。',
      chainsZk: 'zkSync Era：用普通以太坊编译器（solc）编出来的代码经 CreateX 部署，地址一样；用 zkSync 自己的编译器编的不适用。',
      chainsMore: '别的以太坊类链上如果也部署了 CreateX，一般也是同一个地址 —— 部署前先模拟一次（第 5 步教你）。',
      dlHead: '在你自己的电脑上下单',
      dlWhy: '这一单不碰任何钥匙，但交货后的「核对」要在你自己手上的页面里做：下载这一页到电脑上，它以后我们改不了；跟 GitHub 上公开的那一份逐字节相同，你可以自己比。',
      dlSteps: ['点下面的按钮，下载这一页（一个文件：' + FILE + '）', '在电脑上双击打开（Chrome 或 Edge）', '照着 5 步走。每一步都说清楚：要不要联网、为什么'],
      dlBtn: '下载这一页', dlGh: '在 GitHub 上核对',
      netGuide: '你用的是下载到自己电脑上的页面。每一步都标了：🔌 = 断网也能做，🌐 = 要联网。',
      s1: '第 1 步 · 🔌 填三样', s2: '第 2 步 · 🌐 报价、下单', s3: '第 3 步 · 🌐 付款', s4: '第 4 步 · 🌐 铸造机在算', s5: '第 5 步 · 🔌 取货、断网核对',
      s1why: '这一步不用联网：页面只在你的电脑上检查格式。',
      modeH: '部署方式（都用 CreateX）',
      m3: 'CREATE3（推荐）：地址只看你的部署地址和盐 —— 合约代码改了，盐照样能用',
      m2: 'CREATE2：地址跟合约代码绑在一起 —— 要代码指纹；代码改一个字，地址就变，要重算',
      depH: '你的部署地址（直接调用 CreateX 的那个地址；用多签就填多签地址）',
      depPh: '0x 开头，40 位',
      ihH: '合约代码的指纹（keccak256，CREATE2 才要）',
      ihPh: '0x 开头，64 位',
      ihHelp: '没有指纹？把合约的部署代码（creation bytecode，连同构造参数）贴进来，页面在你电脑上算：',
      ihCalc: '在本机算指纹',
      patH: { contract: '想要的开头 / 结尾（只能用 0-9、a-f）', token: '币名或吉利号（只能用 0-9、a-f）' },
      preLbl: '开头 0x', sufLbl: '结尾',
      tokenHint: '想用字母拼币名？地址里只有 a-f：可以用 0 代替 o、1 代替 i 或 l、5 代替 s、7 代替 t（比如 c0ffee、5afe、bee7）。',
      labelH: '（可选）给这一单起个名字，只你自己看',
      next1: '下一步：报价',
      preview: function (p, s) { return '地址会长这样：0x' + p + '…' + s; },
      pinnedTxt: function (n, a, b) { return '一共 ' + n + ' 位（可卖 ' + a + '~' + b + ' 位）'; },
      bad: { deployer: '部署地址要 0x 加 40 位十六进制', checksum: '部署地址的大小写对不上（大小写是校验码）—— 从钱包里重新复制一次', zero: '部署地址不能是全 0',
        ih: 'CREATE2 要 0x 加 64 位十六进制的代码指纹', hex: '图案里只能用 0-9、a-f', empty: '开头或结尾至少填一个', pinned: function (a, b) { return '开头加结尾一共要 ' + a + '~' + b + ' 位'; }, code: '贴进来的部署代码不是十六进制' },
      s2why: '这一步要联网：价格只从平台取；下单时页面发给平台的全部内容写在最下面。',
      quoteBtn: '报价', priceIs: function (p) { return '价格：' + p + ' USDT'; },
      mintIs: function (a, b) { return '铸造耗时：' + a + '（过了 ' + b + ' 还没铸好，全额退）'; },
      payH: '付款（只收 BSC 上的 USDT）', payBsc: 'BSC · USDT-BEP20（手续费不到 1 美分）',
      refH: '（可选）推荐码', refPh: '6 位，没有就空着',
      pickH: '取货码（抄下来，或者截图）',
      pickWhy: '盐和地址只给拿得出取货码的人 —— 你的币还没发，地址提前外泄会被人盯。取货码存在这个页面里；换一台电脑取货就要它。它不是钥匙，丢了也不会丢钱（找我们用订单号 + 付款交易号取）。',
      orderBtn: '下单', orderOk: function (id) { return '下好了：订单号 ' + id; },
      s3why: '这一步要联网：页面每 10 秒问一次平台「钱到了没有」。',
      payTo: function (a, c) { return '把 ' + a + ' USDT（' + c + '）转到这个地址：'; },
      payOnly: function (c) { return '只转 ' + c + ' 上的 USDT，金额一分不差（多付要人工退差额）。转之前核对整串地址。'; },
      payWait: '等到账……（到账后这一页自己往下走）',
      payGot: function (x, y) { return '已收到 ' + x + ' / ' + y + ' USDT，接着等'; },
      // VOUCHER0X_20261002：付款这一步「有券？」（现金券 / 免费券，一单一张）。券真不真、抵多少，全由平台判
      vchAsk: '有券？', vchBtn: '用券',
      vchPart: function (h, c, d) { return '已用券 ' + h + '，抵 ' + c + ' USDT，还要付 ' + d + ' USDT'; },
      vchFull: '已用券全额抵扣，不用付款',
      copy: '复制', copied: '已复制',
      leaveQ: '不打算付了？告诉我们为什么（只发一个词）：', leave: { price: '太贵', confusing: '看不懂', trust: '不放心', browsing: '只是看看' }, leaveThanks: '收到，谢谢',
      s4why: '这一步要联网：页面每 15 秒问一次进度。你可以关掉页面，回来用订单号 + 取货码接着取货。',
      mintNow: function (a) { return '铸造机正在显卡上算盐（这一种的铸造耗时 ' + a + '）……'; },
      s5why: '取货要联网（拿回盐）；拿到之后的核对不用联网 —— 可以先断网再点「核对」，页面只用 salt.js 在你的电脑上算。',
      pickBtn: '取货', verifyBtn: '核对（断网也行）',
      checks: ['盐的前 20 个字节就是你的部署地址 → CreateX 只准你本人用这个盐，别人在任何一条链上都占不了这个地址', '盐的第 21 个字节是 00 → 各条链上算出来都是同一个地址', '用这个盐在你的电脑上算出来的地址', '地址符合你要的图案'],
      ocH: '交货前，平台在这几条链上只读模拟过（不上链、不花钱、不要你的合约代码）',
      ocPending: '链上模拟还在跑，过一会刷新（点「取货」再拿一次）',
      deployH: '怎么部署（你自己来，用你平时部署合约的工具）',
      deploy: function (d) {
        return ['用你的部署地址 ' + d.deployer + ' 直接调用 CreateX（' + d.factory + '，各条链同一个地址）：' + d.call,
          d.mode === 'create3' ? '第二个参数是你的合约部署代码（含构造参数）。这个地址跟代码无关：代码定稿前后都能用，每条链的代码也可以不一样。' : '第二个参数必须是那份部署代码，逐字节一样：keccak256(它) 要等于 ' + d.initHash + '。代码改一个字，地址就变。',
          '先模拟再发：同样的参数先 call 一次（不发交易），返回的地址应该就是 ' + d.address + '。',
          '每条链都这样发一次，地址都一样。'];
      },
      deployWarn: '⚠ 必须由这个部署地址本人直接调用 CreateX。用别的地址发、或者经过别的合约转一道调用，CreateX 会把这个盐当成别人的 —— 部署会成功，但地址就不是这一个了。所以一定先模拟。',
      // CONTRACT0X_20260928：合约自己转不了账 —— 登记用 /contract（部署地址先认证过，盐就是上面这个），不用转零头
      regAfter: { contract: '部署之后：在官方机器人里发「/contract 合约地址 盐」，把它登记到你的认证下（部署地址要先认证过）—— 谁在零九零查这个地址，都看到「这是 @你 登记的官方合约」。',
        token: '发币之后：在官方机器人里发「/contract 合约地址 盐」，把代币地址登记到你的黄勾认证下（部署地址要先认证过）—— 谁在零九零查这个地址，都看到「这是 @你 登记的官方合约」；名字一样、地址不一样的币，就不是你登记的那一个。' },
      regAfterLink: '认证怎么做 →',
      resumeH: '换了电脑，或者关掉过这一页？用订单号 + 取货码接着来：',
      resumeId: '订单号（c 开头 9 位）', resumeCode: '取货码（32 位）', resumeBtn: '接着来',
      myOrders: '这个浏览器下过的单：',
      sentHead: '这一页跟平台说过的每一句话', sentNone: '还没说过话。', sentTech: '懂技术的人看这里：每一次原样发了什么',
      sentKinds: { catalog: '要价目表', quote: '报价（方式 + 图案）', order: '下单（方式、部署地址、代码指纹、图案、付款链、推荐码、取货码的指纹）', status: '问进度（订单号）', pickup: '取货（订单号 + 取货码）', leave: '「不打算付」的原因（一个词）', voucher: '用券（订单号 + 券码）', other: '其他' },
      offline: '连不上平台（断网了？）—— 这一步要联网',
      footNever: '零九零永远不会让你连接钱包、不会让你在钱包 App 里给我们签名或授权、不会让你转钱给我们来「验证」。凡是这样要求你的，一定是假的。',
      footOne: '官方网址只有一个：0x 000 000 000 .com（0x 后面 9 个 0）· 零九零没有发行任何代币 · 收藏官网，以后只从收藏夹进。',
      footLinks: '常见问题 · 招商 · 认证 · 付费提醒 · 查订单',
      newsTag: '快讯', newsX: '隐藏 24 小时',
      status: { created: '等付款', minting: '铸造中', found: '铸好了，等你取货', delivered: '已取货', expired: '已过期（没付款）', refunded: '已退款' },
    },
    en: {
      title: { contract: '0x000000000 — Vanity Contract', token: '0x000000000 — Token Address' },
      here: { contract: 'You are on: Vanity Contract (for project teams)', token: 'You are on: Token Address (for token issuers)' },
      hereSub: { contract: 'A contract address people recognize - the same address on every EVM chain. We only compute the "salt": no keys are involved in this order.', token: 'A token contract address that carries your coin name or lucky number - people in the group can tell the real coin at a glance. We only compute the "salt": no keys are involved in this order.' },
      navVanity: 'Vanity Wallet', navContract: 'Vanity Contract', navToken: 'Token Address', navFree: 'Free Generator', navWp: 'White paper',
      trust: 'Page code published on GitHub · No keys are involved in this order · This is how 0x000000000 protects its own money',
      cmpHead: 'Three minting pages - make sure you are on the right one:',
      cmpRows: [['', 'Vanity Wallet', 'Vanity Contract', 'Token Address'],
        ['What', 'Your own wallet address', 'The address of a contract you deploy', 'The contract address of a token you issue'],
        ['For', 'Individuals, merchants', 'Project teams', 'Token issuers, launch platforms'],
        ['Keys', 'Only you hold the key (you make half, we compute the other half)', 'No keys at all (we only compute a salt)', 'No keys at all (we only compute a salt)'],
        ['Across EVM chains', 'Same address (same key)', 'Same address (CreateX)', 'Same address (CreateX)'],
        ['Where', '0x000000000.com', '0x000000000.com/contract', '0x000000000.com/token']],
      whatH: 'What this is',
      what: { contract: 'When you deploy a contract, its address is computed from: the deploy factory (CreateX) + your deployer address + a number called the "salt" + the fingerprint of the contract code. A different salt gives a different address - we use GPUs to find the salt that makes the address look the way you want, hand it to you, and you deploy it yourself. The address matches on the spot.',
        token: 'Issuing a token means deploying a token contract, and its address is computed from: the deploy factory (CreateX) + your deployer address + a number called the "salt". We use GPUs to find the salt that puts your coin name or lucky number into the address, hand it to you, and you launch it yourself. The address matches on the spot.' },
      moreH: 'Why it helps, real examples, honestly',
      whyH: 'Why',
      why: { contract: ['Recognizable: an address starting with a row of zeros tells users it is the official contract', 'Same address on every chain: Ethereum, BSC, Base... users remember one', 'Slightly cheaper calls: each pair of zeros (a "zero byte") in the address saves a little gas when others call it - only high-frequency traders notice, honestly', 'Zero key risk: there is no key involved, so there is no key to leak'],
        token: ['Tell the real coin at a glance: when same-name fakes are everywhere, the address ends in your lucky number', 'Launch platforms already use address endings as their brand: four.meme ends in 4444, Flap.sh in 8888 / 7777', 'Same address on every chain: for multi-chain tokens users check one address', 'Zero key risk: there is no key involved'] },
      casesH: 'Real examples',
      cases: { contract: ['Uniswap v4 core contract 0x000000000004444c...: chosen through a three-week open competition (2024-11-10 to 12-01)', 'OpenSea Seaport 1.6: 0x0000000000000068F116..., the same address on every chain', '1inch router v6: 0x111111125421cA6d..., the same address on every chain', 'Multicall3: 0xcA11... (reads like "call"), the same address on 250+ chains'],
        token: ['2025-01, the TRUMP launch weekend: tokens named "Trump" went from 3,300 to 6,800 (Blockaid)', '2023-08, within a day of PayPal announcing PYUSD: nearly 30 fake PYUSD trading pairs appeared, the biggest traded about $2.6M', '2025-02, a well-known trader bought a fake LIBRA token by mistake: about $170K, soon worth about $62K', '2026-03, Blockaid: over 54,000 fake stablecoins among 17M+ new tokens, over 34,000 of them posing as USDT'] },
      riskH: 'Without it',
      risk: { contract: 'The address is a random string, users cannot tell which one is official, and it differs on every chain. A cautionary tale: Multicall3 once made its deployment key with a generator; the key leaked and an attacker took its address on another chain. Computing a salt leaves no key to leak.',
        token: 'Same-name fakes everywhere, and buyers can only tell them apart by a random string. Honestly: a 4-character ending is cheap for a scammer to imitate too - so make the pattern long enough, and pair it with a gold check verification page (payers can look up which contract you registered as official).' },
      honestH: 'Honestly',
      honest: ['Free open-source tools can do this too (teams with engineers can compute it themselves). What we add: no GPU to rent, delivered as soon as it is found, the salt only works for you, the same address on every chain, and a read-only simulation on 9 chains before delivery', 'EVM addresses only use 0-9 and a-f and ignore case - "pepe" cannot be written; cafe, beef, c0ffee, 8888 can', 'Price = total cost (GPU time at the measured speed + one collection fee per order) x 20, rounded up'],
      priceH: 'Prices (from the speed measured on an RTX 5090 on 09-28)',
      priceCols: ['Start + end, in total', 'CREATE3 · price', 'CREATE3 · mint time', 'CREATE2 · price', 'CREATE2 · mint time'],
      priceNote: 'Mint time is quoted so that 95 out of 100 orders finish within it; if an order is not finished by the refund deadline, it is refunded in full. Same number of characters, same price - 0x0000 is as hard as 0xbeef.',
      priceOffline: 'Prices show up here once you are online (prices only come from the platform - the page keeps no second copy)',
      chainsH: 'The same address on every EVM chain',
      chains: 'The CreateX deploy factory has the same address and the same code on every EVM chain. On 09-28 we simulated deployments read-only on the 9 chains below (nothing sent, nothing paid): the same deployer + the same salt gives the same address on every one of them; someone else using your salt gets a different address; changing byte 21 of the salt to 01 makes every chain different (so the salts we deliver always have 00 there).',
      chainsZk: 'zkSync Era: code compiled with the normal Ethereum compiler (solc) and deployed through CreateX gets the same address; code compiled with zkSync\'s own compiler does not.',
      chainsMore: 'Other EVM chains where CreateX is deployed usually give the same address too - simulate before you deploy (step 5 shows how).',
      dlHead: 'Order on your own computer',
      dlWhy: 'No keys are involved in this order, but the check after delivery should happen in a page you hold: download this page to your computer - we can never change it afterwards, and it is byte-for-byte identical to the copy published on GitHub, so you can compare it yourself.',
      dlSteps: ['Click the button below to download this page (a single file: ' + FILE + ')', 'Double-click it on your computer to open it (Chrome or Edge)', 'Follow its 5 steps. Each step says whether it needs the internet, and why'],
      dlBtn: 'Download this page', dlGh: 'Verify on GitHub',
      netGuide: 'You are using the page downloaded to your own computer. Every step is marked: 🔌 = works offline, 🌐 = needs the internet.',
      s1: 'Step 1 · 🔌 Fill in three things', s2: 'Step 2 · 🌐 Price and order', s3: 'Step 3 · 🌐 Pay', s4: 'Step 4 · 🌐 The minting machine is computing', s5: 'Step 5 · 🔌 Collect and check offline',
      s1why: 'No internet needed here: the page only checks formats on your computer.',
      modeH: 'Deploy method (both use CreateX)',
      m3: 'CREATE3 (recommended): the address depends only on your deployer address and the salt - change the contract code and the salt still works',
      m2: 'CREATE2: the address is tied to the contract code - needs the code fingerprint; change one character of the code and the address changes',
      depH: 'Your deployer address (the address that calls CreateX directly; for a multisig, the multisig address)',
      depPh: 'starts with 0x, 40 characters',
      ihH: 'Fingerprint of the contract code (keccak256, CREATE2 only)',
      ihPh: 'starts with 0x, 64 characters',
      ihHelp: 'No fingerprint? Paste the contract\'s creation bytecode (including constructor arguments) and the page computes it on your computer:',
      ihCalc: 'Compute it locally',
      patH: { contract: 'The start / end you want (0-9 and a-f only)', token: 'Coin name or lucky number (0-9 and a-f only)' },
      preLbl: 'Start 0x', sufLbl: 'End',
      tokenHint: 'Spelling a name? Addresses only have a-f: use 0 for o, 1 for i or l, 5 for s, 7 for t (for example c0ffee, 5afe, bee7).',
      labelH: '(Optional) a name for this order, only you see it',
      next1: 'Next: get a price',
      preview: function (p, s) { return 'The address will look like: 0x' + p + '...' + s; },
      pinnedTxt: function (n, a, b) { return n + ' characters in total (for sale: ' + a + '-' + b + ')'; },
      bad: { deployer: 'The deployer address must be 0x plus 40 hex characters', checksum: 'The deployer address has a wrong upper/lower case pattern (that is its checksum) - copy it from your wallet again', zero: 'The deployer address cannot be all zeros',
        ih: 'CREATE2 needs a code fingerprint: 0x plus 64 hex characters', hex: 'The pattern can only use 0-9 and a-f', empty: 'Fill in the start or the end (at least one)', pinned: function (a, b) { return 'Start plus end must be ' + a + '-' + b + ' characters in total'; }, code: 'The pasted bytecode is not hex' },
      s2why: 'Internet needed here: the price only comes from the platform; everything the page sends when ordering is listed at the bottom.',
      quoteBtn: 'Get price', priceIs: function (p) { return 'Price: ' + p + ' USDT'; },
      mintIs: function (a, b) { return 'Mint time: ' + a + ' (not finished after ' + b + ' = full refund)'; },
      payH: 'Payment (USDT on BSC only)', payBsc: 'BSC · USDT-BEP20 (fee under 1 cent)',
      refH: '(Optional) referral code', refPh: '6 characters, leave empty if none',
      pickH: 'Pickup code (write it down or take a screenshot)',
      pickWhy: 'The salt and the address are only given to whoever has the pickup code - your token is not launched yet, and an address leaking early gets watched. The code is stored in this page; you need it to collect on another computer. It is not a key: losing it loses no money (contact us with the order number + payment transaction).',
      orderBtn: 'Place order', orderOk: function (id) { return 'Ordered: order number ' + id; },
      s3why: 'Internet needed here: every 10 seconds the page asks the platform whether the money has arrived.',
      payTo: function (a, c) { return 'Send ' + a + ' USDT (' + c + ') to this address:'; },
      payOnly: function (c) { return 'Only USDT on ' + c + ', the exact amount (overpayments are refunded by hand). Check the whole address before sending.'; },
      payWait: 'Waiting for the payment... (this page moves on by itself once it arrives)',
      payGot: function (x, y) { return 'Received ' + x + ' / ' + y + ' USDT, still waiting'; },
      vchAsk: 'Have a voucher?', vchBtn: 'Apply',
      vchPart: function (h, c, d) { return 'Voucher ' + h + ' applied: ' + c + ' USDT off, ' + d + ' USDT left to pay'; },
      vchFull: 'Fully covered by the voucher - nothing to pay',
      copy: 'Copy', copied: 'Copied',
      leaveQ: 'Not going to pay? Tell us why (sends one word only):', leave: { price: 'too expensive', confusing: 'confusing', trust: 'not sure I trust it', browsing: 'just looking' }, leaveThanks: 'Got it, thank you',
      s4why: 'Internet needed here: the page asks for progress every 15 seconds. You can close it and come back with the order number + pickup code.',
      mintNow: function (a) { return 'The minting machine is computing the salt on a GPU (mint time for this kind: ' + a + ')...'; },
      s5why: 'Collecting needs the internet (to fetch the salt); checking it afterwards does not - go offline first if you like, then click "Check": the page only uses salt.js on your computer.',
      pickBtn: 'Collect', verifyBtn: 'Check (works offline)',
      checks: ['The first 20 bytes of the salt are your deployer address -> CreateX only lets you use this salt; nobody can take this address on any chain', 'Byte 21 of the salt is 00 -> every chain gives the same address', 'The address this salt gives, computed on your computer', 'The address matches the pattern you asked for'],
      ocH: 'Before delivery the platform simulated it read-only on these chains (nothing sent, nothing paid, your code not needed)',
      ocPending: 'The on-chain simulation is still running - click "Collect" again in a moment',
      deployH: 'How to deploy (yourself, with the tool you normally deploy with)',
      deploy: function (d) {
        return ['From your deployer address ' + d.deployer + ', call CreateX (' + d.factory + ', the same address on every chain) directly: ' + d.call,
          d.mode === 'create3' ? 'The second argument is your contract\'s creation bytecode (with constructor arguments). This address does not depend on the code: it works before and after the code is final, and the code may even differ per chain.' : 'The second argument must be exactly that creation bytecode: keccak256 of it must equal ' + d.initHash + '. Change one character and the address changes.',
          'Simulate first: make the same call without sending a transaction; the returned address should be ' + d.address + '.',
          'Do this once on each chain - the address is the same everywhere.'];
      },
      deployWarn: '⚠ The deployer address itself must call CreateX directly. Sending from another address, or routing the call through another contract, makes CreateX treat the salt as someone else\'s - the deployment succeeds, but at a different address. So always simulate first.',
      regAfter: { contract: 'After deploying: send "/contract <contract address> <salt>" to the official bot to register it under your verification (the deployer must be verified first) - anyone who looks the address up on 0x000000000 then sees "the official contract registered by @you".',
        token: 'After launch: send "/contract <token address> <salt>" to the official bot to register it under your gold check (the deployer must be verified first) - anyone who looks the address up on 0x000000000 then sees "the official contract registered by @you"; a token with the same name at a different address is not the one you registered.' },
      regAfterLink: 'How verification works ->',
      resumeH: 'Another computer, or closed this page? Continue with the order number + pickup code:',
      resumeId: 'order number (c + 8 characters)', resumeCode: 'pickup code (32 characters)', resumeBtn: 'Continue',
      myOrders: 'Orders placed in this browser:',
      sentHead: 'Every word this page said to the platform', sentNone: 'Nothing said yet.', sentTech: 'For technical readers: exactly what was sent each time',
      sentKinds: { catalog: 'asked for the price list', quote: 'asked for a price (method + pattern)', order: 'placed the order (method, deployer address, code fingerprint, pattern, payment chain, referral code, fingerprint of the pickup code)', status: 'asked for progress (order number)', pickup: 'collected (order number + pickup code)', leave: '"not going to pay" reason (one word)', voucher: 'applied a voucher (order number + voucher code)', other: 'other' },
      offline: 'Cannot reach the platform (offline?) - this step needs the internet',
      footNever: '0x000000000 will never ask you to connect your wallet, to sign or approve anything for us in a wallet app, or to send us money to "verify". Anyone who asks is fake.',
      footOne: 'The only official website: 0x 000 000 000 .com (nine zeros after 0x) · 0x000000000 has not issued any token · bookmark it and always come in from the bookmark.',
      footLinks: 'FAQ · Partners · Verification · Paid alerts · Track an order',
      newsTag: 'NEWS', newsX: 'hide for 24 hours',
      status: { created: 'waiting for payment', minting: 'minting', found: 'minted - waiting for you to collect', delivered: 'collected', expired: 'expired (not paid)', refunded: 'refunded' },
    },
    // IDLANG0X_20260928：印尼文（DSJ「增加印尼文」）。键、数组长度、函数参数跟 en 一一对应；这两页只说「kunci」，不出现个人靓号页上那个词。
    id: {
      title: { contract: '0x000000000 — Kontrak Cantik', token: '0x000000000 — Alamat Token' },
      here: { contract: 'Anda sedang di: Kontrak Cantik (untuk tim proyek)', token: 'Anda sedang di: Alamat Token (untuk penerbit token)' },
      hereSub: { contract: 'Alamat kontrak yang mudah dikenali - alamat yang sama di setiap jaringan EVM. Kami hanya menghitung "salt": pesanan ini tidak melibatkan kunci apa pun.', token: 'Alamat kontrak token yang memuat nama koin atau angka keberuntungan Anda - orang di grup bisa langsung mengenali koin yang asli. Kami hanya menghitung "salt": pesanan ini tidak melibatkan kunci apa pun.' },
      navVanity: 'Dompet Cantik', navContract: 'Kontrak Cantik', navToken: 'Alamat Token', navFree: 'Generator Gratis', navWp: 'Whitepaper',
      trust: 'Kode halaman dipublikasikan di GitHub · Pesanan ini tidak melibatkan kunci apa pun · Beginilah cara 0x000000000 melindungi uangnya sendiri',
      cmpHead: 'Tiga halaman cetak - pastikan Anda di halaman yang benar:',
      cmpRows: [['', 'Dompet Cantik', 'Kontrak Cantik', 'Alamat Token'],
        ['Apa', 'Alamat dompet Anda sendiri', 'Alamat kontrak yang Anda deploy', 'Alamat kontrak token yang Anda terbitkan'],
        ['Untuk', 'Perorangan, pedagang', 'Tim proyek', 'Penerbit token, platform peluncuran'],
        ['Kunci', 'Hanya Anda yang memegang kunci (Anda membuat separuh, kami menghitung separuh lainnya)', 'Tanpa kunci sama sekali (kami hanya menghitung salt)', 'Tanpa kunci sama sekali (kami hanya menghitung salt)'],
        ['Di jaringan EVM', 'Alamat sama (kunci sama)', 'Alamat sama (CreateX)', 'Alamat sama (CreateX)'],
        ['Di mana', '0x000000000.com', '0x000000000.com/contract', '0x000000000.com/token']],
      whatH: 'Apa ini',
      what: { contract: 'Saat Anda men-deploy kontrak, alamatnya dihitung dari: factory deploy (CreateX) + alamat deployer Anda + sebuah angka yang disebut "salt" + sidik jari kode kontrak. Salt yang berbeda menghasilkan alamat yang berbeda - kami memakai GPU untuk mencari salt yang membuat alamat terlihat seperti yang Anda mau, menyerahkannya kepada Anda, lalu Anda men-deploy sendiri. Alamatnya langsung cocok saat itu juga.',
        token: 'Menerbitkan token berarti men-deploy kontrak token, dan alamatnya dihitung dari: factory deploy (CreateX) + alamat deployer Anda + sebuah angka yang disebut "salt". Kami memakai GPU untuk mencari salt yang memasukkan nama koin atau angka keberuntungan Anda ke dalam alamat, menyerahkannya kepada Anda, lalu Anda meluncurkannya sendiri. Alamatnya langsung cocok saat itu juga.' },
      moreH: 'Mengapa perlu, contoh nyata, jujur saja',
      whyH: 'Mengapa',
      why: { contract: ['Mudah dikenali: alamat yang diawali deretan angka nol memberi tahu pengguna bahwa itu kontrak resmi', 'Alamat sama di setiap jaringan: Ethereum, BSC, Base... pengguna cukup mengingat satu', 'Panggilan sedikit lebih murah: setiap pasangan nol (sebuah "byte nol") di alamat menghemat sedikit gas saat orang lain memanggilnya - jujur saja, hanya trader frekuensi tinggi yang merasakannya', 'Nol risiko kunci: tidak ada kunci yang terlibat, jadi tidak ada kunci yang bisa bocor'],
        token: ['Langsung kenali koin yang asli: saat koin palsu bernama sama ada di mana-mana, alamat Anda berakhir dengan angka keberuntungan Anda', 'Platform peluncuran sudah memakai akhiran alamat sebagai merek: four.meme berakhir 4444, Flap.sh 8888 / 7777', 'Alamat sama di setiap jaringan: untuk token multi-jaringan, pengguna cukup memeriksa satu alamat', 'Nol risiko kunci: tidak ada kunci yang terlibat'] },
      casesH: 'Contoh nyata',
      cases: { contract: ['Kontrak inti Uniswap v4 0x000000000004444c...: dipilih lewat kompetisi terbuka selama tiga minggu (2024-11-10 sampai 12-01)', 'OpenSea Seaport 1.6: 0x0000000000000068F116..., alamat sama di setiap jaringan', 'Router 1inch v6: 0x111111125421cA6d..., alamat sama di setiap jaringan', 'Multicall3: 0xcA11... (dibaca seperti "call"), alamat sama di 250+ jaringan'],
        token: ['2025-01, akhir pekan peluncuran TRUMP: token bernama "Trump" bertambah dari 3,300 menjadi 6,800 (Blockaid)', '2023-08, dalam sehari setelah PayPal mengumumkan PYUSD: muncul hampir 30 pasangan perdagangan PYUSD palsu, yang terbesar diperdagangkan sekitar $2.6M', '2025-02, seorang trader terkenal salah membeli token LIBRA palsu: sekitar $170K, tak lama kemudian nilainya tinggal sekitar $62K', '2026-03, Blockaid: lebih dari 54,000 stablecoin palsu di antara 17M+ token baru, lebih dari 34,000 di antaranya menyamar sebagai USDT'] },
      riskH: 'Tanpa ini',
      risk: { contract: 'Alamatnya berupa deretan acak, pengguna tidak bisa membedakan mana yang resmi, dan alamatnya berbeda di setiap jaringan. Pelajaran pahit: Multicall3 dulu membuat kunci deployment-nya dengan sebuah generator; kunci itu bocor dan penyerang mengambil alamatnya di jaringan lain. Menghitung salt tidak menyisakan kunci yang bisa bocor.',
        token: 'Koin palsu bernama sama ada di mana-mana, dan pembeli hanya bisa membedakannya lewat deretan acak. Jujur saja: akhiran 4 karakter juga murah untuk ditiru penipu - jadi buat polanya cukup panjang, dan padukan dengan halaman verifikasi centang kuning (pembayar bisa mengecek kontrak mana yang Anda daftarkan sebagai resmi).' },
      honestH: 'Jujur saja',
      honest: ['Alat open-source gratis juga bisa melakukan ini (tim yang punya engineer bisa menghitungnya sendiri). Nilai tambah kami: tidak perlu menyewa GPU, dikirim begitu ditemukan, salt hanya berlaku untuk Anda, alamat sama di setiap jaringan, dan simulasi read-only di 9 jaringan sebelum pengiriman', 'Alamat EVM hanya memakai 0-9 dan a-f serta tidak membedakan huruf besar/kecil - "pepe" tidak bisa ditulis; cafe, beef, c0ffee, 8888 bisa', 'Harga = total biaya (waktu GPU dengan kecepatan terukur + satu biaya pengumpulan per pesanan) x 20, dibulatkan ke atas'],
      priceH: 'Harga (dari kecepatan yang diukur pada RTX 5090 tanggal 09-28)',
      priceCols: ['Awalan + akhiran, total', 'CREATE3 · harga', 'CREATE3 · waktu cetak', 'CREATE2 · harga', 'CREATE2 · waktu cetak'],
      priceNote: 'Waktu cetak dihitung sehingga 95 dari 100 pesanan selesai dalam waktu itu; jika sebuah pesanan belum selesai sampai batas waktu pengembalian dana, dananya dikembalikan penuh. Jumlah karakter sama, harga sama - 0x0000 sama sulitnya dengan 0xbeef.',
      priceOffline: 'Harga muncul di sini setelah Anda online (harga hanya diambil dari platform - halaman ini tidak menyimpan salinan kedua)',
      chainsH: 'Alamat sama di setiap jaringan EVM',
      chains: 'Factory deploy CreateX punya alamat dan kode yang sama di setiap jaringan EVM. Pada 09-28 kami mensimulasikan deployment secara read-only di 9 jaringan di bawah (tidak ada yang dikirim, tidak ada yang dibayar): deployer yang sama + salt yang sama menghasilkan alamat yang sama di setiap jaringan; orang lain yang memakai salt Anda mendapat alamat yang berbeda; mengubah byte ke-21 salt menjadi 01 membuat setiap jaringan berbeda (karena itu salt yang kami kirim selalu berisi 00 di posisi itu).',
      chainsZk: 'zkSync Era: kode yang dikompilasi dengan compiler Ethereum biasa (solc) lalu di-deploy lewat CreateX mendapat alamat yang sama; kode yang dikompilasi dengan compiler milik zkSync sendiri tidak.',
      chainsMore: 'Jaringan EVM lain yang juga memiliki CreateX biasanya memberi alamat yang sama juga - simulasikan dulu sebelum deploy (langkah 5 menunjukkan caranya).',
      dlHead: 'Pesan dari komputer Anda sendiri',
      dlWhy: 'Pesanan ini tidak melibatkan kunci apa pun, tetapi pemeriksaan setelah pengiriman sebaiknya dilakukan di halaman yang Anda pegang sendiri: unduh halaman ini ke komputer Anda - kami tidak akan pernah bisa mengubahnya setelah itu, dan halaman ini identik byte demi byte dengan salinan yang dipublikasikan di GitHub, jadi Anda bisa membandingkannya sendiri.',
      dlSteps: ['Klik tombol di bawah untuk mengunduh halaman ini (satu file: ' + FILE + ')', 'Klik dua kali file itu di komputer Anda untuk membukanya (Chrome atau Edge)', 'Ikuti 5 langkahnya. Setiap langkah menyebutkan apakah perlu internet, dan alasannya'],
      dlBtn: 'Unduh halaman ini', dlGh: 'Periksa di GitHub',
      netGuide: 'Anda memakai halaman yang diunduh ke komputer Anda sendiri. Setiap langkah ditandai: 🔌 = bisa offline, 🌐 = perlu internet.',
      s1: 'Langkah 1 · 🔌 Isi tiga hal', s2: 'Langkah 2 · 🌐 Harga dan pesan', s3: 'Langkah 3 · 🌐 Bayar', s4: 'Langkah 4 · 🌐 Mesin cetak sedang menghitung', s5: 'Langkah 5 · 🔌 Ambil dan periksa secara offline',
      s1why: 'Di sini tidak perlu internet: halaman hanya memeriksa format di komputer Anda.',
      modeH: 'Metode deploy (keduanya memakai CreateX)',
      m3: 'CREATE3 (disarankan): alamat hanya bergantung pada alamat deployer Anda dan salt - ubah kode kontrak, salt tetap berlaku',
      m2: 'CREATE2: alamat terikat pada kode kontrak - perlu sidik jari kode; ubah satu karakter kode dan alamatnya berubah',
      depH: 'Alamat deployer Anda (alamat yang memanggil CreateX secara langsung; untuk multisig, alamat multisig-nya)',
      depPh: 'diawali 0x, 40 karakter',
      ihH: 'Sidik jari kode kontrak (keccak256, hanya CREATE2)',
      ihPh: 'diawali 0x, 64 karakter',
      ihHelp: 'Tidak punya sidik jari? Tempel creation bytecode kontrak (termasuk argumen constructor) dan halaman ini menghitungnya di komputer Anda:',
      ihCalc: 'Hitung di komputer ini',
      patH: { contract: 'Awalan / akhiran yang Anda mau (hanya 0-9 dan a-f)', token: 'Nama koin atau angka keberuntungan (hanya 0-9 dan a-f)' },
      preLbl: 'Awalan 0x', sufLbl: 'Akhiran',
      tokenHint: 'Mau mengeja nama? Alamat hanya punya a-f: pakai 0 untuk o, 1 untuk i atau l, 5 untuk s, 7 untuk t (misalnya c0ffee, 5afe, bee7).',
      labelH: '(Opsional) nama untuk pesanan ini, hanya Anda yang melihatnya',
      next1: 'Berikutnya: minta harga',
      preview: function (p, s) { return 'Alamatnya akan terlihat seperti: 0x' + p + '...' + s; },
      pinnedTxt: function (n, a, b) { return 'Total ' + n + ' karakter (dijual: ' + a + '-' + b + ')'; },
      bad: { deployer: 'Alamat deployer harus 0x plus 40 karakter hex', checksum: 'Pola huruf besar/kecil alamat deployer salah (itulah checksum-nya) - salin lagi dari dompet Anda', zero: 'Alamat deployer tidak boleh semuanya nol',
        ih: 'CREATE2 perlu sidik jari kode: 0x plus 64 karakter hex', hex: 'Pola hanya boleh memakai 0-9 dan a-f', empty: 'Isi awalan atau akhiran (minimal salah satu)', pinned: function (a, b) { return 'Awalan plus akhiran harus total ' + a + '-' + b + ' karakter'; }, code: 'Bytecode yang ditempel bukan hex' },
      s2why: 'Di sini perlu internet: harga hanya diambil dari platform; semua yang dikirim halaman saat memesan tercantum di bagian bawah.',
      quoteBtn: 'Minta harga', priceIs: function (p) { return 'Harga: ' + p + ' USDT'; },
      mintIs: function (a, b) { return 'Waktu cetak: ' + a + ' (belum selesai setelah ' + b + ' = dana dikembalikan penuh)'; },
      payH: 'Pembayaran (hanya USDT di BSC)', payBsc: 'BSC · USDT-BEP20 (biaya di bawah 1 sen)',
      refH: '(Opsional) kode referal', refPh: '6 karakter, kosongkan jika tidak ada',
      pickH: 'Kode pengambilan (catat atau ambil screenshot)',
      pickWhy: 'Salt dan alamat hanya diberikan kepada siapa pun yang memegang kode pengambilan - token Anda belum diluncurkan, dan alamat yang bocor lebih awal akan diawasi orang. Kode ini disimpan di halaman ini; Anda memerlukannya untuk mengambil pesanan dari komputer lain. Kode ini bukan kunci: kehilangannya tidak membuat Anda kehilangan uang (hubungi kami dengan nomor pesanan + transaksi pembayaran).',
      orderBtn: 'Pesan', orderOk: function (id) { return 'Sudah dipesan: nomor pesanan ' + id; },
      s3why: 'Di sini perlu internet: setiap 10 detik halaman menanyakan ke platform apakah uangnya sudah masuk.',
      payTo: function (a, c) { return 'Kirim ' + a + ' USDT (' + c + ') ke alamat ini:'; },
      payOnly: function (c) { return 'Hanya USDT di ' + c + ', jumlahnya persis (kelebihan bayar dikembalikan secara manual). Periksa seluruh alamat sebelum mengirim.'; },
      payWait: 'Menunggu pembayaran... (halaman ini lanjut sendiri begitu dana masuk)',
      payGot: function (x, y) { return 'Diterima ' + x + ' / ' + y + ' USDT, masih menunggu'; },
      vchAsk: 'Punya voucher?', vchBtn: 'Pakai',
      vchPart: function (h, c, d) { return 'Voucher ' + h + ' dipakai: potongan ' + c + ' USDT, sisa bayar ' + d + ' USDT'; },
      vchFull: 'Ditanggung penuh oleh voucher - tidak perlu bayar',
      copy: 'Salin', copied: 'Tersalin',
      leaveQ: 'Tidak jadi bayar? Beri tahu kami alasannya (hanya mengirim satu kata):', leave: { price: 'terlalu mahal', confusing: 'membingungkan', trust: 'belum yakin bisa dipercaya', browsing: 'hanya melihat-lihat' }, leaveThanks: 'Diterima, terima kasih',
      s4why: 'Di sini perlu internet: halaman menanyakan progres setiap 15 detik. Anda bisa menutupnya lalu kembali dengan nomor pesanan + kode pengambilan.',
      mintNow: function (a) { return 'Mesin cetak sedang menghitung salt di GPU (waktu cetak untuk jenis ini: ' + a + ')...'; },
      s5why: 'Mengambil pesanan perlu internet (untuk mengambil salt); memeriksanya setelah itu tidak - putuskan internet dulu jika mau, lalu klik "Periksa": halaman hanya memakai salt.js di komputer Anda.',
      pickBtn: 'Ambil', verifyBtn: 'Periksa (bisa offline)',
      checks: ['20 byte pertama salt adalah alamat deployer Anda -> CreateX hanya mengizinkan Anda memakai salt ini; tidak ada yang bisa mengambil alamat ini di jaringan mana pun', 'Byte ke-21 salt adalah 00 -> setiap jaringan menghasilkan alamat yang sama', 'Alamat yang dihasilkan salt ini, dihitung di komputer Anda', 'Alamatnya cocok dengan pola yang Anda minta'],
      ocH: 'Sebelum pengiriman, platform mensimulasikannya secara read-only di jaringan-jaringan ini (tidak ada yang dikirim, tidak ada yang dibayar, kode Anda tidak diperlukan)',
      ocPending: 'Simulasi on-chain masih berjalan - klik "Ambil" lagi sebentar lagi',
      deployH: 'Cara deploy (sendiri, dengan alat yang biasa Anda pakai untuk deploy)',
      deploy: function (d) {
        return ['Dari alamat deployer Anda ' + d.deployer + ', panggil CreateX (' + d.factory + ', alamat sama di setiap jaringan) secara langsung: ' + d.call,
          d.mode === 'create3' ? 'Argumen kedua adalah creation bytecode kontrak Anda (dengan argumen constructor). Alamat ini tidak bergantung pada kode: berlaku sebelum dan sesudah kode final, dan kodenya bahkan boleh berbeda di tiap jaringan.' : 'Argumen kedua harus persis creation bytecode itu: keccak256-nya harus sama dengan ' + d.initHash + '. Ubah satu karakter dan alamatnya berubah.',
          'Simulasikan dulu: lakukan panggilan yang sama tanpa mengirim transaksi; alamat yang dikembalikan seharusnya ' + d.address + '.',
          'Lakukan ini sekali di setiap jaringan - alamatnya sama di mana pun.'];
      },
      deployWarn: '⚠ Alamat deployer itu sendiri harus memanggil CreateX secara langsung. Mengirim dari alamat lain, atau meneruskan panggilan lewat kontrak lain, membuat CreateX menganggap salt itu milik orang lain - deployment berhasil, tetapi di alamat yang berbeda. Jadi selalu simulasikan dulu.',
      regAfter: { contract: 'Setelah deploy: kirim "/contract <alamat kontrak> <salt>" ke bot resmi untuk mendaftarkannya di bawah verifikasi Anda (deployer harus terverifikasi lebih dulu) - siapa pun yang mencari alamat itu di 0x000000000 akan melihat "kontrak resmi yang didaftarkan oleh @Anda".',
        token: 'Setelah peluncuran: kirim "/contract <alamat token> <salt>" ke bot resmi untuk mendaftarkannya di bawah centang kuning Anda (deployer harus terverifikasi lebih dulu) - siapa pun yang mencari alamat itu di 0x000000000 akan melihat "kontrak resmi yang didaftarkan oleh @Anda"; token dengan nama sama di alamat berbeda bukanlah yang Anda daftarkan.' },
      regAfterLink: 'Cara kerja verifikasi ->',
      resumeH: 'Di komputer lain, atau halaman ini sempat tertutup? Lanjutkan dengan nomor pesanan + kode pengambilan:',
      resumeId: 'nomor pesanan (c + 8 karakter)', resumeCode: 'kode pengambilan (32 karakter)', resumeBtn: 'Lanjutkan',
      myOrders: 'Pesanan dari browser ini:',
      sentHead: 'Setiap kata yang dikirim halaman ini ke platform', sentNone: 'Belum ada yang dikirim.', sentTech: 'Untuk pembaca teknis: persis apa yang dikirim setiap kali',
      sentKinds: { catalog: 'meminta daftar harga', quote: 'meminta harga (metode + pola)', order: 'membuat pesanan (metode, alamat deployer, sidik jari kode, pola, jaringan pembayaran, kode referal, sidik jari kode pengambilan)', status: 'menanyakan progres (nomor pesanan)', pickup: 'mengambil pesanan (nomor pesanan + kode pengambilan)', leave: 'alasan "tidak jadi bayar" (satu kata)', voucher: 'memakai voucher (nomor pesanan + kode voucher)', other: 'lainnya' },
      offline: 'Tidak bisa menghubungi platform (offline?) - langkah ini perlu internet',
      footNever: '0x000000000 tidak akan pernah meminta Anda menghubungkan dompet, menandatangani atau menyetujui apa pun untuk kami di aplikasi dompet, atau mengirim uang untuk "verifikasi". Siapa pun yang meminta itu adalah palsu.',
      footOne: 'Satu-satunya situs resmi: 0x 000 000 000 .com (sembilan angka nol setelah 0x) · 0x000000000 tidak pernah menerbitkan token apa pun · simpan di bookmark dan selalu masuk dari bookmark.',
      footLinks: 'FAQ · Mitra · Verifikasi · Peringatan berbayar · Lacak pesanan',
      newsTag: 'BERITA', newsX: 'sembunyikan 24 jam',
      status: { created: 'menunggu pembayaran', minting: 'sedang dicetak', found: 'sudah dicetak - menunggu Anda mengambilnya', delivered: 'sudah diambil', expired: 'kedaluwarsa (tidak dibayar)', refunded: 'dana dikembalikan' },
    },
  };
  var T = function () { return D[lang]; };
  var pick = function (v) { return (v && typeof v === 'object' && !Array.isArray(v) && v[PRODUCT] !== undefined) ? v[PRODUCT] : v; };

  // ── 出网口（全页唯一）─────────────────────────────────────────────────────────────────────────────
  var SENT = [];
  function sentKind(method, path) {
    if (path === '/api/c2/catalog') return 'catalog';
    if (path === '/api/c2/quote') return 'quote';
    if (method === 'POST' && path === '/api/c2/orders') return 'order';
    if (/\/pickup$/.test(path)) return 'pickup';
    if (path === '/api/fw/leave') return 'leave';
    if (method === 'POST' && /\/voucher$/.test(path)) return 'voucher';   // VOUCHER0X_20261002
    if (/^\/api\/c2\/orders\/c[0-9a-f]{8}$/.test(path)) return 'status';
    return 'other';
  }
  function api(path, method, body) {
    method = method || 'GET';
    var rec = { method: method, url: path, kind: sentKind(method, path), body: body ? JSON.stringify(body) : '' };
    SENT.push(rec); renderSent();
    return fetch(API_BASE + path, { method: method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { code: r.status, body: j }; }); })
      .catch(function () { rec.failed = true; renderSent(); return { code: 0, body: { error: T().offline, errorEn: T().offline, errorId: T().offline } }; });
  }
  function renderSent() {
    var list = $('#sentList'); if (!list) return;
    var rows = [];
    SENT.forEach(function (x) { var last = rows[rows.length - 1]; if (last && last.kind === x.kind && x.kind === 'status') { last.n++; return; } rows.push({ kind: x.kind, n: 1, failed: x.failed }); });
    list.innerHTML = rows.map(function (r) { return '<li>' + esc((T().sentKinds[r.kind] || T().sentKinds.other) + (r.n > 1 ? ' ×' + r.n : '') + (r.failed ? ' ✗' : '')) + '</li>'; }).join('');
    $('#sentCount').textContent = '(' + SENT.length + ')';
    $('#sentVerdict').textContent = SENT.length ? '' : T().sentNone;
    $('#sentRawAll').textContent = SENT.map(function (x) { return x.method + ' ' + x.url + (x.body ? '\n' + x.body : ''); }).join('\n\n');
  }
  // 平台回的话：中文 error · 英文 errorEn · 印尼文 errorId（没有就退回英文、再退回中文）
  var errOf = function (res) { var b = (res && res.body) || {}; return (res.code ? 'HTTP ' + res.code + ' ' : '') + ((lang === 'id' ? (b.errorId || b.errorEn) : lang === 'en' ? b.errorEn : b.error) || b.error || ''); };
  var errMsg = function (res) { var b = (res && res.body) || {}; return (lang === 'id' ? (b.errorId || b.errorEn) : lang === 'en' ? b.errorEn : b.error) || b.error || errOf(res); };

  // ── 本机记的单（只有订单号、取货码；不发给任何人）─────────────────────────────────────────────────────
  var MY_KEY = 'c2_orders';
  function myOrders() { try { var v = JSON.parse(localStorage.getItem(MY_KEY) || '[]'); return Array.isArray(v) ? v.filter(function (x) { return x && /^c[0-9a-f]{8}$/.test(x.id) && /^[0-9a-f]{32}$/.test(x.code); }) : []; } catch (e) { return []; } }
  function remember(id, code) { try { var l = myOrders().filter(function (x) { return x.id !== id; }); l.unshift({ id: id, code: code, p: PRODUCT }); localStorage.setItem(MY_KEY, JSON.stringify(l.slice(0, 50))); } catch (e) { /* 存不了：取货码印在页面上，他自己抄 */ } }
  function newCode() { var b = new Uint8Array(16); crypto.getRandomValues(b); return SALT.bytesToHex(b); }
  function codeHash(c) { return SALT.bytesToHex(SALT.keccak256(new TextEncoder().encode(c))); }

  // ── 顶部快讯细条（只播投毒、假币、假网址、整体规模四类 —— 数据是打包时从 news.js 里挑的）──────────────────
  var NK = 'c2_newsHide';
  function news() {
    var strip = $('#nStrip'); if (!strip || typeof NEWS === 'undefined' || !NEWS.length) return;
    var hid = 0; try { hid = Number(localStorage.getItem(NK) || 0); } catch (e) {}
    if (Date.now() - hid < 24 * 3600e3) { strip.hidden = true; return; }
    strip.hidden = false;
    var i = Math.floor(Math.random() * NEWS.length), paused = false;
    // 每条快讯的字是 [中文, 英文, 印尼文]：印尼文取第 3 个，哪一格还没有第 3 个就退回英文
    var nL = function () { return lang === 'id' ? 2 : lang === 'en' ? 1 : 0; };
    var L = nL(), pk = function (a) { return a.length > L ? a[L] : a[1]; };
    var show = function () { var n = NEWS[i % NEWS.length]; $('#nsTag').textContent = T().newsTag; $('#nsText').textContent = pk(n.d) + ' · ' + pk(n.ch) + ' · ' + pk(n.a) + ' — ' + pk(n.w); $('#nsText').title = pk(n.l); };
    show();
    strip.onmouseenter = function () { paused = true; }; strip.onmouseleave = function () { paused = false; };
    $('#nsX').title = T().newsX;
    $('#nsX').onclick = function () { try { localStorage.setItem(NK, String(Date.now())); } catch (e) {} strip.hidden = true; };
    clearInterval(news.t); news.t = setInterval(function () { if (!paused) { i++; L = nL(); show(); } }, 6000);
  }

  // ── 静态的字 ─────────────────────────────────────────────────────────────────────────────────────
  function txt(id, s) { var e = document.getElementById(id); if (e) e.textContent = s; }
  function ul(id, arr) { var e = document.getElementById(id); if (e) e.innerHTML = arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }
  function renderStatic() {
    var t = T();
    document.documentElement.lang = lang;
    document.title = pick(t.title);
    txt('ttl', pick(t.title)); txt('hereBig', pick(t.here)); txt('hereSub', pick(t.hereSub));
    txt('navVanity', t.navVanity); txt('navContract', t.navContract); txt('navToken', t.navToken); txt('navFree', t.navFree); txt('navWp', t.navWp);
    txt('trustBar', t.trust); txt('cmpHead', t.cmpHead);
    var cols = { contract: 2, token: 3 }[PRODUCT];
    $('#cmpTable').innerHTML = t.cmpRows.map(function (r, ri) {
      return '<tr>' + r.map(function (c, ci) { var tag = ri === 0 || ci === 0 ? 'th' : 'td'; return '<' + tag + (ci === cols ? ' class="cur"' : '') + '>' + esc(c) + '</' + tag + '>'; }).join('') + '</tr>';
    }).join('');
    txt('moreH', t.moreH); txt('whatH', t.whatH); txt('whatP', pick(t.what)); txt('whyH', t.whyH); ul('whyL', pick(t.why));
    txt('casesH', t.casesH); ul('casesL', pick(t.cases)); txt('riskH', t.riskH); txt('riskP', pick(t.risk));
    txt('honestH', t.honestH); ul('honestL', t.honest);
    txt('priceH', t.priceH); txt('priceNote', t.priceNote);
    txt('chainsH', t.chainsH); txt('chainsP', t.chains); txt('chainsZk', t.chainsZk); txt('chainsMore', t.chainsMore);
    txt('dlHead', t.dlHead); txt('dlWhy', t.dlWhy); ul('dlSteps', t.dlSteps); txt('dlBtn', t.dlBtn); txt('dlGh', t.dlGh);
    txt('netGuide', t.netGuide);
    txt('resumeH', t.resumeH); $('#resumeId').placeholder = t.resumeId; $('#resumeCode').placeholder = t.resumeCode; txt('resumeBtn', t.resumeBtn);
    txt('sentHead', t.sentHead); txt('sentTech', t.sentTech);
    txt('footNever', t.footNever); txt('footOne', t.footOne);
    var fl = t.footLinks.split(' · ');
    document.querySelectorAll('#footLinks a').forEach(function (a, i) { if (fl[i]) a.textContent = fl[i]; });
    $('#btnZh').classList.toggle('active', lang === 'zh'); $('#btnEn').classList.toggle('active', lang === 'en');
    var bId = $('#btnId'); if (bId) bId.classList.toggle('active', lang === 'id');
    renderPrices(); renderChains(); renderSteps(); renderSent(); renderMine(); news();
  }

  // ── 价目表（只从平台取）──────────────────────────────────────────────────────────────────────────
  var CAT = null;
  function renderPrices() {
    var t = T(), tb = $('#priceBody'); if (!tb) return;
    $('#priceHead').innerHTML = '<tr>' + t.priceCols.map(function (c, i) { return '<th' + (i ? ' class="num"' : '') + '>' + esc(c) + '</th>'; }).join('') + '</tr>';
    if (!CAT) { tb.innerHTML = '<tr><td colspan="5" class="dim">' + esc(t.priceOffline) + '</td></tr>'; return; }
    var rows = [];
    for (var n = CAT.minPinned; n <= CAT.maxPinned; n++) {
      var r3 = CAT.rows.filter(function (r) { return r.mode === 'create3' && r.pinned === n; })[0] || {}, r2 = CAT.rows.filter(function (r) { return r.mode === 'create2' && r.pinned === n; })[0] || {};
      var mt = function (r) { return (lang === 'id' ? (r.mintTimeTextId || r.mintTimeTextEn || r.mintTimeText) : lang === 'en' ? r.mintTimeTextEn : r.mintTimeText) || '—'; };
      rows.push('<tr><td>' + n + '</td><td class="num">' + esc(r3.priceUsdt == null ? '—' : r3.priceUsdt) + '</td><td class="num">' + esc(mt(r3)) + '</td><td class="num">' + esc(r2.priceUsdt == null ? '—' : r2.priceUsdt) + '</td><td class="num">' + esc(mt(r2)) + '</td></tr>');
    }
    tb.innerHTML = rows.join('');
  }
  function renderChains() {
    var box = $('#chainChips'); if (!box) return;
    var list = (CAT && CAT.chains) || [{ name: 'Ethereum' }, { name: 'BSC' }, { name: 'Base' }, { name: 'Arbitrum' }, { name: 'Optimism' }, { name: 'Polygon' }, { name: 'Avalanche' }, { name: 'Linea' }, { name: 'zkSync Era' }];
    box.innerHTML = list.map(function (c) { return '<span class="chip on">' + esc(c.name) + '</span>'; }).join('');
    txt('factoryAddr', 'CreateX · ' + SALT.CREATEX);
  }

  // ── 五步 ─────────────────────────────────────────────────────────────────────────────────────────
  var S = { step: 1, mode: 'create3', deployer: '', initHash: '', prefix: '', suffix: '', label: '', payChain: 'bsc', ref: '', quote: null, order: null, payment: null, code: null, delivery: null, poll: null,
    vchOpen: false, vchCode: '', vchErr: null, vchKey: '' };
  var MINP = function () { return (CAT && CAT.minPinned) || 8; }, MAXP = function () { return (CAT && CAT.maxPinned) || 12; };
  function check1() {
    var t = T(), errs = [];
    var ap = SALT.addrProblem(S.deployer);
    if (ap) errs.push(ap === 'checksum' ? t.bad.checksum : ap === 'zero' ? t.bad.zero : t.bad.deployer);
    if (S.mode === 'create2' && !SALT.isHex(S.initHash, 32)) errs.push(t.bad.ih);
    var pp = SALT.patProblem(S.prefix, S.suffix);
    if (pp === 'hex') errs.push(t.bad.hex); else if (pp === 'empty') errs.push(t.bad.empty);
    else { var n = SALT.pinned(S.prefix, S.suffix); if (n < MINP() || n > MAXP()) errs.push(t.bad.pinned(MINP(), MAXP())); }
    return errs;
  }
  function stepBox(n, title, why, inner, active) {
    return '<li class="c2step' + (active ? ' act' : '') + (S.step > n ? ' done' : '') + '" id="st' + n + '"><div class="step-head">' + esc(title) + '</div><div class="step-desc dim">' + esc(why) + '</div>' + (active ? inner : '') + '</li>';
  }
  function renderSteps() {
    var el = $('#steps'); if (!el) return;
    var t = T();
    var s1 = '<div class="c2form">'
      + '<div class="lbl">' + esc(t.modeH) + '</div>'
      + '<label class="c2radio"><input type="radio" name="c2mode" value="create3"' + (S.mode === 'create3' ? ' checked' : '') + '> ' + esc(t.m3) + '</label>'
      + '<label class="c2radio"><input type="radio" name="c2mode" value="create2"' + (S.mode === 'create2' ? ' checked' : '') + '> ' + esc(t.m2) + '</label>'
      + '<div class="lbl">' + esc(t.depH) + '</div><input id="c2dep" class="c2in" spellcheck="false" autocomplete="off" placeholder="' + esc(t.depPh) + '" value="' + esc(S.deployer) + '">'
      + (S.mode === 'create2' ? '<div class="lbl">' + esc(t.ihH) + '</div><input id="c2ih" class="c2in" spellcheck="false" autocomplete="off" placeholder="' + esc(t.ihPh) + '" value="' + esc(S.initHash) + '">'
        + '<details class="c2help"><summary>' + esc(t.ihHelp) + '</summary><textarea id="c2code" class="c2in" rows="3" spellcheck="false"></textarea><button type="button" class="run" id="c2ihCalc">' + esc(t.ihCalc) + '</button></details>' : '')
      + '<div class="lbl">' + esc(pick(t.patH)) + '</div>'
      + '<div class="c2pat"><span>' + esc(t.preLbl) + '</span><input id="c2pre" class="c2in short" spellcheck="false" autocomplete="off" value="' + esc(S.prefix) + '"><span>…' + esc(t.sufLbl) + '</span><input id="c2suf" class="c2in short" spellcheck="false" autocomplete="off" value="' + esc(S.suffix) + '"></div>'
      + (PRODUCT === 'token' ? '<div class="step-desc dim">' + esc(t.tokenHint) + '</div>' : '')
      + '<div class="c2prev" id="c2prev"></div>'
      + '<div class="lbl">' + esc(t.labelH) + '</div><input id="c2label" class="c2in" maxlength="40" value="' + esc(S.label) + '">'
      + '<div class="c2errs err" id="c2errs"></div>'
      + '<button type="button" class="run" id="c2next1">' + esc(t.next1) + '</button></div>';
    var s2 = '<div class="c2form"><button type="button" class="run" id="c2quote">' + esc(t.quoteBtn) + '</button><div id="c2quoteOut"></div>'
      + (S.quote ? '<div class="lbl">' + esc(t.payH) + '</div>'
        + '<label class="c2radio"><input type="radio" name="c2pay" value="bsc"' + (S.payChain === 'bsc' ? ' checked' : '') + '> ' + esc(t.payBsc) + '</label>'
        + '<div class="lbl">' + esc(t.refH) + '</div><input id="c2ref" class="c2in short" maxlength="6" placeholder="' + esc(t.refPh) + '" value="' + esc(S.ref) + '">'
        + '<div class="lbl">' + esc(t.pickH) + '</div><div class="c2code"><code id="c2pick">' + esc(S.code) + '</code> <button type="button" class="copy" data-copy="' + esc(S.code) + '">' + esc(t.copy) + '</button></div>'
        + '<div class="step-desc dim">' + esc(t.pickWhy) + '</div>'
        + '<button type="button" class="run" id="c2order">' + esc(t.orderBtn) + '</button>' : '')
      + '<div class="c2errs err" id="c2err2"></div></div>';
    var p = S.payment || {}, o = S.order || {}, v = vchOf(o), full = !!v && v.full;
    if (S.order) S.vchKey = vchKey(o);
    // VOUCHER0X_20261002：全额抵扣 = 没有要转的钱 —— 收款地址、金额、「等到账」「不打算付」都不画，只剩用券那一句
    var s3 = '<div class="c2form">' + (S.order ? '<div class="ok">' + esc(t.orderOk(o.orderId)) + '</div>'
      + (full ? '' : '<div>' + esc(t.payTo(p.amountUsdt, p.network || p.chain)) + '</div><div class="c2code"><code id="c2payAddr">' + esc(p.address) + '</code> <button type="button" class="copy" data-copy="' + esc(p.address) + '">' + esc(t.copy) + '</button></div>'
        + '<div class="step-desc warn">' + esc(t.payOnly(p.network || p.chain)) + '</div>'
        + (p.contract ? '<div class="step-desc dim">USDT: ' + esc(p.contract) + '</div>' : ''))
      + vchHtml(t, o, v)
      + (full ? '' : '<div class="step-desc" id="c2payState">' + esc(o.paidUsdt && o.paidUsdt !== '0' ? t.payGot(o.paidUsdt, o.amountUsdt) : t.payWait) + '</div>'
        + '<details class="c2help"><summary>' + esc(t.leaveQ) + '</summary>' + Object.keys(t.leave).map(function (k) { return '<button type="button" class="chip" data-leave="' + k + '">' + esc(t.leave[k]) + '</button>'; }).join(' ') + '<span id="c2leaveOk"></span></details>') : '') + '</div>';
    var s4 = '<div class="c2form"><div class="mint-live"><span class="mint-anim"></span> <span>' + esc(t.mintNow(lang === 'id' ? (o.mintTimeTextId || o.mintTimeTextEn || o.mintTimeText || '') : lang === 'en' ? (o.mintTimeTextEn || '') : (o.mintTimeText || ''))) + '</span></div></div>';
    var s5 = '<div class="c2form"><button type="button" class="run" id="c2pickBtn">' + esc(t.pickBtn) + '</button> <button type="button" class="run" id="c2verify"' + (S.delivery ? '' : ' disabled') + '>' + esc(t.verifyBtn) + '</button>'
      + '<div id="c2deliv"></div><div class="c2errs err" id="c2err5"></div></div>';
    el.innerHTML = stepBox(1, t.s1, t.s1why, s1, S.step === 1) + stepBox(2, t.s2, t.s2why, s2, S.step === 2) + stepBox(3, t.s3, t.s3why, s3, S.step === 3)
      + stepBox(4, t.s4, t.s4why, s4, S.step === 4) + stepBox(5, t.s5, t.s5why, s5, S.step === 5);
    wire();
    if (S.step === 1) prev1();
    if (S.step === 2 && S.quote) showQuote();
    if (S.step === 5 && S.delivery) showDelivery();
  }
  // ── VOUCHER0X_20261002：用券（现金券 / 免费券）────────────────────────────────────────────────────────
  //   券码真不真、抵多少、这一单还能不能用，全由平台判（POST /api/c2/orders/:id/voucher）—— 页面只去掉空格，空的不发。
  //   用上之后金额改成还要付的（「已收到 x / y」也按它算）；全额抵扣 → 收款那一块不画，那一句留在第 3 步；
  //   平台当场记成已付，这一页本来每 10 秒问一次进度 —— 下一次问到就照常进第 4 步（不另起一套）。
  var isZero = function (x) { return x != null && x !== '' && Number(x) === 0; };
  var vchOf = function (o) { return o && o.voucherHint ? { hint: o.voucherHint, credit: o.voucherCredit, due: o.amountUsdt, full: isZero(o.amountUsdt) } : null; };
  var vchPayable = function (o) { return o.status === 'created' && !(Number(o.paidUsdt) > 0); };        // 平台只收没付、一分没到的单
  var vchKey = function (o) { return o.voucherHint ? 'v|' + o.voucherHint + '|' + o.amountUsdt : vchPayable(o) ? 'open' : 'shut'; };
  // 平台回的单：券的那几格按约定在 order 里；万一放在外面一层也认
  var orderOf = function (b) { var o = (b && b.order) || {}; ['listUsdt', 'voucherHint', 'voucherCredit', 'voucherKind'].forEach(function (k) { if (o[k] == null && b && b[k] != null) o[k] = b[k]; }); return o; };
  function vchHtml(t, o, v) {
    if (v) return '<div class="step-desc ok" id="c2vchOk">' + esc(v.full ? t.vchFull : t.vchPart(v.hint, v.credit, v.due)) + '</div>';
    if (!vchPayable(o)) return '';
    return '<details class="c2help" id="c2vch"' + (S.vchOpen ? ' open' : '') + '><summary>' + esc(t.vchAsk) + '</summary>'
      + '<div class="c2pat"><input id="c2vchCode" class="c2in short" maxlength="40" spellcheck="false" autocomplete="off" aria-label="voucher" placeholder="0x0…" value="' + esc(S.vchCode) + '">'
      + '<button type="button" class="run" id="c2vchGo">' + esc(t.vchBtn) + '</button></div>'
      + (S.vchErr ? '<div class="step-desc warn" id="c2vchErr">' + esc(errMsg(S.vchErr)) + '</div>' : '') + '</details>';
  }
  function vchGo() {
    var i = $('#c2vchCode'), b = $('#c2vchGo'), code = String(i ? i.value : '').replace(/\s+/g, '');
    S.vchCode = code; if (i) i.value = code;
    if (!code || !S.order) { if (i) i.focus(); return; }
    if (b) b.disabled = true;
    api('/api/c2/orders/' + S.order.orderId + '/voucher', 'POST', { code: code }).then(function (r) {
      var x = r.body || {};
      if (r.code !== 200 || !x.ok) { S.vchErr = r; S.vchOpen = true; renderSteps(); return; }
      var due = x.covered === true ? 0 : x.amountUsdt;
      S.vchErr = null; S.vchOpen = false; S.vchCode = '';
      S.order.amountUsdt = due; S.order.listUsdt = x.listUsdt; S.order.voucherHint = x.hint; S.order.voucherCredit = x.creditUsdt; S.order.voucherKind = x.kind;
      if (S.payment) S.payment.amountUsdt = due;
      renderSteps();
    });
  }
  var vchReset = function () { S.vchOpen = false; S.vchCode = ''; S.vchErr = null; };
  function prev1() {
    var t = T(), pv = $('#c2prev'); if (!pv) return;
    var p = SALT.normPat(S.prefix), s = SALT.normPat(S.suffix);
    pv.textContent = t.preview(p, s) + ' · ' + t.pinnedTxt(SALT.pinned(p, s), MINP(), MAXP());
    var e = check1(); $('#c2errs').textContent = (S.deployer || S.prefix || S.suffix) ? e.join(' · ') : '';
  }
  function showQuote() {
    var t = T(), q = S.quote, out = $('#c2quoteOut'); if (!out || !q) return;
    out.innerHTML = '<div class="c2price">' + esc(t.priceIs(q.priceUsdt)) + '</div><div class="step-desc">' + esc(t.mintIs(lang === 'id' ? (q.mintTimeTextId || q.mintTimeTextEn || q.mintTimeText) : lang === 'en' ? q.mintTimeTextEn : q.mintTimeText,
      lang === 'id' ? (q.refundTextId || q.refundTextEn || q.refundText) : lang === 'en' ? q.refundTextEn : q.refundText)) + '</div>';
  }
  function wire() {
    var on = function (id, ev, f) { var e = document.getElementById(id); if (e) e.addEventListener(ev, f); };
    document.querySelectorAll('input[name=c2mode]').forEach(function (r) { r.addEventListener('change', function () { keep1(); S.mode = r.value; renderSteps(); }); });
    ['c2dep', 'c2ih', 'c2pre', 'c2suf', 'c2label'].forEach(function (id) { on(id, 'input', function () { keep1(); prev1(); }); });
    on('c2ihCalc', 'click', function () {
      var c = String($('#c2code').value || '').replace(/\s+/g, '');
      if (!SALT.isHex(c) || !c.replace(/^0x/i, '')) { $('#c2errs').textContent = T().bad.code; return; }
      S.initHash = '0x' + SALT.bytesToHex(SALT.keccak256(SALT.hexToBytes(c))); $('#c2ih').value = S.initHash; prev1();
    });
    on('c2next1', 'click', function () { keep1(); var e = check1(); if (e.length) { $('#c2errs').textContent = e.join(' · '); return; } S.step = 2; S.quote = null; if (!S.code) S.code = newCode(); renderSteps(); getQuote(); });
    on('c2quote', 'click', getQuote);
    document.querySelectorAll('input[name=c2pay]').forEach(function (r) { r.addEventListener('change', function () { S.payChain = r.value; }); });
    on('c2ref', 'input', function () { S.ref = String($('#c2ref').value || '').trim().toUpperCase(); });
    on('c2order', 'click', placeOrder);
    document.querySelectorAll('[data-leave]').forEach(function (b) { b.addEventListener('click', function () { api('/api/fw/leave', 'POST', { reason: b.getAttribute('data-leave') }).then(function () { txt('c2leaveOk', ' ' + T().leaveThanks); }); }); });
    on('c2pickBtn', 'click', collect);
    on('c2verify', 'click', showDelivery);
    var vd = $('#c2vch');
    if (vd) vd.addEventListener('toggle', function () { S.vchOpen = vd.open; var i = $('#c2vchCode'); if (vd.open && i) i.focus(); });
    on('c2vchGo', 'click', vchGo);
    on('c2vchCode', 'input', function () { S.vchCode = $('#c2vchCode').value; });
    on('c2vchCode', 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); vchGo(); } });
  }
  function keep1() {
    var v = function (id) { var e = document.getElementById(id); return e ? e.value : null; };
    if (v('c2dep') != null) S.deployer = v('c2dep').trim();
    if (v('c2ih') != null) S.initHash = v('c2ih').trim();
    if (v('c2pre') != null) S.prefix = v('c2pre').trim();
    if (v('c2suf') != null) S.suffix = v('c2suf').trim();
    if (v('c2label') != null) S.label = v('c2label');
  }
  function getQuote() {
    api('/api/c2/quote', 'POST', { mode: S.mode, prefix: SALT.normPat(S.prefix), suffix: SALT.normPat(S.suffix) }).then(function (r) {
      if (r.code !== 200) { txt('c2err2', errOf(r)); return; }
      S.quote = r.body; renderSteps();
    });
  }
  function placeOrder() {
    var b = { product: PRODUCT, mode: S.mode, deployer: S.deployer, initHash: S.mode === 'create2' ? S.initHash : undefined, prefix: SALT.normPat(S.prefix), suffix: SALT.normPat(S.suffix),
      label: S.label || undefined, payChain: S.payChain, ref: S.ref || undefined, pickupHash: codeHash(S.code), lang: lang };
    api('/api/c2/orders', 'POST', b).then(function (r) {
      if (r.code !== 200) { txt('c2err2', errOf(r)); return; }
      S.order = r.body.order; S.payment = r.body.payment; remember(S.order.orderId, S.code); vchReset();
      S.step = 3; renderSteps(); renderMine(); pollStatus();
    });
  }
  function pollStatus() {
    clearTimeout(S.poll);
    if (!S.order) return;
    api('/api/c2/orders/' + S.order.orderId).then(function (r) {
      if (r.code === 200) {
        S.order = orderOf(r.body);
        var st = S.order.status, t = T();
        // VOUCHER0X_20261002：券在别处用上了（机器人里）、或者钱到了一部分（不再给「有券？」）→ 第 3 步按新的重画
        if (S.step === 3 && vchKey(S.order) !== S.vchKey) { if (S.payment && S.order.amountUsdt != null) S.payment.amountUsdt = S.order.amountUsdt; renderSteps(); }
        if (st === 'created' && S.step === 3) { var e = $('#c2payState'); if (e) e.textContent = S.order.paidUsdt && S.order.paidUsdt !== '0' ? t.payGot(S.order.paidUsdt, S.order.amountUsdt) : t.payWait; }
        if (st === 'minting' && S.step < 4) { S.step = 4; renderSteps(); }
        if ((st === 'found' || st === 'delivered') && S.step < 5) { S.step = 5; renderSteps(); collect(); return; }
        if (st === 'expired' || st === 'refunded') { txt('c2payState', (t.status[st] || st)); return; }
      }
      S.poll = setTimeout(pollStatus, S.step >= 4 ? 15000 : 10000);
    });
  }
  function collect() {
    if (!S.order || !S.code) return;
    api('/api/c2/orders/' + S.order.orderId + '/pickup', 'POST', { code: S.code }).then(function (r) {
      if (r.code !== 200) { txt('c2err5', errOf(r)); return; }
      S.delivery = r.body.delivery; S.step = 5; renderSteps();
    });
  }
  // 核对：只用 salt.js 在本机算 —— 断网也能跑
  function showDelivery() {
    var d = S.delivery, box = $('#c2deliv'); if (!d || !box) return;
    var t = T(), salt = String(d.salt).replace(/^0x/i, '');
    var parts = (function () { try { return SALT.saltParts(salt); } catch (e) { return null; } })();
    var v = SALT.verify({ mode: d.mode, deployer: d.deployer, initHash: d.initHash ? d.initHash.replace(/^0x/i, '') : undefined, salt: salt, prefix: d.prefix, suffix: d.suffix });
    var c1 = !!parts && parts.owner.toLowerCase() === String(d.deployer).toLowerCase(), c2 = !!parts && parts.flag === 0, c3 = !!v.address && v.address === d.address, c4 = v.ok;
    var mark = function (x) { return x ? '<b class="up">✓</b> ' : '<b class="down">✗</b> '; };
    var h = '<div class="c2addr"><code>' + esc(d.address) + '</code></div>'
      + '<ol class="c2checks"><li>' + mark(c1) + esc(t.checks[0]) + '</li><li>' + mark(c2) + esc(t.checks[1]) + '</li><li>' + mark(c3) + esc(t.checks[2]) + (lang === 'zh' ? '：' : ': ') + '<code>' + esc(v.address || '—') + '</code></li><li>' + mark(c4) + esc(t.checks[3]) + (lang === 'zh' ? '：' : ': ') + '0x' + esc(d.prefix) + '…' + esc(d.suffix) + '</li></ol>'
      + '<div class="lbl">salt</div><div class="c2code"><code>' + esc(d.salt) + '</code> <button type="button" class="copy" data-copy="' + esc(d.salt) + '">' + esc(t.copy) + '</button></div>'
      + '<div class="lbl">' + esc(t.ocH) + '</div>'
      + (d.onchain && d.onchain.rows ? '<div class="chips">' + d.onchain.rows.map(function (r) { return '<span class="chip ' + (r.ok ? 'on' : 'off') + '">' + (r.ok ? '✓ ' : '✗ ') + esc(r.chain) + '</span>'; }).join('') + '</div>' : '<div class="step-desc dim">' + esc(t.ocPending) + '</div>')
      + '<div class="lbl">' + esc(t.deployH) + '</div><ol class="c2deploy">' + t.deploy({ deployer: d.deployer, factory: d.factory, call: d.call, mode: d.mode, initHash: d.initHash, address: d.address }).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>'
      + '<pre class="c2cmd">cast call ' + esc(d.factory) + ' "' + esc(SALT.SELECTOR[d.mode]) + '" ' + esc(d.salt) + ' &lt;initCode&gt; --from ' + esc(d.deployer) + ' --rpc-url &lt;RPC&gt;\ncast send ' + esc(d.factory) + ' "' + esc(SALT.SELECTOR[d.mode]) + '" ' + esc(d.salt) + ' &lt;initCode&gt; --from ' + esc(d.deployer) + ' --rpc-url &lt;RPC&gt;</pre>'
      + '<div class="step-desc warn">' + esc(t.deployWarn) + '</div>'
      + '<div class="step-desc">' + esc(pick(t.regAfter)) + ' <a href="verify.html" data-site="verify.html">' + esc(t.regAfterLink) + '</a></div>';
    box.innerHTML = h;
    fixLinks(box);
  }
  function renderMine() {
    var box = $('#myOrders'); if (!box) return;
    var l = myOrders().filter(function (x) { return x.p === PRODUCT; });
    box.innerHTML = l.length ? esc(T().myOrders) + ' ' + l.map(function (x) { return '<button type="button" class="chip" data-resume="' + esc(x.id) + '">' + esc(x.id) + '</button>'; }).join(' ') : '';
    box.querySelectorAll('[data-resume]').forEach(function (b) { b.addEventListener('click', function () { var x = myOrders().filter(function (y) { return y.id === b.getAttribute('data-resume'); })[0]; if (x) resume(x.id, x.code); }); });
  }
  function resume(id, code) {
    id = String(id || '').trim().toLowerCase(); code = String(code || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '');
    if (!/^c[0-9a-f]{8}$/.test(id) || !/^[0-9a-f]{32}$/.test(code)) return;
    S.code = code; S.order = { orderId: id };
    api('/api/c2/orders/' + id).then(function (r) {
      if (r.code !== 200) { txt('resumeMsg', errOf(r)); return; }
      S.order = orderOf(r.body); S.payment = { address: S.order.depositAddress, amountUsdt: S.order.amountUsdt, network: S.order.payChain === 'tron' ? 'TRC-20' : 'BEP-20', chain: S.order.payChain };
      vchReset();
      remember(id, code);
      var st = S.order.status;
      S.step = st === 'created' ? 3 : st === 'minting' ? 4 : (st === 'found' || st === 'delivered') ? 5 : 3;
      renderSteps(); renderMine();
      if (S.step === 5) collect(); else pollStatus();
    });
  }
  // 下载到电脑上的这一份（file://）：站内链接写完整网址、开新窗口（不然点一下就离开这一页）
  function fixLinks(root) {
    if (/^https?:$/.test(location.protocol)) return;
    (root || document).querySelectorAll('a[data-site]').forEach(function (a) { a.href = 'https://0x000000000.com/' + a.getAttribute('data-site'); a.target = '_blank'; a.rel = 'noopener'; });
  }

  // ── 开页 ─────────────────────────────────────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return;
    var t = T(), done = function () { b.textContent = t.copied; setTimeout(function () { b.textContent = t.copy; }, 1200); };
    try { navigator.clipboard.writeText(b.getAttribute('data-copy')).then(done, function () {}); } catch (err) { /* 复制不了：字就印在旁边 */ }
  });
  $('#btnZh').addEventListener('click', function () { lang = 'zh'; try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} renderStatic(); });
  $('#btnEn').addEventListener('click', function () { lang = 'en'; try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} renderStatic(); });
  if ($('#btnId')) $('#btnId').addEventListener('click', function () { lang = 'id'; try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} renderStatic(); });
  $('#resumeBtn').addEventListener('click', function () { resume($('#resumeId').value, $('#resumeCode').value); });
  // 网站上只给「下载这一页」；下载到电脑上双击打开（file://）或本机测试才给 5 步
  $('#dlGate').hidden = !ON_SITE; $('#flowWrap').hidden = ON_SITE;
  if (location.protocol === 'file:') { var dl = $('#dlPage'); if (dl) dl.hidden = true; }
  try { var q = new URLSearchParams(location.search).get('ref'); if (/^[2-9A-HJ-NP-Z]{6}$/i.test(q || '')) S.ref = q.toUpperCase(); } catch (e) {}
  try { var m = decodeURIComponent(location.pathname || '').match(/_ref-([2-9A-HJ-NP-Za-hj-np-z]{6})(?:\s*\(\d+\))?\.html?$/); if (m) S.ref = m[1].toUpperCase(); } catch (e) {}
  setInterval(function () { var d = new Date(); txt('utcClock', d.toISOString().slice(11, 19) + ' UTC'); }, 1000);
  fixLinks();
  renderStatic();
  api('/api/c2/catalog').then(function (r) { if (r.code === 200) { CAT = r.body; renderPrices(); renderChains(); if (S.step === 1) prev1(); } });
})();
