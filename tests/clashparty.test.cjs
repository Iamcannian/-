const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '..', 'desktop', 'clash-party.js'), 'utf8');
let assertions = 0;
function ok(value, message) { assertions++; assert.ok(value, message); }
function runtime(options = {}) {
  const ctx = {}; vm.createContext(ctx); vm.runInContext(source, ctx);
  vm.runInContext('Object.assign(ruleOptionsEnable, ' + JSON.stringify(options) + ')', ctx);
  return ctx;
}
const proxy = name => ({ name, type: 'ss', server: 'example.com', port: 443, cipher: 'aes-128-gcm', password: 'fixture-only' });
const fixture = () => ({ proxies: ['🇭🇰 日用 专线 香港[0.2]', '日用 日本[0.2]', '香港 01', '香港 02', '日本 01', '美国 01', '新加坡 01', '台湾 01', '德国 01', '法国 0.5x'].map(proxy) });
function inspect(ctx, config) {
  const before = JSON.stringify(config), result = ctx.main(config);
  ok(JSON.stringify(config) === before, 'input must not be mutated');
  const groups = result['proxy-groups'], byName = Object.fromEntries(groups.map(g => [g.name, g]));
  const daily = new Set(result.proxies.filter(p => ctx.isDailyProxy(p)).map(p => p.name));
  const ordinaryRoots = ['手动选择','自动选择','自动选择地区','全部节点-自动选择','故障转移','负载均衡','香港','日本','美国','新加坡','台湾','其他国家'];
  function leaves(name, seen = []) {
    if (!byName[name]) return [name];
    ok(!seen.includes(name), 'no group cycle');
    return byName[name].proxies.flatMap(p => leaves(p, [...seen, name]));
  }
  for (const name of ordinaryRoots) if (byName[name]) {
    ok(leaves(name).every(p => !daily.has(p)), name + ' must exclude daily through nested groups');
  }
  ok(leaves('日常').every(p => daily.has(p) || p === 'REJECT'), 'daily has no ordinary/direct fallback');
  ok(byName['默认代理'].proxies.includes('日常'), 'daily exposed in default group');
  const rules = result.rules, providers = result['rule-providers'];
  for (const r of rules) for (const match of r.matchAll(/RULE-SET,([^,()]+)/g)) ok(!!providers[match[1]], 'provider exists ' + match[1]);
  for (const p of Object.values(providers)) {
    ok(p.interval === 86400, '24-hour updates'); ok(p.proxy === '基础服务', 'explicit update route');
    ok(p.format !== 'mrs' || p.behavior !== 'classical', 'correct mrs behavior');
  }
  for (const r of rules) {
    if (r.startsWith('AND,')) continue;
    const parts = r.split(','), target = parts[parts.length - 1] === 'no-resolve' ? parts[parts.length - 2] : parts[parts.length - 1];
    ok(!!byName[target] || ['DIRECT','REJECT','PASS'].includes(target), 'rule target ' + target);
  }
  for (const value of result.dns['fake-ip-filter']) if (value.startsWith('rule-set:')) ok(!!providers[value.slice(9)], 'DNS provider exists');
  ok(!result['allow-lan'], 'no LAN sharing by default');
  ok(!('external-ui-url' in result), 'no unused desktop UI download');
  return result;
}
const c = runtime();
for (const name of ['香港[0.2]', '日本【0.2】', '美国（0.2）', '台湾 0.2x', '新加坡 x0.2', '香港 0.2倍', '香港［０.２０］', '日\u200b用 专线 香港[0.2]']) ok(c.isDailyProxy({ name }), name);
for (const name of ['香港[0.25]', '香港[10.2]', '香港[0.02]', '香港 0.5x', 'x0.21 日本', '日常 1x', '日用 香港', '日本 0.8倍']) ok(!c.isDailyProxy({ name }), name);
let result = inspect(c, fixture());
let rules = result.rules;
ok(rules.indexOf('RULE-SET,gemini,Gemini') < rules.indexOf('RULE-SET,google,Google'), 'Gemini before Google');
ok(rules.indexOf('RULE-SET,ai,AI') < rules.indexOf('RULE-SET,google,Google'), 'AI before Google');
ok(rules.indexOf('RULE-SET,awads,AdBlock') < rules.indexOf('RULE-SET,geolocation-cn,直连'), 'ads before broad domestic domains');
ok(!result['proxy-groups'].some(g => g.name === '负载均衡'), 'balance default off');
ok(!result['rule-providers'].cdn_domain, 'optional CDN off');
ok(result['rule-providers'].awads.url.includes('Only.Ads'), 'pure ads variant');
ok(Object.values(result['rule-providers']).filter(p => p['path-in-bundle']).every(p => p.url.includes('appshubcc/bett-rules') || /emby|emos/.test(p.url)), 'Bettbox resources retained');
for (const names of [['香港[0.2]'], ['香港 1x'], ['德国[0.2]', '法国 1x'], ['日用 香港'], ['香港 0.5x', '美国[0.2]']]) inspect(c, { proxies: names.map(proxy) });
const options = vm.runInContext('Object.keys(ruleOptionsEnable)', c);
for (const key of options) inspect(runtime({ [key]: false }), fixture());
inspect(runtime(Object.fromEntries(options.map(k => [k, false]))), fixture());
inspect(runtime({ 负载均衡: true, 下载资源走日常: true, 屏蔽PCDN: true }), fixture());
result = inspect(runtime({ 代理IPV4优先: true }), fixture());
ok(result.proxies.filter(p => p.type === 'ss').every(p => p['ip-version'] === 'ipv4-prefer'), 'IPv4 preference');
const colliding = { proxies: [proxy('日常'), proxy('香港'), proxy('🇭🇰 A'), proxy('香港 A'), proxy('A'), proxy('A ')] };
inspect(c, colliding);
assert.throws(() => c.main({ proxies: [] }), /未找到/);
assert.throws(() => c.main({ proxies: [proxy('same'), { ...proxy('same'), port: 444 }] }), /同名/);
assert.throws(() => c.main({ 'proxy-providers': { remote: {} } }), /proxy-providers/);
assert.throws(() => c.main({ proxies: [{ ...proxy('香港 普通'), 'dialer-proxy': '日用 日本[0.2]' }, proxy('日用 日本[0.2]')] }), /倍率隔离/);
assert.throws(() => c.main({ proxies: [{ ...proxy('香港 A'), 'dialer-proxy': '日本 B' }, { ...proxy('日本 B'), 'dialer-proxy': '香港 A' }] }), /循环/);
const dialer = { proxies: [{ ...proxy('香港 A'), 'dialer-proxy': '日本 B' }, proxy('日本 B')] };
result = inspect(c, dialer);
ok(result.proxies[0]['dialer-proxy'] === result.proxies[1].name, 'dialer follows normalization');
const privateDns = fixture();
privateDns.dns = { nameserver: ['https://private-resolver.example/dns-query'], 'proxy-server-nameserver': ['https://private-resolver.example/dns-query'] };
result = inspect(c, privateDns);
ok(JSON.stringify(result.dns['proxy-server-nameserver-policy']).includes('private-resolver.example'), 'private airport DNS preserved');
const scoped = { proxies: [{ ...proxy('香港 A'), server: 'a.airport.co.uk' }, { ...proxy('日本 B'), server: 'b.airport.co.uk' }], dns: { 'nameserver-policy': { 'a.airport.co.uk': ['https://private.example/dns-query'], 'b.airport.co.uk': ['https://private.example/dns-query'] } } };
result = inspect(c, scoped);
ok(!Object.keys(result.dns['proxy-server-nameserver-policy']).some(k => k.startsWith('+.')), 'do not broaden airport DNS suffix scope');

