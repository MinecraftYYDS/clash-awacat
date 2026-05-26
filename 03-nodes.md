# nodes.js - 节点格式转换

## 导出函数

```javascript
export function nodeToURI(node)   // 返回协议 URI 字符串
export function nodeToClash(node) // 返回 Clash proxy 配置对象
```

## URI 格式规范

### hysteria2
```
hysteria2://{password}@{server}:{port}?sni={sni}&insecure=1#{urlEncodedName}
```
- `insecure=1` 仅当 `skipCertVerify === true` 时添加
- 如果 sni 为空则不加 sni 参数
- 节点名称用 `encodeURIComponent()` 编码

### shadowsocks
```
ss://{base64(method:password)}@{server}:{port}#{urlEncodedName}
```
- userinfo 部分: `btoa(method + ':' + password)`

### vmess
```
vmess://{base64(jsonConfig)}
```
jsonConfig 结构:
```json
{
  "v": "2",
  "ps": "节点名称",
  "add": "server",
  "port": port,       // 注意: 这里是数字或字符串都行，建议用数字
  "id": "uuid",
  "aid": 0,
  "net": "tcp",       // tcp/ws/grpc/h2
  "type": "none",
  "host": "",
  "path": "",
  "tls": "tls"        // 有TLS时为"tls"，无TLS时为""
}
```

### vless
```
vless://{uuid}@{server}:{port}?type={network}&security={security}&sni={sni}&flow={flow}&pbk={pbk}&sid={sid}&fp={fp}#{urlEncodedName}
```
- 只添加非空参数
- 使用 URLSearchParams 构建查询字符串

### trojan
```
trojan://{password}@{server}:{port}?sni={sni}&allowInsecure=1&type={network}#{urlEncodedName}
```
- `allowInsecure=1` 仅当 `skipCertVerify === true`

---

## Clash Proxy 对象格式

### hysteria2
```javascript
{
  name: node.name,
  type: 'hysteria2',
  server: node.server,
  port: node.port,
  password: node.password,
  sni: node.sni || node.server,
  'skip-cert-verify': Boolean(node.skipCertVerify)
}
```

### shadowsocks
```javascript
{
  name: node.name,
  type: 'ss',
  server: node.server,
  port: node.port,
  cipher: node.method,
  password: node.password
}
```

### vmess
```javascript
{
  name: node.name,
  type: 'vmess',
  server: node.server,
  port: node.port,
  uuid: node.uuid,
  alterId: 0,
  cipher: 'auto',
  network: node.network || 'tcp',
  tls: Boolean(node.tls),
  'skip-cert-verify': Boolean(node.skipCertVerify),
  servername: node.sni || ''
}
```

### vless
```javascript
{
  name: node.name,
  type: 'vless',
  server: node.server,
  port: node.port,
  uuid: node.uuid,
  network: node.network || 'tcp',
  tls: true,
  'skip-cert-verify': Boolean(node.skipCertVerify),
  servername: node.sni || ''
}
// 如果 security === 'reality'，额外添加:
{
  'reality-opts': {
    'public-key': node.pbk || '',
    'short-id': node.sid || ''
  },
  flow: node.flow || '',
  'client-fingerprint': node.fp || 'chrome'
}
```

### trojan
```javascript
{
  name: node.name,
  type: 'trojan',
  server: node.server,
  port: node.port,
  password: node.password,
  sni: node.sni || node.server,
  'skip-cert-verify': Boolean(node.skipCertVerify),
  network: node.network || 'tcp'
}
```

---

## 注意事项

- `nodeToURI` 对未知 type 返回空字符串 `''`
- `nodeToClash` 对未知 type 返回 `null`
- 调用方需要 `.filter(Boolean)` 过滤掉 null/空值
