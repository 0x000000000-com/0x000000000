// 0x000000000 — 前端原型逻辑（终端风）
'use strict';

const dict = {
  zh: {
    posPrefix: '前缀 Prefix', posSuffix: '后缀 Suffix', posBoth: '前+后 Both ends',
    thType: '类型 Type', thPrice: '价格 USDT', thEta: '铸造耗时',
    catalogOpen: '查看全部价格 ▸', catalogTitle: '价目表',
    catalogTeaser: (on, off) => '两条链 · ' + on + ' 档在售' + (off ? '（另有 ' + off + ' 档铸造机暂不支持）' : ''), 
    catalogDown: '价目表暂时取不到 —— 宁可不显示，也不给你看一张可能过期的表。',
    kindPrefix: '前缀', digits: '位', sellLens: '可售位数: ',
    onlyKinds: (k) => '目前只卖：' + k + '。后缀、前后缀组合、按图案定价都还没实现 —— 不在这张表里的一律不可售。',
    noteHot: '热门模式 (9999/8888/0000/dead/beef/c0ffee/666…) 溢价 30-100%；0x9999 与 0xabcd 难度相同——定价按位数不按字符。',
    safeTitle: '[SAFE] 定制区 · 无托管模式 NON-CUSTODIAL',
    safeBody: '我们全程只拿到影子 A 和另外半把钥匙 b —— 这两样加起来也推不出你的私钥。完整私钥只在你自己的电脑上拼出来。',
    noteProto: '原型说明：这一页连的是真平台，只有付款是模拟的。你的那一半钥匙只在你自己的电脑上生成和使用。',
    // LIVEPAY0X：切了真收款之后上面那句就是假话了。liveSwap 会用下面这句顶替它。
    noteProtoLive: '这一页连的是真平台：下单、铸造、交货、收款都是真的。你的那一半钥匙只在你自己的电脑上生成和使用，平台看不到。',
    heroTag: '靓号地址铸造台 · SPLIT-KEY 无托管',
    // LESSTEXT0X_20260928（少字 B）：原来 hero 那一整句换成「你一半 + 我们一半」的图；这几格是图上的字
    kdYou: '你的一半', kdYouSub: '只在你电脑上', kdOurs: '我们的一半', kdOursSub: '显卡算出来的', kdKey: '完整钥匙', kdKeySub: '只在你电脑上合成',
    kdCap: '我们手里只有你的影子 A 和 b —— 合起来也造不出你的钥匙。',
    evmSum: '一个 0x 地址，以太坊类各条链通用',
    proofSum: '你自己怎么核对',
    routeHead: '下载、双击打开、跟着 6 步走：',
    route: [['造钥匙', '断网'], ['下单', '挑图案'], ['付款', 'BSC USDT'], ['铸造', '显卡在算'], ['取货合钥匙', '断网合'], ['交收条', '签个名']],
    routeLine: ['在你电脑上造一半钥匙，只交出公开的影子。', '挑好图案下单，页面替你签个名，证明钥匙在你手上。', '往这一单专用的地址转 BSC 上的 USDT。',
      '我们的显卡拿着影子，去找你要的那个地址。', '取回 b，断网，在你电脑上合成完整钥匙。', '用新钥匙签个收条，这一单结清。'],
    routeMore: '展开细节',
    dlMore: '为什么要下载？',
    footMore: '更多',
    heroCta: '开始铸造 →',
    // PPTNAV0X_20260924：顶栏导航 → 0x000000000.com/ppt（6 步说明书 / 白皮书）
    navPpt: '说明书 · 6 步看懂',
    navWp: '白皮书',   // WPNAV0X_20260928
    // CONTRACT0X_20260928：三种铸造各一页、各一个名字（DSJ「名字和页面要不一样，不要让人给混了」）+ 首页三张入口卡片 + 以太坊类各链同址
    navVanity: '个人靓号', navContract: '合约靓号', navToken: '发币地址定制', navFree: '免费生成',
    ecb1: '防骗提醒 →', ecb2: '个人靓号 ↓', ec3a: '合约靓号 →', ec3b: '发币地址定制 →',
    heroEvm: '0x 开头的靓号：同一把私钥，在以太坊、BSC、Polygon、Arbitrum、Optimism、Base、Avalanche C 链这些以太坊类的链上都是同一个地址 —— 买一个，这些链都能用。每条链上的钱是分开记的，转账时选对链。',
    // CONTRACT0X_20260928：防混第 1、2 条 —— 页首「你现在在」+ 三格对照表（表里的字跟 js/c2app.js 的 cmpRows 逐字相同，order-ui.test 第 8 段比对）
    hereBig: '你现在在：个人靓号（给个人、商家）',
    cmpHead: '三个铸造页，别走错：',
    cmpWhat: '是什么', cmpWhat1: '你自己的钱包地址', cmpWhat2: '你部署的合约的地址', cmpWhat3: '你发的币的合约地址',
    cmpFor: '给谁', cmpFor1: '个人、商家', cmpFor2: '项目方', cmpFor3: '发币的人、发币平台',
    cmpKey: '钥匙', cmpKey1: '钥匙只在你手里（你造一半、我们算另一半）', cmpKey2: '不碰任何钥匙（只算盐）', cmpKey3: '不碰任何钥匙（只算盐）',
    cmpEvm: '以太坊类各条链', cmpEvm1: '同一个地址（同一把钥匙）', cmpEvm2: '同一个地址（CreateX）', cmpEvm3: '同一个地址（CreateX）',
    cmpWhere: '去哪',
    // TICKER0X_20260924：顶栏那一行一直在「打字」的话。第一句是 DSJ 要的那句意思，另外两句是能自己核对的证据。
    ticker: ['我们不要你的信任 —— 我们给你证据。', '私钥从不离开你的电脑 —— 发给我们的每一句话都列给你看。', '这个页面 = GitHub 上公开的那份，一字不差 —— 你自己核对。'],
    tickerSr: '我们不要你的信任 —— 我们给你证据。',
    gsEvm0: '0x0000000000 · 前缀10位', gsEvm8: '0x8888888888 · 前缀10位', gsTron: 'TXooooo… · TRON 前缀6位',
    footTrack: '订单查询',
    footPartners: '招商',                    // REF0X_20260928 第 6 步：招商页
    footVerify: '认证 · 收款名片',           // VERIFY0X_20260928：认证页、付费提醒页
    footAlerts: '付费提醒',
    // TRUST0X_20260923：原来还写着「OFAC 制裁筛查 · 大额阈值 KYC」—— 代码里一行都没有（grep 0 处），
    //   「开源工具可审计」那时也还没公开。页面上每一句都得是真的，假话比没话更伤信任。
    foot1: '页面代码公开在 GitHub，可逐字节核对 · 定制区无托管 · 只收 BSC 上的 USDT（BEP20）',
    // TRUST0X_20260923：DSJ「两半都在我们的平台合成，用户会不会怀疑我们拿得到私钥？」
    //   说「拿不到」没用，要让用户自己能核对。每一条都是能验的事实，不是口号。
    proof1: '你的那一半钥匙在你自己的电脑上生成，也只存在你自己的电脑上。平台收到的只有公钥（公开的，像银行卡号）和签名（证明你手里有那一半，但不暴露它）—— 铸造页最下面「这一页跟平台说过的每一句话」逐条列着，你自己看。',
    proof2: '「造钥匙」这一步不需要联网：你可以先关掉 Wi-Fi 再点，照样做完。',
    proof3: '这个页面就是一个文件，跟 GitHub 上公开的那份逐字节相同。GitHub 的机器每小时自动下载一次网站上的页面核对指纹，还会在每个新版本上用真浏览器走完全程、查私钥有没有被发出去 —— 这两项检查我们插不上手。',
    proofVer: '页面版本',
    proofGh: '到 GitHub 核对',
    // DLONLY0X_20260924：DSJ「直接改成全下载到电脑模式，网站上的6个步骤也直接撤掉，6个步骤只显示在下载到电脑页面」
    dlHead: '在你自己的电脑上铸造',
    dlWhy: '铸造靓号要用到你的私钥。为了让私钥从头到尾只出现在你自己的电脑上，造钥匙、下单、取货、合成钥匙都在一个下载到你电脑上的页面里做 —— 网站上不做。',
    dlStep1: '点下面的按钮，把铸造页面（就一个文件：0x000000000.html）下载到你的电脑。',
    dlStep2: '在电脑上双击打开它（用 Chrome 或 Edge）。',
    dlStep3: '跟着里面的 6 步走。哪一步要断网、哪一步要联网，每一步都会用人话告诉你，还会说为什么。',
    dlGetBtn: '下载铸造页面',
    dlNote: '下载下来的这个文件在你自己手里，我们以后改不了它。它跟 GitHub 上公开的那份一个字节都不差，你可以自己核对（上面「到 GitHub 核对」）。',
    dlResume: (id) => '要接着做订单 ' + id + '：打开你电脑上的铸造页面，在最下面「输入订单号接着做」那里填这个订单号。',
    // REF0X_20260928：推荐链接进来的人，网站上「下载铸造页面」那一块最上面说一句
    refBanner: (c) => '推荐码 ' + c + ' 已经记下：用下面的按钮下载的铸造页会自动带上它（第 2 步）。',
    refCopy: '复制推荐码', refCopied: '已复制',
    netGuide: '你现在用的是下载到自己电脑上的铸造页。每一步都标了：🔌 = 这一步建议断网做，🌐 = 这一步要联网。每一步都写了为什么。',
    offlineErr: '现在没联网，这一步发不出去。连上网再点一次 —— 前面做好的都还在，不用重来。',
    sentHead: '这一页跟平台说过的每一句话',
    sentNone: '还没跟平台说过任何话。',
    sentCheck: (n, sHit, kHit, hasS, hasK) => '一共 ' + n + ' 次。' + (hasS ? (sHit ? '⚠ 你的那一半钥匙出现了 ' + sHit + ' 次！' : '你的那一半钥匙：一次都没有 ✓') : '你还没造钥匙') + '　' + (hasK ? (kHit ? '⚠ 完整私钥出现了 ' + kHit + ' 次！' : '完整私钥：一次都没有 ✓') : '完整私钥还没合出来') + '　（这是这一页自己在下面这些内容里一个字一个字搜出来的）',
    sentTimes: (n) => '（' + n + ' 次，每隔几秒问一次）',
    sentFailed: '（没发出去：当时没联网）',
    sentTech: '懂技术的人看这里：每一次发了什么，原样列出',
    sentGhHead: '不信这一页自己说的？GitHub 上有两项检查，是 GitHub 的机器在跑，我们碰不到：',
    sentGh1: '① 私钥外发检查：每次改这个页面，GitHub 的机器都用真浏览器把 6 步走一遍，逐个核对页面发出去的每一句话。绿色 ✓ = 没有把钥匙发出去。',
    sentGh2: '② 防篡改巡检：GitHub 的机器每小时下载一次网站上的页面，跟公开的那份逐字节比。绿色 ✓ = 网站上的就是公开的那份，没被偷偷改过。',
    sentGhRuns: '看 GitHub 的检查记录 ↗',
    sentGhRepo: '看公开的页面代码 ↗',
    sent: {
      catalog: '看价目表 —— 没带你的任何东西',
      check: '免费查一个地址 —— 带了你贴的那个地址（平台查完不存、不记日志）',
      health: '看平台在不在线 —— 没带你的任何东西',
      create: '下单 —— 告诉平台：哪条链、什么图案、用哪条链付款（填了推荐码的话还有推荐码）',
      share: '交「影子」—— 一个公开的数（像银行卡号）加一个签名，证明你手里有那一半钥匙；钥匙本身没发',
      payment: '问收款地址 —— 没带你的任何东西',
      status: '问进度 —— 没带你的任何东西',
      paysim: '测试用的模拟付款 —— 没带你的任何东西',
      download: '取货 —— 带了一个签名，证明是你本人来取',
      receipt: '交收条 —— 带了一个签名，证明你拿到了',
      leave: '说不打算付的原因 —— 只带了你点的那一个词（没有订单号）',
      voucher: '用券 —— 只带了你填的券码',
      other: '其他',
    },
    foot2: '平台永远不会索要你的私钥或备份文件 —— 任何索要私钥的消息都是钓鱼。',
    // FREECHECK0X_20260928：构思 v3 第三章第 1 条（DSJ：「这句话是精髓」）+ 个人靓号页另加的那一句 + 官方网址只有一个
    footNever: '零九零永远不会让你连接钱包、不会让你在钱包 App 里给我们签名或授权、不会让你转钱给我们来「验证」。凡是这样要求你的，一定是假的。',
    footSign: '铸造页会在页面里自动签几次名（下单、取货、交收条），用的是这一单在你电脑上生成、合成的钥匙，签的只是一段证明文字，不是转账、不是授权 —— 只用来证明这一单是你的。',
    footOne: '官方网址只有一个：0x 000 000 000 .com（0x 后面 9 个 0）· 零九零没有发行任何代币 · 收藏官网，以后只从收藏夹进。',
    footShort: '零九零永远不会要你的私钥、不会让你连钱包、签名或转钱「验证」—— 这样要的都是假的。官方只有：',
    footBot: '官方机器人只有一个：Telegram 上的 @OxOOOOOOOOObot（里面的 O 全是字母 O，不是数字 0）。发一个网址或 @用户名给它，它告诉你是不是我们的；发一个地址（波场或以太坊类 0x…），它帮你查有没有被投毒。',
    thOrder: '订单 Order', thPattern: '模式 Pattern', thStatus: '状态 Status', thPrice2: '价格 USDT',
    boot: [
      'Windows PowerShell',
      'Copyright (C) 0x000000000. All rights reserved.',
      '',
      '0x000000000 — VANITY ADDRESS MINT',
      '靓号地址铸造台 · split-key 无托管铸造',
      '航次: 0x000000000 · 任务: 铸造靓号私钥 · 轨道: 近地',
      '',
      '加载模块: [ok] keccak256   [ok] secp256k1   [ok] BEP20 watcher',
      'GPU 铸造队列: 待命 (Vast.ai / RunPod · 订单驱动扩缩容)',
      '',
      '命令: Get-VanityCatalog | New-VanityOrder | Get-MyOrders',
    ],
    ordersEmpty: '还没有订单', ordersDown: '订单暂时取不到，刷新一下再试',
    ordersResume: '接着做', thAction: '操作', ordersIdPh: '订单号（8 位）', ordersIdBtn: '接着做这一单',
    ordersIdLbl: '换了电脑或浏览器？输入订单号接着做：',
    statusTxt: (s) => '订单 ' + (orderState.orderId || '-') + ' · 状态: ' + s,
    flow: {
      // ALLINONE0X_20260923：全部改成人话。DSJ 原话「每个步骤必须人话解释，容易让用户明白」。
      // 规矩：不出现 P=A+b·G、ECDLP、变体、挖矿这类词；说清楚【这一步在谁的机器上算】。
      // LESSTEXT0X_20260928：每一步「为什么断网 / 联网」那一整句收进一个小标签里，点开才看
      netTag: ['🔌 断网做', '🌐 要联网', '🌐 要联网', '🌐 保持联网', '🌐 取货 → 🔌 断网合', '🌐 要联网'], why: '为什么',
      chainLbl: '要哪条链的地址', posLbl: '漂亮的部分放哪',
      prePh: '开头', sufPh: '结尾',
      s1head: '造一把只有你有的钥匙',
      s1desc: '这一步全部在你自己的电脑上算完，平台一个字节都收不到。它会把一把钥匙劈成两半：一半留在你这儿（下面叫「你的那一半」），另一半的「影子」交给平台。平台拿着影子推不回你的那一半 —— 所以从头到尾，完整私钥只可能出现在你的电脑上。',
      net1: '🔌 建议断网做：先拔网线或关掉 Wi-Fi，再点「造钥匙」。为什么：这一步会生成你的那一半钥匙，断网的时候这一页就算想往外发东西也发不出去。做完再连上网，接着做第 2 步。',
      genBtn: '造钥匙',
      genOk: '钥匙造好了，备份文件 my-secret-s.json 已经存到你的下载文件夹。现在可以连上网，做第 2 步。',
      genKeep: '这个文件一定要留好。丢了这个靓号就永久没了，我们也找不回来 —— 建议再存一份到 U 盘或另一台电脑。',
      reloadLbl: '刷新过页面？选回你的 my-secret-s.json',
      fileOk: (pat, ch) => '读到了你之前的备份：' + pat + '（' + ch + '），可以接着下单。',
      keyKept: (pat, ch) => '钥匙还在（' + pat + ' · ' + ch + '），切换语言不影响它，可以接着下单。',
      fileBad: '这个文件读不了，换一个试试。',
      noCore: '密钥模块没加载起来，刷新一下页面再试。',
      noTier: '这个长度目前没有定价，换一个长度。',
      offlineHint: '现在没联网，看不到价格 —— 钥匙照样能造。连上网以后价格会自己出来。',
      suggest: '建议', notPriced: '待定价',
      soon: '这一档还没定价，暂时不接单',
      posSoon: '铸造机暂不支持',
      cantMint: '这一种铸造机暂时还做不了，先不接单 —— 收了钱却交不出货，比不卖糟得多。',
      patOk2: (usdt, t) => '可以做 · ' + usdt + ' USDT · 大约 ' + t + '铸好',

      s2head: '下单',
      s2desc: '点一下就好，下面三件事页面自己做完：① 建单，拿到平台给的一句随机的话；② 用你的那一半钥匙给这句话签个名，证明钥匙真在你手上（防止有人白嫖平台的算力）；③ 把影子和签名交给平台。签名也是在你的电脑上算的。',
      net2: '🌐 这一步要联网。为什么：要把你要的图案、链、付款方式告诉平台，平台才会建单、给你收款地址。发出去的只有这些，加上影子和签名 —— 钥匙本身不发（最下面「这一页跟平台说过的每一句话」可以自己核对）。',
      create: '下单',
      created: '订单建好了，编号',
      signing: '正在用你的那半把钥匙签名…（在本机算）',
      shareOk: '签名通过。我们收到的只有影子 A —— 你的那一半没有离开这台电脑。',
      needGen: '先做上一步，把钥匙造出来。',

      s3head: '付款',
      s3desc: '原型模式：点一下就当付过了，不用真转账。',
      s3descLive: '下面这个收款地址是这一单专用的。用你自己的钱包，按上面写的那条链，转【正好这个金额】的 USDT 过去就行。',
      net3: '🌐 这一步要联网。为什么：你要从交易所或钱包把 USDT 转到下面这个地址；这一页要连着网，才能看到钱到了没有。',
      payChainLbl: '付款方式',
      refLbl: '推荐码（可选）', refPh: '6 位，比如 AB23CD',
      refFrom: (c) => '推荐码 ' + c + ' 是从推荐链接带过来的；不对可以改，也可以清空。',
      refBad: '推荐码是 6 位：数字 2-9 和英文字母（没有 0、1、I、O）—— 看看有没有抄错；没有推荐码就空着。',
      payChainOffline: '现在还没联网，付款方式还没取到 —— 连上网以后点一下这里，所有能用的付款链都会出来。',
      payPickNow: '付款方式刚取到（刚才没联网）：上面「付款方式」现在可以选了。选好再点一次「下单」。',
      payInfo2: (a, amt, c, net) => '用 ' + net + ' 转 ' + amt + ' USDT 到  ' + a + '   · 到账后还要等 ' + c + ' 个确认',
      copyAddr: '复制地址',
      // VOUCHER0X_20261002：金额下面一行小字「有券？」（现金券 / 免费券，一单一张）。券真不真、抵多少、还能不能用，全由平台判
      vchAsk: '有券？', vchBtn: '用券',
      vchPart: (h, c, d) => '已用券 ' + h + '，抵 ' + c + ' USDT，还要付 ' + d + ' USDT',
      vchFull: '已用券全额抵扣，不用付款',
      pay: '就当已付款（原型）', payLive: '我转好了，开始盯',
      payNote: '每一单的收款地址都不一样，我们靠地址认单，所以别用别的单子的地址。转完这一页会自己往下走，不用刷新；也可以直接关掉，回头在下面「我的订单」里找回来。',
      // REF0X_20260928 第 8 步（每一步的记录）：付款页一键原因。只发四个词之一，不带订单号
      leaveAsk: '不打算付了？点一个原因告诉我们（可以不点；只发你点的那一个词，不带订单号）：',
      leaveOpt: { price: '太贵', confusing: '看不懂', trust: '不放心', browsing: '只是看看' },
      leaveThanks: '收到，谢谢 —— 我们会照着改。',
      paying: '正在模拟到账…', payingLive: '正在盯这个地址（每 2.5 秒看一眼）…',
      watching: '开始盯链上这个地址…',
      // MINTLIVE4_20260924：DSJ「虽然有说我们开做，但是也放个显示正在铸造的一个小动态让用户更直观……不然用户会一直在等，
      //   会让用户感觉付了钱但是没反应」。第 4 步原来只在状态变的那一下印一行字，之后一直不动。现在一直有一行在动的状态：
      //   等到账（等了多久）→ 钱到了 → 正在铸造（算了多久）→ 铸好了。只报「已经多久」，不报「还要多久」。
      mint4Wait: (d) => '等你的付款到账 · 已经等了 ' + d + '。转完一般 1 分钟内会看到，到了这一行会自己变。',
      mint4WaitLong: (id) => '超过 10 分钟还没看到到账：先核对转的是不是上面那条链、那个地址、那个金额。都对的话先别再转，把订单号 ' + id + ' 发给我们，我们去链上查。',
      // PARTIALPAY0X_20260924：分几笔付的钱平台会合起来算 —— 收到一部分时这一行直接告诉他还差多少
      mint4Part: (got, want, left) => '已经收到 ' + got + ' USDT，还差 ' + left + ' USDT（一共 ' + want + '）。把差的转到同一个地址就行 —— 几笔会合起来算，够了这一行会自己变。',
      mint4Paid: '钱收到了，马上开始铸造…',
      mint4Run: (d) => '正在铸造 · 已经算了 ' + d,
      mint4RunNote: '显卡正在一个一个地试，试到开头或结尾正好是你要的那串为止。这一页每 2.5 秒问一次进度，铸好了这一行会自己变。',
      mint4Done: (d) => '铸好了' + (d ? '（这一单算了 ' + d + '）' : '') + ' ✓',
      mint4Next: '往下到第 5 步取货。',
      dur: (h, m, sec) => (h ? h + ' 小时 ' + String(m).padStart(2, '0') + ' 分' : (m ? m + ' 分 ' + String(sec).padStart(2, '0') + ' 秒' : sec + ' 秒')),
      payConfirmN: (n) => '到账后要等 ' + n + ' 个确认。',

      s4head: '我们正在开始铸造',
      s4desc: '我们拿着你的影子 A 一直试，直到试出一个地址，它的开头或结尾正好是你要的那串。整个过程我们手上只有 A，做不出你的私钥。',
      net4: '🌐 保持联网，这一页先别关。为什么：平台的显卡正在替你算，这一页每隔几秒问一次进度。关掉也不要紧，回头在最下面用订单号接着做。',
      mineHit: '做出来了：', readyToTake: '可以取货了。',

      s5head: '取货：把两半合起来',
      s5desc: '平台把另一半（叫 b）交给你。先点「取货」把它拿回来，再点「合成我的钥匙」—— 在你的电脑上把两半合成完整私钥，并且当场核对算出来的地址是不是你买的那个，对不上就不让你往下导出。',
      net5: '先 🌐 联网点「取货」；看到「拿到了」之后可以 🔌 断网，再点「合成我的钥匙」和「导出钱包文件」。为什么：合成的这一刻完整私钥才第一次出现 —— 断网做，它就只可能留在你的电脑上。',
      dlBtn: '取货（要联网）',
      mergeBtn: '合成我的钥匙（可以断网）',
      gotB: '拿到了。现在可以断网（拔网线或关掉 Wi-Fi），再点「合成我的钥匙」。',
      mergeOk: '合成成功，地址已核对。完整私钥现在只在这台电脑上。',
      evmTwin: (a) => '同一把钥匙在以太坊 / BSC 上的写法是 ' + a + '。MetaMask 只认这种 0x 写法；要看到 T 开头的地址，请导进 TronLink 这类 TRON 钱包。',
      hitWord: '命中',
      addrMatch: '跟你买的那个地址一致 ✓',
      addrDiff: (a) => '★ 对不上！我们给的是 ' + a + ' —— 先别导出，把这一屏截给我们。',
      mergeBad: (want, ch) => '⛔ 合出来的地址没有一个是你要的 ' + want + '（' + ch + '）—— 我们给的 b 有问题。先别导出，把这一屏截给我们。',
      // KSONLY0X_20260924：DSJ「拿掉明文文件，专注做好钱包文件就好！」—— 只剩钱包文件一种导出。
      //   密码要输两遍（输错一个字，文件就永远打不开）；TRON 的文件存成 .txt（TronLink 只收 .txt）。
      pwLbl: '给钱包文件设个密码（至少 8 位）', pwPh: '密码', pw2Ph: '再输一次',
      ksBtn: '导出钱包文件',
      pwShort: '密码至少 8 位。这个密码丢了，导出来的文件就再也打不开了。',
      pwDiff: '两次输的密码不一样 —— 再输一遍。',
      noSubtle: '这个浏览器不让用加密功能，钱包文件做不出来。请用 Chrome 或 Edge 打开这个页面再试。',
      ksWork: '正在加密…（故意算得慢，别人暴力猜密码也得这么慢）',
      ksOk: (name, tron) => '导好了：' + name + '（在你的下载文件夹）。' + (tron
        ? '导进 TronLink：添加钱包 → TRON-导入钱包 → 通过 Keystore 文件导入 → 选 ' + name + ' → 输入刚才的密码。'
        : '导进 MetaMask：添加账户或硬件钱包 → 导入账户 → 选择类型「JSON 文件」→ 选 ' + name + ' → 输入刚才的密码。')
        + '文件和密码分开放 —— 两样都在，钥匙就在。下面有这个文件的人话说明。',
      ksFail: '加密失败：',
      // KSGUIDE0X_20260924：DSJ「打开时是不需要输入密码的…一堆地址，我都不知道哪个是私钥？怎么导入钱包？…你也没有人话解释在网页」
      ksGuideHead: '这个钱包文件是什么？为什么打开不用密码？私钥在哪？怎么导进钱包？（点开看）',
      ksGuide: [
        ['一句话', '钱包文件 = 你的私钥 + 一把锁。开锁的钥匙，就是你刚才设的密码。'],
        ['为什么打开不用密码？', '文件本身是普通文字，谁都能打开看。锁住的是里面的私钥：打开只看得到锁住之后的一串乱码，没有密码什么都做不了。你把它导进钱包的时候，钱包才会问你密码。'],
        ['里面那些是什么？', 'address = 你的地址（TRON 的写成 41 开头的十六进制 —— 跟 T 开头的是同一个地址，TronLink 认这种写法）· ciphertext = 锁住的私钥 · iv、salt = 上锁用的随机数 · mac = 用来判断密码对不对 · kdf、n、r、p = 这把锁有多难撬（故意算得很慢）· id、version = 文件编号和格式版本 · readme = 这段说明。除了 address，那些一长串的都不是地址，也不是私钥。'],
        ['私钥在哪一行？', '哪一行都不是明文私钥 —— 它被锁成了 ciphertext。这正是这个文件安全的原因：文件就算被人拿到，没有密码也拿不走你的钱。'],
        ['怎么导进钱包？', '0x 开头的地址 → MetaMask：添加账户或硬件钱包 → 导入账户 → 选择类型「JSON 文件」→ 选 my-keystore.json → 输密码。 T 开头的地址 → TronLink：添加钱包 → TRON-导入钱包 → 通过 Keystore 文件导入 → 选 my-keystore.txt（TronLink 只收 .txt）→ 输密码。'],
        ['怎么保管？', '文件和密码分开放（比如文件存 U 盘，密码写在纸上）。两样都在，钥匙就在。只丢了一样：铸好之后 30 天内，还可以用 my-secret-s.json 和订单号重新取货、重新合成、重新导出。'],
      ],

      s6head: '交个收条',
      s6desc: '用刚合成的完整钥匙给一句话签个名交回来。平台手上没有你的那一半，这个签名平台自己造不出来 —— 收到就等于双方都认这一单交付完成了。',
      net6: '🌐 这一步要联网。为什么：要把「我拿到了」的签名交给平台，这一单才算结清。不交也不影响你已经拿到的钥匙。',
      receiptBtn: '签收条并提交',
      receiptSkip: '可以不交，不影响你已经拿到的钥匙。交了这一单算结清，结清之后你仍然可以随时免费重新下载同一个 b；还送你一个月实时防投毒提醒。',
      receiptOk: '收条收到了，这一单结清。',
      perkOk: '送你一个月实时防投毒提醒（个人档，最多盯 5 个波场地址）：点下面这个链接，在官方机器人里领（一单一次）。',
      perkLink: '领首月实时提醒 ↗',
      receiptBad: '签不出来 —— 手上的 b 跟这张收条对不上。',
      noReceipt: '还没有收条可签，先完成上一步。',
      copied: '已复制 ✓',
      keepId: (id) => '记下订单号 ' + id + '：关了页面也能在下面「我的订单」里接着做，换电脑就输这个号。',
      needSecForTake: '取货要用你那半把钥匙签名 —— 请先在第 1 步选回你的 my-secret-s.json。',
      secBack: '钥匙装回来了，可以取货。',
      resuming: (id, pat, ch) => '正在接着做订单 ' + id + '（' + pat + ' · ' + ch + '）。第 1、2 步已经做过了。',
      pickSecForResume: '你那半把钥匙不在这个页面里了（关过页面就会这样）。取货之前，请在下面「刷新过页面？」那里选回 my-secret-s.json。',
      watchingAgain: '继续盯着到账 / 铸造进度…',
      orderClosed: (st) => '这一单已经是「' + st + '」，不能再往下做了。',
      badId: '订单号是 8 位（0-9 和 a-f）。',
      noSuchOrder: '找不到这个订单号。',
      resumeHint: (pat, amt) => '这张单：' + pat + ' · ' + amt + ' USDT',
    },
    // 难度/价格表
  },
  en: {
    posPrefix: 'Prefix', posSuffix: 'Suffix', posBoth: 'Both ends',
    thType: 'Type', thPrice: 'Price USDT', thEta: 'Mint time',
    catalogOpen: 'See all prices',  catalogTitle: 'Price list',
    catalogTeaser: (on, off) => 'Two chains · ' + on + ' tiers on sale' + (off ? ' (' + off + ' more not supported by the minter yet)' : ''), 
    catalogDown: 'Price list unavailable right now — better to show nothing than a table that may be out of date.',
    kindPrefix: 'Prefix', digits: 'digits', sellLens: 'sellable lengths: ',
    onlyKinds: (k) => 'Currently on sale: ' + k + '. Suffix, both-ends and pattern-based pricing are not implemented — anything not in this table cannot be ordered.',
    noteHot: 'Hot patterns (9999/8888/0000/dead/beef/c0ffee/666…) +30-100%. 0x9999 is as hard as 0xabcd — price by length, not by characters.',
    safeTitle: '[SAFE] CUSTOM ZONE · NON-CUSTODIAL',
    safeBody: 'All we ever hold is your shadow A and the other half, b. Those two together still cannot produce your private key - it only ever gets assembled on your own computer.',
    noteProto: 'Prototype note: this page talks to the real platform; only payment is simulated. Your half of the key is created and used only on your own computer.',
    noteProtoLive: 'This page talks to the real platform: ordering, minting, delivery and payment are all real. Your half of the key is created and used only on your own computer - the platform never sees it.',
    heroTag: 'VANITY ADDRESS MINT · NON-CUSTODIAL SPLIT-KEY',
    kdYou: 'Your half', kdYouSub: 'only on your computer', kdOurs: 'Our half', kdOursSub: 'found by our GPUs', kdKey: 'Your full key', kdKeySub: 'put together only on your computer',
    kdCap: 'We only ever hold your shadow A and b - even together they cannot make your key.',
    evmSum: 'One 0x address works on every Ethereum-type chain',
    proofSum: 'How you can check this yourself',
    routeHead: 'Download it, open it, follow 6 steps:',
    route: [['Make key', 'offline'], ['Order', 'pick a pattern'], ['Pay', 'BSC USDT'], ['Minting', 'our GPUs'], ['Collect & build', 'offline'], ['Receipt', 'one signature']],
    routeLine: ['Make half a key on your computer; only its public shadow goes out.', 'Pick your pattern and order; the page signs to prove the key is yours.', 'Send USDT on BSC to this order\'s own address.',
      'Our GPUs search with your shadow for the address you want.', 'Collect b, go offline, and join the halves into your full key.', 'Sign a receipt with your new key - the order is settled.'],
    routeMore: 'Show details',
    dlMore: 'Why download it?',
    footMore: 'More',
    heroCta: 'Start minting →',
    navPpt: 'How it works · 6 steps',
    navWp: 'White paper',
    navVanity: 'Vanity Wallet', navContract: 'Vanity Contract', navToken: 'Token Address', navFree: 'Free Generator',
    ecb1: 'Scam alerts →', ecb2: 'Vanity Wallet ↓', ec3a: 'Vanity Contract →', ec3b: 'Token Address →',
    heroEvm: '0x vanity addresses: the same private key gives the same address on Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche C-Chain and other Ethereum-type chains - buy one, use it on all of them. Funds on each chain are kept separately, so pick the right chain when you send.',
    hereBig: 'You are on: Vanity Wallet (for individuals and merchants)',
    cmpHead: 'Three minting pages - make sure you are on the right one:',
    cmpWhat: 'What', cmpWhat1: 'Your own wallet address', cmpWhat2: 'The address of a contract you deploy', cmpWhat3: 'The contract address of a token you issue',
    cmpFor: 'For', cmpFor1: 'Individuals, merchants', cmpFor2: 'Project teams', cmpFor3: 'Token issuers, launch platforms',
    cmpKey: 'Keys', cmpKey1: 'Only you hold the key (you make half, we compute the other half)', cmpKey2: 'No keys at all (we only compute a salt)', cmpKey3: 'No keys at all (we only compute a salt)',
    cmpEvm: 'Across EVM chains', cmpEvm1: 'Same address (same key)', cmpEvm2: 'Same address (CreateX)', cmpEvm3: 'Same address (CreateX)',
    cmpWhere: 'Where',
    ticker: ["We don't ask for your trust - we give you proof.", 'Your private key never leaves your computer - every message sent to us is listed for you.', 'This page = the public copy on GitHub, byte for byte - verify it yourself.'],
    tickerSr: "We don't ask for your trust - we give you proof.",
    gsEvm0: '0x0000000000 · prefix 10', gsEvm8: '0x8888888888 · prefix 10', gsTron: 'TXooooo… · TRON prefix 6',
    footTrack: 'Track an order',
    footPartners: 'Partners',
    footVerify: 'Verification · payment cards',
    footAlerts: 'Paid alerts',
    foot1: 'page code published on GitHub, verifiable byte for byte · custom zone non-custodial · USDT on BSC (BEP20) only',
    proof1: 'Your half of the key is created on your own computer and only ever stored there. The platform only receives a public key (public, like a bank account number) and signatures (proof that you hold your half, without revealing it). Everything the minting page says to the platform is listed at its bottom under "Every word this page said to the platform" - check it yourself.',
    proof2: '"Make key" needs no network: switch off Wi-Fi before clicking and it still works.',
    proof3: 'This page is a single file, byte-for-byte identical to the copy published on GitHub. GitHub\'s machines download the live page every hour and compare fingerprints, and run the whole flow in a real browser on every new version to check that no private key is sent - we cannot touch either check.',
    proofVer: 'page version',
    proofGh: 'Verify on GitHub',
    dlHead: 'Mint on your own computer',
    dlWhy: 'Minting a vanity address involves your private key. To keep that key on your own computer from start to finish, making the key, ordering, collecting and building the key all happen in a page you download to your computer - not on this website.',
    dlStep1: 'Click the button below to download the minting page (a single file: 0x000000000.html).',
    dlStep2: 'Double-click it on your computer to open it (Chrome or Edge).',
    dlStep3: 'Follow its 6 steps. Each step tells you in plain words whether to go offline or stay online, and why.',
    dlGetBtn: 'Download the minting page',
    dlNote: 'The downloaded file stays in your hands - we can never change it afterwards. It is byte-for-byte identical to the copy published on GitHub, so you can check it yourself ("Verify on GitHub" above).',
    dlResume: (id) => 'To continue order ' + id + ': open the minting page on your computer and enter this order number at the bottom.',
    refBanner: (c) => 'Referral code ' + c + ' is saved: the minting page you download with the button below fills it in for you (step 2).',
    refCopy: 'Copy code', refCopied: 'Copied',
    netGuide: 'You are using the minting page downloaded to your own computer. Every step is marked: 🔌 = best done offline, 🌐 = needs the internet. Each step says why.',
    offlineErr: 'You are offline, so this step could not be sent. Reconnect and click again - everything you already did is still here.',
    sentHead: 'Every word this page said to the platform',
    sentNone: 'Nothing said to the platform yet.',
    sentCheck: (n, sHit, kHit, hasS, hasK) => n + ' messages. ' + (hasS ? (sHit ? '⚠ Your half of the key appears ' + sHit + ' times!' : 'Your half of the key: not once ✓') : 'No key made yet') + '   ' + (hasK ? (kHit ? '⚠ The full private key appears ' + kHit + ' times!' : 'Full private key: not once ✓') : 'Full key not built yet') + '   (this page searched everything below, character by character)',
    sentTimes: (n) => ' (' + n + ' times, once every few seconds)',
    sentFailed: ' (not sent: you were offline)',
    sentTech: 'For technical readers: exactly what was sent each time',
    sentGhHead: 'Rather not take this page at its word? GitHub runs two checks on its own machines - we cannot touch them:',
    sentGh1: '1. Private-key leak check: every time this page changes, machines at GitHub walk through all 6 steps in a real browser and check every single thing the page sends. Green ✓ = no key was sent.',
    sentGh2: '2. Tamper patrol: every hour, machines at GitHub download the live page and compare it byte by byte with the published copy. Green ✓ = the live page is the published one, unchanged.',
    sentGhRuns: 'See the check history on GitHub ↗',
    sentGhRepo: 'See the published page code ↗',
    sent: {
      catalog: 'read the price list - carried nothing of yours',
      check: 'free check of an address - carried the address you pasted (the platform stores and logs nothing)',
      health: 'checked the platform is online - carried nothing of yours',
      create: 'order - told the platform which chain, which pattern and which payment chain (and the referral code, if you filled one in)',
      share: 'handed in the "shadow" - a public number (like a bank account number) plus a signature proving you hold your half; the key itself was not sent',
      payment: 'asked for the payment address - carried nothing of yours',
      status: 'asked for progress - carried nothing of yours',
      paysim: 'test-only simulated payment - carried nothing of yours',
      download: 'collect - carried a signature proving it is you',
      receipt: 'receipt - carried a signature proving you got it',
      leave: 'said why you are not paying - carried only the one word you tapped (no order number)',
      voucher: 'voucher - carried only the code you typed',
      other: 'other',
    },
    foot2: 'The platform will never ask for your private key or backup file - any message asking for keys is phishing.',
    footNever: '0x000000000 will never ask you to connect your wallet, to sign or approve anything for us in a wallet app, or to send us money to "verify". Anyone who asks is fake.',
    footSign: 'The minting page signs a few times inside the page (placing the order, collecting, filing the receipt), with the key made and built for that order on your own computer. It signs a short proof text - never a transfer, never an approval - only to prove the order is yours.',
    footOne: 'The only official website: 0x 000 000 000 .com (nine zeros after 0x) · 0x000000000 has not issued any token · bookmark it and always come in from the bookmark.',
    footShort: '0x000000000 never asks for your private key, a wallet connection, a signature or a payment to "verify" - anyone who does is fake. Official:',
    footBot: 'The only official bot: @OxOOOOOOOOObot on Telegram (every O is the letter O, not a zero). Send it a website or a @username and it tells you whether it is ours; send it an address (TRON or EVM 0x…) and it checks it for poisoning.',
    thOrder: 'Order', thPattern: 'Pattern', thStatus: 'Status', thPrice2: 'Price USDT',
    boot: [
      'Windows PowerShell',
      'Copyright (C) 0x000000000. All rights reserved.',
      '',
      '0x000000000 — VANITY ADDRESS MINT',
      'split-key non-custodial vanity minting',
      'vessel: 0x000000000 · mission: mint vanity keys · orbit: LEO',
      '',
      'loading: [ok] keccak256   [ok] secp256k1   [ok] BEP20 watcher',
      'GPU pool: standby (Vast.ai / RunPod · order-driven scaling)',
      '',
      'commands: Get-VanityCatalog | New-VanityOrder | Get-MyOrders',
    ],
    ordersEmpty: 'No orders yet', ordersDown: 'Could not load your orders - refresh to try again',
    ordersResume: 'Continue', thAction: 'Action', ordersIdPh: 'order number (8 chars)', ordersIdBtn: 'Continue this order',
    ordersIdLbl: 'On another computer or browser? Enter the order number to continue:',
    statusTxt: (s) => 'order ' + (orderState.orderId || '-') + ' · status: ' + s,
    flow: {
      netTag: ['🔌 best offline', '🌐 online', '🌐 online', '🌐 stay online', '🌐 collect → 🔌 build offline', '🌐 online'], why: 'why',
      chainLbl: 'Which chain', posLbl: 'Where the pattern goes',
      prePh: 'start', sufPh: 'end',
      s1head: 'Make a key only you hold',
      s1desc: 'This runs entirely on your own computer; the platform receives none of it. It splits one key in two: one half stays with you (below: "your half"), and the "shadow" of the other half goes to the platform. The shadow cannot be turned back into your half - so the complete private key can only ever appear on your computer.',
      net1: '🔌 Best done offline: unplug the network cable or turn off Wi-Fi first, then click "Make key". Why: this step creates your half of the key; while offline, this page could not send anything out even if it tried. Reconnect afterwards for step 2.',
      genBtn: 'Make my key',
      genOk: 'Key created. The backup file my-secret-s.json is in your downloads folder. You can go back online now for step 2.',
      genKeep: 'Keep that file. Lose it and this address is gone for good - we cannot recover it either. Put a second copy on a USB stick or another machine.',
      reloadLbl: 'Reloaded the page? Pick your my-secret-s.json back',
      fileOk: (pat, ch) => 'Loaded your backup: ' + pat + ' (' + ch + '). You can order now.',
      keyKept: (pat, ch) => 'Your key is still here (' + pat + ' · ' + ch + ') - switching the language does not touch it. You can place the order.',
      fileBad: 'That file could not be read. Try another one.',
      noCore: 'The key module did not load. Refresh the page and try again.',
      noTier: 'That length has no price yet - pick another length.',
      offlineHint: 'You are offline, so prices are not shown - you can still make the key. Prices appear by themselves once you reconnect.',
      suggest: 'suggested', notPriced: 'price not set yet',
      soon: 'this tier has no price yet - not taking orders',
      posSoon: 'not supported yet',
      cantMint: 'The minting machine cannot make this kind yet, so it is not on sale - taking payment without being able to deliver is worse than not selling.',
      patOk2: (usdt, t) => 'Available - ' + usdt + ' USDT - ready in about ' + t,

      s2head: 'Place the order',
      s2desc: 'One click. The page does three things for you: creates the order and receives a random phrase from the platform; signs that phrase with your half of the key to prove it is really yours (so nobody can use the platform GPUs for free); hands in the shadow and the signature. The signature is also computed on your computer.',
      net2: '🌐 Needs the internet. Why: the platform has to receive your pattern, chain and payment choice before it can open the order and give you a payment address. Only those go out, plus the shadow and a signature - never the key itself (check it yourself in "Every word this page said to the platform" at the bottom).',
      create: 'Place order',
      created: 'Order created, number',
      signing: 'Signing with your half of the key (on this machine)...',
      shareOk: 'Signature accepted. All we received is shadow A - your half never left this computer.',
      needGen: 'Do the step above first and make your key.',

      s3head: 'Pay',
      s3desc: 'Prototype mode: one click counts as paid, no real transfer.',
      s3descLive: 'The address below belongs to this order only. Send exactly that amount of USDT from your own wallet, on the chain named above.',
      net3: '🌐 Needs the internet. Why: you send USDT from your exchange or wallet to the address below, and this page has to be online to see the payment arrive.',
      payChainLbl: 'Pay with',
      refLbl: 'Referral code (optional)', refPh: '6 characters, e.g. AB23CD',
      refFrom: (c) => 'Referral code ' + c + ' came with the referral link; change it or clear it if it is not right.',
      refBad: 'A referral code has 6 characters: digits 2-9 and letters (no 0, 1, I or O) - check for a typo, or leave it empty.',
      payChainOffline: 'Not online yet, so the payment options have not loaded - once you are back online, click here and every available chain will show up.',
      payPickNow: 'Payment options just loaded (you were offline): pick the chain you want to pay on above, then click "Place order" again.',
      payInfo2: (a, amt, c, net) => 'Send ' + amt + ' USDT over ' + net + ' to  ' + a + '   - then ' + c + ' confirmations',
      copyAddr: 'Copy address',
      vchAsk: 'Have a voucher?', vchBtn: 'Apply',
      vchPart: (h, c, d) => 'Voucher ' + h + ' applied: ' + c + ' USDT off, ' + d + ' USDT left to pay',
      vchFull: 'Fully covered by the voucher - nothing to pay',
      pay: 'Count it as paid (prototype)', payLive: 'Sent it - start watching',
      payNote: 'Every order gets its own address and that is how we match payments, so never reuse another order\'s address. The page moves on by itself - no refresh needed. You can also close it and come back through "My orders" below.',
      leaveAsk: 'Not going to pay? Tap a reason (optional - only that one word is sent, no order number):',
      leaveOpt: { price: 'Too expensive', confusing: 'Hard to follow', trust: 'Not sure it is safe', browsing: 'Just looking' },
      leaveThanks: 'Got it, thank you - we will use it to improve.',
      paying: 'Simulating payment...', payingLive: 'Watching that address (every 2.5s)...',
      watching: 'Watching that address on-chain...',
      mint4Wait: (d) => 'Waiting for your payment to land - ' + d + ' so far. It usually shows up within a minute of sending; this line changes by itself when it does.',
      mint4WaitLong: (id) => 'Over 10 minutes and no payment seen yet: check that you sent on the chain named above, to that address, that exact amount. If all of it is right, do not send again - send us order number ' + id + ' and we will check the chain.',
      mint4Part: (got, want, left) => 'Received ' + got + ' USDT so far - ' + left + ' USDT to go (total ' + want + '). Send the rest to the same address; payments are added up, and this line changes by itself once it is complete.',
      mint4Paid: 'Payment received - minting starts now...',
      mint4Run: (d) => 'Minting - running for ' + d,
      mint4RunNote: 'The GPU tries candidates one after another until an address starts or ends with exactly what you asked for. This page asks for progress every 2.5 seconds and this line changes by itself when it is done.',
      mint4Done: (d) => 'Minted' + (d ? ' (this order took ' + d + ')' : '') + ' ✓',
      mint4Next: 'Go down to step 5 to collect it.',
      dur: (h, m, sec) => (h ? h + 'h ' + String(m).padStart(2, '0') + 'm' : (m ? m + 'm ' + String(sec).padStart(2, '0') + 's' : sec + 's')),
      payConfirmN: (n) => 'After it lands it needs ' + n + ' confirmations.',

      s4head: 'We are starting to mint',
      s4desc: 'We take your shadow A and keep trying until an address turns up whose start or end is exactly what you asked for. All we hold throughout is A, which cannot produce your private key.',
      net4: '🌐 Stay online and keep this page open. Why: the platform GPUs are working on your address, and this page asks for progress every few seconds. Closing it is fine - continue later with the order number at the bottom.',
      mineHit: 'Found: ', readyToTake: 'Ready to collect.',

      s5head: 'Collect: join the two halves',
      s5desc: 'The platform hands you the other half (called b). Click "Collect" to fetch it, then "Build my key" - your computer joins the two halves into the complete private key and immediately checks the address is the one you bought; if it is not, exporting is blocked.',
      net5: 'First 🌐 go online and click "Collect"; once you see "Got it", you can go 🔌 offline and click "Build my key" and "Export wallet file". Why: the complete private key appears for the first time at that moment - build it offline and it can only stay on your computer.',
      dlBtn: 'Collect (needs internet)',
      mergeBtn: 'Build my key (can be offline)',
      gotB: 'Got it. You can go offline now (unplug or turn off Wi-Fi), then click "Build my key".',
      mergeOk: 'Joined, address verified. The complete private key now exists only on this computer.',
      evmTwin: (a) => 'The same key written the Ethereum / BSC way is ' + a + '. MetaMask only shows this 0x form; to see the T address, import it into a TRON wallet such as TronLink.',
      hitWord: 'matched',
      addrMatch: 'Matches the address you bought.',
      addrDiff: (a) => 'Mismatch. We delivered ' + a + ' - do not export; send us a screenshot of this.',
      mergeBad: (want, ch) => 'None of the candidates match your ' + want + ' (' + ch + ') - the b we sent is wrong. Do not export; send us a screenshot of this.',
      pwLbl: 'Set a password for the wallet file (at least 8 characters)', pwPh: 'password', pw2Ph: 'type it again',
      ksBtn: 'Export wallet file',
      pwShort: 'At least 8 characters. Lose this password and the exported file can never be opened.',
      pwDiff: 'The two passwords do not match - type them again.',
      noSubtle: 'This browser does not allow the encryption the wallet file needs. Open this page in Chrome or Edge and try again.',
      ksWork: 'Encrypting... (deliberately slow, so brute-forcing the password is slow too) ',
      ksOk: (name, tron) => 'Exported: ' + name + ' (in your downloads folder). ' + (tron
        ? 'Import into TronLink: Add Wallet - TRON - Import Wallet - Import via Keystore File - pick ' + name + ' - enter the password. '
        : 'Import into MetaMask: Add account or hardware wallet - Import account - Select type: JSON File - pick ' + name + ' - enter the password. ')
        + 'Keep the file and the password in separate places - with both, you have your key. A plain-words guide to the file is below.',
      ksFail: 'Encryption failed: ',
      ksGuideHead: 'What is this wallet file? Why does it open without a password? Where is the key? How do I import it? (tap to read)',
      ksGuide: [
        ['In one line', 'Wallet file = your private key + a lock. The key to the lock is the password you just set.'],
        ['Why does it open without a password?', 'The file itself is plain text - anyone can open it and look. What is locked is the private key inside: opening the file only shows the scrambled, locked version, which is useless without the password. Your wallet asks for the password when you import the file.'],
        ['What are all those lines?', 'address = your address (for TRON it is written in hex starting with 41 - the same address as your T… one, spelled the way TronLink reads it) · ciphertext = your private key, locked · iv, salt = random numbers the lock uses · mac = lets the wallet check the password · kdf, n, r, p = how hard the lock is to force (deliberately slow) · id, version = file number and format version · readme = this explanation. Apart from address, none of those long strings is an address or a key.'],
        ['Which line is the private key?', 'None of them in plain form - it is locked inside ciphertext. That is exactly what makes the file safe: even if someone gets the file, without the password they cannot take your funds.'],
        ['How do I import it?', 'Addresses starting with 0x → MetaMask: Add account or hardware wallet - Import account - Select type: JSON File - pick my-keystore.json - enter the password. Addresses starting with T → TronLink: Add Wallet - TRON - Import Wallet - Import via Keystore File - pick my-keystore.txt (TronLink only accepts .txt) - enter the password.'],
        ['How do I keep it safe?', 'Keep the file and the password in different places (for example the file on a USB stick, the password on paper). With both, you have your key. Lost one of them? Within 30 days of minting you can collect again with my-secret-s.json and the order number, rebuild the key and export a new file.'],
      ],

      s6head: 'Send a receipt',
      s6desc: 'Sign one phrase with the key you just built. The platform does not hold your half, so it could not forge this signature - receiving it means both sides agree the order is delivered.',
      net6: '🌐 Needs the internet. Why: the "I got it" signature has to reach the platform to settle the order. Skipping it does not affect the key you already have.',
      receiptBtn: 'Sign and send receipt',
      receiptSkip: 'Optional. Skipping it does not affect the key you already hold. Filing it settles the order, and you can still re-download the same b for free afterwards; it also gets you a free month of real-time poisoning alerts.',
      receiptOk: 'Receipt filed - order settled.',
      perkOk: 'A free month of real-time poisoning alerts (Personal plan, up to 5 TRON addresses): open the link below and claim it in the official bot (once per order).',
      perkLink: 'Claim the free month ↗',
      receiptBad: 'Cannot sign - the b on hand does not match this receipt.',
      noReceipt: 'No receipt to sign yet - finish the step above.',
      copied: 'Copied',
      keepId: (id) => 'Keep your order number ' + id + ': you can close this page and continue from "My orders" below, or enter this number on another computer.',
      needSecForTake: 'Collecting needs a signature from your half of the key - pick your my-secret-s.json in step 1 first.',
      secBack: 'Your key half is loaded - you can collect now.',
      resuming: (id, pat, ch) => 'Continuing order ' + id + ' (' + pat + ' - ' + ch + '). Steps 1 and 2 are already done.',
      pickSecForResume: 'Your half of the key is no longer in this page (closing it does that). Before collecting, pick your my-secret-s.json under "Reloaded the page?" below.',
      watchingAgain: 'Watching for payment / minting progress again...',
      orderClosed: (st) => 'This order is "' + st + '" and cannot go any further.',
      badId: 'Order numbers are 8 characters (0-9 and a-f).',
      noSuchOrder: 'No order with that number.',
      resumeHint: (pat, amt) => 'This order: ' + pat + ' - ' + amt + ' USDT',
    },
  },
  // IDLANG0X_20260928：DSJ「增加印尼文」。键、函数参数跟 en 一一对应（i18n-id.test 逐个比：少一个键、多一个参数、夹一个汉字都红）。
  //   用词：vanity address = alamat cantik（跟印尼人熟的「nomor cantik」一个意思）· 铸造 = cetak（mencetak）· 私钥 = kunci privat ·
  //   影子 = bayangan · 投毒 = peracunan alamat。不用 menambang / tambang（挖）、rumus（公式）、varian。
  id: {
    posPrefix: 'Awalan', posSuffix: 'Akhiran', posBoth: 'Kedua ujung',
    thType: 'Jenis', thPrice: 'Harga USDT', thEta: 'Waktu cetak',
    catalogOpen: 'Lihat semua harga',  catalogTitle: 'Daftar harga',
    catalogTeaser: (on, off) => 'Dua jaringan · ' + on + ' tingkat dijual' + (off ? ' (' + off + ' lagi belum didukung mesin cetak)' : ''),
    catalogDown: 'Daftar harga sedang tidak tersedia — lebih baik tidak menampilkan apa-apa daripada tabel yang mungkin sudah usang.',
    kindPrefix: 'Awalan', digits: 'karakter', sellLens: 'panjang yang dijual: ',
    onlyKinds: (k) => 'Saat ini yang dijual: ' + k + '. Akhiran, kedua ujung, dan harga berdasarkan pola belum tersedia — yang tidak ada di tabel ini tidak bisa dipesan.',
    noteHot: 'Pola populer (9999/8888/0000/dead/beef/c0ffee/666…) +30-100%. 0x9999 sama sulitnya dengan 0xabcd — harga ditentukan oleh panjang, bukan oleh karakternya.',
    safeTitle: '[AMAN] ZONA KUSTOM · NON-KUSTODIAL',
    safeBody: 'Yang pernah kami pegang hanyalah bayangan A milik Anda dan separuh lainnya, b. Keduanya digabung pun tetap tidak bisa menghasilkan kunci privat Anda - kunci itu hanya pernah dirakit di komputer Anda sendiri.',
    noteProto: 'Catatan prototipe: halaman ini terhubung ke platform sungguhan; hanya pembayarannya yang disimulasikan. Separuh kunci Anda dibuat dan dipakai hanya di komputer Anda sendiri.',
    noteProtoLive: 'Halaman ini terhubung ke platform sungguhan: pemesanan, pencetakan, pengiriman, dan pembayaran semuanya nyata. Separuh kunci Anda dibuat dan dipakai hanya di komputer Anda sendiri - platform tidak pernah melihatnya.',
    heroTag: 'CETAK ALAMAT CANTIK · KUNCI TERBELAH, NON-KUSTODIAL',
    kdYou: 'Separuh Anda', kdYouSub: 'hanya di komputer Anda', kdOurs: 'Separuh kami', kdOursSub: 'ditemukan kartu grafis kami', kdKey: 'Kunci lengkap Anda', kdKeySub: 'dirakit hanya di komputer Anda',
    kdCap: 'Yang kami pegang hanya bayangan A milik Anda dan b - digabung pun tetap tidak bisa menjadi kunci Anda.',
    evmSum: 'Satu alamat 0x berlaku di semua jaringan tipe Ethereum',
    proofSum: 'Cara Anda memeriksanya sendiri',
    routeHead: 'Unduh, buka, ikuti 6 langkah:',
    route: [['Buat kunci', 'offline'], ['Pesan', 'pilih pola'], ['Bayar', 'BSC USDT'], ['Pencetakan', 'kartu grafis kami'], ['Ambil & rakit', 'offline'], ['Tanda terima', 'satu tanda tangan']],
    routeLine: ['Buat separuh kunci di komputer Anda; hanya bayangan publiknya yang keluar.', 'Pilih pola lalu pesan; halaman menandatangani untuk membuktikan kunci itu milik Anda.', 'Kirim USDT di BSC ke alamat khusus pesanan ini.',
      'Kartu grafis kami mencari alamat yang Anda mau dengan bayangan Anda.', 'Ambil b, putuskan internet, lalu gabungkan kedua separuh menjadi kunci lengkap.', 'Tanda tangani tanda terima dengan kunci baru Anda - pesanan selesai.'],
    routeMore: 'Lihat detail',
    dlMore: 'Kenapa harus diunduh?',
    footMore: 'Selengkapnya',
    heroCta: 'Mulai cetak →',
    navPpt: 'Cara kerja · 6 langkah',
    navWp: 'Whitepaper',
    navVanity: 'Dompet Cantik', navContract: 'Kontrak Cantik', navToken: 'Alamat Token', navFree: 'Generator Gratis',
    ecb1: 'Peringatan penipuan →', ecb2: 'Dompet Cantik ↓', ec3a: 'Kontrak Cantik →', ec3b: 'Alamat Token →',
    heroEvm: 'Alamat cantik 0x: kunci privat yang sama menghasilkan alamat yang sama di Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche C-Chain, dan jaringan tipe Ethereum lainnya - beli satu, pakai di semuanya. Dana di tiap jaringan dicatat terpisah, jadi pilih jaringan yang benar saat mengirim.',
    hereBig: 'Anda sedang di: Dompet Cantik (untuk perorangan dan pedagang)',
    cmpHead: 'Tiga halaman cetak - pastikan Anda di halaman yang benar:',
    cmpWhat: 'Apa', cmpWhat1: 'Alamat dompet Anda sendiri', cmpWhat2: 'Alamat kontrak yang Anda deploy', cmpWhat3: 'Alamat kontrak token yang Anda terbitkan',
    cmpFor: 'Untuk', cmpFor1: 'Perorangan, pedagang', cmpFor2: 'Tim proyek', cmpFor3: 'Penerbit token, platform peluncuran',
    cmpKey: 'Kunci', cmpKey1: 'Hanya Anda yang memegang kunci (Anda membuat separuh, kami menghitung separuh lainnya)', cmpKey2: 'Tanpa kunci sama sekali (kami hanya menghitung salt)', cmpKey3: 'Tanpa kunci sama sekali (kami hanya menghitung salt)',
    cmpEvm: 'Di jaringan EVM', cmpEvm1: 'Alamat sama (kunci sama)', cmpEvm2: 'Alamat sama (CreateX)', cmpEvm3: 'Alamat sama (CreateX)',
    cmpWhere: 'Di mana',
    ticker: ['Kami tidak meminta kepercayaan Anda - kami memberi bukti.', 'Kunci privat Anda tidak pernah meninggalkan komputer Anda - setiap pesan yang dikirim ke kami ditampilkan untuk Anda.', 'Halaman ini = salinan publik di GitHub, byte demi byte - periksa sendiri.'],
    tickerSr: 'Kami tidak meminta kepercayaan Anda - kami memberi bukti.',
    gsEvm0: '0x0000000000 · awalan 10', gsEvm8: '0x8888888888 · awalan 10', gsTron: 'TXooooo… · awalan TRON 6',
    footTrack: 'Lacak pesanan',
    footPartners: 'Mitra',
    footVerify: 'Verifikasi · kartu pembayaran',
    footAlerts: 'Peringatan berbayar',
    foot1: 'kode halaman dipublikasikan di GitHub, bisa dicek byte demi byte · zona kustom non-kustodial · pembayaran hanya USDT di BSC',
    proof1: 'Separuh kunci Anda dibuat di komputer Anda sendiri dan hanya pernah disimpan di sana. Platform hanya menerima kunci publik (terbuka, seperti nomor rekening bank) dan tanda tangan (bukti bahwa Anda memegang separuh itu, tanpa membukanya). Semua yang dikatakan halaman cetak kepada platform tercantum di bagian bawahnya, di "Setiap kata yang dikirim halaman ini ke platform" - periksa sendiri.',
    proof2: '"Buat kunci" tidak butuh internet: matikan Wi-Fi sebelum mengklik, dan tetap berhasil.',
    proof3: 'Halaman ini adalah satu file, identik byte demi byte dengan salinan yang dipublikasikan di GitHub. Mesin GitHub mengunduh halaman live setiap jam dan membandingkan sidik jarinya, serta menjalankan seluruh alur di browser sungguhan pada setiap versi baru untuk memastikan tidak ada kunci privat yang dikirim - kami tidak bisa menyentuh kedua pemeriksaan itu.',
    proofVer: 'versi halaman',
    proofGh: 'Periksa di GitHub',
    dlHead: 'Cetak di komputer Anda sendiri',
    dlWhy: 'Mencetak alamat cantik melibatkan kunci privat Anda. Agar kunci itu tetap di komputer Anda dari awal sampai akhir, pembuatan kunci, pemesanan, pengambilan, dan perakitan kunci semuanya dilakukan di halaman yang Anda unduh ke komputer - bukan di situs web ini.',
    dlStep1: 'Klik tombol di bawah untuk mengunduh halaman cetak (satu file: 0x000000000.html).',
    dlStep2: 'Klik dua kali di komputer Anda untuk membukanya (Chrome atau Edge).',
    dlStep3: 'Ikuti 6 langkahnya. Setiap langkah memberi tahu dengan bahasa sederhana apakah harus offline atau tetap online, dan alasannya.',
    dlGetBtn: 'Unduh halaman cetak',
    dlNote: 'File yang diunduh tetap di tangan Anda - kami tidak pernah bisa mengubahnya setelah itu. File ini identik byte demi byte dengan salinan yang dipublikasikan di GitHub, jadi Anda bisa memeriksanya sendiri ("Periksa di GitHub" di atas).',
    dlResume: (id) => 'Untuk melanjutkan pesanan ' + id + ': buka halaman cetak di komputer Anda dan masukkan nomor pesanan ini di bagian bawah.',
    refBanner: (c) => 'Kode referal ' + c + ' tersimpan: halaman cetak yang Anda unduh dengan tombol di bawah akan mengisinya otomatis (langkah 2).',
    refCopy: 'Salin kode', refCopied: 'Tersalin',
    netGuide: 'Anda memakai halaman cetak yang diunduh ke komputer sendiri. Setiap langkah ditandai: 🔌 = sebaiknya offline, 🌐 = butuh internet. Setiap langkah menjelaskan alasannya.',
    offlineErr: 'Anda sedang offline, jadi langkah ini tidak bisa dikirim. Sambungkan lagi lalu klik lagi - semua yang sudah Anda lakukan masih ada.',
    sentHead: 'Setiap kata yang dikirim halaman ini ke platform',
    sentNone: 'Belum ada yang dikirim ke platform.',
    sentCheck: (n, sHit, kHit, hasS, hasK) => n + ' pesan. ' + (hasS ? (sHit ? '⚠ Separuh kunci Anda muncul ' + sHit + ' kali!' : 'Separuh kunci Anda: tidak sekali pun ✓') : 'Belum ada kunci yang dibuat') + '   ' + (hasK ? (kHit ? '⚠ Kunci privat lengkap muncul ' + kHit + ' kali!' : 'Kunci privat lengkap: tidak sekali pun ✓') : 'Kunci lengkap belum dirakit') + '   (halaman ini memeriksa semua di bawah, karakter demi karakter)',
    sentTimes: (n) => ' (' + n + ' kali, setiap beberapa detik)',
    sentFailed: ' (tidak terkirim: Anda sedang offline)',
    sentTech: 'Untuk pembaca teknis: persis apa yang dikirim setiap kali',
    sentGhHead: 'Tidak mau percaya begitu saja pada halaman ini? GitHub menjalankan dua pemeriksaan di mesinnya sendiri - kami tidak bisa menyentuhnya:',
    sentGh1: '1. Pemeriksaan kebocoran kunci privat: setiap kali halaman ini berubah, mesin GitHub menjalankan keenam langkah di browser sungguhan dan memeriksa setiap hal yang dikirim halaman. Hijau ✓ = tidak ada kunci yang dikirim.',
    sentGh2: '2. Patroli anti-ubah: setiap jam, mesin GitHub mengunduh halaman live dan membandingkannya byte demi byte dengan salinan yang dipublikasikan. Hijau ✓ = halaman live adalah yang dipublikasikan, tanpa perubahan.',
    sentGhRuns: 'Lihat riwayat pemeriksaan di GitHub ↗',
    sentGhRepo: 'Lihat kode halaman yang dipublikasikan ↗',
    sent: {
      catalog: 'membaca daftar harga - tidak membawa data Anda',
      check: 'cek gratis sebuah alamat - membawa alamat yang Anda tempel (platform tidak menyimpan atau mencatat apa pun)',
      health: 'memeriksa platform online - tidak membawa data Anda',
      create: 'memesan - memberi tahu platform jaringan mana, pola apa, dan jaringan pembayaran mana (serta kode referal, jika Anda mengisinya)',
      share: 'menyerahkan "bayangan" - angka publik (seperti nomor rekening) plus tanda tangan yang membuktikan Anda memegang separuh kunci; kuncinya sendiri tidak dikirim',
      payment: 'meminta alamat pembayaran - tidak membawa data Anda',
      status: 'menanyakan progres - tidak membawa data Anda',
      paysim: 'pembayaran simulasi khusus pengujian - tidak membawa data Anda',
      download: 'ambil - membawa tanda tangan yang membuktikan itu Anda',
      receipt: 'tanda terima - membawa tanda tangan yang membuktikan Anda sudah menerimanya',
      leave: 'alasan Anda tidak membayar - hanya membawa satu kata yang Anda ketuk (tanpa nomor pesanan)',
      voucher: 'voucher - hanya membawa kode yang Anda ketik',
      other: 'lainnya',
    },
    foot2: 'Platform tidak akan pernah meminta kunci privat atau file cadangan Anda - pesan apa pun yang meminta kunci adalah phishing.',
    footNever: '0x000000000 tidak akan pernah meminta Anda menghubungkan dompet, menandatangani atau menyetujui apa pun untuk kami di aplikasi dompet, atau mengirim uang untuk "verifikasi". Siapa pun yang meminta itu adalah palsu.',
    footSign: 'Halaman cetak menandatangani beberapa kali di dalam halaman (saat memesan, mengambil, mengirim tanda terima), dengan kunci yang dibuat dan dirakit untuk pesanan itu di komputer Anda sendiri. Yang ditandatangani hanyalah teks bukti pendek - tidak pernah transfer, tidak pernah persetujuan - hanya untuk membuktikan pesanan itu milik Anda.',
    footOne: 'Satu-satunya situs resmi: 0x 000 000 000 .com (sembilan angka nol setelah 0x) · 0x000000000 tidak pernah menerbitkan token apa pun · simpan di bookmark dan selalu masuk dari bookmark.',
    footShort: '0x000000000 tidak pernah meminta kunci privat Anda, koneksi dompet, tanda tangan, atau pembayaran untuk "verifikasi" - siapa pun yang memintanya palsu. Resmi:',
    footBot: 'Satu-satunya bot resmi: @OxOOOOOOOOObot di Telegram (setiap O adalah huruf O, bukan angka nol). Kirimkan situs web atau @username dan bot akan memberi tahu apakah itu milik kami; kirimkan alamat (TRON atau EVM 0x…) dan bot akan memeriksa apakah alamat itu diracun.',
    thOrder: 'Pesanan', thPattern: 'Pola', thStatus: 'Status', thPrice2: 'Harga USDT',
    boot: [
      'Windows PowerShell',
      'Copyright (C) 0x000000000. All rights reserved.',
      '',
      '0x000000000 — VANITY ADDRESS MINT',
      'cetak alamat cantik · split-key non-kustodial',
      'kapal: 0x000000000 · misi: cetak kunci alamat cantik · orbit: LEO',
      '',
      'memuat: [ok] keccak256   [ok] secp256k1   [ok] BEP20 watcher',
      'GPU: siaga (Vast.ai / RunPod · skala mengikuti pesanan)',
      '',
      'perintah: Get-VanityCatalog | New-VanityOrder | Get-MyOrders',
    ],
    ordersEmpty: 'Belum ada pesanan', ordersDown: 'Pesanan Anda tidak bisa dimuat - muat ulang untuk mencoba lagi',
    ordersResume: 'Lanjutkan', thAction: 'Aksi', ordersIdPh: 'nomor pesanan (8 karakter)', ordersIdBtn: 'Lanjutkan pesanan ini',
    ordersIdLbl: 'Di komputer atau browser lain? Masukkan nomor pesanan untuk melanjutkan:',
    statusTxt: (s) => 'pesanan ' + (orderState.orderId || '-') + ' · status: ' + s,
    flow: {
      netTag: ['🔌 sebaiknya offline', '🌐 online', '🌐 online', '🌐 tetap online', '🌐 ambil → 🔌 rakit offline', '🌐 online'], why: 'kenapa',
      chainLbl: 'Jaringan mana', posLbl: 'Letak polanya',
      prePh: 'awal', sufPh: 'akhir',
      s1head: 'Buat kunci yang hanya Anda pegang',
      s1desc: 'Langkah ini berjalan sepenuhnya di komputer Anda sendiri; platform tidak menerima apa pun darinya. Satu kunci dibelah dua: separuh tetap pada Anda (di bawah: "separuh Anda"), dan "bayangan" dari separuh lainnya dikirim ke platform. Bayangan itu tidak bisa diubah kembali menjadi separuh Anda - jadi kunci privat lengkap hanya bisa muncul di komputer Anda.',
      net1: '🔌 Sebaiknya offline: cabut kabel jaringan atau matikan Wi-Fi dulu, lalu klik "Buat kunci saya". Alasannya: langkah ini membuat separuh kunci Anda; saat offline, halaman ini tidak bisa mengirim apa pun keluar walaupun mencoba. Sambungkan lagi sesudahnya untuk langkah 2.',
      genBtn: 'Buat kunci saya',
      genOk: 'Kunci dibuat. File cadangan my-secret-s.json ada di folder unduhan Anda. Sekarang Anda boleh online lagi untuk langkah 2.',
      genKeep: 'Simpan file itu. Kalau hilang, alamat ini hilang untuk selamanya - kami juga tidak bisa memulihkannya. Simpan salinan kedua di USB atau komputer lain.',
      reloadLbl: 'Memuat ulang halaman? Pilih kembali my-secret-s.json Anda',
      fileOk: (pat, ch) => 'Cadangan Anda dimuat: ' + pat + ' (' + ch + '). Sekarang Anda bisa memesan.',
      keyKept: (pat, ch) => 'Kunci Anda masih di sini (' + pat + ' · ' + ch + ') - mengganti bahasa tidak menyentuhnya. Anda bisa memesan.',
      fileBad: 'File itu tidak bisa dibaca. Coba file lain.',
      noCore: 'Modul kunci tidak termuat. Muat ulang halaman dan coba lagi.',
      noTier: 'Panjang itu belum punya harga - pilih panjang lain.',
      offlineHint: 'Anda sedang offline, jadi harga tidak ditampilkan - Anda tetap bisa membuat kunci. Harga muncul sendiri setelah Anda tersambung lagi.',
      suggest: 'disarankan', notPriced: 'harga belum ditetapkan',
      soon: 'tingkat ini belum punya harga - belum menerima pesanan',
      posSoon: 'belum didukung',
      cantMint: 'Mesin cetak belum bisa membuat jenis ini, jadi belum dijual - menerima pembayaran tanpa bisa mengirim barangnya lebih buruk daripada tidak menjual.',
      patOk2: (usdt, t) => 'Tersedia - ' + usdt + ' USDT - siap dalam sekitar ' + t,

      s2head: 'Pesan',
      s2desc: 'Satu klik. Halaman melakukan tiga hal untuk Anda: membuat pesanan dan menerima frasa acak dari platform; menandatangani frasa itu dengan separuh kunci Anda untuk membuktikan bahwa itu benar-benar milik Anda (supaya tidak ada yang memakai GPU platform secara gratis); menyerahkan bayangan dan tanda tangannya. Tanda tangan itu juga dihitung di komputer Anda.',
      net2: '🌐 Butuh internet. Alasannya: platform harus menerima pola, jaringan, dan pilihan pembayaran Anda sebelum bisa membuka pesanan dan memberi alamat pembayaran. Hanya itu yang keluar, ditambah bayangan dan tanda tangan - kuncinya sendiri tidak pernah (periksa sendiri di "Setiap kata yang dikirim halaman ini ke platform" di bagian bawah).',
      create: 'Pesan',
      created: 'Pesanan dibuat, nomor',
      signing: 'Menandatangani dengan separuh kunci Anda (di komputer ini)...',
      shareOk: 'Tanda tangan diterima. Yang kami terima hanya bayangan A - separuh kunci Anda tidak pernah meninggalkan komputer ini.',
      needGen: 'Selesaikan langkah di atas dulu dan buat kunci Anda.',

      s3head: 'Bayar',
      s3desc: 'Mode prototipe: satu klik dihitung sudah bayar, tanpa transfer sungguhan.',
      s3descLive: 'Alamat di bawah hanya untuk pesanan ini. Kirim USDT dengan jumlah persis itu dari dompet Anda sendiri, di jaringan yang disebut di atas.',
      net3: '🌐 Butuh internet. Alasannya: Anda mengirim USDT dari bursa atau dompet Anda ke alamat di bawah, dan halaman ini harus online untuk melihat pembayarannya masuk.',
      payChainLbl: 'Bayar dengan',
      refLbl: 'Kode referal (opsional)', refPh: '6 karakter, mis. AB23CD',
      refFrom: (c) => 'Kode referal ' + c + ' datang bersama tautan referal; ganti atau kosongkan jika tidak benar.',
      refBad: 'Kode referal terdiri dari 6 karakter: angka 2-9 dan huruf (tanpa 0, 1, I, atau O) - periksa salah ketik, atau kosongkan.',
      payChainOffline: 'Belum online, jadi pilihan pembayaran belum termuat - setelah online lagi, klik di sini dan semua jaringan yang tersedia akan muncul.',
      payPickNow: 'Pilihan pembayaran baru saja termuat (tadi Anda offline): pilih jaringan pembayaran di atas, lalu klik "Pesan" lagi.',
      payInfo2: (a, amt, c, net) => 'Kirim ' + amt + ' USDT lewat ' + net + ' ke  ' + a + '   - lalu tunggu ' + c + ' konfirmasi',
      copyAddr: 'Salin alamat',
      vchAsk: 'Punya voucher?', vchBtn: 'Pakai',
      vchPart: (h, c, d) => 'Voucher ' + h + ' dipakai: potongan ' + c + ' USDT, sisa bayar ' + d + ' USDT',
      vchFull: 'Ditanggung penuh oleh voucher - tidak perlu bayar',
      pay: 'Anggap sudah bayar (prototipe)', payLive: 'Sudah kirim - mulai pantau',
      payNote: 'Setiap pesanan punya alamatnya sendiri dan dengan itulah kami mencocokkan pembayaran, jadi jangan pernah memakai alamat pesanan lain. Halaman bergerak sendiri - tidak perlu dimuat ulang. Anda juga bisa menutupnya dan kembali lewat "Pesanan saya" di bawah.',
      leaveAsk: 'Tidak jadi membayar? Ketuk satu alasan (opsional - hanya satu kata itu yang dikirim, tanpa nomor pesanan):',
      leaveOpt: { price: 'Terlalu mahal', confusing: 'Sulit dipahami', trust: 'Ragu apakah aman', browsing: 'Hanya melihat-lihat' },
      leaveThanks: 'Baik, terima kasih - kami akan memakainya untuk perbaikan.',
      paying: 'Menyimulasikan pembayaran...', payingLive: 'Memantau alamat itu (setiap 2,5 detik)...',
      watching: 'Memantau alamat itu di blockchain...',
      mint4Wait: (d) => 'Menunggu pembayaran Anda masuk - sudah ' + d + '. Biasanya muncul dalam satu menit setelah dikirim; baris ini berubah sendiri saat itu terjadi.',
      mint4WaitLong: (id) => 'Sudah lebih dari 10 menit dan belum ada pembayaran yang terlihat: periksa bahwa Anda mengirim di jaringan yang disebut di atas, ke alamat itu, dengan jumlah persis itu. Kalau semuanya benar, jangan kirim lagi - kirimkan nomor pesanan ' + id + ' kepada kami dan kami akan memeriksa blockchain.',
      mint4Part: (got, want, left) => 'Sejauh ini diterima ' + got + ' USDT - kurang ' + left + ' USDT (total ' + want + '). Kirim sisanya ke alamat yang sama; pembayaran dijumlahkan, dan baris ini berubah sendiri begitu lengkap.',
      mint4Paid: 'Pembayaran diterima - pencetakan dimulai sekarang...',
      mint4Run: (d) => 'Sedang dicetak - sudah berjalan ' + d,
      mint4RunNote: 'GPU mencoba kandidat satu per satu sampai ada alamat yang awal atau akhirnya persis seperti yang Anda minta. Halaman ini menanyakan progres setiap 2,5 detik dan baris ini berubah sendiri saat selesai.',
      mint4Done: (d) => 'Selesai dicetak' + (d ? ' (pesanan ini butuh ' + d + ')' : '') + ' ✓',
      mint4Next: 'Turun ke langkah 5 untuk mengambilnya.',
      dur: (h, m, sec) => (h ? h + 'j ' + String(m).padStart(2, '0') + 'm' : (m ? m + 'm ' + String(sec).padStart(2, '0') + 'd' : sec + 'd')),
      payConfirmN: (n) => 'Setelah masuk, perlu ' + n + ' konfirmasi.',

      s4head: 'Kami mulai mencetak',
      s4desc: 'Kami mengambil bayangan A Anda dan terus mencoba sampai muncul alamat yang awal atau akhirnya persis seperti yang Anda minta. Yang kami pegang selama itu hanyalah A, yang tidak bisa menghasilkan kunci privat Anda.',
      net4: '🌐 Tetap online dan biarkan halaman ini terbuka. Alasannya: GPU platform sedang mengerjakan alamat Anda, dan halaman ini menanyakan progres setiap beberapa detik. Menutupnya tidak masalah - lanjutkan nanti dengan nomor pesanan di bagian bawah.',
      mineHit: 'Ditemukan: ', readyToTake: 'Siap diambil.',

      s5head: 'Ambil: gabungkan dua separuh',
      s5desc: 'Platform memberi Anda separuh lainnya (disebut b). Klik "Ambil" untuk mengambilnya, lalu "Rakit kunci saya" - komputer Anda menggabungkan dua separuh itu menjadi kunci privat lengkap dan langsung memeriksa bahwa alamatnya adalah yang Anda beli; kalau bukan, ekspor diblokir.',
      net5: 'Pertama 🌐 online dan klik "Ambil"; setelah muncul "Sudah diterima", Anda boleh 🔌 offline dan klik "Rakit kunci saya" serta "Ekspor file dompet". Alasannya: kunci privat lengkap muncul pertama kali pada saat itu - rakit saat offline dan kunci itu hanya bisa tetap di komputer Anda.',
      dlBtn: 'Ambil (butuh internet)',
      mergeBtn: 'Rakit kunci saya (boleh offline)',
      gotB: 'Sudah diterima. Sekarang Anda boleh offline (cabut kabel atau matikan Wi-Fi), lalu klik "Rakit kunci saya".',
      mergeOk: 'Tergabung, alamat terverifikasi. Kunci privat lengkap sekarang hanya ada di komputer ini.',
      evmTwin: (a) => 'Kunci yang sama ditulis dengan cara Ethereum / BSC adalah ' + a + '. MetaMask hanya menampilkan bentuk 0x ini; untuk melihat alamat T, impor ke dompet TRON seperti TronLink.',
      hitWord: 'cocok',
      addrMatch: 'Cocok dengan alamat yang Anda beli.',
      addrDiff: (a) => 'Tidak cocok. Kami mengirim ' + a + ' - jangan diekspor; kirimkan tangkapan layar ini kepada kami.',
      mergeBad: (want, ch) => 'Tidak ada kandidat yang cocok dengan ' + want + ' (' + ch + ') Anda - b yang kami kirim salah. Jangan diekspor; kirimkan tangkapan layar ini kepada kami.',
      pwLbl: 'Buat kata sandi untuk file dompet (minimal 8 karakter)', pwPh: 'kata sandi', pw2Ph: 'ketik sekali lagi',
      ksBtn: 'Ekspor file dompet',
      pwShort: 'Minimal 8 karakter. Kalau kata sandi ini hilang, file yang diekspor tidak akan pernah bisa dibuka.',
      pwDiff: 'Kedua kata sandi tidak sama - ketik lagi.',
      noSubtle: 'Browser ini tidak mengizinkan enkripsi yang dibutuhkan file dompet. Buka halaman ini di Chrome atau Edge dan coba lagi.',
      ksWork: 'Mengenkripsi... (sengaja lambat, supaya menebak kata sandi juga lambat) ',
      ksOk: (name, tron) => 'Diekspor: ' + name + ' (di folder unduhan Anda). ' + (tron
        ? 'Impor ke TronLink: Add Wallet - TRON - Import Wallet - Import via Keystore File - pilih ' + name + ' - masukkan kata sandi. '
        : 'Impor ke MetaMask: Add account or hardware wallet - Import account - Select type: JSON File - pilih ' + name + ' - masukkan kata sandi. ')
        + 'Simpan file dan kata sandinya di tempat terpisah - dengan keduanya, Anda memegang kunci Anda. Panduan sederhana tentang file ini ada di bawah.',
      ksFail: 'Enkripsi gagal: ',
      ksGuideHead: 'Apa file dompet ini? Kenapa bisa dibuka tanpa kata sandi? Di mana kuncinya? Bagaimana cara mengimpornya? (ketuk untuk membaca)',
      ksGuide: [
        ['Singkatnya', 'File dompet = kunci privat Anda + gembok. Kunci gemboknya adalah kata sandi yang baru Anda buat.'],
        ['Kenapa bisa dibuka tanpa kata sandi?', 'File itu sendiri berupa teks biasa - siapa pun bisa membuka dan melihatnya. Yang digembok adalah kunci privat di dalamnya: membuka file hanya menampilkan versi yang teracak dan terkunci, yang tidak berguna tanpa kata sandi. Dompet Anda meminta kata sandi saat Anda mengimpor file itu.'],
        ['Apa semua baris itu?', 'address = alamat Anda (untuk TRON ditulis dalam hex yang diawali 41 - alamat yang sama dengan alamat T… Anda, dieja seperti yang dibaca TronLink) · ciphertext = kunci privat Anda, terkunci · iv, salt = angka acak yang dipakai gembok · mac = supaya dompet bisa memeriksa kata sandi · kdf, n, r, p = seberapa sulit gembok dibobol (sengaja lambat) · id, version = nomor file dan versi format · readme = penjelasan ini. Selain address, tidak satu pun dari deretan panjang itu adalah alamat atau kunci.'],
        ['Baris mana yang kunci privat?', 'Tidak ada yang dalam bentuk terbuka - kunci itu terkunci di dalam ciphertext. Justru itulah yang membuat file ini aman: meski seseorang mendapatkan filenya, tanpa kata sandi dia tidak bisa mengambil dana Anda.'],
        ['Bagaimana cara mengimpornya?', 'Alamat yang diawali 0x → MetaMask: Add account or hardware wallet - Import account - Select type: JSON File - pilih my-keystore.json - masukkan kata sandi. Alamat yang diawali T → TronLink: Add Wallet - TRON - Import Wallet - Import via Keystore File - pilih my-keystore.txt (TronLink hanya menerima .txt) - masukkan kata sandi.'],
        ['Bagaimana menyimpannya dengan aman?', 'Simpan file dan kata sandi di tempat berbeda (misalnya file di USB, kata sandi di kertas). Dengan keduanya, Anda memegang kunci Anda. Kehilangan salah satunya? Dalam 30 hari setelah dicetak, Anda bisa mengambil lagi dengan my-secret-s.json dan nomor pesanan, merakit ulang kunci, dan mengekspor file baru.'],
      ],

      s6head: 'Kirim tanda terima',
      s6desc: 'Tandatangani satu frasa dengan kunci yang baru Anda rakit. Platform tidak memegang separuh kunci Anda, jadi tidak bisa memalsukan tanda tangan ini - menerimanya berarti kedua pihak sepakat pesanan sudah diterima.',
      net6: '🌐 Butuh internet. Alasannya: tanda tangan "sudah saya terima" harus sampai ke platform untuk menyelesaikan pesanan. Melewatinya tidak memengaruhi kunci yang sudah Anda pegang.',
      receiptBtn: 'Tandatangani dan kirim tanda terima',
      receiptSkip: 'Opsional. Melewatinya tidak memengaruhi kunci yang sudah Anda pegang. Mengirimnya menyelesaikan pesanan, dan setelah itu Anda tetap bisa mengunduh ulang b yang sama secara gratis; Anda juga mendapat satu bulan gratis peringatan real-time peracunan alamat.',
      receiptOk: 'Tanda terima terkirim - pesanan selesai.',
      perkOk: 'Satu bulan gratis peringatan real-time peracunan alamat (paket Personal, hingga 5 alamat TRON): buka tautan di bawah dan klaim di bot resmi (sekali per pesanan).',
      perkLink: 'Klaim bulan gratis ↗',
      receiptBad: 'Tidak bisa menandatangani - b yang ada tidak cocok dengan tanda terima ini.',
      noReceipt: 'Belum ada tanda terima untuk ditandatangani - selesaikan langkah di atas.',
      copied: 'Tersalin',
      keepId: (id) => 'Simpan nomor pesanan Anda ' + id + ': Anda bisa menutup halaman ini dan melanjutkan dari "Pesanan saya" di bawah, atau memasukkan nomor ini di komputer lain.',
      needSecForTake: 'Mengambil butuh tanda tangan dari separuh kunci Anda - pilih my-secret-s.json Anda di langkah 1 dulu.',
      secBack: 'Separuh kunci Anda sudah termuat - sekarang Anda bisa mengambil.',
      resuming: (id, pat, ch) => 'Melanjutkan pesanan ' + id + ' (' + pat + ' - ' + ch + '). Langkah 1 dan 2 sudah selesai.',
      pickSecForResume: 'Separuh kunci Anda sudah tidak ada di halaman ini (menutup halaman menyebabkannya). Sebelum mengambil, pilih my-secret-s.json Anda di "Memuat ulang halaman?" di bawah.',
      watchingAgain: 'Memantau pembayaran / progres cetak lagi...',
      orderClosed: (st) => 'Pesanan ini berstatus "' + st + '" dan tidak bisa dilanjutkan.',
      badId: 'Nomor pesanan terdiri dari 8 karakter (0-9 dan a-f).',
      noSuchOrder: 'Tidak ada pesanan dengan nomor itu.',
      resumeHint: (pat, amt) => 'Pesanan ini: ' + pat + ' - ' + amt + ' USDT',
    },
  }
};

