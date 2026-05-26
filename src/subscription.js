import { kGet, kSet } from './kv.js';
import { DEFAULT_RULES } from './defaults.js';
import { nodeToURI, nodeToClash } from './nodes.js';
import { toYaml } from './yaml.js';

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function buildRuleProviders() {
  return {
    reject: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt', path: './ruleset/reject.yaml', interval: 86400 },
    icloud: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt', path: './ruleset/icloud.yaml', interval: 86400 },
    apple: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt', path: './ruleset/apple.yaml', interval: 86400 },
    google: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt', path: './ruleset/google.yaml', interval: 86400 },
    proxy: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt', path: './ruleset/proxy.yaml', interval: 86400 },
    direct: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt', path: './ruleset/direct.yaml', interval: 86400 },
    lancidr: { type: 'http', behavior: 'ipcidr', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt', path: './ruleset/lancidr.yaml', interval: 86400 },
    cncidr: { type: 'http', behavior: 'ipcidr', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt', path: './ruleset/cncidr.yaml', interval: 86400 },
    telegramcidr: { type: 'http', behavior: 'ipcidr', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt', path: './ruleset/telegramcidr.yaml', interval: 86400 },
  };
}

function buildRules(rulesCfg, outboundPolicy) {
  const customRules = Array.isArray(rulesCfg.customRules) ? rulesCfg.customRules.filter(Boolean) : [];

  if (rulesCfg.preset === 'loyalsoldier') {
    return [
      'RULE-SET,reject,REJECT',
      'RULE-SET,icloud,DIRECT',
      'RULE-SET,apple,DIRECT',
      'RULE-SET,google,' + outboundPolicy,
      'RULE-SET,proxy,' + outboundPolicy,
      'RULE-SET,direct,DIRECT',
      'RULE-SET,lancidr,DIRECT,no-resolve',
      'RULE-SET,cncidr,DIRECT,no-resolve',
      'RULE-SET,telegramcidr,' + outboundPolicy + ',no-resolve',
      ...customRules,
      'GEOIP,CN,DIRECT',
      'MATCH,' + outboundPolicy,
    ];
  }

  return [...customRules, 'MATCH,' + outboundPolicy];
}

async function recordStat(sub, request, env) {
  const stats = await kGet(env.KV, 'stats', {});
  if (!stats[sub.id]) {
    stats[sub.id] = { visits: 0, lastVisit: 0, uas: [] };
  }

  stats[sub.id].visits += 1;
  stats[sub.id].lastVisit = Date.now();

  const ua = request.headers.get('User-Agent') || 'unknown';
  if (!stats[sub.id].uas.includes(ua)) {
    stats[sub.id].uas.push(ua);
    if (stats[sub.id].uas.length > 10) stats[sub.id].uas.shift();
  }

  await kSet(env.KV, 'stats', stats);
}

function makeNotFound() {
  return new Response('Not Found', { status: 404 });
}

export async function handleSubscription(token, request, env) {
  const subscriptions = await kGet(env.KV, 'subscriptions', []);
  const sub = subscriptions.find((item) => item.token === token);
  if (!sub) return makeNotFound();

  if (sub.expireTime && sub.expireTime > 0 && Date.now() > sub.expireTime) {
    return new Response('Subscription expired', { status: 410 });
  }

  const allNodes = await kGet(env.KV, 'nodes', []);
  const nodeIds = Array.isArray(sub.nodeIds) ? sub.nodeIds : ['all'];

  let nodes;
  if (nodeIds.length === 0 || nodeIds.includes('all')) {
    nodes = allNodes.filter((n) => n.enabled !== false);
  } else {
    const idSet = new Set(nodeIds);
    nodes = allNodes.filter((n) => idSet.has(n.id) && n.enabled !== false);
  }

  nodes.sort((a, b) => (a.sort || 0) - (b.sort || 0));

  await recordStat(sub, request, env);

  const ua = request.headers.get('User-Agent') || '';
  const format = new URL(request.url).searchParams.get('format');
  const isClash = format === 'clash' || (!format && /clash|mihomo|stash/i.test(ua));

  const total = (sub.totalGB || 0) * 1073741824;
  const headers = {
    'Content-Type': isClash ? 'text/yaml; charset=utf-8' : 'text/plain; charset=utf-8',
    'subscription-userinfo': 'upload=0; download=0; total=' + total + '; expire=' + (sub.expireTime || 0),
    'Profile-Update-Interval': '12',
    'Access-Control-Allow-Origin': '*',
  };

  if (!isClash) {
    const uris = nodes.map(nodeToURI).filter(Boolean).join('\n');
    return new Response(utf8ToBase64(uris), { headers });
  }

  const rulesCfg = await kGet(env.KV, 'rules', DEFAULT_RULES);
  const proxies = nodes.map(nodeToClash).filter(Boolean);
  const proxyNames = proxies.map((p) => p.name);
  const outboundPolicy = rulesCfg.defaultOutbound === 'direct' ? 'DIRECT' : '节点选择';

  const clashConfig = {
    port: 7890,
    'socks-port': 7891,
    'allow-lan': true,
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',
    dns: {
      enable: true,
      'enhanced-mode': 'fake-ip',
      'fake-ip-range': '198.18.0.1/16',
      nameserver: ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
      fallback: ['https://1.1.1.1/dns-query', 'https://dns.google/dns-query'],
      'fallback-filter': {
        geoip: true,
        'geoip-code': 'CN',
      },
    },
    proxies,
    'proxy-groups': [
      {
        name: '节点选择',
        type: 'select',
        proxies: ['自动选择', ...proxyNames, 'DIRECT'],
      },
      {
        name: '自动选择',
        type: 'url-test',
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        tolerance: 50,
      },
    ],
    rules: buildRules(rulesCfg, outboundPolicy),
  };

  if (rulesCfg.preset === 'loyalsoldier') {
    clashConfig['rule-providers'] = buildRuleProviders();
  }

  return new Response(toYaml(clashConfig), { headers });
}