const hostConfig = { proxies: [proxy('香港')], hosts: { 'example.com': 'a.internal', 'a.internal': '198.51.100.2' }, dns: { listen: '0.0.0.0:1053', 'proxy-server-nameserver': ['127.0.0.1:1053'] }, tun: { enable: true, stack: 'mips', 'exclude-package': ['com.example.bank'] } };
result = inspect(c, hostConfig);
ok(result.proxies[0].server === '198.51.100.2', 'airport hosts chain preserved');
ok(JSON.stringify(result.tun) === JSON.stringify(hostConfig.tun), 'existing TUN exclusions preserved');
ok(JSON.stringify(c.main(fixture())) === JSON.stringify(c.main(fixture())), 'deterministic repeated execution');
// Deterministic generated inputs catch name/multiplier classification regressions.
for (let i = 0; i < 30; i++) {
  const regions = ['香港','日本','美国','德国','法国'];
  const names = Array.from({ length: 1 + i % 8 }, (_, j) => regions[(i+j)%5] + ' 节点' + j + (j%3===0 ? '[0.2]' : '[1]'));
  inspect(c, { proxies: names.map(proxy) });
}
const outDir = process.env.CLASHPARTY_TEST_OUTPUT;
if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'config.json'), JSON.stringify(c.main(fixture()), null, 2));
  fs.writeFileSync(path.join(outDir, 'options-all.json'), JSON.stringify(runtime({ 负载均衡: true, 下载资源走日常: true, 屏蔽PCDN: true }).main(fixture()), null, 2));
  fs.writeFileSync(path.join(outDir, 'daily-only.json'), JSON.stringify(c.main({ proxies: [proxy('香港[0.2]')] }), null, 2));
}
console.log('PASS: ' + assertions + ' assertions; daily isolation, switches, references, DNS, TUN, collisions and generated fixtures');

