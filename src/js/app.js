// 0x000000000 — 前端原型逻辑（终端风）
'use strict';

const dict = {
  zh: {
    run: '运行 Run', lblPos: '-位置 Position', posPrefix: '前缀 Prefix', posSuffix: '后缀 Suffix', posBoth: '前+后 Both ends',
    thType: '类型 Type', thPrice: '价格 USDT', thEta: '铸造耗时',
    catalogOpen: '查看全部价格 ▸', catalogTitle: '价目表',
    catalogTeaser: (on, off) => '两条链 · ' + on + ' 档在售' + (off ? '（另有 ' + off + ' 档铸造机暂不支持）' : '') + '，点上面那个按钮看完整价目表。', 
    catalogDown: '价目表暂时取不到 —— 宁可不显示，也不给你看一张可能过期的表。',
    kindPrefix: '前缀', digits: '位',
    onlyKinds: (k) => '目前只卖：' + k + '。后缀、前后缀组合、按图案定价都还没实现 —— 不在这张表里的一律不可售。',
    calcNotSellable: '不可售（后端目前不支持这一类）',
    calcNoCatalog: '价目表取不到，暂不报价',
    noteHot: '热门模式 (9999/8888/0000/dead/beef/c0ffee/666…) 溢价 30-100%；0x9999 与 0xabcd 难度相同——定价按位数不按字符。',
    safeTitle: '[SAFE] 定制区 · 无托管模式 NON-CUSTODIAL',
    safeBody: '我们全程只拿到影子 A 和另外半把钥匙 b —— 这两样加起来也推不出你的私钥。完整私钥只在你自己的电脑上拼出来。',
    noteProto: '原型说明：这一页连的是真平台，只有付款是模拟的。你的那一半钥匙只在你自己的电脑上生成和使用。',
    // LIVEPAY0X：切了真收款之后上面那句就是假话了。liveSwap 会用下面这句顶替它。
    noteProtoLive: '这一页连的是真平台：下单、铸造、交货、收款都是真的。你的那一半钥匙只在你自己的电脑上生成和使用，平台看不到。',
    heroTag: '靓号地址铸造台 · SPLIT-KEY 无托管',
    heroMission: '用 USDT 付款。你先在自己电脑上造一半钥匙，我们替你铸另一半——完整私钥只有你拼得出。',
    heroCta: '开始铸造 →',
    // TRUST0X_20260923：原来还写着「OFAC 制裁筛查 · 大额阈值 KYC」—— 代码里一行都没有（grep 0 处），
    //   「开源工具可审计」那时也还没公开。页面上每一句都得是真的，假话比没话更伤信任。
    foot1: '页面代码公开在 GitHub，可逐字节核对 · 定制区无托管 · 收款支持 TRON / BSC 上的 USDT',
    // TRUST0X_20260923：DSJ「两半都在我们的平台合成，用户会不会怀疑我们拿得到私钥？」
    //   说「拿不到」没用，要让用户自己能核对。每一条都是能验的事实，不是口号。
    proof1: '你的那一半钥匙在你自己的电脑上生成，也只存在你自己的电脑上。平台收到的只有公钥（公开的，像银行卡号）和签名（证明你手里有那一半，但不暴露它）—— 铸造页最下面「这一页跟平台说过的每一句话」逐条列着，你自己看。',
    proof2: '「造钥匙」这一步不需要联网：你可以先关掉 Wi-Fi 再点，照样做完。',
    proof3: '这个页面就是一个文件，跟 GitHub 上公开的那份逐字节相同。GitHub 的机器每小时自动下载一次网站上的页面核对指纹，还会在每个新版本上用真浏览器走完全程、查私钥有没有被发出去 —— 这两项检查我们插不上手。',
    proofVer: '页面版本',
    proofDl: '下载铸造页面到自己电脑上',
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
      health: '看平台在不在线 —— 没带你的任何东西',
      create: '下单 —— 告诉平台：哪条链、什么图案、用哪条链付款',
      share: '交「影子」—— 一个公开的数（像银行卡号）加一个签名，证明你手里有那一半钥匙；钥匙本身没发',
      payment: '问收款地址 —— 没带你的任何东西',
      status: '问进度 —— 没带你的任何东西',
      paysim: '测试用的模拟付款 —— 没带你的任何东西',
      download: '取货 —— 带了一个签名，证明是你本人来取',
      receipt: '交收条 —— 带了一个签名，证明你拿到了',
      other: '其他',
    },
    foot2: '平台永远不会索要你的私钥或备份文件 —— 任何索要私钥的消息都是钓鱼。',
    thOrder: '订单 Order', thPattern: '模式 Pattern', thStatus: '状态 Status', thPrice2: '价格 USDT',
    boot: [
      'Windows PowerShell',
      'Copyright (C) 0x000000000. All rights reserved.',
      '',
      '0x000000000 — VANITY ADDRESS MINER',
      '靓号地址铸造台 · split-key 无托管铸造',
      '航次: 0x000000000 · 任务: 铸造靓号私钥 · 轨道: 近地',
      '',
      '加载模块: [ok] keccak256   [ok] secp256k1   [ok] TRC20 watcher',
      'GPU 铸造队列: 待命 (Vast.ai / RunPod · 订单驱动扩缩容)',
      '',
      '命令: Get-VanityCatalog | Measure-VanityPattern | New-VanityOrder | Get-MyOrders',
    ],
    calcHeader: (p, pos) => 'PATTERN   : 0x' + p + '  (' + pos + ')',
    calcTries: (n, t) => 'TRIES     : ' + t + ' 期望次数 (16^' + n + ')',
    calcRate: 'HASHRATE  : 1.0 GKey/s 每卡 (RTX 4090 估算; 以实测为准)',
    calcEta: (s) => 'ETA       : ' + s,
    calcPrice: 'PRICE     : ',
    calcWarn: 'WARNINGS  : ',
    errHex: '错误: 模式必须是 hex 字符 (0-9 a-f)',
    errEmpty: '错误: 请至少输入 1 位模式',
    warnFarm: '≥13 位：目前不可售（后端最多到 12 位）。真要做得上 GPU 集群，得先谈。',
    warnImpossible: '40 位 (全9) 数学上不可行: 16^40 ≈ 1.46e48',
    warnEip55: '匹配忽略大小写 (EIP-55 校验和由地址自动派生)',
    ordersEmpty: '还没有订单', ordersDown: '订单暂时取不到，刷新一下再试',
    ordersResume: '接着做', thAction: '操作', ordersIdPh: '订单号（8 位）', ordersIdBtn: '接着做这一单',
    ordersIdLbl: '换了电脑或浏览器？输入订单号接着做：',
    statusTxt: (s) => '订单 ' + (orderState.orderId || '-') + ' · 状态: ' + s,
    flow: {
      // ALLINONE0X_20260923：全部改成人话。DSJ 原话「每个步骤必须人话解释，容易让用户明白」。
      // 规矩：不出现 P=A+b·G、ECDLP、变体、挖矿这类词；说清楚【这一步在谁的机器上算】。
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
      fileBad: '这个文件读不了，换一个试试。',
      noCore: '密钥模块没加载起来，刷新一下页面再试。',
      noTier: '这个长度目前没有定价，换一个长度。',
      offlineHint: '现在没联网，看不到价格 —— 钥匙照样能造。连上网以后价格会自己出来。',
      suggest: '建议',
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
      payChainLbl: '你想用哪条链付款',
      payInfo2: (a, amt, c, net) => '用 ' + net + ' 转 ' + amt + ' USDT 到  ' + a + '   · 到账后还要等 ' + c + ' 个确认',
      copyAddr: '复制地址',
      pay: '就当已付款（原型）', payLive: '我转好了，开始盯',
      payNote: '每一单的收款地址都不一样，我们靠地址认单，所以别用别的单子的地址。转完这一页会自己往下走，不用刷新；也可以直接关掉，回头在下面「我的订单」里找回来。',
      paying: '正在模拟到账…', payingLive: '正在盯这个地址（每 2.5 秒看一眼）…',
      watching: '开始盯链上这个地址…',
      stPaidWait: '钱收到了，正在排队等机器', stMining: '钱收到了，机器正在做',

      s4head: '我们开做',
      s4desc: '我们拿着你的影子 A 一直试，直到试出一个地址，它的开头或结尾正好是你要的那串。整个过程我们手上只有 A，做不出你的私钥。',
      net4: '🌐 保持联网，这一页先别关。为什么：平台的显卡正在替你算，这一页每隔几秒问一次进度。关掉也不要紧，回头在最下面用订单号接着做。',
      mineHit: '做出来了：', readyToTake: '可以取货了。',

      s5head: '取货：把两半合起来',
      s5desc: '平台把另一半（叫 b）交给你。先点「取货」把它拿回来，再点「合成我的钥匙」—— 在你的电脑上把两半合成完整私钥，并且当场核对算出来的地址是不是你买的那个，对不上就不让你往下导出。',
      net5: '先 🌐 联网点「取货」；看到「拿到了」之后可以 🔌 断网，再点「合成我的钥匙」和「导出钱包」。为什么：合成的这一刻完整私钥才第一次出现 —— 断网做，它就只可能留在你的电脑上。',
      dlBtn: '取货（要联网）',
      mergeBtn: '合成我的钥匙（可以断网）',
      gotB: '拿到了。现在可以断网（拔网线或关掉 Wi-Fi），再点「合成我的钥匙」。',
      mergeOk: '合成成功，地址已核对。完整私钥现在只在这台电脑上。',
      evmTwin: (a) => '同一把钥匙在以太坊 / BSC 上的写法是 ' + a + '。MetaMask 只认这种 0x 写法；要看到 T 开头的地址，请导进 TronLink 这类 TRON 钱包。',
      hitWord: '命中',
      addrMatch: '跟你买的那个地址一致 ✓',
      addrDiff: (a) => '★ 对不上！我们给的是 ' + a + ' —— 先别导出，把这一屏截给我们。',
      mergeBad: (want, ch) => '⛔ 合出来的地址没有一个是你要的 ' + want + '（' + ch + '）—— 我们给的 b 有问题。先别导出，把这一屏截给我们。',
      pwLbl: '给钱包文件设个密码', pwPh: '至少 8 位',
      ksBtn: '导出钱包文件', plainBtn: '导出明文私钥（不建议）',
      pwShort: '密码至少 8 位。这个密码丢了，导出来的文件就再也打不开了。',
      noSubtle: '这个浏览器不给用加密接口，换个浏览器，或者用下面的明文导出并自己保管好。',
      ksWork: '正在加密…（故意算得慢，别人暴力猜密码也得这么慢）',
      ksOk: '导好了：my-keystore.json。导进 MetaMask：账户 → 导入账户 → 选 JSON 文件 → 输这个密码。',
      ksOkTron: '导好了：my-keystore.json —— 这是加密备份，留好。MetaMask 不支持 TRON，导进去只会显示同一把钥匙的 0x 写法（上面那一行）。要在 TRON 上用，请用下面「导出明文私钥」导进 TronLink（导入钱包 → 私钥），导完立刻删掉那个文件。',
      ksFail: '加密失败：',
      plainWarn: (tron) => '明文私钥已下载（my-key.txt，里面就是 64 位私钥）。' + (tron ? '导进 TronLink：导入钱包 → 私钥 → 粘贴这 64 位。' : '导进 MetaMask：导入账户 → 私钥 → 粘贴这 64 位。') + '任何人拿到这个文件就拿到了这个地址 —— 导完立刻删掉它。',

      s6head: '交个收条',
      s6desc: '用刚合成的完整钥匙给一句话签个名交回来。平台手上没有你的那一半，这个签名平台自己造不出来 —— 收到就等于双方都认这一单交付完成了。',
      net6: '🌐 这一步要联网。为什么：要把「我拿到了」的签名交给平台，这一单才算结清。不交也不影响你已经拿到的钥匙。',
      receiptBtn: '签收条并提交',
      receiptSkip: '可以不交，不影响你已经拿到的钥匙。交了这一单算结清，结清之后你仍然可以随时免费重新下载同一个 b。',
      receiptOk: '收条收到了，这一单结清。',
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
    run: 'Run', lblPos: '-Position', posPrefix: 'Prefix', posSuffix: 'Suffix', posBoth: 'Both ends',
    thType: 'Type', thPrice: 'Price USDT', thEta: 'Mint time',
    catalogOpen: 'See all prices',  catalogTitle: 'Price list',
    catalogTeaser: (on, off) => 'Two chains, ' + on + ' tiers on sale' + (off ? ' (' + off + ' more not supported by the minter yet)' : '') + ' - open the full list with the button above.', 
    catalogDown: 'Price list unavailable right now — better to show nothing than a table that may be out of date.',
    kindPrefix: 'Prefix', digits: 'digits',
    onlyKinds: (k) => 'Currently on sale: ' + k + '. Suffix, both-ends and pattern-based pricing are not implemented — anything not in this table cannot be ordered.',
    calcNotSellable: 'Not for sale (backend does not support this kind yet)',
    calcNoCatalog: 'Price list unavailable — no quote',
    noteHot: 'Hot patterns (9999/8888/0000/dead/beef/c0ffee/666…) +30-100%. 0x9999 is as hard as 0xabcd — price by length, not by characters.',
    safeTitle: '[SAFE] CUSTOM ZONE · NON-CUSTODIAL',
    safeBody: 'All we ever hold is your shadow A and the other half, b. Those two together still cannot produce your private key - it only ever gets assembled on your own computer.',
    noteProto: 'Prototype note: this page talks to the real platform; only payment is simulated. Your half of the key is created and used only on your own computer.',
    noteProtoLive: 'This page talks to the real platform: ordering, minting, delivery and payment are all real. Your half of the key is created and used only on your own computer - the platform never sees it.',
    heroTag: 'VANITY ADDRESS MINER · NON-CUSTODIAL SPLIT-KEY',
    heroMission: 'Pay in USDT. You make half the key on your own machine, we mint the other half - the full key can only be assembled by you.',
    heroCta: 'Start minting →',
    foot1: 'page code published on GitHub, verifiable byte for byte · custom zone non-custodial · USDT on TRON / BSC',
    proof1: 'Your half of the key is created on your own computer and only ever stored there. The platform only receives a public key (public, like a bank account number) and signatures (proof that you hold your half, without revealing it). Everything the minting page says to the platform is listed at its bottom under "Every word this page said to the platform" - check it yourself.',
    proof2: '"Make key" needs no network: switch off Wi-Fi before clicking and it still works.',
    proof3: 'This page is a single file, byte-for-byte identical to the copy published on GitHub. GitHub\'s machines download the live page every hour and compare fingerprints, and run the whole flow in a real browser on every new version to check that no private key is sent - we cannot touch either check.',
    proofVer: 'page version',
    proofDl: 'Download the minting page to your computer',
    proofGh: 'Verify on GitHub',
    dlHead: 'Mint on your own computer',
    dlWhy: 'Minting a vanity address involves your private key. To keep that key on your own computer from start to finish, making the key, ordering, collecting and building the key all happen in a page you download to your computer - not on this website.',
    dlStep1: 'Click the button below to download the minting page (a single file: 0x000000000.html).',
    dlStep2: 'Double-click it on your computer to open it (Chrome or Edge).',
    dlStep3: 'Follow its 6 steps. Each step tells you in plain words whether to go offline or stay online, and why.',
    dlGetBtn: 'Download the minting page',
    dlNote: 'The downloaded file stays in your hands - we can never change it afterwards. It is byte-for-byte identical to the copy published on GitHub, so you can check it yourself ("Verify on GitHub" above).',
    dlResume: (id) => 'To continue order ' + id + ': open the minting page on your computer and enter this order number at the bottom.',
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
      health: 'checked the platform is online - carried nothing of yours',
      create: 'order - told the platform which chain, which pattern and which payment chain',
      share: 'handed in the "shadow" - a public number (like a bank account number) plus a signature proving you hold your half; the key itself was not sent',
      payment: 'asked for the payment address - carried nothing of yours',
      status: 'asked for progress - carried nothing of yours',
      paysim: 'test-only simulated payment - carried nothing of yours',
      download: 'collect - carried a signature proving it is you',
      receipt: 'receipt - carried a signature proving you got it',
      other: 'other',
    },
    foot2: 'The platform will never ask for your private key or backup file - any message asking for keys is phishing.',
    thOrder: 'Order', thPattern: 'Pattern', thStatus: 'Status', thPrice2: 'Price USDT',
    boot: [
      'Windows PowerShell',
      'Copyright (C) 0x000000000. All rights reserved.',
      '',
      '0x000000000 — VANITY ADDRESS MINER',
      'split-key non-custodial vanity minting',
      'vessel: 0x000000000 · mission: mint vanity keys · orbit: LEO',
      '',
      'loading: [ok] keccak256   [ok] secp256k1   [ok] TRC20 watcher',
      'GPU pool: standby (Vast.ai / RunPod · order-driven scaling)',
      '',
      'commands: Get-VanityCatalog | Measure-VanityPattern | New-VanityOrder | Get-MyOrders',
    ],
    calcHeader: (p, pos) => 'PATTERN   : 0x' + p + '  (' + pos + ')',
    calcTries: (n, t) => 'TRIES     : ' + t + ' expected (16^' + n + ')',
    calcRate: 'HASHRATE  : 1.0 GKey/s per GPU (RTX 4090 estimate; calibrate with benchmark)',
    calcEta: (s) => 'ETA       : ' + s,
    calcPrice: 'PRICE     : ',
    calcWarn: 'WARNINGS  : ',
    errHex: 'error: pattern must be hex characters (0-9 a-f)',
    errEmpty: 'error: enter at least 1 hex digit',
    warnFarm: '>=13 digits: not for sale (the backend tops out at 12). Doing it for real needs a GPU cluster — talk to us first.',
    warnImpossible: '40 digits (all-9) is mathematically impossible: 16^40 ≈ 1.46e48',
    warnEip55: 'matching ignores case (EIP-55 checksum is derived automatically)',
    ordersEmpty: 'No orders yet', ordersDown: 'Could not load your orders - refresh to try again',
    ordersResume: 'Continue', thAction: 'Action', ordersIdPh: 'order number (8 chars)', ordersIdBtn: 'Continue this order',
    ordersIdLbl: 'On another computer or browser? Enter the order number to continue:',
    statusTxt: (s) => 'order ' + (orderState.orderId || '-') + ' · status: ' + s,
    flow: {
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
      fileBad: 'That file could not be read. Try another one.',
      noCore: 'The key module did not load. Refresh the page and try again.',
      noTier: 'That length has no price yet - pick another length.',
      offlineHint: 'You are offline, so prices are not shown - you can still make the key. Prices appear by themselves once you reconnect.',
      suggest: 'suggested',
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
      payChainLbl: 'Which chain do you want to pay on',
      payInfo2: (a, amt, c, net) => 'Send ' + amt + ' USDT over ' + net + ' to  ' + a + '   - then ' + c + ' confirmations',
      copyAddr: 'Copy address',
      pay: 'Count it as paid (prototype)', payLive: 'Sent it - start watching',
      payNote: 'Every order gets its own address and that is how we match payments, so never reuse another order\'s address. The page moves on by itself - no refresh needed. You can also close it and come back through "My orders" below.',
      paying: 'Simulating payment...', payingLive: 'Watching that address (every 2.5s)...',
      watching: 'Watching that address on-chain...',
      stPaidWait: 'Paid - queued for a machine', stMining: 'Paid - the machine is working',

      s4head: 'We do the work',
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
      pwLbl: 'Password for the wallet file', pwPh: 'at least 8 characters',
      ksBtn: 'Export wallet file', plainBtn: 'Export plain private key (not advised)',
      pwShort: 'At least 8 characters. Lose this password and the exported file can never be opened.',
      noSubtle: 'This browser will not allow the crypto API. Use another browser, or the plain export below and keep it safe yourself.',
      ksWork: 'Encrypting... (deliberately slow, so brute-forcing the password is slow too) ',
      ksOk: 'Exported: my-keystore.json. In MetaMask: Account - Import account - JSON file - this password.',
      ksOkTron: 'Exported: my-keystore.json - keep it as your encrypted backup. MetaMask does not support TRON and would only show the 0x form of the same key (the line above). To use it on TRON, click "Export plain private key" below and import it into TronLink (Import wallet - Private key), then delete that file right away.',
      ksFail: 'Encryption failed: ',
      plainWarn: (tron) => 'Plain private key downloaded (my-key.txt - just the 64-character key). ' + (tron ? 'TronLink: Import wallet - Private key - paste the 64 characters. ' : 'MetaMask: Import account - Private key - paste the 64 characters. ') + 'Anyone who gets this file owns the address - delete it right after importing.',

      s6head: 'Send a receipt',
      s6desc: 'Sign one phrase with the key you just built. The platform does not hold your half, so it could not forge this signature - receiving it means both sides agree the order is delivered.',
      net6: '🌐 Needs the internet. Why: the "I got it" signature has to reach the platform to settle the order. Skipping it does not affect the key you already have.',
      receiptBtn: 'Sign and send receipt',
      receiptSkip: 'Optional. Skipping it does not affect the key you already hold. Filing it settles the order, and you can still re-download the same b for free afterwards.',
      receiptOk: 'Receipt filed - order settled.',
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
};

const savedLang = (() => { try { return localStorage.getItem('0xlang'); } catch (e) { return null; } })();
let lang = savedLang || (typeof navigator !== 'undefined' && navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en');
const t = (k) => (dict[lang][k] !== undefined ? dict[lang][k] : k);
const $ = (s) => document.querySelector(s);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- LIVEPAY0X_20260922：真收款模式 ----
   后端 TRON_MODE=live 之后,「模拟支付」那条路会被服务端 400 掉（platform-server.mjs:436）,
   而轮询原本只在模拟支付成功后才启动 —— 于是真转了账页面会一直干等。
   这里做两件事：把 xxxLive 文案顶上去、让「我已转账」直接启动轮询。 */
let IS_LIVE = false;
function liveSwap(o) {
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    const base = k.endsWith('Live') && k.slice(0, -4);
    if (base && Object.prototype.hasOwnProperty.call(o, base)) o[base] = o[k];
    else liveSwap(o[k]);
  }
}

/* ---- 语言切换 ---- */
function applyLang() {
  try { localStorage.setItem('0xlang', lang); } catch (e) {}
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('#btnZh').classList.toggle('active', lang === 'zh');
  $('#btnEn').classList.toggle('active', lang === 'en');
  renderBoot(true);
  renderCatalog();
  renderTeaser();
  renderOrders();
  renderSteps();
  if (lastCalc) renderCalc();
  const dr = $('#dlResumeMsg'); if (dr && dr.dataset.order) dr.textContent = t('dlResume')(dr.dataset.order);
}
$('#btnZh').addEventListener('click', () => { lang = 'zh'; applyLang(); });
$('#btnEn').addEventListener('click', () => { lang = 'en'; applyLang(); });

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
  const f2 = dict[lang].flow || {};
  body.innerHTML = chains.map((c) => {
    const rows = CATALOG.rows.filter((r) => (r.chain || 'evm') === c.id);
    if (!rows.length) return '';
    const head = '<tr><td colspan="3" class="chainhead">' + esc(c.label + '  ' + c.example)
      + (c.worksOn && c.worksOn.length > 1 ? '<span class="works">' + esc(c.worksOn.join(' · ')) + '</span>' : '')
      + '</td></tr>';
    return head + rows.map((r) => {
      const priced = r.priceUsdt != null;
      const price = priced ? esc(String(r.priceUsdt))
        : '<span class="soon">' + esc(f2.notPriced || '待定价')
          + (r.suggestedUsdt != null ? ' · ' + esc((f2.suggest || '建议') + ' ' + r.suggestedUsdt) : '') + '</span>';
      // CATFIELD0X_20260923：后端目录行现在给的是 kindLabel / pinned / mintTimeText。
      //   etaText 按 DSJ 死令【不给客户看期望耗时】已删；slaText 早改名成 mintTimeText。
      //   这里原来还硬写 t('kindPrefix')，后缀档也会被标成「前缀」—— 一起修掉。
      return '<tr' + (priced && r.mintable !== false ? '' : ' class="unpriced"') + '><td class="tier">'
        + esc((r.pattern || '') + '  ')
        + esc((r.kindLabel || t('kindPrefix')) + ' ' + (r.pinned != null ? r.pinned : r.length) + ' ' + t('digits')) + '</td>'
        + '<td class="price">' + price + '</td>'
        // MINTABLE0X_20260923：定了价但铸造机做不了的,价格照写（DSJ 定的价不动）,耗时那格写明为什么不卖
        + '<td class="eta">' + (r.mintable === false
            ? '<span class="soon">' + esc(f2.posSoon || '铸造机暂不支持') + '</span>'
            : esc(r.mintTimeText)) + '</td></tr>';
    }).join('');
  }).join('') + '<tr><td colspan="3">' + esc(CATALOG.note || t('onlyKinds')(CATALOG.sellableKinds.join(' / '))) + '</td></tr>';
}

