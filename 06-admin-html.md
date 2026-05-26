# admin-html.js - WebUI 前端

此文件导出一个 HTML 字符串常量，作为管理面板的完整单页应用。

```javascript
export const ADMIN_HTML = `<!DOCTYPE html>...`;
```

## 页面结构

### 登录页
- 居中卡片，包含标题 "Sub Panel"、密码输入框、登录按钮
- 回车键触发登录
- 登录成功后 JWT token 存入 `localStorage.setItem('token', ...)`

### 登录后主界面
- 左侧固定侧边栏（200px宽）：导航菜单
- 右侧主内容区
- 5个页面：节点管理、订阅管理、规则配置、统计信息、系统设置

## CSS 主题

```css
:root {
  --bg: #0f0f1a;        /* 页面背景 */
  --surface: #1a1a2e;   /* 卡片/侧边栏背景 */
  --surface2: #16213e;  /* 次级表面 */
  --primary: #e94560;   /* 强调色/按钮 */
  --text: #eeeeee;      /* 主文字 */
  --text2: #aaaaaa;     /* 次要文字 */
  --border: #2a2a3e;    /* 边框 */
  --success: #4caf50;   /* 成功/在线 */
  --warning: #ff9800;   /* 警告 */
  --danger: #c62828;    /* 危险/删除 */
}
```

- 所有背景使用深色
- 按钮圆角 5-6px
- 卡片圆角 8px，1px border
- 字体: system-ui, sans-serif
- 响应式: 768px 以下隐藏侧边栏，主内容全宽

## JavaScript 架构

使用简单的 SPA 路由，通过变量控制当前页面，调用 `render()` 重新渲染。

```javascript
let token = localStorage.getItem('token');
let currentPage = 'nodes';  // 'nodes' | 'subs' | 'rules' | 'stats' | 'settings'
let state = { nodes: [], subs: [], rules: {}, stats: {} };

// API 请求封装
async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 401) {
    token = null;
    localStorage.removeItem('token');
    render();
    return null;
  }
  return res.json();
}

// 加载数据
async function loadData() {
  state.nodes = await api('/nodes') || [];
  state.subs = await api('/subscriptions') || [];
  state.rules = await api('/rules') || {};
  state.stats = await api('/stats') || {};
}

// 渲染
function render() {
  const app = document.getElementById('app');
  if (!token) { app.innerHTML = renderLogin(); return; }
  app.innerHTML = renderLayout();
}

// Toast 提示
function toast(message, success = true) {
  const el = document.createElement('div');
  el.className = 'toast ' + (success ? 'toast-ok' : 'toast-err');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
```

## 各页面功能详细说明

### 1. 节点管理页

**表格列**: 名称 | 协议 | 服务器 | 端口 | 状态 | 操作

**操作按钮**:
- 编辑（蓝色）→ 打开模态框
- 启用/禁用（黄色）→ 切换 enabled
- 删除（红色）→ confirm 后删除

**顶部按钮**:
- "检测状态" → 调用 /api/check，alert 显示结果
- "添加节点" → 打开空白模态框

**节点编辑模态框**:
- 通用字段: 名称、协议(select)、服务器、端口、SNI、跳过证书验证(checkbox)
- 协议切换时动态显示对应字段:
  - hysteria2: 密码
  - shadowsocks: 加密方式(select)、密码
  - vmess: UUID、传输方式(select)、Host、Path、TLS(checkbox)
  - vless: UUID、传输方式、安全(tls/reality)、Flow、Public Key、Short ID、Fingerprint
  - trojan: 密码、传输方式

### 2. 订阅管理页

**表格列**: 名称 | 订阅链接 | 节点 | 操作

**订阅链接**: 显示完整 URL `{origin}/sub/{token}`，点击复制到剪贴板

**创建/编辑模态框**:
- 订阅名称 (input)
- Token (input, placeholder="留空自动生成")
- 总流量GB (number, 0=无限)
- 过期时间 (number, 时间戳, 0=永久)
- 包含全部节点 (checkbox)
- 节点选择 (当不勾选全部时显示，checkbox 列表)

**底部说明卡片**:
```
Clash/Mihomo: 直接导入订阅链接
Shadowrocket: 添加订阅链接，或在链接后加 ?format=base64
强制Clash格式: ?format=clash
```

### 3. 规则配置页

- 规则预设 (select): Loyalsoldier(推荐) / 无预设
- 自定义规则 (textarea): 每行一条，格式 TYPE,VALUE,POLICY
- 默认出站 (select): 代理 / 直连
- 保存按钮
- 底部说明卡片解释各规则集作用

### 4. 统计信息页

**顶部统计卡片网格**:
- 节点总数
- 订阅总数  
- 总访问次数

**每个订阅的详细统计卡片**:
- 订阅名称 + 访问次数 badge
- 最后访问时间
- UA 列表 (小标签)

### 5. 系统设置页

- 导出配置按钮 → 调用 /api/export，下载为 JSON 文件
- 导入配置按钮 → 文件选择器，读取 JSON 后调用 /api/import
- 重置数据按钮 → 两次 confirm 后重置

## 模态框实现

```html
<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <h3>标题</h3>
    <!-- 表单内容 -->
    <div class="actions">
      <button onclick="closeModal()">取消</button>
      <button onclick="save()">保存</button>
    </div>
  </div>
</div>
```

- 点击遮罩层关闭
- `closeModal()`: 移除 `.modal-overlay` 元素
- 模态框通过 `document.body.insertAdjacentHTML('beforeend', html)` 添加

## 重要注意事项

1. **模板字符串转义**: 整个 HTML 在 JS 文件中作为模板字符串（反引号），HTML 内部的 JS 代码中如果也用反引号（模板字符串），需要用 `\`` 转义，或者改用字符串拼接 `'...' + var + '...'` 避免冲突

2. **推荐方案**: HTML 内部的 JavaScript 全部使用单引号字符串和字符串拼接，不使用模板字符串，这样外层的反引号不会冲突

3. **或者**: 使用 `${...}` 时确保不会和外层模板字符串冲突。最安全的做法是 HTML 中的 JS 不使用反引号。

4. **innerHTML 赋值**: 使用字符串拼接构建 HTML，不要在 HTML 内部的 JS 中使用 `\`` 模板字符串

5. **事件绑定**: 使用 `onclick="functionName()"` 内联事件，因为每次 render 会重建 DOM

6. **数据刷新**: 每次增删改操作后调用 `await loadData(); render();` 刷新界面