// LANGEN0X_20260924：DSJ「把网页默认成英文」。原来按浏览器语言挑（中文浏览器看中文），开页时也不套词典 ——
//   英文访客看到的其实是 index.html 里写死的中文。现在：默认英文；只有点了「中文 / EN」才记住；开页就把整页套成这个语言。
//   换一个新的键（0xlang2）：以前点过「中文」的人也先看到英文 —— 包括店主自己，不然他看不出默认已经改了。
const LANG_KEY = '0xlang2';
// IDLANG0X_20260928：第三种语言印尼文（id）。同一个开关、同一个记忆；认不出的一律英文。词典里万一少一格，退回英文那一格，不印键名。
let lang = (() => { try { const v = localStorage.getItem(LANG_KEY); return v === 'zh' || v === 'en' || v === 'id' ? v : 'en'; } catch (e) { return 'en'; } })();
const t = (k) => (dict[lang][k] !== undefined ? dict[lang][k] : dict.en[k] !== undefined ? dict.en[k] : k);
// SRVEN0X_20260924：平台下发的字（链名、报错、目录说明）也要跟着语言走。平台给了 xxxEn 就用它；
//   老平台没给就退回原来那句 —— 宁可显示中文，也不许空着。
//   IDLANG0X：印尼文先挑 xxxId，平台没给就退回英文那一句。
const L = (o, k) => { if (!o) return undefined; const pick = (s) => (typeof o[k + s] === 'string' && o[k + s]) || '';
  return (lang === 'id' && (pick('Id') || pick('En'))) || (lang === 'en' && pick('En')) || o[k]; };