/* ---- 难度计算器 ---- */
// PRICECONTRA0X_20260921: 这里原本有 PRICE_PREFIX / PRICE_SUFFIX 两张写死的表，
// 和后端真正收钱的那张对不上，还给后端根本不能卖的后缀报价。已删 —— 价目只有一个来源。
let lastCalc = null;
let PICKED = 'evm';                 // 客户选的是【要哪条链的靓号地址】，不是用哪条链付款

function fmtTries(b) { return b.toLocaleString('en-US'); }
function etaStr(tries) {
  const secs = Number(tries / 10n ** 9n);
  if (secs < 1) return '<1s / 卡';
  if (secs < 60) return '~' + Math.round(secs) + 's / 卡';
  if (secs < 3600) return '~' + Math.round(secs / 60) + ' 分钟 / 卡';
  if (secs < 86400) return '~' + (secs / 3600).toFixed(1) + ' 小时 / 卡';
  return '~' + (secs / 86400).toFixed(1) + ' 天 / 卡';
}
function renderCalc() {
  const out = $('#calcOut');
  if (!lastCalc) { out.innerHTML = ''; return; }
  const { p1, p2, pos, lines } = lastCalc;
  out.innerHTML = lines;
  void p1; void p2; void pos;
}
function runCalc() {
  const pos = $('#pos').value;
  const p1 = $('#pat1').value.trim().toLowerCase().replace(/^0x/, '');
  const p2 = pos === 'both' ? $('#pat2').value.trim().toLowerCase().replace(/^0x/, '') : '';
  const out = $('#calcOut');
  const bad = (msg) => out.innerHTML = '<span class="err">' + msg + '</span>';
  if (!p1 || (pos === 'both' && !p2)) return bad(t('errEmpty'));
  if (!/^[0-9a-f]+$/.test(p1) || (pos === 'both' && !/^[0-9a-f]+$/.test(p2))) return bad(t('errHex'));
  const total = p1.length + p2.length;
  if (total >= 40) {
    out.innerHTML = '<span class="warn">' + t('warnImpossible') + '</span>';
    lastCalc = { p1, p2, pos, lines: out.innerHTML };
    return;
  }
  const tries = 16n ** BigInt(total);
  const L = [];
  L.push('<span class="k">' + esc(t('calcHeader')(pos === 'both' ? p1 + '…' + p2 : (pos === 'suffix' ? '…' + p1 : p1), t('pos' + pos.charAt(0).toUpperCase() + pos.slice(1)))) + '</span>');
  L.push('<span class="k">' + esc(t('calcTries')(total, fmtTries(tries))) + '</span>');
  L.push('<span class="k">' + esc(t('calcRate')) + '</span>');
  L.push('<span class="k">' + esc(t('calcEta')(etaStr(tries))) + '</span>');
  // 定价只认后端目录。不在目录里的一律写【不可售】——
  // 以前这里对后缀/前后缀报「面议」，而那种单子后端一定 400。
  const kind = pos === 'both' ? 'both' : (pos === 'suffix' ? 'suffix' : 'prefix');
  const hit = catalogLookup(kind, total);
  const price = hit === null ? t('calcNoCatalog')
    : (hit === false ? t('calcNotSellable') : hit.priceUsdt + ' USDT');
  L.push('<span class="k">' + esc(t('calcPrice')) + '</span><span class="v gold">' + esc(price) + '</span>');
  const warns = [];
  if (total >= 13) warns.push(t('warnFarm'));
  warns.push(t('warnEip55'));
  L.push('<span class="k">' + esc(t('calcWarn')) + '</span><span class="' + (total >= 13 ? 'warn' : 'v') + '">' + esc(warns.join('; ')) + '</span>');
  out.innerHTML = L.join('\n');
  lastCalc = { p1, p2, pos, lines: out.innerHTML };
}
$('#calcBtn').addEventListener('click', runCalc);
$('#pos').addEventListener('change', () => { $('#pat2').hidden = $('#pos').value !== 'both'; if (lastCalc) runCalc(); });
$('#pat1').addEventListener('keydown', (e) => { if (e.key === 'Enter') runCalc(); });
$('#pat2').addEventListener('keydown', (e) => { if (e.key === 'Enter') runCalc(); });

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
let RESUME = null;   // 由 wireOrderFlow 挂上（它要用向导里的闭包）