// Desktop-specific regression checks.
result = c.main({ ...fixture(), 'mixed-port': 17890, secret: 'test-secret', 'external-controller': '127.0.0.1:19090', profile: { custom: true }, tun: { enable: false } });
assert.equal(result['mixed-port'], 17890);
assert.equal(result.secret, 'test-secret');
assert.equal(result['external-controller'], '127.0.0.1:19090');
assert.equal(result.profile.custom, true);
assert.equal(result.sniffer.enable, false);
assert.ok(Object.values(result['rule-providers']).every(p => !('path-in-bundle' in p)));
const mapDesktop = Object.fromEntries(result['proxy-groups'].map(g => [g.name, g]));
assert.equal(mapDesktop['美国-故障转移'].type, 'fallback');
assert.ok(mapDesktop['美国-故障转移'].proxies.every(n => n.includes('美国') && !n.includes('0.2')));
for (const n of ['OpenAI','Gemini','Claude','AI']) assert.equal(mapDesktop[n].proxies[0], '美国-故障转移');
const missingUS = c.main({proxies: [proxy('香港 01'), proxy('美国[0.2]')]});
assert.ok(!missingUS['proxy-groups'].some(g => g.name === '美国-故障转移'));
const collisionDesktop = c.main({proxies: [proxy('美国-故障转移'), proxy('美国 02')]});
assert.ok(collisionDesktop.proxies[0].name !== '美国-故障转移');
console.log('PASS: desktop runtime preservation, regional fallback, AI defaults, resource independence');

// Audited desktop defaults and platform independence.
const defaultResult = c.main(fixture());
const defaultGroups = Object.fromEntries(defaultResult['proxy-groups'].map(g => [g.name,g]));
assert.equal(defaultGroups['默认代理'].proxies[0], '自动选择');
assert.equal(defaultGroups['香港'].proxies[0], '香港-故障转移');
assert.equal(defaultGroups['FCM'].proxies[0], '默认代理');
assert.ok(defaultGroups['基础服务'].proxies.every(n => !n.includes('0.2')));
assert.equal(defaultGroups['美国-故障转移'].interval, 180);
assert.equal(defaultGroups['全部节点-自动选择'].interval, 300);
assert.equal(defaultResult.profile['store-selected'], false);
assert.ok(defaultResult.dns.nameserver.every(n => n.endsWith('#基础服务')));
assert.ok(!defaultResult.rules.some(r => r.startsWith('AND,')), 'do not force QUIC restriction in system-proxy preset');
const inputHosts = {...fixture(),hosts:{'node.internal':'198.51.100.9'}};
assert.equal(c.main(inputHosts).hosts['node.internal'],'198.51.100.9');
for(const names of [['香港[0.2]'],['香港 1x']]) {
 const r=c.main({proxies:names.map(proxy)});
 const infra=r['proxy-groups'].find(g=>g.name==='基础服务');
 assert.ok(infra.proxies.length>0);
}
assert.equal(fs.readFileSync(path.join(__dirname,'..','mobile','bettbox.js'),'utf8'),fs.readFileSync(path.join(__dirname,'..','mihomoScript-bettbox-next.js'),'utf8'));
assert.equal(source,fs.readFileSync(path.join(__dirname,'..','mihomoScript-clashparty.js'),'utf8'));
console.log('PASS: automatic defaults, DNS/update independence, platform isolation and preserved airport hosts');