const $ = (s) => document.querySelector(s);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- LIVEPAY0X_20260922：真收款模式 ----
   后端 TRON_MODE=live 之后,「模拟支付」那条路会被服务端 400 掉（platform-server.mjs:436）,
   而轮询原本只在模拟支付成功后才启动 —— 于是真转了账页面会一直干等。
   这里做两件事：把 xxxLive 文案顶上去、让「我已转账」直接启动轮询。 */
let IS_LIVE = false;
let HEALTH_OK = false;   // NETSYNC0X_20260924：拿到过 /api/health 没有（断网打开的页面一开始是 false）
function liveSwap(o) {
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    const base = k.endsWith('Live') && k.slice(0, -4);
    if (base && Object.prototype.hasOwnProperty.call(o, base)) o[base] = o[k];
    else liveSwap(o[k]);
  }
}

/* ---- LESSTEXT0X_20260928（少字 B，DSJ 选的）：下载那一块的六步路线 ----
   六步画成一条带图标的路线；点一步，下面一句话 + 「展开细节」（铸造页上那一步的完整说明、为什么断网 / 联网）—— 一个字没删，点开就在。
   图标跟方案页（零九零少字方案）那一套一样；第 5 步是「取货 + 合钥匙」、第 6 步是「交收条」（照铸造页真实的六步，不照示意图）。 */