// SENTLOG0X_20260923：这一页发给平台的【每一次】通信都记下来，用人话摆在页面上（「发给平台的全部内容」）。
//   这里是全页唯一的出网口 —— 页面上别处没有 fetch / XHR / WebSocket（打包闸会扫）。
const SENT = [];
function sentKind(method, path) {
  const p = path.split('?')[0];
  if (p === '/api/catalog') return 'catalog';
  if (p === '/api/health') return 'health';
  if (method === 'POST' && p === '/api/orders') return 'create';
  if (/\/share$/.test(p)) return 'share';
  if (/\/payment$/.test(p)) return 'payment';
  if (/\/pay-sim$/.test(p)) return 'paysim';
  if (/\/download$/.test(p)) return 'download';
  if (/\/receipt$/.test(p)) return 'receipt';
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
// 从自己电脑上打开的这份（file://）不需要「下载这个页面」那个链接 —— 它自己就是那个文件
try { if (location.protocol === 'file:') { const a = document.getElementById('dlPage'); if (a) a.hidden = true; } } catch (e) {}
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
  outLine(container, (res.code ? 'HTTP ' + res.code + ' ' : '') + (b.error || ''), 'err');
  if (b.reason) outLine(container, b.reason, 'err');
  if (Array.isArray(b.sellableLengths) && b.sellableLengths.length) {
    outLine(container, (lang === 'en' ? 'sellable lengths: ' : '可售位数: ') + b.sellableLengths.join(' / '), 'err');
  }
}

