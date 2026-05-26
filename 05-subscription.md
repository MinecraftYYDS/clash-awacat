# subscription.js - 订阅生成

## 导出

```javascript
export async function handleSubscription(token, request, env)
```

## 处理流程

1. 从 KV 获取 subscriptions 数组，找到 `token` 匹配的订阅
2. 找不到返回 404
3. 获取所有节点
4. 根据订阅的 `nodeIds` 过滤节点：
   - `nodeIds` 为 `['all']` 或未设置 → 使用所有 `enabled: true` 的节点
   - 否则 → 使用 `nodeIds` 中列出的且 `enabled: true` 的节点
5. 按 `sort` 字段排序
6. 记录统计（visits++, lastVisit, UA）
7. 判断输出格式
8. 生成响应

## 格式判断

```javascript
const ua = request.headers.get('User-Agent') || '';
const format = new URL(request.url).searchParams.get('format');
const isClash = format === 'clash' || (!format && /clash|mihomo|stash/i.test(ua));
```

## Clash 配置生成

完整配置结构：

```javascript
{
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
    'fallback-filter': { geoip: true, 'geoip-code': 'CN' },
  },
  proxies: [...],           // nodeToClash() 转换后的数组
  'proxy-groups': [
    { name: '节点选择', type: 'select', proxies: ['自动选择', ...所有节点名, 'DIRECT'] },
    { name: '自动选择', type: 'url-test', proxies: [...所有节点名], url: 'http://www.gstatic.com/generate_204', interval: 300, tolerance: 50 },
  ],
  'rule-providers': {...},  // 当 preset=loyalsoldier 时
  rules: [...],
}
```

### rule-providers (preset=loyalsoldier)

```javascript
{
  reject: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt', path: './ruleset/reject.yaml', interval: 86400 },
  icloud: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt', path: './ruleset/icloud.yaml', interval: 86400 },
  apple: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt', path: './ruleset/apple.yaml', interval: 86400 },
  google: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt', path: './ruleset/google.yaml', interval: 86400 },
  proxy: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt', path: './ruleset/proxy.yaml', interval: 86400 },
  direct: { type: 'http', behavior: 'domain', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt', path: './ruleset/direct.yaml', interval: 86400 },
  lancidr: { type: 'http', behavior: 'ipcidr', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt', path: './ruleset/lancidr.yaml', interval: 86400 },
  cncidr: { type: 'http', behavior: 'ipcidr', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt', path: './ruleset/cncidr.yaml', interval: 86400 },
  telegramcidr: { type: 'http', behavior: 'ipcidr', url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt', path: './ruleset/telegramcidr.yaml', interval: 86400 },
}
```

### rules (preset=loyalsoldier)

```javascript
[
  'RULE-SET,reject,REJECT',
  'RULE-SET,icloud,DIRECT',
  'RULE-SET,apple,DIRECT',
  'RULE-SET,google,节点选择',
  'RULE-SET,proxy,节点选择',
  'RULE-SET,direct,DIRECT',
  'RULE-SET,lancidr,DIRECT,no-resolve',
  'RULE-SET,cncidr,DIRECT,no-resolve',
  'RULE-SET,telegramcidr,节点选择,no-resolve',
  ...customRules,  // 用户自定义规则插入这里
  'GEOIP,CN,DIRECT',
  'MATCH,节点选择',
]
```

### rules (preset=none)

```javascript
[
  ...customRules,
  'MATCH,节点选择',
]
```

## Base64 输出

```javascript
const uris = nodes.map(nodeToURI).filter(Boolean).join('\n');
const body = btoa(uris);
```

## 响应 Headers

```javascript
{
  'Content-Type': isClash ? 'text/yaml; charset=utf-8' : 'text/plain; charset=utf-8',
  'subscription-userinfo': `upload=0; download=0; total=${(sub.totalGB || 0) * 1073741824}; expire=${sub.expireTime || 0}`,
  'Profile-Update-Interval': '12',
}
```

## 统计记录

```javascript
const stats = await kGet(env.KV, 'stats', {});
if (!stats[sub.id]) stats[sub.id] = { visits: 0, lastVisit: 0, uas: [] };
stats[sub.id].visits++;
stats[sub.id].lastVisit = Date.now();
const ua = request.headers.get('User-Agent') || 'unknown';
if (!stats[sub.id].uas.includes(ua)) {
  stats[sub.id].uas.push(ua);
  if (stats[sub.id].uas.length > 10) stats[sub.id].uas.shift();
}
await kSet(env.KV, 'stats', stats);
```