const ROUTE_IC = [
  '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2"/>',
  '<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  '<circle cx="12" cy="12" r="8"/><path d="M9 9h6M12 9v7"/>',
  '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 10l2 2 4-4"/>',
];
let routeAt = 0;
function renderRoute() {
  const ol = document.getElementById('route'), box = document.getElementById('routeDetail'); if (!ol || !box) return;
  const r = t('route'), line = t('routeLine'), f = t('flow') || {}, n = routeAt + 1;
  ol.innerHTML = r.map((x, i) => '<li><button type="button" class="rt' + (i === routeAt ? ' on' : '') + '" data-rt="' + i + '" aria-pressed="' + (i === routeAt) + '">'
    + '<span class="rt-ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + ROUTE_IC[i] + '</svg></span>'
    + '<span class="rt-no">' + (i + 1) + '</span><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + '</small></button></li>').join('');
  box.innerHTML = '<p><b>' + esc(n + ' · ' + r[routeAt][0]) + '</b> ' + esc(line[routeAt]) + '</p>'
    + '<details class="fold"><summary>' + esc(t('routeMore')) + '</summary><div class="netline">' + esc(f['net' + n] || '') + '</div>'
    + '<div class="step-desc">' + esc(f['s' + n + 'descLive'] || f['s' + n + 'desc'] || '') + '</div></details>';
}
document.addEventListener('click', (e) => {
  const b = e.target && e.target.closest ? e.target.closest('[data-rt]') : null; if (!b) return;
  routeAt = Math.max(0, Math.min(5, Number(b.dataset.rt) || 0)); renderRoute();
});

/* ---- 语言切换 ---- */
// 只换「写死在页面上的字」：开页时跑一次（默认英文靠它），切语言时也跑
function applyStaticLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('#btnZh').classList.toggle('active', lang === 'zh');
  $('#btnEn').classList.toggle('active', lang === 'en');
  $('#btnId').classList.toggle('active', lang === 'id');
  renderRoute();
  if (window.KeyCore && window.KeyCore.setLang) window.KeyCore.setLang(lang);   // keycore 的提示（图案不合法之类）跟着换
  const dr = $('#dlResumeMsg'); if (dr && dr.dataset.order) dr.textContent = t('dlResume')(dr.dataset.order);
  if (typeof renderRef === 'function') renderRef();              // REF0X：推荐码那一句跟着换语言
  tickerRestart();
  if (typeof window.fcLang === 'function') window.fcLang();   // FREECHECK0X_20260928：免费查、快讯自己画出来的字也跟着换
}
function applyLang(save) {
  if (save) { try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} }
  applyStaticLang();
  renderBoot(true);
  renderCatalog();
  renderTeaser();
  renderOrders();
  // LANGKEEP0X_20260924：切语言原来会把六步整个重画 —— 造好的钥匙、下到一半的单全清掉，只能回头选文件、输订单号。
  //   默认英文之后切语言的人会多：手上有进度就接着续（钥匙留在内存里；有订单号就按订单号续到它该在的那一步）。
  const keepSec = orderState.sec, keepId = orderState.orderId;
  renderSteps();
  if (keepId && RESUME) { orderState.sec = keepSec; RESUME(keepId, true); }
  else if (keepSec && KEEPKEY) KEEPKEY(keepSec);
}
$('#btnZh').addEventListener('click', () => { lang = 'zh'; applyLang(true); });
$('#btnEn').addEventListener('click', () => { lang = 'en'; applyLang(true); });
$('#btnId').addEventListener('click', () => { lang = 'id'; applyLang(true); });

