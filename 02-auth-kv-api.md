# auth.js / kv.js / api.js

## auth.js - JWT 认证

使用 Web Crypto API 实现 HMAC-SHA256 JWT。

```javascript
// 导出
export async function createJWT(payload, secret) → string
export async function verifyJWT(token, secret) → payload | null
```

实现要点：
- Header: `{"alg":"HS256","typ":"JWT"}`
- 用 `btoa(JSON.stringify(header))` + `btoa(JSON.stringify(payload))` 生成前两段
- 用 `crypto.subtle.importKey('raw', ...)` 导入密钥
- 用 `crypto.subtle.sign('HMAC', ...)` 签名 `header.payload`
- 签名结果转 base64 作为第三段
- 验证时用 `crypto.subtle.verify` 比对
- 检查 `payload.exp`（毫秒时间戳），过期返回 null
- JWT 有效期: 7天

---

## kv.js - 数据层

```javascript
import { DEFAULT_NODES, DEFAULT_RULES } from './defaults.js';

export async function kGet(KV, key, defaultValue = null) {
  const val = await KV.get(key, 'json');
  return val !== null ? val : defaultValue;
}

export async function kSet(KV, key, value) {
  await KV.put(key, JSON.stringify(value));
}

export async function initKV(KV) {
  const existing = await KV.get('nodes');
  if (existing === null) {
    await kSet(KV, 'nodes', DEFAULT_NODES);
    await kSet(KV, 'subscriptions', []);
    await kSet(KV, 'rules', DEFAULT_RULES);
    await kSet(KV, 'stats', {});
  }
}
```

---

## api.js - API 路由处理

```javascript
import { createJWT, verifyJWT } from './auth.js';
import { kGet, kSet } from './kv.js';
import { DEFAULT_RULES } from './defaults.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    }
  });
}

export async function handleAPI(path, request, env) { ... }
```

### API 端点列表

| 路径 | 方法 | 说明 | 认证 |
|------|------|------|------|
| /api/login | POST | `{password}` → `{token}` | 无 |
| /api/nodes | GET | 返回节点数组 | 需要 |
| /api/nodes | POST | 添加节点，body为节点对象（无需id/sort） | 需要 |
| /api/nodes/:id | PUT | 更新节点，body为部分字段 | 需要 |
| /api/nodes/:id | DELETE | 删除节点 | 需要 |
| /api/nodes/reorder | POST | `{ids:[id1,id2,...]}` 重排序 | 需要 |
| /api/subscriptions | GET | 返回订阅数组 | 需要 |
| /api/subscriptions | POST | 创建订阅 | 需要 |
| /api/subscriptions/:id | PUT | 更新订阅 | 需要 |
| /api/subscriptions/:id | DELETE | 删除订阅 | 需要 |
| /api/rules | GET | 返回规则对象 | 需要 |
| /api/rules | PUT | 更新规则 | 需要 |
| /api/stats | GET | 返回统计对象 | 需要 |
| /api/check | GET | 检测节点在线（fetch HEAD，3s超时） | 需要 |
| /api/export | GET | 导出全部数据 | 需要 |
| /api/import | POST | 导入数据覆盖 | 需要 |

### 重要注意

- **路由匹配顺序**: `/api/nodes/reorder` 必须在 `/api/nodes/:id` 之前判断！
  ```javascript
  // 正确顺序:
  if (path === '/api/nodes/reorder' && method === 'POST') { ... }
  if (path.startsWith('/api/nodes/') && method === 'PUT') { ... }
  ```
- 添加节点时自动生成: `id = 'id-' + crypto.randomUUID()`, `sort = nodes.length`
- 创建订阅时: 若无 token 则 `token = crypto.randomUUID().replace(/-/g,'').slice(0,16)`
- 节点检测: 对每个节点 `fetch('https://server:port', {method:'HEAD', signal: AbortController(3000ms)}).catch(()=>{})` 返回 `{id, online: boolean, latency: ms}`
