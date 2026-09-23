# 0x000000000.com page code · published so you can check it

**中文 → [README.md](README.md)**

[![Live page tamper patrol](https://github.com/0x000000000-com/0x000000000/actions/workflows/tamper-check.yml/badge.svg)](https://github.com/0x000000000-com/0x000000000/actions/workflows/tamper-check.yml)
[![Private-key leak check](https://github.com/0x000000000-com/0x000000000/actions/workflows/noleak.yml/badge.svg)](https://github.com/0x000000000-com/0x000000000/actions/workflows/noleak.yml)

This repository does one thing: **it lets you confirm two facts yourself, without having to trust us —**

1. **The platform never gets your private key.**
2. **The platform has not secretly changed the page.**

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
| 5 Collect → build | 🌐 collect → 🔌 build can be offline | Go online to fetch the other half, then go offline to build the complete private key and export your wallet — at the moment the full key first exists, your computer is not connected |
| 6 Receipt | 🌐 needs internet | The "I got it" signature has to reach the platform to settle the order (optional) |

One file, one fingerprint: opened on the website it shows only "Download"; downloaded and opened from your computer it shows the 6 steps. The checks below verify both ways of opening it.

## Three pieces of evidence

| | What it is | Where to look |
|---|---|---|
| **1. The page is this one file** | The website home page = `0x000000000.html` here = the file you get from "Download the minting page" on the website, **byte for byte**. Its fingerprint is in `SHA256SUMS`. Every change leaves a public record here that cannot be deleted. | This page · commit history |
| **2. Tamper patrol** | **Every hour**, machines at GitHub download the live home page and compare it with the fingerprint here. **Any mismatch turns red**, visible to everyone. The check runs on GitHub; the platform cannot touch it. | Left badge above |
| **3. Private-key leak check** | For every new version, machines at GitHub walk through all 6 steps in a **real browser** and check **every single request** the page sends (table below): every field must equal a recomputed value exactly — **one extra field or one extra character turns it red**. | Right badge above |

## Everything the page sends to the platform

| When | What is sent | How it is checked |
|---|---|---|
| Opening the page | Reads the price list, checks the platform is online — **nothing of yours is sent** | Must carry no content |
| Order | Which chain, the pattern, which payment chain | Exactly these four fields, equal to what you chose |
| Upload | Public key A + one signature | A must equal "your half × G"; the signature must be an RFC6979 **deterministic signature** (no random field to hide anything in) |
| Waiting for payment / minting | Asks for order progress and the payment address — **nothing of yours is sent** | Must carry no content |
| Collect | One signature (proves it is you) | Same as above, deterministic |
| Receipt | One signature made with the complete key you built | Deterministic; the platform does not hold your half and could not forge it |

The page **connects nowhere else**. The check also really goes offline: "Make key" completes offline with 0 requests in the meantime; after collecting, "Build my key" and "Export wallet file" complete offline with 0 requests.
Two more: opened as the website, the file shows only "Download" and no steps; downloaded and opened offline from the start, both TRON and EVM can be chosen and a key can be made. The check code is `test/noleak.cjs` — anyone can run it.

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
```

**Rebuild it from source yourself** (`src/` holds the complete page source)

```
node src/build-single.mjs src rebuilt.html
```

The resulting `rebuilt.html` must be byte-for-byte identical to `0x000000000.html`, for anyone who runs it.

**Offline test**: download `0x000000000.html`, double-click it, turn off Wi-Fi, then click "Make key" — it still completes. After collecting in step 5, turn off Wi-Fi again: "Build my key" and "Export wallet file" still complete.

## What is not here

The platform's server code and GPU minting program are not in this repository. They **never touch your half**: what they receive is exactly what the table above checks field by field, regardless of whether the server is real or fake. That is why the check uses a public mock platform (`test/mock-platform.mjs`).

## Versions

Every commit is a version. The page shows a "page version" computed from the source content; it corresponds one-to-one with `src/` here.