/* ---- TICKER0X_20260924：顶栏那一行「打代码」的字 ----
   DSJ「在网页横梁上做一个像打代码出现的一段字，这段字要一直重复的像打代码那样一直闪出来类似跑马灯一直在跑，
   写着『我们不骗取用户信任，我们提供证明！』」。一个字一个字打出来 → 停一下 → 退格删掉 → 打下一句，一直循环；
   主句隔一句出现一次。系统设了「减少动态效果」就只摆主句、不动。页面在后台时不打。 */
const TICKER = { timer: null, gen: 0 };
function tickerRestart() {
  const el = $('#tickerText'); if (!el) return;
  clearTimeout(TICKER.timer); const gen = ++TICKER.gen;
  const lines = t('ticker'), order = [0, 1, 0, 2];
  if (reducedMotion) { el.textContent = lines[0]; return; }
  let li = 0, i = 0, back = false;
  const step = () => {
    if (gen !== TICKER.gen) return;
    if (document.hidden) { TICKER.timer = setTimeout(step, 700); return; }
    const txt = lines[order[li % order.length] % lines.length];
    if (!back) {
      i += 1; el.textContent = txt.slice(0, i);
      if (i >= txt.length) { back = true; TICKER.timer = setTimeout(step, 2600); return; }
      TICKER.timer = setTimeout(step, 34 + Math.floor(Math.random() * 46));
    } else {
      i = Math.max(0, i - 3); el.textContent = txt.slice(0, i);
      if (i === 0) { back = false; li += 1; TICKER.timer = setTimeout(step, 420); return; }
      TICKER.timer = setTimeout(step, 16);
    }
  };
  el.textContent = ''; step();
}

/* ---- 开机自举 ---- */
const bootEl = $('#boot');
let bootDone = false;
function renderBoot(instant) {
  bootDone = true;
  bootEl.innerHTML = '';
  const lines = t('boot');
  if (instant || reducedMotion) {
    bootEl.innerHTML = lines.map(l => esc(l).replace(/\[ok\]/g, '<span class="ok">[ok]</span>')).join('\n');
    return;
  }
  let li = 0;
  const typeLine = () => {
    if (li >= lines.length) return;
    if (li > 0) bootEl.appendChild(document.createTextNode('\n'));
    const div = document.createElement('span');
    bootEl.appendChild(div);
    const txt = lines[li];
    li += 1;
    let i = 0;
    const step = () => {
      if (i < txt.length) {
        div.textContent = txt.slice(0, i + 1);
        i += 1;
        setTimeout(step, li === 1 || li === 2 ? 14 : 2);
      } else { div.innerHTML = esc(txt).replace(/\[ok\]/g, '<span class="ok">[ok]</span>'); setTimeout(typeLine, 40); }
    };
    step();
  };
  typeLine();
}
// ESCNULL0X_20260923：原来是 s.replace(...)，喂进 undefined 就抛 TypeError。
// 后果不是少显示一格，是【renderCatalog 整个挂掉，价目表一行都画不出来】——
// 线上就这么坏着，页面写「价目表暂时取不到」，看起来像后端的锅，其实是前端一个字段没接上。
// 少一个字段就该少显示一格，不该连累整张表。
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ---- 目录表 ---- */
// 唯一价目来源是后端 /api/catalog。前端【不留表】—— 留了就会分叉（PRICECONTRA0X_20260921）。
let CATALOG = null;      // null = 还没取到
let catalogPending = false;
function catalogLookup(kind, len) {
  if (!CATALOG) return null;                                   // 取不到
  if (!CATALOG.sellableKinds.includes(kind)) return false;     // 这一类根本不卖
  return CATALOG.rows.find((r) => r.kind === kind && r.length === len) || false;
}
async function loadCatalog() {
  const r = await api('/api/catalog');
  CATALOG = (r.code === 200 && r.body && Array.isArray(r.body.rows)) ? r.body : null;
  renderCatalog();
  renderTeaser();
}
// TEASER0X_20260923：首页那行「N 档在售」原来写死 18,暂停 6 档之后立刻就成了错的。
//   从目录实时数 —— 在卖的看 orderable,暂停的是「定了价但铸造机做不了」那几档。
function renderTeaser() {
  const el = $('#catalogTeaser'); if (!el) return;
  if (!CATALOG) { el.textContent = ''; return; }
  const on = CATALOG.rows.filter((r) => r.orderable).length;
  const off = CATALOG.rows.filter((r) => r.priceUsdt != null && !r.orderable).length;
  el.textContent = t('catalogTeaser')(on, off);
}
function renderCatalog() {
  const body = $('#catalogBody');
  if (!body) return;
  if (!CATALOG && !catalogPending) { catalogPending = true; loadCatalog(); }
  if (!CATALOG) {
    body.innerHTML = '<tr><td colspan="3">' + esc(t('catalogDown')) + '</td></tr>';
    return;
  }
  // CHAINSEL0X_20260923：两条链分组显示。价目和字母表全部来自后端,前端不留任何一份表。
  const chains = CATALOG.chains || [{ id: 'evm', label: 'EVM', example: '' }];
  const f = dict[lang].flow || {};
  body.innerHTML = chains.map((c) => {
    const rows = CATALOG.rows.filter((r) => (r.chain || 'evm') === c.id);
    if (!rows.length) return '';
    const head = '<tr><td colspan="3" class="chainhead">' + esc(L(c, 'label') + '  ' + c.example)
      + (c.worksOn && c.worksOn.length > 1 ? '<span class="works">' + esc(c.worksOn.join(' · ')) + '</span>' : '')
      + '</td></tr>';
    return head + rows.map((r) => {
      const priced = r.priceUsdt != null;
      const price = priced ? esc(String(r.priceUsdt))
        : '<span class="soon">' + esc(f.notPriced)
          + (r.suggestedUsdt != null ? ' · ' + esc(f.suggest + ' ' + r.suggestedUsdt) : '') + '</span>';
      // CATFIELD0X_20260923：后端目录行现在给的是 kindLabel / pinned / mintTimeText。
      //   etaText 按 DSJ 死令【不给客户看期望耗时】已删；slaText 早改名成 mintTimeText。
      //   这里原来还硬写 t('kindPrefix')，后缀档也会被标成「前缀」—— 一起修掉。
      return '<tr' + (priced && r.mintable !== false ? '' : ' class="unpriced"') + '><td class="tier">'
        + esc((r.pattern || '') + '  ')
        + esc((L(r, 'kindLabel') || t('kindPrefix')) + ' ' + (r.pinned != null ? r.pinned : r.length) + ' ' + t('digits')) + '</td>'
        + '<td class="price">' + price + '</td>'
        // MINTABLE0X_20260923：定了价但铸造机做不了的,价格照写（DSJ 定的价不动）,耗时那格写明为什么不卖
        + '<td class="eta">' + (r.mintable === false
            ? '<span class="soon">' + esc(f.posSoon) + '</span>'
            : esc(L(r, 'mintTimeText'))) + '</td></tr>';
    }).join('');
  }).join('') + '<tr><td colspan="3">' + esc(L(CATALOG, 'note') || t('onlyKinds')(CATALOG.sellableKinds.join(' / '))) + '</td></tr>';
}

// CALCGONE0X_20260924：这里原来是「Measure-VanityPattern 难度计算器」。它只认 0x（EVM）图案、不认 TRON，
//   而第 1 步输图案时已经当场报价格和大约多久（两条链都行），价目表也列着全部档位 —— 重复又会说错，删掉。
let PICKED = 'evm';                 // 客户选的是【要哪条链的靓号地址】，不是用哪条链付款

/* ---- 下单流程（对接真后端） ---- */
// 本地开发走独立后端端口; 生产同域反代(nginx /api/) → 同源
// ONEFILE0X_20260923：页面可以下载到自己电脑上双击打开（file://），那时要连回平台的网址。
const API_BASE = location.protocol === 'file:' ? 'https://0x000000000.com'
  : (location.hostname === '127.0.0.1' || location.hostname === 'localhost') ? 'http://127.0.0.1:8787' : '';
const STATUS_CLASS = { created: 'st-created', share_uploaded: 'st-share', paid: 'st-paid', mining: 'st-minting', delivered: 'st-delivered', found: 'st-delivered', settled: 'st-delivered', expired: 'st-expired', refunded: 'st-refunded' };
// STATUSLBL0X_20260923：按真状态字符串查,查不到就原样印状态 —— 绝不印拼出来的假键名
const STATUS_LABEL = {
  zh: { created: '已建单', share_uploaded: '影子已上传', paid: '已付款', mining: '铸造中',
        found: '已铸出', delivered: '已交货', settled: '已交回执', expired: '已过期', refunded: '已退款' },
  en: { created: 'created', share_uploaded: 'shadow uploaded', paid: 'paid', mining: 'minting',
        found: 'minted', delivered: 'delivered', settled: 'receipt filed', expired: 'expired', refunded: 'refunded' },
  id: { created: 'dibuat', share_uploaded: 'bayangan terkirim', paid: 'dibayar', mining: 'sedang dicetak',
        found: 'sudah dicetak', delivered: 'dikirim', settled: 'tanda terima masuk', expired: 'kedaluwarsa', refunded: 'dikembalikan' },
};
const statusLabel = (st) => (STATUS_LABEL[lang] || STATUS_LABEL.zh)[st] || String(st || '');
const stepsEl = $('#steps');
const statusEl = $('#statusLine');
// DLONLY0X_20260924：原来这里有 toolink / altcmd（指向 tool.html 的入口）。altcmd 从没被调用过，
//   而下载模式之后「离线用」就是下载下来的这一个文件本身 —— 两个都删掉，不留死代码。
const orderState = { orderId: null, challenge: null, A: null, b: null, address: null };
// MYORDERS0X_20260923：「我的订单」= 这个浏览器自己下过的单。平台没有账号,服务器不该、也不再
//   把全库的单列给任何人。这里存的只是订单号（丢了也不要紧,订单号页面上写着、用订单号就能续）。
const MY_KEY = '0x_myorders';
function myOrders() {
  try { const v = JSON.parse(localStorage.getItem(MY_KEY) || '[]'); return Array.isArray(v) ? v.filter((x) => /^[0-9a-f]{8}$/.test(x)) : []; }
  catch (e) { return []; }
}
function rememberOrder(id) {
  try { const l = myOrders().filter((x) => x !== id); l.unshift(id); localStorage.setItem(MY_KEY, JSON.stringify(l.slice(0, 50))); } catch (e) {}
}
function forgetOrder(id) {
  try { localStorage.setItem(MY_KEY, JSON.stringify(myOrders().filter((x) => x !== id))); } catch (e) {}
}
// ── REF0X_20260928：推荐码 ────────────────────────────────────────────────
// 网站上（0x000000000.com）：带 ?ref= 进来 → 记在这个浏览器里（换一个推荐链接进来就换成新的）；「下载铸造页面」的文件名带上它 ——
//   0x000000000_ref-AB23CD.html：文件内容一个字节都不变（跟 GitHub 上那份指纹照样一样），只是名字不同。
// 下载到电脑上的那一份（file://）：从自己的文件名里读回来（浏览器给重名文件加的「 (1)」也认），填进第 2 步；他可以改、可以清空。
//   ★ 这一段在下面「洗干净地址栏」之前跑 —— 洗完 ?ref= 就没了。只存在这个浏览器里，不发给任何人（下单时他没清空才随单一起发）。
const REF_RE = /^[2-9A-HJ-NP-Z]{6}$/, REF_KEY = 'zn_ref';
const refNorm = (x) => String(x == null ? '' : x).trim().toUpperCase();
const REF_FROM = (() => {
  try { const q = refNorm(new URLSearchParams(location.search).get('ref')); if (REF_RE.test(q)) { try { localStorage.setItem(REF_KEY, q); } catch (e) {} return { code: q, from: 'link' }; } } catch (e) {}
  try { const m = decodeURIComponent(location.pathname || '').match(/_ref-([2-9A-HJ-NP-Za-hj-np-z]{6})(?:\s*\(\d+\))?\.html?$/); const c = m ? refNorm(m[1]) : '';
        if (REF_RE.test(c)) { try { localStorage.setItem(REF_KEY, c); } catch (e) {} return { code: c, from: 'file' }; } } catch (e) {}
  try { const v = refNorm(localStorage.getItem(REF_KEY)); if (REF_RE.test(v)) return { code: v, from: 'saved' }; } catch (e) {}
  return { code: '', from: '' };
})();
let RESUME = null;   // 由 wireOrderFlow 挂上（它要用向导里的闭包）
let KEEPKEY = null;  // 同上：切语言重画之后把内存里的钥匙装回第 1 步（LANGKEEP0X_20260924）

