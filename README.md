<p align="center"><img src="logo.svg" width="120" height="120" alt="0x000000000 logo"></p>

# 0x000000000.com page code · published so you can check it

**English** · [中文](README.zh-CN.md)

[![Live page tamper patrol](https://github.com/0x000000000-com/0x000000000/actions/workflows/tamper-check.yml/badge.svg)](https://github.com/0x000000000-com/0x000000000/actions/workflows/tamper-check.yml)
[![Private-key leak check](https://github.com/0x000000000-com/0x000000000/actions/workflows/noleak.yml/badge.svg)](https://github.com/0x000000000-com/0x000000000/actions/workflows/noleak.yml)
[![Font rebuild check](https://github.com/0x000000000-com/0x000000000/actions/workflows/fonts.yml/badge.svg)](https://github.com/0x000000000-com/0x000000000/actions/workflows/fonts.yml)

This repository does one thing: **it lets you confirm two facts yourself, without having to trust us —**

1. **The platform never gets your private key.**
2. **The platform has not secretly changed the page.**

Prefer an animated version first? **[0x000000000.com/ppt](https://0x000000000.com/ppt)** — the 6 steps, why you do not need to trust us, why we cannot get your private key, and where the proof is. That page's file is here too (`ppt.html`).

The home page also has a **free address-poisoning check** for TRON and a list of **security news** (incidents and research findings, each with its source). The check sends the platform one thing only: the address you pasted (see the table below).

The white paper: **[0x000000000.com/wp](https://0x000000000.com/wp)** — what runs today, the scam we work against (address poisoning), what we build next, and how to check each claim yourself. Its file is here too (`wp.html`).

Payment cards: **0x000000000.com/@name** — the page a verified person or business shows to the people who pay them: every verified address with a copy button and a QR code, and a box that tells you, inside your browser, whether the address you are about to pay is one of them. The page's file is here too (`card.html`); the addresses on it are read from the platform when the page opens. Ours is [0x000000000.com/@0x000000000](https://0x000000000.com/@0x000000000).

Vanity contracts and token addresses: **[0x000000000.com/contract](https://0x000000000.com/contract)** and **[0x000000000.com/token](https://0x000000000.com/token)** — for project teams and token issuers: a contract address that is easy to recognise and the same on every EVM chain. No key is involved at all: we compute only a salt, which works through CreateX and only for your own deployer address; you check it on your own computer and deploy it yourself. Each page is one file, here too (`0x000000000-contract.html`, `0x000000000-token.html`), put together from `src/` by `src/build-c2.mjs`.

Official Telegram bot: **@OxOOOOOOOOObot** — spelled with the capital letter O, not the digit zero, because Telegram names cannot start with a digit. Any other bot or account using our name is not us.

## How it works (one paragraph)

Your key is split in two. **Your half is generated in your own browser** and saved as `my-secret-s.json` on your own computer; the platform only receives its **public key** (public, like a bank account number) and a **signature** (proof that you hold your half, without revealing it). The platform mints the other half, `b`, on its GPUs and hands it to you, and **joining the two halves into the complete private key also happens in your own browser**. A private key cannot be derived from a public key — that is the security foundation of Bitcoin, Ethereum and TRON.

The only thing left to trust is that "the web page code that joins the key does not secretly send your half out". This repository exists so you can **check exactly that**.

## Where minting happens: on your own computer

The website 0x000000000.com **only offers the download; it does not mint**. The 6 minting steps appear only in the single file you download to your computer (`0x000000000.html`). Double-click it, and every step tells you in plain words **whether to go offline or stay online, and why**.

| Step | Offline / online | Why |
|---|---|---|
| 1 Make key | 🔌 best done offline | Creates your half of the key. While offline, the page could not send anything out even if it tried |
| 2 Order | 🌐 needs internet | The platform has to receive your pattern, chain and payment choice to open the order and give you a payment address |
| 3 Pay | 🌐 needs internet | You send USDT from your exchange or wallet; the page must be online to see it arrive |
| 4 Minting | 🌐 stay online | The platform GPUs work on your address; the page asks for progress every few seconds |
| 5 Collect → build | 🌐 collect → 🔌 build can be offline | Go online to fetch the other half, then go offline to build the complete private key and export your wallet file — at the moment the full key first exists, your computer is not connected |
| 6 Receipt | 🌐 needs internet | The "I got it" signature has to reach the platform to settle the order (optional) |

One file, one fingerprint: opened on the website it shows only "Download"; downloaded and opened from your computer it shows the 6 steps. The checks below verify both ways of opening it.

## Four pieces of evidence

| | What it is | Where to look |
|---|---|---|
| **1. The page is this one file** | The website home page = `0x000000000.html` here = the file you get from "Download the minting page" on the website, **byte for byte**. The explainer at `0x000000000.com/ppt` = `ppt.html` here, the white paper at `0x000000000.com/wp` = `wp.html` here, every payment card page `0x000000000.com/@name` = `card.html` here, and the vanity contract and token address pages `0x000000000.com/contract` and `0x000000000.com/token` = `0x000000000-contract.html` and `0x000000000-token.html` here. All their fingerprints are in `SHA256SUMS`. Every change leaves a public record here that cannot be deleted. | This page · commit history |
| **2. Tamper patrol** | **Every hour**, machines at GitHub download the live home page, the download copy, the `/ppt` explainer, the `/wp` white paper, a payment card page and the `/contract` and `/token` pages, and compare them with the fingerprints here. **Any mismatch turns red**, visible to everyone. The check runs on GitHub; the platform cannot touch it. | First badge above |
| **3. Private-key leak check** | For every new version, machines at GitHub walk through all 6 steps in a **real browser** and check **every single request** the page sends (table below): every field must equal a recomputed value exactly — **one extra field or one extra character turns it red**. | Second badge above |
| **4. Font rebuild** | The page embeds two open-source fonts (see "Fonts" below). Machines at GitHub rebuild them from the official original font files; the result must be **byte-for-byte identical** to what the page carries — that large block of font data holds fonts and nothing else. | Third badge above |

## Everything the page sends to the platform

| When | What is sent | How it is checked |
|---|---|---|
| Opening the page | Reads the price list, checks the platform is online — **nothing of yours is sent** | Must carry no content |
| Order | Which chain, the pattern, which payment chain — plus the referral code, if you came through a referral link or typed one | Exactly these four fields (five with a referral code), equal to what you chose; the code must equal the one in the link or file name |
| Upload | Public key A + one signature | A must equal "your half × G"; the signature must be an RFC6979 **deterministic signature** (no random field to hide anything in) |
| Waiting for payment / minting | Asks for order progress and the payment address — **nothing of yours is sent** | Must carry no content |
| Collect | One signature (proves it is you) | Same as above, deterministic |
| Receipt | One signature made with the complete key you built | Deterministic; the platform does not hold your half and could not forge it |
| Not paying (only if you tap a reason) | One word out of four: too expensive, hard to follow, not sure it is safe, just looking — no order number | Exactly one field, equal to the word you tapped |
| Free check (only when you use it) | The address you pasted into the check box (a TRON address, or an EVM 0x… address — for those only the verification is looked up); if you also filled in your own address, that address in a second request | Exactly one field, equal to the address you pasted. The check runs it while your half of the key is already in the page's memory |

The page **connects nowhere else**. The check also really goes offline: "Make key" completes offline with 0 requests in the meantime; after collecting, "Build my key" and "Export wallet file" complete offline with 0 requests.
A few more: opened as the website, the file shows only "Download" and no steps; downloaded and opened offline from the start, both TRON and EVM can be chosen and a key can be made — also when the network is down but the browser thinks it is online (requests just hang): the choice is there the moment the page opens, it does not wait for them; a first-time visitor sees English, and switching to Chinese after making a key keeps the key; the two links in the top bar go to `/ppt` and `/wp` (in the downloaded copy they open a new window, so the page you are working in stays open); a referral link (`?ref=CODE`) only makes the downloaded file's name carry the code — the file's bytes stay the same, and no request carries the code until you order. The check code is `test/noleak.cjs` — anyone can run it.

## The wallet file (exported in step 5)

- Step 5 exports exactly one thing: a **wallet file** (the standard keystore V3 format), encrypted with the password you **type twice**. The page no longer exports a plain-text private key.
- **Opening the file needs no password**: the private key inside is **encrypted** (the `crypto` section), and the address is public anyway. You type the password **when you import it into a wallet** — the wallet uses it to decrypt the key.
- **TRON**: the file is `my-keystore.txt`, and the address is written as 42 hex characters starting with `41` — the form TronLink accepts (with a `T…` address, TronLink's import hangs without an error). Import: TronLink → import wallet → Keystore → pick this file → enter the password.
- **EVM** (Ethereum, BSC, …): the file is `my-keystore.json`. Import: MetaMask → add account → import account → type "JSON File" → pick this file → enter the password.
- The leak check decrypts the wallet file with the same password and confirms it holds exactly the key that was built, with the right address format.

## Fonts

The whole page uses code-style fonts: **JetBrains Mono** for Latin letters, digits and symbols; **Noto Sans SC** for Chinese, with every Chinese character widened to exactly two Latin characters so both scripts sit on the same grid. Both are open-source fonts (SIL OFL 1.1).

So that the page looks the same offline and never contacts a font website, the fonts are embedded in the page, keeping only the characters the page uses (listed in `src/css/fonts-chars.txt`). `src/build-fonts.py` regenerates `src/css/fonts.css` from the official Google Fonts files (URLs pinned to fixed commits, fingerprints at the top of the script), byte for byte, for anyone who runs it.

Characters used only by the white paper and the other text pages (payment cards, partners, verification, alerts, the vanity contract and token address pages) are kept in a second file, `src/css/fonts-extra.css` (listed in `src/css/fonts-extra-chars.txt`), so adding text to those pages never changes a single byte of the minting page. The same script regenerates both files, and the font check compares both.

## Check it yourself (pick any)

**Check the file you downloaded**

```
Windows:   certutil -hashfile 0x000000000.html SHA256
Mac/Linux: shasum -a 256 0x000000000.html
```

The fingerprint must match the one in `SHA256SUMS`.

**Check what the website is serving right now**

```
curl -s https://0x000000000.com/ | shasum -a 256
curl -s https://0x000000000.com/ppt | shasum -a 256
curl -s https://0x000000000.com/wp | shasum -a 256
curl -s https://0x000000000.com/@0x000000000 | shasum -a 256
curl -s https://0x000000000.com/contract | shasum -a 256
curl -s https://0x000000000.com/token | shasum -a 256
```

The first must equal the `0x000000000.html` line in `SHA256SUMS`, the second the `ppt.html` line, the third the `wp.html` line, the fourth the `card.html` line (every `/@name` page is that same file), the fifth the `0x000000000-contract.html` line and the sixth the `0x000000000-token.html` line.

**Rebuild it from source yourself** (`src/` holds the complete page source)

```
node src/build-single.mjs src rebuilt.html
```

The resulting `rebuilt.html` must be byte-for-byte identical to `0x000000000.html`, for anyone who runs it. The vanity contract and token address pages are rebuilt the same way:

```
node src/build-c2.mjs src rebuilt
```

The two files it writes into `rebuilt/` must be byte-for-byte identical to `0x000000000-contract.html` and `0x000000000-token.html`.

**Rebuild the fonts** (Python 3.11, after `pip install fonttools==4.62.1 brotli==1.2.0`)

```
python src/build-fonts.py JetBrainsMono[wght].ttf NotoSansSC[wght].ttf
```

Download the two font files from the URLs at the top of `src/build-fonts.py`. The generated `src/css/fonts.css` and `src/css/fonts-extra.css` must be byte-for-byte identical to the ones in this repository.

**Offline test**: download `0x000000000.html`, double-click it, turn off Wi-Fi, then click "Make key" — it still completes. After collecting in step 5, turn off Wi-Fi again: "Build my key" and "Export wallet file" still complete.

## What is not here

The platform's server code and GPU minting program are not in this repository. They **never touch your half**: what they receive is exactly what the table above checks field by field, regardless of whether the server is real or fake. That is why the check uses a public mock platform (`test/mock-platform.mjs`).

## Versions

Every commit is a version. The page shows a "page version" computed from the source content; it corresponds one-to-one with `src/` here.

Commit messages are written in Chinese. Four commits on 2026-09-24 (`7aa9992`, `9036d0b`, `9b1d7f6`, `7acb2b5`, the step 4 "minting now" row) carry English-only messages; the [Chinese README](README.zh-CN.md) adds Chinese notes for them. Commit history itself cannot be edited — that is exactly why it can be trusted.