/* ────────────────────────────────────────────────────────────────────────
   ALLINONE0X_20260923 —— 六步全部在这一页做完。

   DSJ 原话：「不要来回切换，太麻烦！」「把每个步骤设计好，让用户跟着跑就行！」
   原来的做法是：页面只负责下单，造钥匙/签名/合钥匙/签回执四件事要跳去 tool.html，
   用户得在两个标签页之间来回七趟，中间还要手动复制粘贴 A、SIG、b、回执签名四样东西。
   任何一样贴错、贴漏、贴串行，都表现为后端一句看不懂的报错。

   现在：密钥运算由 js/keycore.js 提供（跟 tool.html 内联的是同一份），
   页面自己调，用户只用点按钮。s 全程只在这个浏览器的内存里，一个字节都不上传。
   tool.html 仍然保留 —— 它是「下载下来、断网、离线用」那条路，不是必经之路。
   ──────────────────────────────────────────────────────────────────────── */

const KC = () => window.KeyCore;

// NETGUIDE0X_20260924：DSJ「哪一步需要断网，哪一步要联网也要人话辅助引导+解释为什么」
function stepBox(no, head, desc, net) {
  const li = document.createElement('li');
  li.innerHTML =
    '<div class="step-head"><span class="no">[' + no + '/6]</span>' + esc(head) + '</div>' +
    (net ? '<div class="netline">' + esc(net) + '</div>' : '') +
    '<div class="step-desc">' + esc(desc) + '</div>';
  return li;
}
function note(text, cls) {
  return '<div class="step-desc' + (cls ? ' ' + cls : '') + '">' + esc(text) + '</div>';
}