// SENTLOG0X_20260923：这一页发给平台的【每一次】通信都记下来，用人话摆在页面上（「发给平台的全部内容」）。
//   这里是全页唯一的出网口 —— 页面上别处没有 fetch / XHR / WebSocket（打包闸会扫）。
const SENT = [];
function sentKind(method, path) {
  const p = path.split('?')[0];
  if (p === '/api/catalog') return 'catalog';
  if (p === '/api/health') return 'health';
  if (method === 'POST' && p === '/api/check') return 'check';   // FREECHECK0X_20260928
  if (method === 'POST' && p === '/api/orders') return 'create';
  if (method === 'POST' && p === '/api/fw/leave') return 'leave';   // REF0X_20260928 第 8 步
  if (/\/share$/.test(p)) return 'share';
  if (/\/payment$/.test(p)) return 'payment';
  if (/\/pay-sim$/.test(p)) return 'paysim';
  if (/\/download$/.test(p)) return 'download';
  if (/\/receipt$/.test(p)) return 'receipt';
  if (method === 'POST' && /\/voucher$/.test(p)) return 'voucher';   // VOUCHER0X_20261002
  if (/^\/api\/orders\/[0-9a-f]{8}$/.test(p)) return 'status';
  return 'other';
}
function renderSent() {
  const list = $('#sentList'); if (!list) return;
  const f = t('sent');
  // 连着好几次一模一样的（比如每几秒查一次进度）合成一行 ×N
  const rows = [];
  for (const x of SENT) {
    const last = rows[rows.length - 1];
    if (last && last.kind === x.kind && x.kind === 'status' && !last.failed && !x.failed) { last.n++; continue; }
    rows.push({ kind: x.kind, n: 1, failed: !!x.failed, raw: x.method + ' ' + x.url + (x.body ? '\n' + x.body : '') });
  }
  // SENTPLAIN0X_20260924：DSJ「还有这个改成人话版」—— 每行只写人话；原样内容整块收进最下面「懂技术的人看这里」
  list.innerHTML = rows.map((r) => '<li>' + esc((f[r.kind] || f.other) + (r.n > 1 ? t('sentTimes')(r.n) : '') + (r.failed ? t('sentFailed') : '')) + '</li>').join('');
  const raw = $('#sentRawAll'); if (raw) raw.textContent = SENT.map((x) => x.method + ' ' + x.url + (x.body ? '\n' + x.body : '')).join('\n\n');
  // 拿页面自己手上的 s 和合出来的 k，在发出去的全部内容里搜（十六进制大小写都搜）
  const blob = SENT.map((x) => x.url + '\n' + (x.body || '')).join('\n').toLowerCase();
  const sHex = orderState.sec && orderState.sec.s != null ? KC().pad64(orderState.sec.s).toLowerCase() : '';
  const kHex = MERGED_K != null ? KC().pad64(MERGED_K).toLowerCase() : '';
  const hits = (h) => (h ? blob.split(h).length - 1 : 0);
  $('#sentCount').textContent = '(' + SENT.length + ')';
  $('#sentVerdict').textContent = SENT.length ? t('sentCheck')(SENT.length, hits(sHex), hits(kHex), !!sHex, !!kHex) : t('sentNone');
}
let MERGED_K = null;   // 第 5 步合出来的完整私钥，只用来在上面那张清单里搜它有没有被发出去
async function api(path, method = 'GET', body) {
  const rec = { method, url: path, kind: sentKind(method, path), body: body ? JSON.stringify(body) : '' };
  SENT.push(rec);
  try { renderSent(); } catch (e) {}
  // OFFLINE0X_20260924：断网时 fetch 直接抛错。统一变成 code 0 + 人话，各步照常用 showApiError 显示。
  let r;
  try { r = await fetch(API_BASE + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { rec.failed = true; try { renderSent(); } catch (e2) {} return { code: 0, body: { error: t('offlineErr') } }; }
  let j = {};
  try { j = await r.json(); } catch (e) {}
  return { code: r.status, body: j };
}
// STATUSLBL0X_20260923：t(st) 查不到 'share_uploaded' 这个键就原样返回键名,
//   状态行直接印机器词。跟订单表用同一张 statusLabel 表,人话。
function setStatus(st) { statusEl.innerHTML = '<span class="' + STATUS_CLASS[st] + '">' + esc(t('statusTxt')(statusLabel(st))) + '</span>'; }
function outLine(container, text, cls) {
  const d = document.createElement('div');
  d.className = cls || '';
  d.textContent = text;
  container.appendChild(d);
}
// UIGUARD0X_20260918: 后端拒单时会带 reason / sellableLengths 回来（可售闸、收款未开放都会），
// 而前端四个出口原来一律只印一行 "HTTP 400"，把后端已经说清楚的理由整段丢掉。
// 四个出口共用这一个函数：以后后端再多返回一个字段，只改这一处，不会又只改好其中一个。
function showApiError(container, res) {
  const b = (res && res.body) || {};
  outLine(container, (res.code ? 'HTTP ' + res.code + ' ' : '') + (L(b, 'error') || ''), 'err');
  if (b.reason) outLine(container, L(b, 'reason'), 'err');
  if (Array.isArray(b.sellableLengths) && b.sellableLengths.length) {
    outLine(container, t('sellLens') + b.sellableLengths.join(' / '), 'err');
  }
}

/* ────────────────────────────────────────────────────────────────────────
   ALLINONE0X_20260923 —— 六步全部在这一页做完。

   DSJ 原话：「不要来回切换，太麻烦！」「把每个步骤设计好，让用户跟着跑就行！」
   原来的做法是：页面只负责下单，造钥匙/签名/合钥匙/签回执四件事要跳去 tool.html，
   用户得在两个标签页之间来回七趟，中间还要手动复制粘贴 A、SIG、b、回执签名四样东西。
   任何一样贴错、贴漏、贴串行，都表现为后端一句看不懂的报错。

   现在：密钥运算由 js/keycore.js 提供，页面自己调，用户只用点按钮。s 全程只在这个浏览器的内存里，一个字节都不上传。
   TOOLRETIRE0X_20260924：tool.html 已经退役（只剩一个把人带回首页的跳转）—— 「下载下来、断网用」就是下载的这一个文件本身；
   而旧工具页既不在 GitHub 上公开、也没过私钥外发检查，还留着明文私钥导出。
   ──────────────────────────────────────────────────────────────────────── */

const KC = () => window.KeyCore;

// NETGUIDE0X_20260924：DSJ「哪一步需要断网，哪一步要联网也要人话辅助引导+解释为什么」
function stepBox(no, head, desc, net) {
  const li = document.createElement('li'), f = t('flow') || {};
  li.innerHTML =
    '<div class="step-head"><span class="no">[' + no + '/6]</span>' + esc(head) + '</div>' +
    // LESSTEXT0X_20260928：「为什么断网 / 联网」那一整句收进小标签（点开才看）；这一步要做什么（step-desc）照旧摆着
    (net ? '<details class="netline"><summary>' + esc((f.netTag || [])[no - 1] || '') + ' · ' + esc(f.why || '') + '</summary>' + esc(net) + '</details>' : '') +
    '<div class="step-desc">' + esc(desc) + '</div>';
  return li;
}
function note(text, cls) {
  return '<div class="step-desc' + (cls ? ' ' + cls : '') + '">' + esc(text) + '</div>';
}

// MINTLIVE4_20260924：第 4 步那一行「在动的状态」。phase：wait 等到账 / paid 钱到了 / run 正在铸造 / done 铸好了。
//   每秒刷新一次「已经多久」；到了 done 就停。系统设了「减少动态效果」时，小动画由 CSS 关掉，字照样每秒更新。
const MINT = { phase: null, since: 0, tick: null, got: 0, want: 0 };
function fmtDur(ms) {
  const x = Math.max(0, Math.floor(ms / 1000)), f = t('flow');
  return f.dur(Math.floor(x / 3600), Math.floor((x % 3600) / 60), x % 60);
}
function mintView(phase, opts = {}) {
  const box = $('#mintLive'), txt = $('#mintText'), note = $('#mintNote');
  if (!box || !txt || !note) return;
  if (phase !== MINT.phase) { MINT.phase = phase; MINT.since = opts.since || Date.now(); }
  box.hidden = false; box.className = 'mint-live ' + phase;
  const draw = () => {
    const f = t('flow'), el = Date.now() - MINT.since;
    note.className = 'step-desc';
    if (phase === 'wait') {
      txt.textContent = MINT.got > 0 && MINT.want > MINT.got ? f.mint4Part(MINT.got, MINT.want, Number((MINT.want - MINT.got).toFixed(6))) : f.mint4Wait(fmtDur(el));
      note.hidden = el < 10 * 60 * 1000; note.className = 'step-desc warn'; note.textContent = f.mint4WaitLong(orderState.orderId || '');
    } else if (phase === 'paid') { txt.textContent = f.mint4Paid; note.hidden = true; }
    else if (phase === 'run') { txt.textContent = f.mint4Run(fmtDur(el)); note.hidden = false; note.textContent = f.mint4RunNote; }
    else { txt.textContent = f.mint4Done(opts.took ? fmtDur(opts.took) : ''); note.hidden = false; note.textContent = f.mint4Next; }
  };
  draw();
  clearInterval(MINT.tick); MINT.tick = null;
  if (phase === 'wait' || phase === 'run') MINT.tick = setInterval(draw, 1000);
}
function mintStop() {
  clearInterval(MINT.tick); MINT.tick = null; MINT.phase = null;
  const b = $('#mintLive'), n = $('#mintNote'); if (b) b.hidden = true; if (n) n.hidden = true;
}

function renderSteps() {
  const f = t('flow');
  stepsEl.innerHTML = '';
  if (orderState.poll) { clearInterval(orderState.poll); orderState.poll = null; }
  orderState.orderId = null; orderState.challenge = null; orderState.A = null;
  orderState.b = null; orderState.address = null; orderState.sec = null;
  orderState.lastSeen = null; orderState.watchSince = 0;
  orderState.pay = null; orderState.vch = null;          // VOUCHER0X_20261002：收款那一行的原始数据 / 已经显示的那张券
  mintStop();

  // ── [1/6] 造钥匙 ────────────────────────────────────────────────────
  const li1 = stepBox(1, f.s1head, f.s1desc, f.net1);
  li1.innerHTML +=
    '<div class="flow-ctl"><span class="lbl">' + esc(f.chainLbl) + '</span>' +
      '<span class="chips" id="chainPick"></span></div>' +
    '<div class="flow-ctl"><span class="lbl">' + esc(f.posLbl) + '</span>' +
      '<select id="orderPos" aria-label="order position">' +
      '<option value="prefix">' + esc(t('posPrefix')) + '</option>' +
      '<option value="suffix">' + esc(t('posSuffix')) + '</option>' +
      '<option value="both">' + esc(t('posBoth')) + '</option></select></div>' +
    '<div class="flow-ctl"><input id="orderPat" maxlength="12" spellcheck="false" aria-label="prefix" placeholder="' + esc(f.prePh) + '">' +
      '<input id="orderPat2" maxlength="12" spellcheck="false" aria-label="suffix" placeholder="' + esc(f.sufPh) + '" hidden>' +
      '<button class="run" id="btnGen">' + esc(f.genBtn) + '</button></div>' +
    '<div class="step-desc" id="patHint"></div>' +
    '<pre class="step-out" id="out1" hidden></pre>' +
    '<div class="flow-ctl" id="reloadBox"><span class="lbl">' + esc(f.reloadLbl) + '</span>' +
      '<input type="file" id="secFile" accept=".json,application/json" aria-label="my-secret-s.json"></div>';
  stepsEl.appendChild(li1);

  // ── [2/6] 下单 ──────────────────────────────────────────────────────
  const li2 = stepBox(2, f.s2head, f.s2desc, f.net2);
  li2.innerHTML +=
    // PAYCHAIN0X_20260923：用哪条链付款。必须在建单之前选 —— 收款地址是建单时就发的。
    '<div class="flow-ctl"><span class="lbl">' + esc(f.payChainLbl) + '</span>' +
      '<select id="payChain" aria-label="payment chain"></select></div>' +
    '<div class="step-desc" id="payChainNote"></div>' +
    // REF0X_20260928：推荐码（可选）。从推荐链接下载的那一份会自己填上；他可以改、可以清空
    '<div class="flow-ctl"><span class="lbl">' + esc(f.refLbl) + '</span>' +
      '<input id="refCode" class="refcode" maxlength="6" spellcheck="false" autocomplete="off" aria-label="referral code" placeholder="' + esc(f.refPh) + '" value="' + esc(REF_FROM.code) + '"></div>' +
    '<div class="step-desc" id="refNote">' + (REF_FROM.code ? esc(f.refFrom(REF_FROM.code)) : '') + '</div>' +
    '<div class="flow-ctl"><button class="run" id="btnCreate" disabled>' + esc(f.create) + '</button></div>' +
    '<pre class="step-out" id="out2" hidden></pre>';
  stepsEl.appendChild(li2);

  // ── [3/6] 付款 ──────────────────────────────────────────────────────
  const li3 = stepBox(3, f.s3head, IS_LIVE ? f.s3descLive : f.s3desc, f.net3);
  li3.innerHTML +=
    '<div class="flow-ctl" id="payInfo" hidden></div>' +
    // VOUCHER0X_20261002：金额下面一行小字「有券？」→ 一个输入框 + 「用券」；用上了就只剩一句话（一单一张券）
    '<div id="vchBox" hidden><div class="step-desc"><button type="button" class="copy" id="vchAsk">' + esc(f.vchAsk) + '</button></div>' +
      '<div class="flow-ctl" id="vchForm" hidden><input id="vchCode" maxlength="40" spellcheck="false" autocomplete="off" aria-label="voucher" placeholder="0x0…">' +
      '<button class="run" id="vchGo">' + esc(f.vchBtn) + '</button></div>' +
      '<div class="step-desc" id="vchMsg" hidden></div></div>' +
    '<div class="flow-ctl"><button class="run" id="btnPay" disabled>' + esc(IS_LIVE ? f.payLive : f.pay) + '</button></div>' +
    '<div class="step-desc dim" id="payNote">' + esc(f.payNote) + '</div>' +
    '<div class="step-desc leave" id="leaveBox" hidden></div>' +      // REF0X_20260928 第 8 步：「不打算付了？」一键原因
    '<pre class="step-out" id="out3" hidden></pre>';
  stepsEl.appendChild(li3);

  // ── [4/6] 铸造 ──────────────────────────────────────────────────────
  const li4 = stepBox(4, f.s4head, f.s4desc, f.net4);
  // MINTLIVE4_20260924：一直在动的那一行（等到账 / 正在铸造），外加一句说明
  li4.innerHTML += '<div class="mint-live" id="mintLive" hidden><span class="mint-anim" aria-hidden="true"><i></i><i></i><i></i></span>' +
    '<span class="mint-text" id="mintText" role="status" aria-live="polite"></span></div>' +
    '<div class="step-desc" id="mintNote" hidden></div>' +
    '<pre class="step-out" id="out4" hidden></pre>';
  stepsEl.appendChild(li4);

  // ── [5/6] 取货 + 当场合成 ───────────────────────────────────────────
  const li5 = stepBox(5, f.s5head, f.s5desc, f.net5);
  li5.innerHTML +=
    '<div class="flow-ctl"><button class="run" id="btnDownload" disabled>' + esc(f.dlBtn) + '</button> ' +
      '<button class="run" id="btnMerge" disabled>' + esc(f.mergeBtn) + '</button></div>' +
    '<pre class="step-out" id="out5" hidden></pre>' +
    '<div class="flow-ctl" id="ksBox" hidden>' +
      '<span class="lbl">' + esc(f.pwLbl) + '</span>' +
      '<div class="pwrow"><input type="password" id="ksPw" autocomplete="new-password" aria-label="wallet file password" placeholder="' + esc(f.pwPh) + '">' +
      '<input type="password" id="ksPw2" autocomplete="new-password" aria-label="wallet file password again" placeholder="' + esc(f.pw2Ph) + '"></div>' +
      '<button class="run" id="btnKs">' + esc(f.ksBtn) + '</button></div>' +
    '<div class="step-desc" id="ksMsg"></div>' +
    // KSGUIDE0X_20260924：钱包文件的人话说明 —— 导出之后自动展开（那正是他打开文件、看到一堆字段的时候）
    '<details class="ksguide" id="ksGuide"><summary>' + esc(f.ksGuideHead) + '</summary><dl>' +
      f.ksGuide.map((x) => '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>').join('') + '</dl></details>';
  stepsEl.appendChild(li5);

  // ── [6/6] 回执 ──────────────────────────────────────────────────────
  const li6 = stepBox(6, f.s6head, f.s6desc, f.net6);
  li6.innerHTML +=
    '<div class="flow-ctl"><button class="run" id="btnReceipt" disabled>' + esc(f.receiptBtn) + '</button></div>' +
    note(f.receiptSkip, 'dim') +
    '<pre class="step-out" id="out6" hidden></pre>';
  stepsEl.appendChild(li6);

  setStatus('created');
  wireOrderFlow(f);
}

function wireOrderFlow(f) {
  // OFFLINE0X_20260924：断网打开时拿不到 /api/catalog，原来链的选项整排消失、只剩默认 EVM（DSJ 实测）。
  //   造钥匙本来就不需要网，所以链从 keycore 自带的那份取（没有价格，价格联网后再补）。
  const chainList = () => (CATALOG && CATALOG.chains) || (KC() ? Object.keys(KC().CHAINS).map((id) => ({
    id, label: KC().CHAINS[id].label, labelEn: KC().CHAINS[id].labelEn, example: '', addrLen: KC().CHAINS[id].addrLen, caseSensitive: !KC().CHAINS[id].lower })) : []);
  const chainMeta = () => chainList().find((c) => c.id === PICKED) || null;
  const norm = (v) => { const c = chainMeta(); const x = String(v || '').trim();
    return (!c || c.caseSensitive) ? x : x.replace(/^0x/i, '').toLowerCase(); };
  const pinnedOf = (pre, suf) => pre.length + suf.length - ((PICKED === 'tron' && pre) ? 1 : 0);
  const orderKind = (pre, suf) => (pre && suf) ? 'both' : (suf ? 'suffix' : 'prefix');
  function readPat() {
    const pos = ($('#orderPos') || {}).value || 'prefix';
    const a = norm($('#orderPat').value), b = norm(($('#orderPat2') || {}).value);
    return pos === 'suffix' ? { pre: '', suf: a }
         : pos === 'both'   ? { pre: a, suf: b }
         :                    { pre: a, suf: '' };
  }
  // 判据一律走 keycore —— 跟工具页、跟后端 patternProblem 是同一套
  const patTrouble = (pre, suf) => KC() ? KC().patProblem(PICKED, pre, suf) : null;
  const seedRow = (chain, kind) => (CATALOG && CATALOG.rows || []).find(
    (r) => (r.chain || 'evm') === chain && r.kind === kind && r.orderable) || null;
  function seedInputs() {
    if (orderState.sec || orderState.orderId) return;   // 钥匙已经造好 / 在续单：图案是定死的，不许被示例覆盖
    const pos = ($('#orderPos') || {}).value || 'prefix';
    const row = seedRow(PICKED, pos); if (!row) return;
    $('#orderPat').value  = pos === 'suffix' ? (row.suffix || '') : (row.prefix || '');
    if ($('#orderPat2')) $('#orderPat2').value = row.suffix || '';
  }
  function refreshHint() {
    const el = $('#patHint'); if (!el) return;
    const { pre, suf } = readPat();
    const why = patTrouble(pre, suf);
    const kind = orderKind(pre, suf), pinned = pinnedOf(pre, suf);
    const row = CATALOG && CATALOG.rows.find(
      (r) => (r.chain || 'evm') === PICKED && r.kind === kind && r.pinned === pinned);
    el.className = 'step-desc' + (why ? ' warn' : '');
    el.textContent = why ? why
      : !(pre || suf) ? ''
      : !CATALOG ? f.offlineHint
      : row && row.mintable === false ? f.cantMint
      : row && row.priceUsdt == null ? f.soon + (row.suggestedUsdt != null ? '（' + f.suggest + ' ' + row.suggestedUsdt + ' USDT）' : '')
      // PLAINHINT0X_20260923：原来写「大约要试 1,099,511,627,776 次」—— 13 位数字对客户没有任何意义。
      : row ? f.patOk2(row.priceUsdt, L(row, 'mintTimeText') || '')
      : f.noTier;
  }
  function renderChainPick() {
    const box = $('#chainPick'); const list = chainList(); if (!box || !list.length) return;
    box.innerHTML = list.map((c) =>
      '<button class="chip' + (c.id === PICKED ? ' active' : '') + '" data-chain="' + esc(c.id) + '">'
      + esc(L(c, 'label')) + ' <span class="dim">' + esc(c.example) + '</span></button>').join('');
    if (orderState.sec || orderState.orderId) box.querySelectorAll('[data-chain]').forEach((b) => { b.disabled = true; });
    box.querySelectorAll('[data-chain]').forEach((b) => b.addEventListener('click', () => {
      PICKED = b.dataset.chain;
      const c = chainMeta();
      syncPosOptions();
      seedInputs();
      if (c) { $('#orderPat').maxLength = c.addrLen;
               if ($('#orderPat2')) $('#orderPat2').maxLength = c.addrLen; }
      renderChainPick(); refreshHint();
    }));
  }
  $('#orderPat').addEventListener('input', refreshHint);
  if ($('#orderPat2')) $('#orderPat2').addEventListener('input', refreshHint);
  if ($('#orderPos')) $('#orderPos').addEventListener('change', () => {
    $('#orderPat2').hidden = $('#orderPos').value !== 'both';
    seedInputs(); refreshHint();
  });
  // NETSYNC0X_20260924：付款链表如果是【连上网以后才补到的】，他还没看过新表 —— 点下单时先让他选一次，
  //   不许默默按缺省的那条建单（补表可能就在他按下按钮的那一瞬间到，所以按「看过没有」判，不按时间先后判）。
  let payNeedsLook = false;
  function renderPayChains() {
    const sel = $('#payChain'); if (!sel) return;
    const wasFallback = sel.dataset.real === '0';   // 刚才给他看的是断网时的缺省表
    const list = (CATALOG && CATALOG.payChains) || [{ id: 'bsc', label: 'BSC', short: 'BEP20', confirmations: 15, note: '' }];   // PAYBSC0X_20260928：断网时的缺省也只列 BSC（全网只收 BSC）
    const cur = sel.value;
    sel.innerHTML = list.map((c) =>
      '<option value="' + esc(c.id) + '">' + esc(c.label + ' · USDT-' + c.short) + '</option>').join('');
    if (cur && list.some((c) => c.id === cur)) sel.value = cur;
    sel.dataset.real = CATALOG ? '1' : '0';
    if (CATALOG && wasFallback && list.length > 1) payNeedsLook = true;
    sel.onpointerdown = sel.onkeydown = () => { if (sel.dataset.real === '1') payNeedsLook = false; };
    const note = () => {
      if (!CATALOG) { $('#payChainNote').textContent = f.payChainOffline; return; }
      const c = list.find((x) => x.id === sel.value) || list[0];
      // PAYNOTEEN0X_20260924：说明按语言取（平台两种都下发），「要等几个确认」进词典 —— 原来英文界面也是整句中文
      $('#payChainNote').textContent = c ? ((L(c, 'note') || '') + ' ' + f.payConfirmN(c.confirmations)) : '';
    };
    sel.onchange = () => { payNeedsLook = false; note(); }; note();
  }
  // MINTABLE0X_20260923：这条链上铸造机做不了的位置,直接变灰并写明原因 ——
  //   不让客户选了、下了单、付了钱,才在第 4 步卡住。判据从 /api/catalog 的 orderable 来，前端不自留表。
  function syncPosOptions() {
    const sel = $('#orderPos'); if (!sel) return;
    // 断网拿不到目录：三种位置都先让选（能不能铸，联网下单时平台会当场说）
    const ok = (kind) => !CATALOG || CATALOG.rows.some((r) => (r.chain || 'evm') === PICKED && r.kind === kind && r.orderable);
    [...sel.options].forEach((o) => {
      const can = ok(o.value);
      o.disabled = !can;
      o.textContent = t(o.value === 'prefix' ? 'posPrefix' : o.value === 'suffix' ? 'posSuffix' : 'posBoth')
        + (can ? '' : '（' + f.posSoon + '）');
    });
    if (sel.options[sel.selectedIndex] && sel.options[sel.selectedIndex].disabled) {
      sel.value = 'prefix';
      $('#orderPat2').hidden = true;
    }
  }
  const bootOrder = () => { renderChainPick(); renderPayChains(); syncPosOptions(); seedInputs(); refreshHint(); };
  // OFFLINEHANG0X_20260924：第 1 步不等网。链按钮、位置先按 keycore 自带的那份画出来，目录回来以后下面照原样再画一次。
  //   原来要等 /api/catalog 有了结果才画：真断网时浏览器马上报错还好，可「网是断的、浏览器以为在线」（NETSYNC0X 那种）时
  //   请求一直挂着，链按钮一直是空的 —— 选不了 TRON。本机把请求挂住实测：12 秒都没画出来；
  //   GitHub 上的私钥外发检查也因此红过一次（慢机器上 1.5 秒还没画出来）。付款链不在这里先画：那张表有「看过没有」的判断。
  renderChainPick(); syncPosOptions(); refreshHint();
  if (CATALOG) bootOrder();
  else { loadCatalog().then(bootOrder).catch(() => { renderChainPick(); renderPayChains(); syncPosOptions(); refreshHint(); }); }
  // NETSYNC0X_20260924：断网打开的页面，一开始拿不到两样东西 —— 目录（付款链、价格、能不能铸）和「真收款还是原型」。
  //   原来只靠 online 事件补目录：① 「真收款」根本不补，第 3 步一直是「就当已付款（原型）」，点了会被平台拒掉；
  //   ② Windows 上有虚拟网卡时，拔了网浏览器也以为自己在线，online 事件根本不来 —— DSJ 20260924 实测第 2 步只有 TRON。
  //   现在：online 事件 +【动第 2 步的时候】（点付款链、点下单）当场补拿，不靠事件。
  // 真收款的字样换进第 3 步 —— 不重画整个步骤区（那会把已经造好的钥匙和订单状态清掉）
  const liveStep3 = () => {
    const btn = $('#btnPay'), li3 = btn && btn.closest('li'); if (!li3) return;
    const d = li3.querySelector('.step-desc'); if (d) d.textContent = f.s3desc;
    if (!orderState.poll) btn.textContent = f.pay;
  };
  let syncing = null;
  const sync = () => (CATALOG && HEALTH_OK) ? Promise.resolve() : (syncing || (syncing = (async () => {
    if (!HEALTH_OK && onHealth(await api('/api/health'))) liveStep3();
    if (!CATALOG) {
      await loadCatalog();
      if (CATALOG) {
        if (!orderState.sec) renderChainPick();
        renderPayChains(); syncPosOptions();
        // NETSYNCALL0X_20260924：整页对照抓到的 —— 在线打开的那份会先填一个示例图案并报价，断网打开的这份补拿之后没填，
        //   第 1 步一直挂着一句橙色的「前缀和后缀都是空的」。他还没输图案、还没造钥匙的话，填上同一个示例。
        if (!orderState.sec) { const { pre, suf } = readPat(); if (!pre && !suf) seedInputs(); }
        refreshHint();
      }
    }
    if (CATALOG || HEALTH_OK) ordersRetry();          // NETSYNCALL0X：网回来了，「我的订单」上次查不到的话也重查
  })().catch(() => {}).finally(() => { syncing = null; })));
  window.ononline = () => { sync(); };
  const li2 = $('#btnCreate') && $('#btnCreate').closest('li');
  if (li2) { li2.addEventListener('pointerdown', () => { sync(); }, true); li2.addEventListener('focusin', () => { sync(); }, true); }

  const dl = (name, text) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: /\.txt$/.test(name) ? 'text/plain;charset=utf-8' : 'application/json' }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  // ── [1/6] 造钥匙 ────────────────────────────────────────────────────
  $('#btnGen').addEventListener('click', () => {
    const out = $('#out1'); out.hidden = false; out.innerHTML = '';
    if (!KC()) return outLine(out, f.noCore, 'err');
    const { pre, suf } = readPat();
    let gen;
    try { gen = KC().makeShare(PICKED, pre, suf); }
    catch (e) { return outLine(out, e.message, 'err'); }
    orderState.sec = KC().readSecretJson(gen.secret);
    orderState.A = gen.A;
    dl('my-secret-s.json', gen.secret);
    outLine(out, f.genOk, 'ok');
    outLine(out, f.genKeep, 'err');
    outLine(out, 'A = ' + gen.A.slice(0, 32) + '…', 'dim');
    $('#btnCreate').disabled = false;
    $('#btnGen').disabled = true;
    ['#orderPos', '#orderPat', '#orderPat2'].forEach((s) => { const e = $(s); if (e) e.disabled = true; });
    stepsEl.querySelectorAll('#chainPick [data-chain]').forEach((b) => { b.disabled = true; });
  });

  // 刷新过页面就选回备份文件 —— 内存里的 s 没了，但文件还在
  $('#secFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const out = $('#out1'); out.hidden = false; out.innerHTML = '';
    const r = new FileReader();
    r.onerror = () => outLine(out, f.fileBad, 'err');
    r.onload = () => {
      let sec;
      try { sec = KC().readSecretJson(r.result); }
      catch (err) { return outLine(out, err.message, 'err'); }
      orderState.sec = sec;
      PICKED = sec.chain;
      orderState.A = KC().signChallenge(sec.s, 'x').A;
      outLine(out, f.fileOk((sec.prefix || '') + (sec.suffix ? '…' + sec.suffix : ''), sec.chain.toUpperCase()), 'ok');
      if (orderState.orderId) {                            // 在续一张已有的单：钥匙装回来就够了
        const o5 = $('#out5'); if (o5) { o5.hidden = false; outLine(o5, f.secBack, 'ok'); }
        if (orderState.pendingShare) { orderState.pendingShare = false; uploadShare($('#out2')).then((ok) => ok && showPayment()); }
      } else {
        $('#btnCreate').disabled = false;
      }
    };
    r.readAsText(file);
  });

  // ── [2/6] 下单 + 自动签挑战 + 自动上传 ──────────────────────────────
  // 上传份额：用 s 签这张单的挑战串，连同影子 A 交上去。续单（建了单但还没交份额）也走这里。
  async function uploadShare(out) {
    const sec = orderState.sec;
    outLine(out, f.signing, 'dim');
    let sig;
    try { sig = KC().signChallenge(sec.s, orderState.challenge).sig; }
    catch (e) { outLine(out, e.message, 'err'); return false; }
    const A = KC().signChallenge(sec.s, 'x').A;          // A 由 s 当场算出,不信任何缓存
    const up = await api('/api/orders/' + orderState.orderId + '/share', 'POST', { A, sig });
    if (up.code !== 200) { showApiError(out, up); return false; }
    outLine(out, f.shareOk, 'ok');
    setStatus('share_uploaded');
    return true;
  }
  // 显示收款地址 + 打开「我转好了」按钮。o = 续单时平台回的这张单（看它用没用过券）；新下的单没有
  async function showPayment(o) {
    const pay = await api('/api/orders/' + orderState.orderId + '/payment');
    if (pay.code !== 200) return false;
    orderState.address = pay.body.address;
    orderState.pay = pay.body;
    drawPay();
    $('#btnPay').disabled = false;
    showLeave();
    vchShow(vchSeen(o), !o || vchOpenFor(o));
    return true;
  }
  function drawPay() {
    const p = orderState.pay, pi = $('#payInfo'); if (!p || !pi) return;
    pi.hidden = false;
    pi.innerHTML = '<span class="lbl">' + esc(f.payInfo2(p.address, p.amountUsdt, p.confirmationsRequired, p.chain + ' · USDT-' + p.network)) + '</span>' +
      '<button class="copy" data-copycmd="' + esc(p.address) + '">' + esc(f.copyAddr) + '</button>';
  }
  // ── VOUCHER0X_20261002：用券（现金券 / 免费券）────────────────────────────
  //   券码真不真、抵多少、这一单还能不能用，全由平台判（POST /api/orders/:id/voucher）—— 页面只去掉空格，空的不发。
  //   用上之后：显示的金额改成还要付的（第 4 步「还差多少」也按它算）；全额抵扣 → 收款地址那一块收起来（没有要转的钱），
  //   照常问进度，平台记成已付之后页面自己往下走。一单一张券：用上了就只剩一句话。
  const isZero = (x) => x != null && x !== '' && Number(x) === 0;
  const vchSeen = (o) => (o && o.voucherHint ? { hint: o.voucherHint, credit: o.voucherCredit, due: o.amountUsdt, full: isZero(o.amountUsdt) } : null);
  const vchOpenFor = (o) => (o.status === 'created' || o.status === 'share_uploaded') && !(Number(o.receivedUsdt) > 0);   // 平台只收没付、一分没到的单
  function vchShow(v, payable) {
    const box = $('#vchBox'); if (!box) return;
    if (!v) { if (!orderState.vch) box.hidden = !payable; return; }
    const key = v.hint + '|' + v.credit + '|' + v.due;
    if (orderState.vch === key) return;                  // 每 2.5 秒问一次进度：没变就不重画（不打断「复制地址」）
    orderState.vch = key;
    box.hidden = false; $('#vchAsk').parentElement.hidden = true; $('#vchForm').hidden = true;
    const m = $('#vchMsg'); m.hidden = false; m.className = 'step-desc ok';
    m.textContent = v.full ? f.vchFull : f.vchPart(v.hint, v.credit, v.due);
    MINT.want = Number(v.due) || 0;
    if (!v.full) { if (orderState.pay) { orderState.pay.amountUsdt = v.due; drawPay(); } return; }
    ['#payInfo', '#payNote', '#leaveBox'].forEach((s) => { const e = $(s); if (e) e.hidden = true; });
    const pb = $('#btnPay'); if (pb) { pb.disabled = true; pb.parentElement.hidden = true; }
    if (!orderState.poll) { orderState.watchSince = Date.now(); orderState.poll = setInterval(pollStatus, 2500); pollStatus(); }
  }
  async function vchGo() {
    const inp = $('#vchCode'), btn = $('#vchGo'), code = String(inp.value || '').replace(/\s+/g, '');
    inp.value = code;
    if (!code) { inp.focus(); return; }
    btn.disabled = true;
    const r = await api('/api/orders/' + orderState.orderId + '/voucher', 'POST', { code });
    btn.disabled = false;
    const b = r.body || {};
    if (r.code !== 200 || !b.ok) {
      const m = $('#vchMsg'); m.hidden = false; m.className = 'step-desc warn'; m.textContent = L(b, 'error') || ('HTTP ' + r.code);
      return;
    }
    const due = b.covered === true ? 0 : b.amountUsdt;
    vchShow({ hint: b.hint, credit: b.creditUsdt, due, full: isZero(due) }, true);
  }
  $('#vchAsk').addEventListener('click', () => { $('#vchAsk').parentElement.hidden = true; $('#vchForm').hidden = false; $('#vchCode').focus(); });
  $('#vchGo').addEventListener('click', vchGo);
  $('#vchCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); vchGo(); } });
  // REF0X_20260928 第 8 步（每一步的记录，构思 v3 第三章第 2 条「离开原因」）：付款页上一键选原因 —— 只发一个词（四选一），
  //   不带订单号、不带别的；点过就收起、不再问。他点「我转好了」就收起（他在付了）。
  function showLeave() {
    const box = $('#leaveBox'); if (!box || box.dataset.done) return;
    box.innerHTML = esc(f.leaveAsk) + ' ' + Object.keys(f.leaveOpt).map((k) => '<button class="chip" data-leave="' + k + '">' + esc(f.leaveOpt[k]) + '</button>').join(' ');
    box.hidden = false;
  }
  $('#leaveBox').addEventListener('click', (e) => {
    const b = e.target.closest('[data-leave]'); if (!b) return;
    const box = $('#leaveBox'); box.dataset.done = '1'; box.textContent = f.leaveThanks;
    api('/api/fw/leave', 'POST', { reason: b.dataset.leave });
  });
  $('#btnCreate').addEventListener('click', async () => {
    const out = $('#out2'); out.hidden = false; out.innerHTML = '';
    const sec = orderState.sec;
    if (!sec) return outLine(out, f.needGen, 'err');
    // NETSYNC0X_20260924：目录还没拿到（断网打开的页面）→ 当场补拿；付款链表是刚补到、他还没看过 → 先让他选，再点一次
    if (!CATALOG || !HEALTH_OK) await sync();
    if (payNeedsLook) { payNeedsLook = false; return outLine(out, f.payPickNow, 'warn'); }
    const ref = refNorm(($('#refCode') || {}).value);                  // REF0X：空着 = 不带；填了就必须长得像推荐码（真假由平台查）
    if (ref && !REF_RE.test(ref)) return outLine(out, f.refBad, 'err');
    const btn = $('#btnCreate'); btn.disabled = true;
    const payChain = ($('#payChain') || {}).value || 'tron';
    const res = await api('/api/orders', 'POST', { chain: sec.chain, prefix: sec.prefix, suffix: sec.suffix, payChain, ...(ref ? { ref } : {}) });
    if (res.code !== 200) { showApiError(out, res); btn.disabled = false; return; }
    orderState.orderId = res.body.orderId;
    orderState.challenge = res.body.challenge;
    rememberOrder(res.body.orderId);                    // 这个浏览器记住自己下过的单,关了页面还找得回来
    if (ref) { try { localStorage.setItem(REF_KEY, ref); } catch (e) {} }   // REF0X：下次在这个浏览器里下单照样带上（「终身」那一条）
    { const r = $('#refCode'); if (r) r.disabled = true; }
    outLine(out, f.created + ' ' + res.body.orderId, 'ok');
    outLine(out, f.keepId(res.body.orderId), 'dim');
    if (!(await uploadShare(out))) { btn.disabled = false; return; }
    renderOrders();
    await showPayment();
  });

  // ── [3/6] 付款 ──────────────────────────────────────────────────────
  const pollStatus = () => {
    api('/api/orders/' + orderState.orderId).then((r) => {
      if (r.code !== 200) return;
      const st = r.body.status;
      // ORDERSTALE0X_20260924：状态一变，最下面「我的订单」跟着重拉 —— 原来要重新打开页面才变
      if (orderState.lastSeen !== st) { orderState.lastSeen = st; renderOrders(); }
      if (orderState.pay) vchShow(vchSeen(r.body), vchOpenFor(r.body));   // VOUCHER0X：券在别处用上了（机器人里）也跟着变；钱到了一部分就不再给「有券？」
      if (st === 'created' || st === 'share_uploaded') {
        MINT.got = Number(r.body.receivedUsdt) || 0; MINT.want = Number(r.body.amountUsdt) || 0;   // PARTIALPAY0X：已经收到多少
        if (MINT.phase !== 'wait') mintView('wait', { since: orderState.watchSince || Date.now() }); return;
      }
      if (st === 'paid') { if (MINT.phase !== 'paid') mintView('paid'); return; }
      if (st === 'mining') { if (MINT.phase !== 'run') mintView('run', { since: r.body.paidAt || Date.now() }); return; }
      if (st !== 'found' && st !== 'settled') {                  // 过期 / 已退款：停下来说清楚，不再空转
        if (orderState.poll) { clearInterval(orderState.poll); orderState.poll = null; }
        mintStop(); const o4 = $('#out4'); o4.hidden = false; outLine(o4, f.orderClosed(statusLabel(st)), 'err');
        return;
      }
      if (orderState.poll) { clearInterval(orderState.poll); orderState.poll = null; }
      if (!r.body.ready) return;
      setStatus('paid');
      orderState.challenge = r.body.challenge || orderState.challenge;
      orderState.receiptChallenge = r.body.receiptChallenge || null;
      // 「这一单算了多久」只在这一页亲眼看着它从「正在铸造」变过来时才报 —— 隔了几个小时回来看，那不是铸造用的时间
      mintView('done', { took: MINT.phase === 'run' ? Date.now() - MINT.since : 0 });
      const out4 = $('#out4'); out4.hidden = false; out4.innerHTML = '';
      outLine(out4, f.mineHit + r.body.foundAddress, 'ok');
      outLine(out4, f.readyToTake, 'ok');
      $('#btnDownload').disabled = false;
    });
  };
  $('#btnPay').addEventListener('click', async () => {
    const out = $('#out3'); out.hidden = false; out.innerHTML = '';
    { const lb = $('#leaveBox'); if (lb && !lb.dataset.done) lb.hidden = true; }   // 他在付了：不再问为什么不付
    if (IS_LIVE) {
      outLine(out, f.payingLive, 'dim');
      $('#btnPay').disabled = true;
      orderState.watchSince = Date.now(); mintView('wait', { since: orderState.watchSince });
      if (!orderState.poll) orderState.poll = setInterval(pollStatus, 2500);
      return;
    }
    outLine(out, f.paying, 'dim');
    const res = await api('/api/orders/' + orderState.orderId + '/pay-sim', 'POST');
    if (res.code !== 200) { showApiError(out, res); return; }
    outLine(out, f.watching, 'dim');
    $('#btnPay').disabled = true;
    orderState.poll = setInterval(pollStatus, 2500);
  });

  // ── [5/6] 取 b + 当场合成 + 核对 ────────────────────────────────────
  let MERGED = null;
  $('#btnDownload').addEventListener('click', async () => {
    const out = $('#out5'); out.hidden = false; out.innerHTML = '';
    // DLSIG0X_20260923：取货凭签名 —— 用你那半把钥匙签这张单的挑战串。没有 s 的人下不到。
    if (!orderState.sec) return outLine(out, f.needSecForTake, 'err');
    let dsig;
    try { dsig = KC().signChallenge(orderState.sec.s, orderState.challenge).sig; }
    catch (e) { return outLine(out, e.message, 'err'); }
    const res = await api('/api/orders/' + orderState.orderId + '/download?sig=' + dsig);
    if (res.code !== 200) { showApiError(out, res); return; }
    orderState.b = res.body.b; orderState.deliveredAddr = res.body.address;
    outLine(out, f.gotB, 'ok');
    $('#btnDownload').disabled = true; $('#btnMerge').disabled = false;
  });
  // MERGESPLIT0X_20260924：合成单独一个按钮 —— 取货要联网，合成不用；让人可以在两步之间断网。
  $('#btnMerge').addEventListener('click', () => {
    const out = $('#out5'); out.hidden = false;
    if (!orderState.sec || !orderState.b) return outLine(out, f.needSecForTake, 'err');
    let r;
    try { r = KC().merge(orderState.sec, KC().parseB(orderState.b)); }
    catch (e) { return outLine(out, e.message, 'err'); }
    if (!r.ok) {
      outLine(out, f.mergeBad(r.want, r.chain.toUpperCase()), 'err');
      KC().candList(r.cands).split('\n').forEach((l) => outLine(out, l, 'dim'));
      return;
    }
    MERGED = r; MERGED_K = r.k; try { renderSent(); } catch (e) {}
    outLine(out, f.mergeOk, 'ok');
    outLine(out, r.addr + (r.want ? '   ← ' + r.want + ' ' + f.hitWord : ''), 'ok');
    const exp = orderState.deliveredAddr;
    outLine(out, r.addr === exp ? f.addrMatch : f.addrDiff(exp), r.addr === exp ? 'ok' : 'err');
    // KEYTXT0X_20260924：TRON 地址的买家在 MetaMask 里只看得见 0x 写法 —— 当场把那一行印出来，免得以为钥匙错了
    if (r.chain === 'tron') outLine(out, f.evmTwin(KC().addrOf('evm', r.k)), 'dim');
    $('#btnMerge').disabled = true;
    $('#ksBox').hidden = false;
    setStatus('delivered');
    if (orderState.receiptChallenge) $('#btnReceipt').disabled = false;
  });
  // KSONLY0X_20260924：DSJ「拿掉明文文件，专注做好钱包文件就好！」—— 明文私钥导出（my-key.txt）整个拿掉。
  //   密码输两遍、对上才做；TRON 存成 .txt（TronLink 只收 .txt），address 那一栏写 TronLink 读得懂的 41… 写法（见 keycore.js）。
  $('#btnKs').addEventListener('click', function () {
    if (!MERGED) return;
    const msg = $('#ksMsg');
    const pw = $('#ksPw').value || '', pw2 = $('#ksPw2').value || '';
    if (pw.length < 8) { msg.className = 'step-desc warn'; msg.textContent = f.pwShort; return; }
    if (pw !== pw2) { msg.className = 'step-desc warn'; msg.textContent = f.pwDiff; return; }
    if (!crypto.subtle) { msg.className = 'step-desc warn'; msg.textContent = f.noSubtle; return; }
    const btn = this; btn.disabled = true;
    msg.className = 'step-desc';
    KC().keystore(MERGED.k, MERGED.addr, MERGED.chain, pw, (p) => {
      msg.textContent = f.ksWork + Math.round(p * 100) + '%';
    }).then((ks) => {
      const name = KC().keystoreName(MERGED.chain);
      dl(name, JSON.stringify(ks, null, 2));
      msg.className = 'step-desc ok'; msg.textContent = f.ksOk(name, MERGED.chain === 'tron'); btn.disabled = false;
      const g = $('#ksGuide'); if (g) g.open = true;
    }, (e) => { msg.className = 'step-desc warn'; msg.textContent = f.ksFail + e.message; btn.disabled = false; });
  });

  // ── [6/6] 回执：一键签 + 提交 ───────────────────────────────────────
  $('#btnReceipt').addEventListener('click', async () => {
    const out = $('#out6'); out.hidden = false; out.innerHTML = '';
    if (!orderState.receiptChallenge) return outLine(out, f.noReceipt, 'err');
    let r;
    try { r = KC().signReceipt(orderState.sec, KC().parseB(orderState.b), orderState.receiptChallenge); }
    catch (e) { return outLine(out, e.message, 'err'); }
    if (!r.ok) return outLine(out, f.receiptBad, 'err');
    const res = await api('/api/orders/' + orderState.orderId + '/receipt', 'POST', { sig: r.sig });
    if (res.code !== 200) { showApiError(out, res); return; }
    outLine(out, f.receiptOk, 'ok');
    // VERIFY0X_20260928（构思 v3 第九章 13「好」）：买靓号的送首月实时提醒 —— 平台回一个一单一次的领取链接，先过一遍样子再放
    const pk = res.body && res.body.perk;
    if (pk && typeof pk.link === 'string' && /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}\?start=p_[2-9A-HJ-NP-Z]{10}$/.test(pk.link)) {
      outLine(out, f.perkOk, 'ok');
      const d = document.createElement('div'), a = document.createElement('a');
      a.href = pk.link; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = f.perkLink;
      d.appendChild(a); out.appendChild(d);
    }
    $('#btnReceipt').disabled = true;
    setStatus('settled');
  });

  // LANGKEEP0X_20260924：切语言重画之后，把内存里那把钥匙原样装回第 1 步 —— 跟刚造完一样：图案填好、锁住，可以直接下单
  KEEPKEY = (sec) => {
    orderState.sec = sec; PICKED = sec.chain;
    orderState.A = KC().signChallenge(sec.s, 'x').A;
    const kind = sec.prefix && sec.suffix ? 'both' : (sec.suffix ? 'suffix' : 'prefix');
    if ($('#orderPos')) $('#orderPos').value = kind;
    $('#orderPat').value = kind === 'suffix' ? sec.suffix : sec.prefix;
    if ($('#orderPat2')) { $('#orderPat2').value = sec.suffix || ''; $('#orderPat2').hidden = kind !== 'both'; }
    stepsEl.querySelectorAll('#chainPick [data-chain]').forEach((b) => { b.classList.toggle('active', b.dataset.chain === PICKED); b.disabled = true; });
    ['#btnGen', '#orderPos', '#orderPat', '#orderPat2'].forEach((q) => { const e = $(q); if (e) e.disabled = true; });
    const o1 = $('#out1'); o1.hidden = false; o1.innerHTML = '';
    outLine(o1, f.keyKept((sec.prefix || '') + (sec.suffix ? '…' + sec.suffix : ''), sec.chain.toUpperCase()), 'ok');
    $('#btnCreate').disabled = false;
  };

  // ── 续单（RESUME0X_20260923）────────────────────────────────────────
  //   原来页面写着「可以直接关掉，回头在我的订单里找回来」—— 那是假的：订单表点了没反应，
  //   关掉页面之后没有任何办法接着做一张付过钱的单。铸造要一个小时，没人会一直开着页面。
  //   现在：凭订单号恢复到它该在的那一步。钥匙（s）不在服务器上，所以要取货时请他选回备份文件。
  RESUME = async (id, quiet) => {
    id = String(id || '').trim().toLowerCase();
    if (!/^[0-9a-f]{8}$/.test(id)) return f.badId;
    const r = await api('/api/orders/' + id);
    if (r.code !== 200) return (r.body && L(r.body, 'error')) || f.noSuchOrder;
    const o = r.body;
    const keep = orderState.sec;
    renderSteps();
    orderState.orderId = o.id; orderState.challenge = o.challenge;
    orderState.receiptChallenge = o.receiptChallenge || null; orderState.address = o.address || null;
    orderState.sec = keep && keep.chain === o.chain ? keep : null;
    rememberOrder(o.id);
    // 第 1、2 步已经做过了：把【这张单自己的】链 / 位置 / 图案填回去再锁住 ——
    //   不填的话第 1 步还显示默认的 EVM 0000000000,续一张 TRON 单时上下两行自相矛盾
    PICKED = o.chain || 'evm';
    const kind = o.prefix && o.suffix ? 'both' : (o.suffix ? 'suffix' : 'prefix');
    if ($('#orderPos')) $('#orderPos').value = kind;
    $('#orderPat').value = kind === 'suffix' ? (o.suffix || '') : (o.prefix || '');
    if ($('#orderPat2')) { $('#orderPat2').value = o.suffix || ''; $('#orderPat2').hidden = kind !== 'both'; }
    stepsEl.querySelectorAll('#chainPick [data-chain]').forEach((b) => b.classList.toggle('active', b.dataset.chain === PICKED));
    if (o.payChain && $('#payChain')) $('#payChain').value = o.payChain;
    const hint = $('#patHint'); if (hint) { hint.className = 'step-desc'; hint.textContent = f.resumeHint(o.patternText || o.pattern, o.amountUsdt); }
    ['#btnGen', '#btnCreate', '#orderPos', '#orderPat', '#orderPat2', '#payChain', '#refCode'].forEach((sel) => { const e = $(sel); if (e) e.disabled = true; });
    stepsEl.querySelectorAll('#chainPick [data-chain]').forEach((b) => { b.disabled = true; });
    const o1 = $('#out1'); o1.hidden = false; o1.innerHTML = '';
    outLine(o1, f.resuming(o.id, o.patternText || o.pattern, (o.chain || 'evm').toUpperCase()), 'ok');
    if (!orderState.sec) outLine(o1, f.pickSecForResume, 'err');
    const st = o.status;
    setStatus(st);
    if (st === 'created') {                              // 建了单还没交份额
      if (orderState.sec) { const o2 = $('#out2'); o2.hidden = false; if (await uploadShare(o2)) await showPayment(o); }
      else orderState.pendingShare = true;
    } else if (st === 'share_uploaded') {
      await showPayment(o);
    } else if (st === 'paid' || st === 'mining') {
      await showPayment(o); $('#btnPay').disabled = true;
      const o3 = $('#out3'); o3.hidden = false; outLine(o3, f.watchingAgain, 'dim');
      mintView(st === 'paid' ? 'paid' : 'run', { since: o.paidAt || Date.now() });
      if (!orderState.poll) orderState.poll = setInterval(pollStatus, 2500);
    } else if (st === 'found' || st === 'settled') {
      mintView('done');
      const o4 = $('#out4'); o4.hidden = false;
      if (o.foundAddress) outLine(o4, f.mineHit + o.foundAddress, 'ok');
      outLine(o4, f.readyToTake, 'ok');
      $('#btnDownload').disabled = false;
    } else {
      const o3 = $('#out3'); o3.hidden = false; outLine(o3, f.orderClosed(statusLabel(st)), 'err');
    }
    if (!quiet) $('#steps').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    return null;
  };

  // 通用复制
  stepsEl.addEventListener('click', (e) => {
    const cp = e.target.closest('[data-copycmd]');
    if (!cp) return;
    navigator.clipboard.writeText(cp.dataset.copycmd).then(() => {
      const old = cp.textContent;
      cp.textContent = f.copied;
      setTimeout(() => { cp.textContent = old; }, 1200);
    }).catch(() => {});
  });
}

