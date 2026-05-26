# Cloudflare Worker 代理订阅管理面板

## 项目概述

开发一个 Cloudflare Worker 项目，实现代理节点订阅管理，包含 WebUI 管理面板。

## 项目结构（多文件，Wrangler 打包）

```
sub-panel/
├── wrangler.toml
├── package.json
├── src/
│   ├── index.js            # 入口，路由分发
│   ├── auth.js             # JWT 认证
│   ├── kv.js               # KV 数据层
│   ├── api.js              # API 处理器
│   ├── subscription.js     # 订阅生成（Clash YAML + Base64）
│   ├── yaml.js             # YAML 序列化（自实现）
│   ├── nodes.js            # 节点格式转换
│   ├── defaults.js         # 默认预置数据
│   └── admin-html.js       # WebUI HTML（导出字符串）
```

## 技术栈

- Cloudflare Workers ES Module 格式
- Wrangler v3 构建部署
- Workers KV 存储（绑定变量名: `KV`）
- 环境变量: `ADMIN_PASSWORD`, `JWT_SECRET`
- 前端: 纯原生 HTML/CSS/JS，无外部依赖
- 暗色主题，响应式

## wrangler.toml

```toml
name = "sub-panel"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV"
id = "替换为你的KV_ID"
```

## package.json

```json
{
  "name": "sub-panel",
  "private": true,
  "scripts": { "dev": "wrangler dev", "deploy": "wrangler deploy" },
  "devDependencies": { "wrangler": "^3.0.0" }
}
```

## 环境变量设置

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put JWT_SECRET
```

## 部署域名

Custom Domain: `clash.awacat.cc`

## 路由

```
GET  /           → 重定向 /admin
GET  /admin      → WebUI HTML
GET  /sub/:token → 订阅内容（自动判断格式）
POST /api/login  → 登录（无需认证）
/api/*           → 管理API（需 Bearer token）
OPTIONS *        → CORS 预检
```
