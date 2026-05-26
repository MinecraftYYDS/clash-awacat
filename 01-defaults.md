# defaults.js - 默认预置数据

## 预置节点

```javascript
export const DEFAULT_NODES = [
  { id: 'node-1', name: 'JP-中转机直连', type: 'hysteria2', server: 'jp.awacat.cc', port: 50000, password: 'neko233333', sni: 'jp.awacat.cc', skipCertVerify: false, enabled: true, sort: 0 },
  { id: 'node-2', name: 'JP-Softbank 中转', type: 'hysteria2', server: 'jp.awacat.cc', port: 50001, password: 'neko233333', sni: 'bing.com', skipCertVerify: true, enabled: true, sort: 1 },
  { id: 'node-3', name: 'JP-KDDI 中转', type: 'hysteria2', server: 'jp.awacat.cc', port: 50002, password: 'neko233333', sni: 'bing.com', skipCertVerify: true, enabled: true, sort: 2 },
  { id: 'node-4', name: 'JP-Softbank 直连', type: 'hysteria2', server: 'softbank88.xzcloudnode.sbs', port: 50393, password: 'neko233333', sni: 'bing.com', skipCertVerify: true, enabled: true, sort: 3 },
  { id: 'node-5', name: 'JP-KDDI 直连', type: 'hysteria2', server: 'kddi10gbps.xzcloudnode.sbs', port: 50393, password: 'neko233333', sni: 'bing.com', skipCertVerify: true, enabled: true, sort: 4 },
];

export const DEFAULT_RULES = {
  preset: 'loyalsoldier',
  customRules: [],
  defaultOutbound: 'proxy'
};
```

## 数据模型

### 节点 (KV key: "nodes")

```javascript
{
  id: string,          // crypto.randomUUID()
  name: string,        // 显示名称
  type: string,        // 'hysteria2' | 'shadowsocks' | 'vmess' | 'vless' | 'trojan'
  server: string,      // 服务器地址
  port: number,        // 端口
  enabled: boolean,    // 是否启用
  sort: number,        // 排序序号
  // --- hysteria2 ---
  password: string,
  sni: string,
  skipCertVerify: boolean,
  // --- shadowsocks ---
  method: string,      // '2022-blake3-aes-128-gcm' 等
  password: string,
  // --- vmess ---
  uuid: string,
  network: string,     // 'tcp' | 'ws' | 'grpc' | 'h2'
  host: string,
  path: string,
  tls: boolean,
  // --- vless ---
  uuid: string,
  network: string,
  security: string,    // 'tls' | 'reality'
  flow: string,
  pbk: string,         // reality public key
  sid: string,         // reality short id
  fp: string,          // fingerprint, 默认 'chrome'
  // --- trojan ---
  password: string,
  network: string,
}
```

### 订阅 (KV key: "subscriptions")

```javascript
{
  id: string,
  name: string,
  token: string,           // URL 路径 token
  nodeIds: string[],       // ['all'] 表示全部，或具体 id 列表
  totalGB: number,         // 总流量GB，0=无限
  expireTime: number,      // 过期时间戳ms，0=永久
  createdAt: number,       // 创建时间戳ms
}
```

### 规则 (KV key: "rules")

```javascript
{
  preset: string,          // 'loyalsoldier' | 'none'
  customRules: string[],   // ['DOMAIN-SUFFIX,example.com,DIRECT', ...]
  defaultOutbound: string, // 'proxy' | 'direct'
}
```

### 统计 (KV key: "stats")

```javascript
{
  [subscriptionId]: {
    visits: number,
    lastVisit: number,     // 时间戳ms
    uas: string[],         // 最近10个 User-Agent
  }
}
```