/* ---- 我的订单（优先真后端, 失败回退 mock） ---- */
// NETSYNCALL0X_20260924：「我的订单」是这一页开机时向平台要的第三样东西（前两样是付款方式、真收款还是原型）。
//   断网打开时它显示「查不到」，原来联网之后不会自己再查。现在：联网信号、回到这个窗口、点到订单那一块、
//   第 2 步补拿成功 —— 只要上一次是「查不到」就重查一次（3 秒内不重复）。
let ORDERS_DOWN = false, ordersRetryAt = 0;
function ordersRetry() {
  if (!ORDERS_DOWN || Date.now() - ordersRetryAt < 3000) return;
  ordersRetryAt = Date.now(); renderOrders();
}
window.addEventListener('online', ordersRetry);
window.addEventListener('focus', ordersRetry);
document.addEventListener('visibilitychange', () => { if (!document.hidden) ordersRetry(); });
{ const so = document.getElementById('secOrders'); if (so) { so.addEventListener('pointerdown', ordersRetry, true); so.addEventListener('focusin', ordersRetry, true); } }
async function renderOrders() {
  // NOMOCK0X / MYORDERS0X_20260923：只列这个浏览器下过的单,逐张按订单号查；
  //   取不到就如实说,不编假单。每一行都能「接着做」—— 关了页面回来就从这里续。
  const body = $('#ordersBody'); if (!body) return;
  const ids = myOrders();
  if (!ids.length) { body.innerHTML = '<tr><td colspan="5">' + esc(t('ordersEmpty')) + '</td></tr>'; return; }
  let rows;
  try {
    rows = await Promise.all(ids.map((id) => api('/api/orders/' + id)
      .then((r) => (r.code === 200 ? r.body : (r.code === 404 ? (forgetOrder(id), null) : undefined)))
      .catch(() => undefined)));
  } catch (e) { rows = []; }
  if (rows.some((x) => x === undefined) && !rows.some((x) => x)) {
    ORDERS_DOWN = true;
    body.innerHTML = '<tr><td colspan="5">' + esc(t('ordersDown')) + '</td></tr>'; return;
  }
  ORDERS_DOWN = false;
  const live = rows.filter(Boolean);
  if (!live.length) { body.innerHTML = '<tr><td colspan="5">' + esc(t('ordersEmpty')) + '</td></tr>'; return; }
  body.innerHTML = live.map((o) =>
    '<tr><td>' + esc(o.id) + '</td><td>' + esc(o.patternText || o.pattern) + '</td>'
    + '<td><span class="' + (STATUS_CLASS[o.status] || '') + '">' + esc(statusLabel(o.status)) + '</span></td>'
    + '<td class="num">' + (o.amountUsdt != null ? o.amountUsdt : '-') + '</td>'
    + '<td>' + (['expired', 'refunded'].includes(o.status) ? ''
        : '<button class="copy" data-resume="' + esc(o.id) + '">' + esc(t('ordersResume')) + '</button>') + '</td></tr>'
  ).join('');
}



