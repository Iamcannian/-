// Clash Party Windows 系统代理覆写 v1.1.0 — 2026-10-21
// 来源与维护：见 ClashParty-README.md；数据更新与脚本更新相互独立。
// 衍生自 https://github.com/AIsouler/MyClash ，保留其机场 DNS 兼容算法。
/*
MIT License
Copyright (c) 2026 AIsouler
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// 客户端设置由独立设置包管理；这里的选项用于修改脚本默认行为。
const SCRIPT_VERSION = "1.1.0-clashparty";
const ruleOptionsEnable = {
  "手动选择": true,
  "自动选择": true,
  "故障转移": true,
  "FCM": true,
  "YouTube": true,
  "Google": true,
  "AI": true,
  "OpenAI": true,
  "Gemini": true,
  "Claude": true,
  "GitHub": true,
  "Microsoft": true,
  "Apple": true,
  "Telegram": true,
  "Steam": true,
  "TikTok": true,
  "Twitter": true,
  "Meta": true,
  "Line": true,
  "Netflix": true,
  "Emby": true,
  "PikPak": true,
  "Spotify": true,
  "Crypto": true,
  "PayPal": true,
  "Patreon": true,
  "EHentai": true,
  "AdBlock": true,
  "负载均衡": false,
  "生成地区自动选择组": true,
  "隐藏地区手动选择组": false,
  "过滤信息节点": true,
  "屏蔽国外QUIC": false,
  "代理IPV4优先": false,
  "代理IPV6优先": false,
  "下载资源走日常": false,
  "屏蔽PCDN": false
};

// 所有网络资源都在此声明；不下载、执行第三方 JavaScript。
const resources = {
  rules: 'https://raw.githubusercontent.com/appshubcc/bett-rules/meta/geo/',
  icons: 'https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/',
  ads: 'https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash-Only.Ads.mrs',
  cdnDomain: 'https://ruleset.skk.moe/Clash/domainset/cdn.txt',
  cdnClassical: 'https://ruleset.skk.moe/Clash/non_ip/cdn.txt',
  test: 'https://www.apple.com/library/test/success.html',
};
const tuning = { ruleInterval: 86400, testInterval: 300, fallbackInterval: 180, tolerance: 50, timeout: 5000 };
const customizeProxies = [];
const customRules = []; // 最高优先级例外，例如 'DOMAIN,example.com,直连'
const iconBaseUrl = resources.icons;
const regionDefinitions = [
  {
    "name": "香港",
    "flag": "🇭🇰",
    "regex": "🇭🇰|香港|(?<![A-Za-z])HKG?(?![A-Za-z])|hong\\s*kong",
    "icon": "https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/HongKong.svg"
  },
  {
    "name": "日本",
    "flag": "🇯🇵",
    "regex": "🇯🇵|日本|东京|大阪|京都|(?<![A-Za-z])JPN?(?![A-Za-z])|japan",
    "icon": "https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/Japan.svg"
  },
  {
    "name": "美国",
    "flag": "🇺🇸",
    "regex": "🇺🇸|美国|纽约|洛杉矶|旧金山|芝加哥|休斯顿|迈阿密|西雅图|波士顿|华盛顿|拉斯维加斯|圣何塞|(?<![A-Za-z])USA?(?![A-Za-z])|america|united\\s*states",
    "icon": "https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/America.svg"
  },
  {
    "name": "新加坡",
    "flag": "🇸🇬",
    "regex": "🇸🇬|新加坡|狮城|(?<![A-Za-z])SGP?(?![A-Za-z])|singapore",
    "icon": "https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/Singapore.svg"
  },
  {
    "name": "台湾",
    "flag": "🇹🇼",
    "regex": "🇹🇼|台湾|台北|高雄|(?<![A-Za-z])TWN?(?![A-Za-z])|taiwan",
    "icon": "https://cdn.jsdmirror.com/gh/AIsouler/MyClash@main/Icons/svg/Taiwan.svg"
  }
].map(r => ({ ...r, regex: new RegExp(r.regex, "i") }));
const baseRuleCatalog = [
  {
    "key": "private",
    "kind": "domain",
    "slug": "private"
  },
  {
    "key": "private_ip",
    "kind": "ipcidr",
    "slug": "private"
  },
  {
    "key": "games_cn",
    "kind": "domain",
    "slug": "category-games@cn"
  },
  {
    "key": "nvidia_cn",
    "kind": "domain",
    "slug": "nvidia@cn"
  },
  {
    "key": "apple_cn",
    "kind": "domain",
    "slug": "apple@cn"
  },
  {
    "key": "microsoft_cn",
    "kind": "domain",
    "slug": "microsoft@cn"
  },
  {
    "key": "geolocation-cn",
    "kind": "domain",
    "slug": "geolocation-cn"
  },
  {
    "key": "cn_ip",
    "kind": "ipcidr",
    "slug": "cn"
  },
  {
    "key": "geolocation-!cn",
    "kind": "domain",
    "slug": "geolocation-!cn"
  },
  {
    "key": "fakeip_filter",
    "kind": "domain",
    "slug": "fakeip-filter"
  },
  {
    "key": "cn",
    "kind": "domain",
    "slug": "cn"
  },
  {
    "key": "douyin",
    "kind": "domain",
    "slug": "douyin"
  }
];
const serviceCatalog = [
  {
    "name": "FCM",
    "icon": "Fcm.svg",
    "direct": true,
    "defaultSelected": "默认代理",
    "providers": [
      {
        "key": "googlefcm",
        "kind": "domain",
        "slug": "googlefcm"
      }
    ],
    "rules": [
      "RULE-SET,googlefcm,FCM"
    ]
  },
  {
    "name": "OpenAI",
    "icon": "OpenAI.svg",
    "defaultSelected": "美国",
    "providers": [
      {
        "key": "openai",
        "kind": "domain",
        "slug": "openai"
      }
    ],
    "rules": [
      "RULE-SET,openai,OpenAI"
    ]
  },
  {
    "name": "Gemini",
    "icon": "Google.svg",
    "defaultSelected": "美国",
    "providers": [
      {
        "key": "gemini",
        "kind": "domain",
        "slug": "google-gemini"
      }
    ],
    "rules": [
      "RULE-SET,gemini,Gemini"
    ]
  },
  {
    "name": "Claude",
    "icon": "OpenAI.svg",
    "defaultSelected": "美国",
    "providers": [
      {
        "key": "anthropic",
        "kind": "domain",
        "slug": "anthropic"
      }
    ],
    "rules": [
      "RULE-SET,anthropic,Claude"
    ]
  },
  {
    "name": "AI",
    "icon": "OpenAI.svg",
    "defaultSelected": "美国",
    "providers": [
      {
        "key": "ai",
        "kind": "domain",
        "slug": "category-ai-!cn"
      }
    ],
    "rules": [
      "RULE-SET,ai,AI"
    ]
  },
  {
    "name": "YouTube",
    "icon": "YouTube.svg",
    "providers": [
      {
        "key": "youtube",
        "kind": "domain",
        "slug": "youtube"
      }
    ],
    "rules": [
      "RULE-SET,youtube,YouTube"
    ]
  },
  {
    "name": "Google",
    "icon": "Google.svg",
    "providers": [
      {
        "key": "google",
        "kind": "domain",
        "slug": "google"
      },
      {
        "key": "google_ip",
        "kind": "ipcidr",
        "slug": "google"
      }
    ],
    "rules": [
      "RULE-SET,google,Google",
      "RULE-SET,google_ip,Google,no-resolve"
    ]
  },
  {
    "name": "GitHub",
    "icon": "GitHub.svg",
    "providers": [
      {
        "key": "github",
        "kind": "domain",
        "slug": "github"
      }
    ],
    "rules": [
      "RULE-SET,github,GitHub"
    ]
  },
  {
    "name": "Microsoft",
    "icon": "Microsoft.svg",
    "direct": true,
    "providers": [
      {
        "key": "microsoft",
        "kind": "domain",
        "slug": "microsoft"
      },
      {
        "key": "microsoft_ip",
        "kind": "ipcidr",
        "slug": "microsoft"
      }
    ],
    "rules": [
      "RULE-SET,microsoft,Microsoft",
      "RULE-SET,microsoft_ip,Microsoft,no-resolve"
    ]
  },
  {
    "name": "Apple",
    "icon": "Apple.svg",
    "direct": true,
    "providers": [
      {
        "key": "apple",
        "kind": "domain",
        "slug": "apple"
      },
      {
        "key": "apple_ip",
        "kind": "ipcidr",
        "slug": "apple"
      }
    ],
    "rules": [
      "RULE-SET,apple,Apple",
      "RULE-SET,apple_ip,Apple,no-resolve"
    ]
  },
  {
    "name": "Telegram",
    "icon": "Telegram.svg",
    "providers": [
      {
        "key": "telegram",
        "kind": "domain",
        "slug": "telegram"
      },
      {
        "key": "telegram_ip",
        "kind": "ipcidr",
        "slug": "telegram"
      }
    ],
    "rules": [
      "RULE-SET,telegram,Telegram",
      "RULE-SET,telegram_ip,Telegram,no-resolve"
    ]
  },
  {
    "name": "Steam",
    "icon": "Steam.svg",
    "direct": true,
    "providers": [
      {
        "key": "steam",
        "kind": "domain",
        "slug": "steam"
      },
      {
        "key": "steam_ip",
        "kind": "ipcidr",
        "slug": "steam"
      }
    ],
    "rules": [
      "RULE-SET,steam,Steam",
      "RULE-SET,steam_ip,Steam,no-resolve"
    ]
  },
  {
    "name": "TikTok",
    "icon": "TikTok.svg",
    "defaultSelected": "日本",
    "providers": [
      {
        "key": "tiktok",
        "kind": "domain",
        "slug": "tiktok"
      },
      {
        "key": "tiktok_ip",
        "kind": "ipcidr",
        "slug": "tiktok"
      }
    ],
    "rules": [
      "RULE-SET,tiktok,TikTok",
      "RULE-SET,tiktok_ip,TikTok,no-resolve"
    ]
  },
  {
    "name": "Twitter",
    "icon": "Twitter.svg",
    "providers": [
      {
        "key": "twitter",
        "kind": "domain",
        "slug": "twitter"
      },
      {
        "key": "twitter_ip",
        "kind": "ipcidr",
        "slug": "twitter"
      }
    ],
    "rules": [
      "RULE-SET,twitter,Twitter",
      "RULE-SET,twitter_ip,Twitter,no-resolve"
    ]
  },
  {
    "name": "Meta",
    "icon": "Meta.svg",
    "providers": [
      {
        "key": "meta",
        "kind": "domain",
        "slug": "meta"
      },
      {
        "key": "facebook_ip",
        "kind": "ipcidr",
        "slug": "facebook"
      }
    ],
    "rules": [
      "RULE-SET,meta,Meta",
      "RULE-SET,facebook_ip,Meta,no-resolve"
    ]
  },
  {
    "name": "Line",
    "icon": "Line.svg",
    "providers": [
      {
        "key": "line",
        "kind": "domain",
        "slug": "line"
      }
    ],
    "rules": [
      "RULE-SET,line,Line"
    ]
  },
  {
    "name": "Netflix",
    "icon": "Netflix.svg",
    "providers": [
      {
        "key": "netflix",
        "kind": "domain",
        "slug": "netflix"
      },
      {
        "key": "netflix_ip",
        "kind": "ipcidr",
        "slug": "netflix"
      }
    ],
    "rules": [
      "RULE-SET,netflix,Netflix",
      "RULE-SET,netflix_ip,Netflix,no-resolve"
    ]
  },
  {
    "name": "Emby",
    "icon": "Emby.svg",
    "direct": true,
    "providers": [
      {
        "key": "emby",
        "kind": "domain",
        "url": "https://cdn.jsdmirror.com/gh/666OS/rules@release/mihomo/domain/Emby.mrs",
        "bundle": "geo/geosite/category-emby.mrs"
      },
      {
        "key": "emos",
        "kind": "domain",
        "url": "https://cdn.jsdmirror.com/gh/binaryu/emos-proxy-rule@main/rules/emos-mihomo.mrs",
        "bundle": "geo/geosite/category-emby.mrs"
      }
    ],
    "rules": [
      "RULE-SET,emby,Emby",
      "RULE-SET,emos,Emby",
      "DOMAIN-SUFFIX,mb3admin.com,Emby",
      "DOMAIN-SUFFIX,nubebelle.com,Emby",
      "DOMAIN-KEYWORD,emby,Emby",
      "PROCESS-NAME,com.mb.android,Emby",
      "PROCESS-NAME,tv.emby.embyatv,Emby",
      "PROCESS-NAME,com.hush.yamby,Emby",
      "PROCESS-NAME,com.jellycine.app,Emby",
      "PROCESS-NAME,com.mountains.hills,Emby",
      "PROCESS-NAME,RodelPlayer.App.exe,Emby",
      "PROCESS-NAME,com.feifeiduck.capyplayer,Emby"
    ]
  },
  {
    "name": "PikPak",
    "icon": "PikPak.svg",
    "direct": true,
    "providers": [
      {
        "key": "pikpak",
        "kind": "domain",
        "slug": "pikpak"
      }
    ],
    "rules": [
      "RULE-SET,pikpak,PikPak"
    ]
  },
  {
    "name": "Spotify",
    "icon": "Spotify.svg",
    "direct": true,
    "providers": [
      {
        "key": "spotify",
        "kind": "domain",
        "slug": "spotify"
      },
      {
        "key": "spotify_ip",
        "kind": "ipcidr",
        "slug": "spotify"
      }
    ],
    "rules": [
      "RULE-SET,spotify,Spotify",
      "RULE-SET,spotify_ip,Spotify,no-resolve"
    ]
  },
  {
    "name": "Crypto",
    "icon": "Bitcoin.svg",
    "defaultSelected": "日本",
    "providers": [
      {
        "key": "cryptocurrency",
        "kind": "domain",
        "slug": "category-cryptocurrency"
      }
    ],
    "rules": [
      "RULE-SET,cryptocurrency,Crypto"
    ]
  },
  {
    "name": "PayPal",
    "icon": "PayPal.svg",
    "defaultSelected": "美国",
    "providers": [
      {
        "key": "paypal",
        "kind": "domain",
        "slug": "paypal"
      }
    ],
    "rules": [
      "RULE-SET,paypal,PayPal"
    ]
  },
  {
    "name": "Patreon",
    "icon": "Patreon.svg",
    "defaultSelected": "香港",
    "providers": [
      {
        "key": "patreon",
        "kind": "domain",
        "slug": "patreon"
      }
    ],
    "rules": [
      "RULE-SET,patreon,Patreon"
    ]
  },
  {
    "name": "EHentai",
    "icon": "EHentai.svg",
    "direct": true,
    "defaultSelected": "美国",
    "providers": [
      {
        "key": "ehentai",
        "kind": "domain",
        "slug": "ehentai"
      }
    ],
    "rules": [
      "RULE-SET,ehentai,EHentai"
    ]
  },
  {
    "name": "AdBlock",
    "icon": "AdBlock.svg",
    "reject": true,
    "providers": [
      {
        "key": "awads",
        "kind": "domain",
        "url": "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/main/Filters/AWAvenue-Ads-Rule-Clash-Only.Ads.mrs"
      }
    ],
    "rules": [
      "RULE-SET,awads,AdBlock"
    ]
  }
];


// ---------- 节点：先分类，后构建分组 ----------
const invisibleCharsRegex = /[\u00AD\u180E\u200B\u200E\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u115F\u1160\u3164\uFFA0]/g;
function toMatchableName(name) {
  return String(name || '').replace(invisibleCharsRegex, '').normalize('NFKC');
}
function isDailyProxy(proxy) {
  const name = toMatchableName(proxy.name);
  // 小数末尾的 0 可省略；拒绝 0.25 / 10.2 / 日期序号等误匹配。
  return /[\[【(]\s*0\.20*\s*[\]】)]|(?:^|[^\d.])0\.20*\s*(?:倍|[x×✕✖⨯⨉*])|[x×✕✖⨯⨉*]\s*0\.20*(?![\d.])/i.test(name);
}
function regionOf(name) {
  return regionDefinitions.find(r => r.regex.test(toMatchableName(name)));
}
function prepareNodes(config) {
  if (config['proxy-providers'] && Object.keys(config['proxy-providers']).length) {
    throw new Error('此版本需要机场配置中的 proxies 节点列表，不支持仅含 proxy-providers 的订阅。');
  }
  const input = [...(Array.isArray(config.proxies) ? config.proxies : []), ...customizeProxies];
  const reserved = new Set(['GLOBAL', 'DIRECT', 'REJECT', 'REJECT-DROP', 'PASS',
    '默认代理', '基础服务', '日常', '日常-自动选择', '直连', '手动选择', '自动选择', '自动选择地区',
    '全部节点-自动选择', '故障转移', '负载均衡', '漏网之鱼', '其他国家', '其他国家-自动选择',
    ...serviceCatalog.map(s => s.name), ...regionDefinitions.flatMap(r => [r.name, r.name + '-自动选择', r.name + '-故障转移']),
    ...['双栈','IPv4优先','IPv6优先','仅IPv4','仅IPv6'].map(s => '🇨🇳 直连 | ' + s)]);
  const rename = new Map(), nodes = [], originals = new Map();
  const info = /剩余流量|套餐到期|订阅到期|重置时间|官方网站|客服|返利|https?:\/\/|t\.me\//i;
  for (const p of input) {
    if (!p || typeof p !== 'object' || typeof p.name !== 'string' || !p.name.trim()) {
      throw new Error('订阅含无名称节点，请先检查机场配置。');
    }
    if (['direct','reject','rematch'].includes(String(p.type).toLowerCase())) continue;
    if (originals.has(p.name)) {
      if (JSON.stringify(originals.get(p.name)) === JSON.stringify(p)) continue;
      throw new Error('存在同名但内容不同的节点：' + p.name);
    }
    originals.set(p.name, p);
    const cleaned = toMatchableName(p.name).replace(/\s+/g, ' ').trim();
    if (ruleOptionsEnable.过滤信息节点 && info.test(cleaned) && !regionOf(cleaned)) continue;
    const flag = cleaned.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u)?.[0];
    const region = regionOf(cleaned);
    const bare = (flag ? cleaned.replace(flag, '') : cleaned).trim();
    const base = (flag || region?.flag) ? `${flag || region.flag} ${bare}` : bare;
    let name = base, suffix = 2;
    while (reserved.has(name)) name = `${base} (${suffix++})`;
    reserved.add(name);
    rename.set(p.name, name);
    const node = { ...p, name };
    if (ruleOptionsEnable.代理IPV4优先 && !ruleOptionsEnable.代理IPV6优先) node['ip-version'] = 'ipv4-prefer';
    if (ruleOptionsEnable.代理IPV6优先 && !ruleOptionsEnable.代理IPV4优先) node['ip-version'] = 'ipv6-prefer';
    nodes.push(node);
  }
  if (!nodes.length) throw new Error('未找到可用代理节点，请检查机场订阅。');
  for (const node of nodes) {
    const dialer = node['dialer-proxy'];
    if (!dialer) continue;
    if (rename.has(dialer)) node['dialer-proxy'] = rename.get(dialer);
    else if (!['DIRECT', 'REJECT'].includes(dialer)) throw new Error('节点的 dialer-proxy 引用了缺失节点：' + dialer);
  }
  const nodeMap = new Map(nodes.map(p => [p.name, p]));
  for (const node of nodes) {
    const seen = new Set([node.name]);
    let target = node['dialer-proxy'];
    while (nodeMap.has(target)) {
      if (seen.has(target)) throw new Error('节点前置代理存在循环：' + node.name);
      seen.add(target);
      const next = nodeMap.get(target);
      if (isDailyProxy(next) !== isDailyProxy(node)) throw new Error('前置代理跨越日常与普通节点，无法保证倍率隔离：' + node.name);
      target = next['dialer-proxy'];
    }
  }
  return nodes;
}
const directProxies = [
  { name: '🇨🇳 直连 | 双栈', type: 'direct' },
  { name: '🇨🇳 直连 | IPv4优先', type: 'direct', 'ip-version': 'ipv4-prefer' },
  { name: '🇨🇳 直连 | IPv6优先', type: 'direct', 'ip-version': 'ipv6-prefer' },
  { name: '🇨🇳 直连 | 仅IPv4', type: 'direct', 'ip-version': 'ipv4' },
  { name: '🇨🇳 直连 | 仅IPv6', type: 'direct', 'ip-version': 'ipv6' },
];
function unique(list) { return [...new Set(list)]; }
function selectGroup(name, choices, icon = 'Proxy.svg', preferred) {
  const proxies = unique(choices.length ? choices : ['REJECT']);
  // 同时调整顺序，兼容不识别 default-selected 的客户端。
  if (preferred && proxies.includes(preferred)) proxies.unshift(...proxies.splice(proxies.indexOf(preferred), 1));
  return { name, type: 'select', proxies, icon: iconBaseUrl + icon,
    ...(preferred && proxies.includes(preferred) ? { 'default-selected': preferred } : {}) };
}
function testGroup(name, names, type = 'url-test') {
  return { name, type, proxies: names.length ? unique(names) : ['REJECT'],
    url: resources.test, interval: type === 'fallback' ? tuning.fallbackInterval : tuning.testInterval, timeout: tuning.timeout,
    lazy: true, 'max-failed-times': 2, 'empty-fallback': 'REJECT',
    ...(type === 'url-test' ? { tolerance: tuning.tolerance } : {}),
    ...(type === 'load-balance' ? { strategy: 'sticky-sessions' } : {}),
    hidden: true, icon: iconBaseUrl + 'Auto.svg' };
}
function buildGroups(nodes) {
  const daily = nodes.filter(isDailyProxy).map(p => p.name);
  const normal = nodes.filter(p => !isDailyProxy(p));
  const normalNames = normal.map(p => p.name);
  const groups = [], regionNames = [], regionAutoNames = [], regionFallbackNames = [];
  const buckets = regionDefinitions.map(r => ({ name: r.name, icon: r.icon, nodes: [] }));
  const other = { name: '其他国家', icon: iconBaseUrl + 'WorldMap.svg', nodes: [] };
  for (const p of normal) {
    const r = regionOf(p.name);
    (r ? buckets.find(b => b.name === r.name) : other).nodes.push(p.name);
  }
  for (const bucket of [...buckets, other]) {
    if (!bucket.nodes.length) continue;
    const autoName = bucket.name + '-自动选择';
    const choices = [...bucket.nodes];
    if (ruleOptionsEnable.生成地区自动选择组) {
      groups.push(testGroup(autoName, bucket.nodes)); choices.push(autoName); regionAutoNames.push(autoName);
    }
    if (ruleOptionsEnable.故障转移 && bucket.name !== '其他国家') {
      const fallbackName = bucket.name + '-故障转移';
      const fallback = testGroup(fallbackName, bucket.nodes, 'fallback');
      fallback.hidden = false;
      groups.push(fallback); choices.push(fallbackName); regionFallbackNames.push(fallbackName);
    }
    const preferred = choices.includes(bucket.name + '-故障转移') ? bucket.name + '-故障转移' : autoName;
    const group = selectGroup(bucket.name, choices, 'Proxy.svg', preferred);
    group.icon = bucket.icon; group.hidden = ruleOptionsEnable.隐藏地区手动选择组;
    groups.push(group); regionNames.push(bucket.name);
  }
  // 即使没有日常节点，也显示明确拒绝的日常组；绝不退回普通节点或直连。
  if (daily.length) groups.push(testGroup('日常-自动选择', daily));
  groups.push(selectGroup('日常', daily.length ? ['日常-自动选择', ...daily] : ['REJECT'], 'Available.svg'));
  // 公共 DNS 与规则下载不依赖用户的默认代理选择。普通节点存在时排除日常。
  const infrastructure = testGroup('基础服务', normalNames.length ? normalNames : daily, 'fallback');
  infrastructure.interval = 600; infrastructure.hidden = true;
  groups.push(infrastructure);
  const baseNames = [];
  if (ruleOptionsEnable.手动选择) { groups.push(selectGroup('手动选择', normalNames, 'Static.svg')); baseNames.push('手动选择'); }
  if (ruleOptionsEnable.自动选择) {
    groups.push(testGroup('全部节点-自动选择', normalNames));
    if (regionAutoNames.length) groups.push(selectGroup('自动选择地区', regionAutoNames, 'WorldMap.svg'));
    groups.push(selectGroup('自动选择', ['全部节点-自动选择', ...(regionAutoNames.length ? ['自动选择地区'] : [])], 'Auto.svg'));
    baseNames.push('自动选择');
  }
  if (ruleOptionsEnable.故障转移) {
    const group = testGroup('故障转移', normalNames, 'fallback'); group.hidden = false;
    groups.push(group); baseNames.push('故障转移');
  }
  if (ruleOptionsEnable.负载均衡) { groups.push(testGroup('负载均衡', normalNames, 'load-balance')); baseNames.push('负载均衡'); }
  // 预设优先自动选择；电脑版关闭旧手选恢复，避免固定坏节点覆盖预设。
  const preferredDefault = normalNames.length
    ? (baseNames.includes('自动选择') ? '自动选择' : regionNames[0] || baseNames[0]) : '日常';
  const defaultGroup = selectGroup('默认代理', [...regionNames, '日常', ...baseNames], 'Proxy.svg', preferredDefault);
  groups.unshift(defaultGroup);
  groups.push(selectGroup('直连', directProxies.map(p => p.name), 'China.svg'));
  for (const svc of serviceCatalog) {
    if (!ruleOptionsEnable[svc.name]) continue;
    const regionalFallback = svc.defaultSelected + '-故障转移';
    const aiService = ['OpenAI', 'Gemini', 'Claude', 'AI'].includes(svc.name);
    const preferred = aiService && regionFallbackNames.includes(regionalFallback)
      ? regionalFallback : svc.defaultSelected && (svc.defaultSelected === '直连' || regionNames.includes(svc.defaultSelected))
      ? svc.defaultSelected : undefined;
    groups.push(selectGroup(svc.name,
      svc.reject ? ['REJECT', 'PASS'] : ['默认代理', ...regionNames, ...regionFallbackNames, ...baseNames, '日常', ...(svc.direct ? ['直连'] : [])],
      svc.icon, preferred));
  }
  groups.push(selectGroup('漏网之鱼', ['默认代理', '直连', '日常', ...regionNames], 'Stack.svg'));
  groups.unshift(selectGroup('GLOBAL', groups.map(g => g.name), 'Global.svg', '默认代理'));
  return groups;
}
// ---------- 规则：仅加载当前启用服务需要的资源 ----------
function providerFrom(def) {
  const ip = def.kind === 'ipcidr';
  const url = def.key === 'awads' ? resources.ads : def.url ||
    resources.rules + (ip ? 'geoip/' : 'geosite/') + def.slug + '.mrs';
  return { type: 'http', behavior: def.kind, format: 'mrs', interval: tuning.ruleInterval,
    url, path: './ruleset/clashparty-v1/' + def.key + '.mrs', proxy: '基础服务' };
}
function buildRules() {
  const providers = {}, domainRules = [], ipRules = [];
  for (const def of baseRuleCatalog) providers[def.key] = providerFrom(def);
  for (const svc of serviceCatalog) {
    if (!ruleOptionsEnable[svc.name]) continue;
    for (const def of svc.providers) providers[def.key] = providerFrom(def);
    for (const rule of svc.rules) (svc.providers.some(p => p.kind === 'ipcidr' && rule.startsWith('RULE-SET,' + p.key + ',')) ? ipRules : domainRules).push(rule);
  }
  const ads = domainRules.filter(r => r.endsWith(',AdBlock'));
  const serviceRules = domainRules.filter(r => !r.endsWith(',AdBlock'));
  const local = ['RULE-SET,private,直连', 'RULE-SET,private_ip,直连,no-resolve'];
  const domesticServices = ['games_cn','nvidia_cn','apple_cn','microsoft_cn'].map(k => 'RULE-SET,' + k + ',直连');
  const cdnRules = [];
  if (ruleOptionsEnable.下载资源走日常) {
    for (const [key, url, behavior] of [['cdn_domain', resources.cdnDomain, 'domain'], ['cdn_classical', resources.cdnClassical, 'classical']]) {
      providers[key] = { type: 'http', behavior, format: 'text', interval: tuning.ruleInterval,
        url, path: './ruleset/clashparty-v1/' + key + '.txt', proxy: '基础服务' };
      cdnRules.push('RULE-SET,' + key + ',日常');
    }
  }
  const quic = ruleOptionsEnable.屏蔽国外QUIC ? [
    'AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((OR,((RULE-SET,cn),(RULE-SET,cn_ip,no-resolve)))))),REJECT',
  ] : [];
  // 服务域名先于大范围分类，IP 规则最后处理。QUIC 阻断是显式前置网络例外。
  const rules = [...customRules, ...local, ...ads, ...quic, ...domesticServices,
    ...serviceRules, 'RULE-SET,geolocation-cn,直连', ...cdnRules,
    'RULE-SET,geolocation-!cn,默认代理', ...ipRules, 'RULE-SET,cn_ip,直连', 'MATCH,漏网之鱼'];
  return { providers, rules };
}
function validateResult(result) {
  const groups = result['proxy-groups'];
  const nodeNames = new Set(result.proxies.map(p => p.name));
  const map = new Map(groups.map(g => [g.name, g]));
  if (map.size !== groups.length || nodeNames.size !== result.proxies.length) throw new Error('名称重复，请检查节点或分组。');
  const builtins = new Set(['DIRECT','REJECT','REJECT-DROP','PASS']);
  for (const g of groups) {
    if (nodeNames.has(g.name)) throw new Error('节点与策略组同名：' + g.name);
    if (!g.proxies.length) throw new Error('空策略组：' + g.name);
    for (const p of g.proxies) if (!nodeNames.has(p) && !map.has(p) && !builtins.has(p)) throw new Error('缺失策略引用：' + p);
  }
  function visit(name, seen) {
    if (!map.has(name)) return;
    if (seen.has(name)) throw new Error('策略组循环引用：' + name);
    const next = new Set(seen); next.add(name);
    for (const p of map.get(name).proxies) visit(p, next);
  }
  for (const g of groups) visit(g.name, new Set());
  return result;
}

const commonDnsList = [
  '223.5.5.5', '223.6.6.6', '2400:3200::1', '2400:3200:baba::1', 'alidns',
  '119.29.29.29', '182.254.116.116', '1.12.12.12', '120.53.53.53',
  '2402:4e00::', 'doh.pub', 'dot.pub', 'dns.pub', 'dnspod',
  '114.114.114.114', '114.114.115.115',
  '180.76.76.76', '2400:da00::6666', 'dns.baidu',
  '1.2.4.8', '210.2.4.8', '2001:dc7:1000::1', 'cnnic',
  '101.226.4.6', '218.30.118.6', '123.125.81.6',
  '2400:8800:1::6', '2400:8800:2::6', 'doh.360', 'dot.360',
  '180.184.1.1', '180.184.2.2',
  '1.1.1.1', '1.0.0.1', '1.1.1.2', '1.0.0.2', '1.1.1.3', '1.0.0.3',
  '2606:4700:4700::1111', '2606:4700:4700::1001',
  '2606:4700:4700::1112', '2606:4700:4700::1002',
  '2606:4700:4700::1113', '2606:4700:4700::1003',
  'dns.cloudflare', 'cloudflare-dns', 'one.one.one.one',
  '8.8.8.8', '8.8.4.4', '2001:4860:4860::8888', '2001:4860:4860::8844', 'dns.google',
  '9.9.9.9', '9.9.9.10', '9.9.9.11', '149.112.112.112',
  '149.112.112.10', '149.112.112.11', '2620:fe::fe', '2620:fe::9', 'quad9',
  '208.67.222.222', '208.67.220.220', '208.67.222.123', '208.67.220.123',
  '2620:119:35::35', '2620:119:53::53', '2620:119:35::123', '2620:119:53::123',
  'opendns', '94.140.14.14', '94.140.15.15', '94.140.14.15', '94.140.15.16',
  '2a10:50c0::ad1:ff', '2a10:50c0::ad2:ff',
  '2a10:50c0::bad1:ff', '2a10:50c0::bad2:ff', 'adguard',
  '76.76.2.0', '76.76.10.0', '76.76.19.19', '76.223.122.150',
  '2a0d:2a00:1::2', '2a0d:2a00:2::2',
  '185.228.168.9', '185.228.169.9', '185.228.168.10', '185.228.169.11',
  '185.228.168.168', '185.228.169.168',
  '77.88.8.8', '77.88.8.1', '2a02:6b8::feed:0ff', '2a02:6b8:0:1::feed:0ff',
  '156.154.70.1', '156.154.71.1', '156.154.70.2', '156.154.71.2',
  '2610:a1:1018::1', '2610:a1:1019::1',
  '194.242.2.2', '2a07:e340::2', '74.82.42.42', '2001:470:20::2',
  'nextdns', 'dns.apple',
];

const commonDnsRegex = new RegExp(
  commonDnsList.map((dns) => dns.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const chinaDNS = ['223.5.5.5#DIRECT', '119.29.29.29#DIRECT'];
const foreignDNS = [
  'https://cloudflare-dns.com/dns-query#基础服务',
  'https://dns.google/dns-query#基础服务',
];
const defaultDNS = [
  '114.114.114.114#DIRECT', 'tls://223.5.5.5#DIRECT',
  'https://1.12.12.12/dns-query#DIRECT',
];
const proxyServerDNS = [
  '114.114.114.114#DIRECT', 'tls://223.5.5.5#DIRECT',
  'https://doh.pub/dns-query#DIRECT',
];

function hostSpecificity(pattern) {
  if (pattern.startsWith('+.')) return 2;
  if (pattern.startsWith('.')) return 1;
  if (pattern.includes('*')) return 0;
  return 3;
}

function matchDomainPattern(pattern, domains) {
  pattern = pattern.toLowerCase();
  if (!pattern.includes('*') && !pattern.startsWith('+.') && !pattern.startsWith('.')) {
    return typeof domains === 'string'
      ? domains.toLowerCase() === pattern
      : [...domains].some((d) => d.toLowerCase() === pattern);
  }
  const domainList = typeof domains === 'string'
    ? [domains.toLowerCase()] : [...domains].map((d) => d.toLowerCase());
  if (pattern.startsWith('+.')) {
    const suffix = pattern.slice(2);
    return domainList.some((domain) => domain === suffix || domain.endsWith(`.${suffix}`));
  }
  if (pattern.startsWith('.')) {
    const suffix = pattern.slice(1);
    return domainList.some((domain) => domain !== suffix && domain.endsWith(`.${suffix}`));
  }
  const patternParts = pattern.split('.');
  return domainList.some((domain) => {
    const domainParts = domain.split('.');
    return patternParts.length === domainParts.length &&
      patternParts.every((part, index) => part === '*' || part === domainParts[index]);
  });
}

function applyHostsToProxies(proxies, hosts) {
  if (!hosts || typeof hosts !== 'object') return proxies;
  const hostEntries = Object.entries(hosts)
    .filter(([, value]) => (typeof value === 'string' && value.length > 0) ||
      (Array.isArray(value) && value.length > 0))
    .sort((a, b) => hostSpecificity(b[0]) - hostSpecificity(a[0]));
  if (hostEntries.length === 0) return proxies;
  const targetOf = (value) => {
    if (Array.isArray(value)) value = value.find((v) => typeof v === 'string' && v.length > 0);
    return typeof value === 'string' && value.length > 0 ? value : null;
  };
  const resolveCache = new Map();
  const resolve = (server) => {
    const cached = resolveCache.get(server);
    if (cached !== undefined) return cached;
    const seen = new Set();
    let current = server.toLowerCase();
    let result = server;
    while (!seen.has(current)) {
      seen.add(current);
      const entry = hostEntries.find(([pattern]) => matchDomainPattern(pattern, current));
      const target = entry && targetOf(entry[1]);
      if (!target) break;
      result = target;
      current = target.toLowerCase();
    }
    resolveCache.set(server, result);
    return result;
  };
  return proxies.map((proxy) => {
    if (typeof proxy.server !== 'string') return proxy;
    const server = resolve(proxy.server);
    return server === proxy.server ? proxy : { ...proxy, server };
  });
}

function stripDnsSuffix(dns) {
  const str = String(dns);
  const hashIndex = str.indexOf('#');
  if (hashIndex === -1) return str;
  const prefix = str.slice(0, hashIndex).trim();
  const suffix = str.slice(hashIndex + 1).toLowerCase().trim();
  if (suffix.includes('direct') || suffix.includes('直连')) return prefix + '#DIRECT';
  return prefix;
}

function isIpAddress(server) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(server) || server.includes(':');
}

function buildDnsAndHostsConfig(config, filteredProxies) {
  const minimalModeEnabled = false;
  const originalDnsConfig = config.dns || {};
  const proxyServerNameservers = originalDnsConfig['proxy-server-nameserver'] || [];
  const listenValue = originalDnsConfig['listen'];

  const shouldRewriteByHosts =
    proxyServerNameservers.length === 1 &&
    typeof listenValue === 'string' &&
    listenValue.length > 0 &&
    (proxyServerNameservers.some((dns) =>
      String(dns).toLowerCase().includes(listenValue.toLowerCase())) ||
      (listenValue.includes('0.0.0.0') &&
        proxyServerNameservers.some((dns) =>
          String(dns).toLowerCase().includes('127.0.0.1'))));

  const mappedProxies = shouldRewriteByHosts
    ? applyHostsToProxies(filteredProxies, config.hosts) : filteredProxies;

  const proxyDomains = new Set(
    mappedProxies.filter((proxy) => typeof proxy.server === 'string')
      .map((proxy) => proxy.server.toLowerCase())
      .filter((server) => !isIpAddress(server)));

  const privateProxyServerNameservers = shouldRewriteByHosts ? [] : proxyServerNameservers;

  const isCommonDns = (dns) => {
    const value = String(dns).trim().toLowerCase();
    if (value === 'system' || value === 'system://') return true;
    return commonDnsRegex.test(value);
  };

  const privateDNS = [...new Set(
    [...(originalDnsConfig['nameserver'] || []), ...privateProxyServerNameservers]
      .map(stripDnsSuffix).filter((dns) => dns.length > 0 && !isCommonDns(dns)))];

  const matchedProxyPolicy = {};
  for (const [domain, dns] of Object.entries({
    ...originalDnsConfig['nameserver-policy'],
    ...originalDnsConfig['proxy-server-nameserver-policy'],
  })) {
    if (!matchDomainPattern(domain, proxyDomains)) continue;
    const stripedDns = Array.isArray(dns)
      ? dns.map(stripDnsSuffix).filter((d) => d.length > 0) : stripDnsSuffix(dns);
    if (Array.isArray(stripedDns) && stripedDns.length === 0) continue;
    matchedProxyPolicy[domain] = stripedDns;
  }

  if (privateDNS.length > 0 && Object.keys(matchedProxyPolicy).length === 0) {
    for (const domain of proxyDomains) matchedProxyPolicy[domain] = privateDNS;
  }

  const proxyServerPolicy = matchedProxyPolicy;

  const originalFakeIpFilter = originalDnsConfig['fake-ip-filter'] || [];
  const proxyFakeIpFilter = originalFakeIpFilter.filter((pattern) =>
    matchDomainPattern(String(pattern), proxyDomains));

  const dns = {
    enable: true,
    ipv6: true,
    'use-hosts': true,
    'cache-algorithm': 'arc',
    'use-system-hosts': true,
    'enhanced-mode': 'fake-ip',
    'fake-ip-range': '198.18.0.1/15',
    'fake-ip-range6': '2001:2::1/48',
    'fake-ip-filter': [
      'rule-set:private',
      'rule-set:fakeip_filter',
      'rule-set:geolocation-cn',
      ...(minimalModeEnabled ? [] :
        ruleOptionsEnable['FCM'] ? ['rule-set:googlefcm'] : []),
      ...proxyFakeIpFilter,
    ],
    'default-nameserver': defaultDNS,
    'proxy-server-nameserver': proxyServerDNS,
    ...(Object.keys(proxyServerPolicy).length > 0 && {
      'proxy-server-nameserver-policy': proxyServerPolicy,
    }),
    nameserver: foreignDNS,
    'nameserver-policy': {
      'rule-set:private': 'system',
      'rule-set:douyin': ['system', '180.184.1.1', '180.184.2.2'],
      'rule-set:cn': chinaDNS,
    },
    'direct-nameserver': chinaDNS,
    'direct-nameserver-follow-policy': true,
  };

  const hosts = {
    'doh.pub': ['1.12.12.12', '120.53.53.53'],
    'cloudflare-dns.com': ['1.1.1.1', '1.0.0.1'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],
    'services.googleapis.cn': 'services.googleapis.com',
  };

  if (ruleOptionsEnable.屏蔽PCDN) {
    for (const domain of ['+.mcdn.bilivideo.com', '+.mcdn.bilivideo.cn', '+.edge.mountaintoys.cn', '+.h2.smtcdns.net']) hosts[domain] = ['0.0.0.0'];
  }
  return { dns, hosts, proxies: mappedProxies };
}


// ---------- 主入口：Clash Party JavaScript 覆写 ----------
function main(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('需要机场订阅配置对象。');
  const nodes = prepareNodes(config);
  const { dns, hosts, proxies } = buildDnsAndHostsConfig(config, nodes);
  const { providers, rules } = buildRules();
  const result = {
    ipv6: true, mode: 'rule', 'log-level': 'info', 'unified-delay': true,
    'tcp-concurrent': true, 'keep-alive-interval': 60, 'find-process-mode': 'strict',
    'allow-lan': false,
    profile: { ...(config.profile || {}), 'store-selected': false, 'store-fake-ip': true },
    sniffer: { enable: false },
    dns, hosts: { ...JSON.parse(JSON.stringify(config.hosts || {})), ...hosts }, proxies: [...proxies, ...directProxies],
    'proxy-groups': buildGroups(proxies), 'rule-providers': providers, rules,
  };
  // 只透传客户端运行参数，不继承订阅中未知分流、监听器和远程脚本。
  // 最终端口/TUN/IPv6/控制器设置仍由 Party 的受控配置合并决定。
  for (const key of ['mixed-port', 'port', 'socks-port', 'redir-port', 'tproxy-port',
    'bind-address', 'external-controller', 'external-controller-pipe',
    'external-controller-unix', 'external-controller-tls', 'external-controller-cors',
    'secret', 'authentication', 'skip-auth-prefixes', 'tun']) {
    if (config[key] !== undefined) result[key] = JSON.parse(JSON.stringify(config[key]));
  }
  return validateResult(result);
}
// END OF SCRIPT v1.1.0-clashparty