function renderSteps() {
  const f = t('flow');
  stepsEl.innerHTML = '';
  if (orderState.poll) { clearInterval(orderState.poll); orderState.poll = null; }
  orderState.orderId = null; orderState.challenge = null; orderState.A = null;
  orderState.b = null; orderState.address = null; orderState.sec = null;

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
    '<div class="flow-ctl"><button class="run" id="btnCreate" disabled>' + esc(f.create) + '</button></div>' +
    '<pre class="step-out" id="out2" hidden></pre>';
  stepsEl.appendChild(li2);

  // ── [3/6] 付款 ──────────────────────────────────────────────────────
  const li3 = stepBox(3, f.s3head, IS_LIVE ? f.s3descLive : f.s3desc, f.net3);
  li3.innerHTML +=
    '<div class="flow-ctl" id="payInfo" hidden></div>' +
    '<div class="flow-ctl"><button class="run" id="btnPay" disabled>' + esc(IS_LIVE ? f.payLive : f.pay) + '</button></div>' +
    note(f.payNote, 'dim') +
    '<pre class="step-out" id="out3" hidden></pre>';
  stepsEl.appendChild(li3);

  // ── [4/6] 铸造 ──────────────────────────────────────────────────────
  const li4 = stepBox(4, f.s4head, f.s4desc, f.net4);
  li4.innerHTML += '<pre class="step-out" id="out4" hidden></pre>';
  stepsEl.appendChild(li4);

  // ── [5/6] 取货 + 当场合成 ───────────────────────────────────────────
  const li5 = stepBox(5, f.s5head, f.s5desc, f.net5);
  li5.innerHTML +=
    '<div class="flow-ctl"><button class="run" id="btnDownload" disabled>' + esc(f.dlBtn) + '</button> ' +
      '<button class="run" id="btnMerge" disabled>' + esc(f.mergeBtn) + '</button></div>' +
    '<pre class="step-out" id="out5" hidden></pre>' +
    '<div class="flow-ctl" id="ksBox" hidden>' +
      '<span class="lbl">' + esc(f.pwLbl) + '</span>' +
      '<input type="password" id="ksPw" aria-label="keystore password" placeholder="' + esc(f.pwPh) + '">' +
      '<button class="run" id="btnKs">' + esc(f.ksBtn) + '</button>' +
      '<button class="copy" id="btnPlain">' + esc(f.plainBtn) + '</button></div>' +
    '<div class="step-desc" id="ksMsg"></div>';
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
    id, label: KC().CHAINS[id].label, example: '', addrLen: KC().CHAINS[id].addrLen, caseSensitive: !KC().CHAINS[id].lower })) : []);
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
      : row ? f.patOk2(row.priceUsdt, row.mintTimeText || '')
      : f.noTier;
  }
  function renderChainPick() {
    const box = $('#chainPick'); const list = chainList(); if (!box || !list.length) return;
    box.innerHTML = list.map((c) =>
      '<button class="chip' + (c.id === PICKED ? ' active' : '') + '" data-chain="' + esc(c.id) + '">'
      + esc(c.label) + ' <span class="dim">' + esc(c.example) + '</span></button>').join('');
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
  function renderPayChains() {
    const sel = $('#payChain'); if (!sel) return;
    const list = (CATALOG && CATALOG.payChains) || [{ id: 'tron', label: 'TRON', short: 'TRC20', confirmations: 19, note: '' }];
    const cur = sel.value;
    sel.innerHTML = list.map((c) =>
      '<option value="' + esc(c.id) + '">' + esc(c.label + ' · USDT-' + c.short) + '</option>').join('');
    if (cur && list.some((c) => c.id === cur)) sel.value = cur;
    const note = () => {
      const c = list.find((x) => x.id === sel.value) || list[0];
      $('#payChainNote').textContent = c ? (c.note + ' 到账后要等 ' + c.confirmations + ' 个确认。') : '';
    };
    sel.onchange = note; note();
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
  if (CATALOG) bootOrder();
  else { loadCatalog().then(bootOrder).catch(() => { renderChainPick(); renderPayChains(); syncPosOptions(); refreshHint(); }); }
  // 断网打开、后来连上了：自己去把目录补回来（价格、能不能铸），不用刷新页面
  window.ononline = () => { if (!CATALOG) loadCatalog().then(() => { if (CATALOG) { renderPayChains(); syncPosOptions(); refreshHint(); if (!orderState.sec) renderChainPick(); } }).catch(() => {}); };

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
  // 显示收款地址 + 打开「我转好了」按钮
  async function showPayment() {
    const pay = await api('/api/orders/' + orderState.orderId + '/payment');
    if (pay.code !== 200) return false;
    orderState.address = pay.body.address;
    const pi = $('#payInfo'); pi.hidden = false;
    pi.innerHTML = '<span class="lbl">' + esc(f.payInfo2(pay.body.address, pay.body.amountUsdt, pay.body.confirmationsRequired, pay.body.chain + ' · USDT-' + pay.body.network)) + '</span>' +
      '<button class="copy" data-copycmd="' + esc(pay.body.address) + '">' + esc(f.copyAddr) + '</button>';
    $('#btnPay').disabled = false;
    return true;
  }
  $('#btnCreate').addEventListener('click', async () => {
    const out = $('#out2'); out.hidden = false; out.innerHTML = '';
    const sec = orderState.sec;
    if (!sec) return outLine(out, f.needGen, 'err');
    const btn = $('#btnCreate'); btn.disabled = true;
    const payChain = ($('#payChain') || {}).value || 'tron';
    const res = await api('/api/orders', 'POST', { chain: sec.chain, prefix: sec.prefix, suffix: sec.suffix, payChain });
    if (res.code !== 200) { showApiError(out, res); btn.disabled = false; return; }
    orderState.orderId = res.body.orderId;
    orderState.challenge = res.body.challenge;
    rememberOrder(res.body.orderId);                    // 这个浏览器记住自己下过的单,关了页面还找得回来
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
      if (r.body.status !== 'found') {
        const msg = r.body.status === 'mining' ? f.stMining : (r.body.status === 'paid' ? f.stPaidWait : null);
        if (msg && orderState.lastSeen !== r.body.status) {
          orderState.lastSeen = r.body.status;
          outLine($('#out4'), msg, 'ok'); $('#out4').hidden = false;
        }
        return;
      }
      if (orderState.poll) { clearInterval(orderState.poll); orderState.poll = null; }
      if (!r.body.ready) return;
      setStatus('paid');
      orderState.challenge = r.body.challenge || orderState.challenge;
      orderState.receiptChallenge = r.body.receiptChallenge || null;
      const out4 = $('#out4'); out4.hidden = false; out4.innerHTML = '';
      outLine(out4, f.mineHit + r.body.foundAddress, 'ok');
      outLine(out4, f.readyToTake, 'ok');
      $('#btnDownload').disabled = false;
    });
  };
  $('#btnPay').addEventListener('click', async () => {
    const out = $('#out3'); out.hidden = false; out.innerHTML = '';
    if (IS_LIVE) {
      outLine(out, f.payingLive, 'dim');
      $('#btnPay').disabled = true;
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
  $('#btnKs').addEventListener('click', function () {
    if (!MERGED) return;
    const msg = $('#ksMsg');
    const pw = $('#ksPw').value || '';
    if (pw.length < 8) { msg.className = 'step-desc warn'; msg.textContent = f.pwShort; return; }
    if (!crypto.subtle) { msg.className = 'step-desc warn'; msg.textContent = f.noSubtle; return; }
    const btn = this; btn.disabled = true;
    msg.className = 'step-desc';
    KC().keystore(MERGED.k, MERGED.addr, MERGED.chain, pw, (p) => {
      msg.textContent = f.ksWork + Math.round(p * 100) + '%';
    }).then((ks) => {
      dl('my-keystore.json', JSON.stringify(ks, null, 2));
      msg.textContent = MERGED.chain === 'tron' ? f.ksOkTron : f.ksOk; btn.disabled = false;
    }, (e) => { msg.className = 'step-desc warn'; msg.textContent = f.ksFail + e.message; btn.disabled = false; });
  });
  $('#btnPlain').addEventListener('click', () => {
    if (!MERGED) return;
    // KEYTXT0X_20260924：原来写 0x + 64 位。TronLink 只收 64 位 0-9a-f（官方说明），多了 0x 就导不进去；MetaMask 两种都收。
    dl('my-key.txt', KC().pad64(MERGED.k));
    const msg = $('#ksMsg'); msg.className = 'step-desc warn'; msg.textContent = f.plainWarn(MERGED.chain === 'tron');
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
    $('#btnReceipt').disabled = true;
    setStatus('settled');
  });

  // ── 续单（RESUME0X_20260923）────────────────────────────────────────
  //   原来页面写着「可以直接关掉，回头在我的订单里找回来」—— 那是假的：订单表点了没反应，
  //   关掉页面之后没有任何办法接着做一张付过钱的单。铸造要一个小时，没人会一直开着页面。
  //   现在：凭订单号恢复到它该在的那一步。钥匙（s）不在服务器上，所以要取货时请他选回备份文件。
  RESUME = async (id) => {
    id = String(id || '').trim().toLowerCase();
    if (!/^[0-9a-f]{8}$/.test(id)) return f.badId;
    const r = await api('/api/orders/' + id);
    if (r.code !== 200) return (r.body && r.body.error) || f.noSuchOrder;
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
    ['#btnGen', '#btnCreate', '#orderPos', '#orderPat', '#orderPat2', '#payChain'].forEach((sel) => { const e = $(sel); if (e) e.disabled = true; });
    stepsEl.querySelectorAll('#chainPick [data-chain]').forEach((b) => { b.disabled = true; });
    const o1 = $('#out1'); o1.hidden = false; o1.innerHTML = '';
    outLine(o1, f.resuming(o.id, o.patternText || o.pattern, (o.chain || 'evm').toUpperCase()), 'ok');
    if (!orderState.sec) outLine(o1, f.pickSecForResume, 'err');
    const st = o.status;
    setStatus(st);
    if (st === 'created') {                              // 建了单还没交份额
      if (orderState.sec) { const o2 = $('#out2'); o2.hidden = false; if (await uploadShare(o2)) await showPayment(); }
      else orderState.pendingShare = true;
    } else if (st === 'share_uploaded') {
      await showPayment();
    } else if (st === 'paid' || st === 'mining') {
      await showPayment(); $('#btnPay').disabled = true;
      const o3 = $('#out3'); o3.hidden = false; outLine(o3, f.watchingAgain, 'dim');
      if (!orderState.poll) orderState.poll = setInterval(pollStatus, 2500);
    } else if (st === 'found' || st === 'settled') {
      const o4 = $('#out4'); o4.hidden = false;
      if (o.foundAddress) outLine(o4, f.mineHit + o.foundAddress, 'ok');
      outLine(o4, f.readyToTake, 'ok');
      $('#btnDownload').disabled = false;
    } else {
      const o3 = $('#out3'); o3.hidden = false; outLine(o3, f.orderClosed(statusLabel(st)), 'err');
    }
    $('#steps').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
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
    body.innerHTML = '<tr><td colspan="5">' + esc(t('ordersDown')) + '</td></tr>'; return;
  }
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

/* ---- 快速模式 chips ---- */
$('#chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#chips .chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  $('#pos').value = 'prefix';
  $('#pat2').hidden = true;
  $('#pat1').value = chip.dataset.pat;
  runCalc();
  $('#calcOut').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
});

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
document.querySelectorAll('.buildIdCopy').forEach((e) => { e.textContent = ($('#buildId') || {}).textContent || ''; });
// 老链接（track.html、以前发出去的 #secOrders）和带订单号进来的：网站上的订单区已经撤掉 → 直接带到下载那一块
if (ON_SITE && (location.hash === '#secOrders' || /[?&]order=/.test(location.search)))
  setTimeout(() => { const g = $('#secOrder'); if (g) g.scrollIntoView({ block: 'start' }); }, 300);
renderOrders();
renderSteps();
renderBoot(false);
// 带着订单号进来（比如 track.html 跳过来,或者他自己存的链接）就直接续 —— 网站上没有 6 步，就告诉他去下载的那一页续
try {
  const q = new URLSearchParams(location.search).get('order');
  const qid = String(q || '').trim().toLowerCase();
  if (q && ON_SITE) { const m = $('#dlResumeMsg'); if (m && /^[0-9a-f]{8}$/.test(qid)) { m.dataset.order = qid; m.textContent = t('dlResume')(qid); } }
  else if (q) setTimeout(() => resumeFrom(q, $('#resumeMsg')), 600);
} catch (e) {}
// 问后端一次：现在是真收款还是模拟。失败就当不是 live（宁可显示旧文案,也不要骗人说在收真钱）
api('/api/health').then((h) => {
  IS_LIVE = !!(h && h.code === 200 && h.body && h.body.mode === 'live');
  if (!IS_LIVE) return;
  liveSwap(dict.zh); liveSwap(dict.en);
  // ★ 只重绘步骤区是不够的：像 noteProto 这种靠 [data-i18n] 渲染的元素在别处，
  //   不重刷它们，字典换了页面上还是旧字（20260923 实测被浏览器抓到一次）。
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  renderSteps();
}).catch(() => {});
$('#pat2').hidden = $('#pos').value !== 'both';
initStars();