/* ---- 续单入口（RESUME0X_20260923）---- */
async function resumeFrom(id, msgEl) {
  if (!RESUME) return;
  const why = await RESUME(id);
  if (msgEl) { msgEl.textContent = why || ''; msgEl.className = 'step-desc' + (why ? ' warn' : ''); }
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-resume]');
  if (b) resumeFrom(b.dataset.resume, $('#resumeMsg'));
});
if ($('#resumeBtn')) {
  $('#resumeBtn').addEventListener('click', () => resumeFrom($('#resumeId').value, $('#resumeMsg')));
  $('#resumeId').addEventListener('keydown', (e) => { if (e.key === 'Enter') resumeFrom($('#resumeId').value, $('#resumeMsg')); });
}

/* ---- 启动 ---- */
$('#body').addEventListener('click', (e) => {
  if (!bootDone && !reducedMotion && e.target.closest('#boot')) { renderBoot(true); }
}, true);

/* ---- 星空背景 ---- */
function initStars() {
  const canvas = $('#space');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, stars = [], raf = 0;
  function layout() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.4 + Math.random() * 0.9,
      base: 0.12 + Math.random() * 0.3,
      ph: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 1.2,
    }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = reducedMotion ? s.base : s.base + Math.sin(t / 1000 * s.sp + s.ph) * 0.1;
      ctx.globalAlpha = Math.max(0.08, Math.min(1, a));
      ctx.fillStyle = '#cfe6ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!document.hidden && !reducedMotion) raf = requestAnimationFrame(draw);
  }
  function redraw() {
    if (reducedMotion) { draw(0); return; }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }
  layout();
  window.addEventListener('resize', () => { layout(); redraw(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) redraw(); });
  redraw();
}

/* ---- UTC 时钟（全球市场） ---- */
const utcEl = $('#utcClock');
function tickUtc() {
  if (!utcEl) return;
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  utcEl.textContent = d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) +
    ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds()) + ' UTC';
}
tickUtc();
setInterval(tickUtc, 1000);


/* CATMODAL0X_20260923：价目表收进弹窗。默认不渲染,点开才拉 —— 首页一进来就该看到下单,
   不是先滚过 18 行价格。关法给三种:背景、✕、Esc；开之前记住焦点,关了还回去。 */
(() => {
  const modal = $('#catalogModal'), btn = $('#btnCatalog');
  if (!modal || !btn) return;
  let last = null, loaded = false;
  const open = () => {
    last = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    (modal.querySelector('.modal-x') || modal).focus();
    if (!loaded) { loaded = true; renderCatalog(); }
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (last && last.focus) last.focus();
  };
  btn.addEventListener('click', open);
  modal.querySelectorAll('[data-close-catalog]').forEach((e) => e.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();

// DLONLY0X_20260924：DSJ「直接改成全下载到电脑模式，网站上的6个步骤也直接撤掉，6个步骤只显示在下载到电脑页面」。
//   同一个文件、同一个指纹：在 0x000000000.com 上打开 → 只给「下载铸造页面」；
//   下载到电脑上双击打开（file://）→ 6 步。本机测试（127.0.0.1 / localhost）也走 6 步 —— GitHub 上的私钥外发检查就在本机跑。
const ON_SITE = /(^|\.)0x000000000\.com$/i.test(location.hostname);
[['#dlGate', !ON_SITE], ['#flowWrap', ON_SITE], ['#secOrders', ON_SITE]].forEach(([sel, hide]) => { const e = $(sel); if (e) e.hidden = hide; });
// REF0X_20260928：网站上有推荐码 → 下载的文件名带上它 + 「下载」那一块最上面说一句（带复制按钮）
function renderRef() {
  const box = $('#dlRef'); if (!box) return;
  const c = REF_FROM.code;
  box.hidden = !(ON_SITE && c);
  if (box.hidden) return;
  box.innerHTML = '<span>' + esc(t('refBanner')(c)) + '</span> <button type="button" class="copy" id="refCopyBtn" data-code="' + esc(c) + '">' + esc(t('refCopy')) + '</button>';
}
if (ON_SITE && REF_FROM.code) {
  { const a = $('#dlPage2'); if (a) a.setAttribute('download', '0x000000000_ref-' + REF_FROM.code + '.html'); }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#refCopyBtn'); if (!b) return;
    const done = () => { b.textContent = t('refCopied'); setTimeout(() => { b.textContent = t('refCopy'); }, 1200); };
    try { navigator.clipboard.writeText(b.dataset.code).then(done, () => {}); } catch (err) { /* 复制不了：码就印在旁边 */ }
  });
}
renderRef();
document.querySelectorAll('.buildIdCopy').forEach((e) => { e.textContent = ($('#buildId') || {}).textContent || ''; });
// CLEANURL0X_20260924：DSJ「我不喜欢看见这样的域名，后面带着#secOrder。我要很干净的0x000000000.com而已！」
//   ① 「开始铸造」原来是 <a href="#secOrder">，点一下地址栏就多出 #secOrder —— 改成按钮：只滚动，不碰地址栏。
//   ② 带着 #… 或 ?order=… 进来的（老链接、track.html 跳过来的）：该用的先读出来，然后把地址栏洗回干净的那一个。
const START_HASH = location.hash, START_QS = location.search;
try {
  if (/^https?:$/.test(location.protocol) && (location.hash || location.search || /\/index\.html$/.test(location.pathname)))
    history.replaceState(null, '', location.pathname.replace(/\/index\.html$/, '/'));
} catch (e) {}
const toOrder = (smooth) => { const g = $('#secOrder'); if (g) g.scrollIntoView({ behavior: smooth && !reducedMotion ? 'smooth' : 'auto', block: 'start' }); };
{ const b = $('#heroCta'); if (b) b.addEventListener('click', () => toOrder(true)); }
// CONTRACT0X_20260928：入口卡片「个人靓号（就是这一页）」—— 只滚到价格那一块，不碰地址栏
{ const b = $('#ecVanity'); if (b) b.addEventListener('click', () => { const h = document.querySelector('.hero'); if (h) h.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }); }); }
// PPTNAV0X_20260924：说明书在 0x000000000.com/ppt。下载到电脑上的这一份（file://）要写完整网址、开新窗口 ——
//   不然点一下就离开了这一页，内存里造好的钥匙和做到一半的单就没了。页脚的 FAQ / 订单查询同理（原来是相对路径，下载版点了是死链）。
if (!/^https?:$/.test(location.protocol)) {
  document.querySelectorAll('a[data-site]').forEach((a) => { a.href = 'https://0x000000000.com/' + a.dataset.site; a.target = '_blank'; a.rel = 'noopener'; });
}
// 老链接（track.html、以前发出去的 #secOrder / #secOrders）和带订单号进来的：网站上的订单区已经撤掉 → 直接带到下载那一块
if (ON_SITE && (/^#secOrders?$/.test(START_HASH) || /[?&](order=|track\b)/.test(START_QS))) setTimeout(() => toOrder(false), 300);
applyStaticLang();
renderOrders();
renderSteps();
renderBoot(false);
// 带着订单号进来（比如 track.html 跳过来,或者他自己存的链接）就直接续 —— 网站上没有 6 步，就告诉他去下载的那一页续
try {
  const q = new URLSearchParams(START_QS).get('order');
  const qid = String(q || '').trim().toLowerCase();
  if (q && ON_SITE) { const m = $('#dlResumeMsg'); if (m && /^[0-9a-f]{8}$/.test(qid)) { m.dataset.order = qid; m.textContent = t('dlResume')(qid); } }
  else if (q) setTimeout(() => resumeFrom(q, $('#resumeMsg')), 600);
} catch (e) {}
// 问后端一次：现在是真收款还是模拟。失败就当不是 live（宁可显示旧文案,也不要骗人说在收真钱）
// NETSYNC0X_20260924：拿到了才记 HEALTH_OK；断网打开的页面，连上网后在第 2 步补问（renderSteps 里的 sync）
function onHealth(h) {
  if (!h || h.code !== 200) return false;
  HEALTH_OK = true;
  if (IS_LIVE || !(h.body && h.body.mode === 'live')) return false;
  IS_LIVE = true;
  // IDLIVE0X_20261002：原来只换 zh、en —— 印尼文页面在真收款时还挂着「原型说明」（帮手 B 10-02 查出来）。每一种语言都换，以后加语言也不会漏
  for (const lg of Object.keys(dict)) liveSwap(dict[lg]);
  // ★ 只重绘步骤区是不够的：像 noteProto 这种靠 [data-i18n] 渲染的元素在别处，
  //   不重刷它们，字典换了页面上还是旧字（20260923 实测被浏览器抓到一次）。
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  return true;
}
api('/api/health').then((h) => { if (onHealth(h)) renderSteps(); }).catch(() => {});
initStars();
