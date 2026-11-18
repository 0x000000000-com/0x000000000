const assert = require('node:assert/strict');
const { createHash, webcrypto } = require('node:crypto');
const fs = require('node:fs');
const vm = require('node:vm');

const page = fs.readFileSync('card.html', 'utf8');
const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const evm = '0x' + 'ab'.repeat(20);
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function tronAddress(valid) {
  const payload = Buffer.from('41' + '42'.repeat(20), 'hex');
  const hash = (bytes) => createHash('sha256').update(bytes).digest();
  const checksum = Buffer.from(hash(hash(payload)).subarray(0, 4));
  if (!valid) checksum[3] ^= 1;
  let number = BigInt('0x' + Buffer.concat([payload, checksum]).toString('hex'));
  let address = '';
  while (number) {
    address = alphabet[Number(number % 58n)] + address;
    number /= 58n;
  }
  assert.match(address, /^T[1-9A-HJ-NP-Za-km-z]{33}$/);
  return address;
}

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this.isConnected = true;
    this.innerHTML = '';
  }

  set textContent(value) { this.children = [value]; }
  append(...children) { this.children.push(...children); }
  setAttribute() {}
  insertAdjacentHTML() {}
  addEventListener(event, listener) { this.listeners[event] = listener; }

  all() {
    return [this, ...this.children.flatMap((child) => child instanceof Element ? child.all() : [])];
  }
}

async function openCard(addresses, name = 'alice', requestedName = 'alice') {
  const elements = new Map();
  const clipboard = [];
  const document = {
    documentElement: {},
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new Element('div'));
      return elements.get(selector);
    },
    querySelectorAll: () => [],
    createElement: (tag) => new Element(tag),
    createTextNode: (value) => value,
    addEventListener() {},
  };
  const context = vm.createContext({
    document, location: { pathname: '/@' + requestedName, search: '' }, URLSearchParams,
    localStorage: { getItem: () => 'zh' },
    window: { addEventListener() {} },
    navigator: { clipboard: { async writeText(value) { clipboard.push(value); } } },
    crypto: webcrypto, TextEncoder, TextDecoder,
    setInterval() {}, setTimeout() {},
    async fetch(url) {
      assert.equal(url, '/api/card/' + requestedName);
      return { status: 200, ok: true, json: async () => ({ name, status: 'live', tier: 'blue', addresses }) };
    },
  });
  for (const script of scripts) vm.runInContext(script, context);
  const all = () => document.querySelector('#app').all();
  const deadline = Date.now() + 1000;
  while (all().length === 2 && all()[1].className === 'sub' && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.ok(all().length > 2, '应完成本地名片加载');
  return { all, clipboard };
}

async function main() {
  const valid = await openCard([{ chain: 'evm', address: evm }, { chain: 'tron', address: tronAddress(true) }]);
  assert.equal(valid.all().filter((node) => node.dataset.addr).length, 2, '两条有效地址应照常显示');
  const mismatch = await openCard([{ chain: 'evm', address: evm }], 'bob');
  assert.equal(mismatch.all().filter((node) => node.dataset.addr).length, 0, '姓名不一致时应停用地址');
  const failures = [];
  const invalidName = await openCard([{ chain: 'evm', address: evm }], 'al\u212A', 'alk');
  if (invalidName.all().some((node) => node.dataset.addr || node.dataset.copy || node.tag === 'form')) {
    failures.push('接口姓名含用户名不允许的字符时应停用全部地址出口，实际仍展示可用名片');
  }
  for (const [label, entry] of [
    ['波场地址的校验码不匹配', { chain: 'tron', address: tronAddress(false) }],
    ['链字段不是字符串', { chain: ['evm'], address: '0x' + 'cd'.repeat(20) }],
  ]) {
    const card = await openCard([{ chain: 'evm', address: evm }, entry]);
    const copy = card.all().find((node) => node.dataset.copy === entry.address);
    const addressBox = card.all().find((node) =>
      (node.className === 'box' || node.className === 'box warn') &&
      node.all().some((child) => child.dataset.addr === entry.address));
    const qr = addressBox?.all().find((node) => node.className === 'btn' && node.listeners.click);
    if (copy) await copy.listeners.click();
    if (qr) await qr.listeners.click();
    const outlets = [
      [card.all().some((node) => node.dataset.addr), '显示地址'],
      [!!copy || card.clipboard.length > 0, '复制地址'],
      [!!qr || card.all().some((node) => node.className === 'qr'), '地址二维码'],
      [card.all().some((node) => node.tag === 'form'), '核对地址'],
    ].filter(([present]) => present).map(([, label]) => label);
    if (outlets.length) failures.push(label + '时应停用全部出口，实际仍有' + outlets.join('、'));
  }
  if (!valid.all().some((node) => node.className === 'q' && /<svg\b/.test(node.innerHTML))) {
    failures.push('有效名片的页首应显示可扫描的分享二维码，实际没有生成二维码图案');
  }
  if (failures.length) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  } else {
    console.log('名片地址出口与分享二维码回归通过');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
