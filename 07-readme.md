# 使用说明

## 文件列表

```
sub-panel-prompt/
├── 00-overview.md       # 项目概述、结构、配置
├── 01-defaults.md       # 默认数据、数据模型定义
├── 02-auth-kv-api.md    # 认证、KV层、API路由
├── 03-nodes.md          # 节点格式转换（URI + Clash）
├── 04-yaml.md           # YAML 序列化器（最易出错）
├── 05-subscription.md   # 订阅生成逻辑
├── 06-admin-html.md     # WebUI 前端
└── 07-readme.md         # 本文件
```

## 如何使用

### 方法1: 一次性给 AI

把所有 .md 文件内容按顺序拼接，一次性发给 AI，让它生成完整项目。

提示词模板:
```
请根据以下需求文档，生成一个完整的 Cloudflare Worker 项目。
项目使用多文件结构，通过 Wrangler 打包部署。
请逐个文件输出完整代码，不要省略任何部分。

[粘贴所有 .md 内容]
```

### 方法2: 分模块让 AI 写

如果 AI 上下文有限，可以分步：

1. 先发 00-overview.md + 01-defaults.md，让它生成 `wrangler.toml`, `package.json`, `src/defaults.js`
2. 发 02-auth-kv-api.md，让它生成 `src/auth.js`, `src/kv.js`, `src/api.js`
3. 发 03-nodes.md，让它生成 `src/nodes.js`
4. 发 04-yaml.md，让它生成 `src/yaml.js`（告诉它这是最重要的文件，要仔细测试）
5. 发 05-subscription.md，让它生成 `src/subscription.js`
6. 发 06-admin-html.md，让它生成 `src/admin-html.js`
7. 最后让它生成 `src/index.js` 入口文件

### 方法3: 让 AI 先写后端再写前端

1. 发 00~05，让它生成所有后端文件
2. 单独发 06，让它专注写前端 HTML

## 部署步骤

1. `npm install`
2. `wrangler login`
3. 创建 KV: `wrangler kv:namespace create SUB_STORE`
4. 把返回的 id 填入 `wrangler.toml`
5. 设置密码: `wrangler secret put ADMIN_PASSWORD`
6. 设置密钥: `wrangler secret put JWT_SECRET`
7. 部署: `wrangler deploy`
8. 在 CF Dashboard 添加 Custom Domain: `clash.awacat.cc`

## 常见问题

### YAML 输出格式错误
- 这是最常见的问题
- 让 AI 重点关注 04-yaml.md 中的测试用例
- 特别注意: 包含逗号的字符串必须加引号（rules 数组中的每一项都包含逗号）

### 模板字符串冲突
- admin-html.js 中 HTML 用反引号包裹
- HTML 内部的 JS 代码不要使用反引号
- 用字符串拼接代替模板字符串

### API 路由匹配
- `/api/nodes/reorder` 必须在 `/api/nodes/:id` 之前判断
- 否则 "reorder" 会被当成节点 id

### Wrangler import HTML
- 如果 `import xxx from './admin.html'` 不工作
- 改用 `src/admin-html.js` 导出字符串常量的方式

## 验证清单

部署后检查:
- [ ] 访问 `https://clash.awacat.cc/admin` 能看到登录页
- [ ] 输入密码能登录
- [ ] 节点管理页显示5个预置节点
- [ ] 能创建订阅
- [ ] 访问 `https://clash.awacat.cc/sub/{token}` 返回内容
- [ ] 用 Clash UA 访问返回 YAML 格式
- [ ] YAML 格式能被 Clash 正确解析
- [ ] 用 Shadowrocket UA 访问返回 base64 格式
- [ ] 节点编辑/添加/删除正常
- [ ] 规则保存正常
- [ ] 导出/导入正常
