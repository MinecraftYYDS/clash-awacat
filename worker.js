const KV_KEYS = {
  INIT: "init_done",
  NODES: "nodes",
  SUBSCRIPTIONS: "subscriptions",
  RULES: "rules",
  STATS: "stats"
};

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

const DEFAULT_RULES = {
  preset: "loyalsoldier",
  customRules: [],
  defaultOutbound: "proxy"
};

const DEFAULT_NODES = [
  {
    id: crypto.randomUUID(),
    name: "JP-中转机直连",
    type: "hysteria2",
    server: "jp.awacat.cc",
    port: 50000,
    enabled: true,
    sort: 0,
    password: "neko233333",
    sni: "jp.awacat.cc",
    skipCertVerify: false
  },
  {
    id: crypto.randomUUID(),
    name: "JP-Softbank 中转",
    type: "hysteria2",
    server: "jp.awacat.cc",
    port: 50001,
    enabled: true,
    sort: 1,
    password: "neko233333",
    sni: "bing.com",
    skipCertVerify: true
  },
  {
    id: crypto.randomUUID(),
    name: "JP-KDDI 中转",
    type: "hysteria2",
    server: "jp.awacat.cc",
    port: 50002,
    enabled: true,
    sort: 2,
    password: "neko233333",
    sni: "bing.com",
    skipCertVerify: true
  },
  {
    id: crypto.randomUUID(),
    name: "JP-Softbank 直连",
    type: "hysteria2",
    server: "softbank88.xzcloudnode.sbs",
    port: 50393,
    enabled: true,
    sort: 3,
    password: "neko233333",
    sni: "bing.com",
    skipCertVerify: true
  },
  {
    id: crypto.randomUUID(),
    name: "JP-KDDI 直连",
    type: "hysteria2",
    server: "kddi10gbps.xzcloudnode.sbs",
    port: 50393,
    enabled: true,
    sort: 4,
    password: "neko233333",
    sni: "bing.com",
    skipCertVerify: true
  }
];

const ADMIN_HTML = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>订阅管理面板</title>
  <style>
    :root {
      --bg: #0f0f1a;
      --card: #1a1a2e;
      --card-2: #151526;
      --text: #e9ecf1;
      --muted: #9fa8c0;
      --line: #2b2b44;
      --accent: #e94560;
      --ok: #2ecc71;
      --bad: #ff5c75;
      --warn: #f4b942;
      --radius: 14px;
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background:
        radial-gradient(circle at 0% 0%, rgba(233, 69, 96, 0.18), transparent 45%),
        radial-gradient(circle at 100% 100%, rgba(57, 100, 255, 0.15), transparent 40%),
        var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    .hidden {
      display: none !important;
    }

    .login-wrap {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 28px;
      box-shadow: var(--shadow);
    }

    .title {
      margin: 0 0 8px;
      font-size: 26px;
      letter-spacing: 1px;
    }

    .subtitle {
      margin: 0 0 20px;
      color: var(--muted);
      font-size: 14px;
    }

    .input, .select, .textarea {
      width: 100%;
      background: var(--card-2);
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
      outline: none;
    }

    .input:focus, .select:focus, .textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.15);
    }

    .textarea {
      min-height: 160px;
      resize: vertical;
      font-family: Consolas, "Courier New", monospace;
    }

    .btn {
      border: 1px solid var(--line);
      background: #222238;
      color: var(--text);
      border-radius: 10px;
      padding: 9px 14px;
      cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
      border-color: #3d3d5f;
    }

    .btn-accent {
      background: var(--accent);
      border-color: transparent;
      color: white;
      font-weight: 600;
    }

    .btn-ok {
      background: #1f7f4d;
      border-color: transparent;
      color: white;
    }

    .btn-bad {
      background: #92263c;
      border-color: transparent;
      color: white;
    }

    .layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      background: rgba(17, 17, 31, 0.95);
      border-right: 1px solid var(--line);
      padding: 18px;
    }

    .brand {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .nav-btn {
      width: 100%;
      text-align: left;
      margin-bottom: 8px;
      background: transparent;
      border: 1px solid transparent;
      padding: 10px 12px;
      color: var(--text);
      border-radius: 10px;
      cursor: pointer;
    }

    .nav-btn.active {
      background: rgba(233, 69, 96, 0.16);
      border-color: rgba(233, 69, 96, 0.4);
    }

    .main {
      padding: 20px;
    }

    .panel {
      display: none;
      animation: fadeIn 0.2s ease;
    }

    .panel.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 14px;
      box-shadow: var(--shadow);
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-top: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card);
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--line);
    }

    th, td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }

    th {
      background: #202039;
      color: #dbe1f1;
      font-weight: 600;
      font-size: 13px;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 12px;
      border: 1px solid var(--line);
      color: var(--muted);
    }

    .tag.ok {
      color: #9cf0c4;
      border-color: rgba(46, 204, 113, 0.5);
    }

    .tag.bad {
      color: #ff93a3;
      border-color: rgba(255, 92, 117, 0.5);
    }

    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 10px;
    }

    .field {
      margin-bottom: 10px;
    }

    .field label {
      display: block;
      color: var(--muted);
      margin-bottom: 6px;
      font-size: 13px;
    }

    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: none;
      place-items: center;
      padding: 16px;
      z-index: 90;
    }

    .modal.show {
      display: grid;
    }

    .modal-card {
      width: 100%;
      max-width: 760px;
      max-height: calc(100vh - 32px);
      overflow: auto;
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 16px;
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .toast {
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 100;
      display: grid;
      gap: 8px;
    }

    .toast-item {
      min-width: 220px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #fff;
      box-shadow: var(--shadow);
      animation: slideIn 0.2s ease;
    }

    .toast-ok { background: #1f7f4d; }
    .toast-bad { background: #9e1f3b; }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(12px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .mono {
      font-family: Consolas, "Courier New", monospace;
      word-break: break-all;
    }

    .actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    @media (max-width: 980px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        height: auto;
        position: relative;
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .grid-3 {
        grid-template-columns: 1fr;
      }

      .row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .sidebar {
        display: none;
      }

      .main {
        padding: 12px;
      }
    }
  </style>
</head>
<body>
  <div id="toast" class="toast"></div>

  <section id="loginSection" class="login-wrap">
    <div class="login-card">
      <h1 class="title">代理订阅管理</h1>
      <p class="subtitle">输入管理密码以进入面板</p>
      <div class="field">
        <label>管理员密码</label>
        <input id="passwordInput" type="password" class="input" placeholder="请输入 ADMIN_PASSWORD" />
      </div>
      <button id="loginBtn" class="btn btn-accent" style="width:100%;">登录</button>
    </div>
  </section>

  <section id="appSection" class="layout hidden">
    <aside class="sidebar">
      <div class="brand">AWACAT Panel</div>
      <button class="nav-btn active" data-panel="nodes">节点管理</button>
      <button class="nav-btn" data-panel="subs">订阅管理</button>
      <button class="nav-btn" data-panel="rules">规则配置</button>
      <button class="nav-btn" data-panel="stats">统计信息</button>
      <button class="nav-btn" data-panel="system">系统设置</button>
      <hr style="border-color: var(--line); border-width: 1px 0 0; margin: 12px 0;" />
      <button id="logoutBtn" class="btn btn-bad" style="width:100%;">退出登录</button>
    </aside>

    <main class="main">
      <section id="panel-nodes" class="panel active">
        <div class="toolbar">
          <button id="addNodeBtn" class="btn btn-accent">添加节点</button>
          <button id="checkNodeBtn" class="btn">节点在线检测</button>
        </div>
        <div style="overflow:auto;">
          <table>
            <thead>
              <tr>
                <th>名称</th><th>协议</th><th>服务器</th><th>端口</th><th>状态</th><th>操作</th>
              </tr>
            </thead>
            <tbody id="nodesBody"></tbody>
          </table>
        </div>
      </section>

      <section id="panel-subs" class="panel">
        <div class="toolbar">
          <button id="addSubBtn" class="btn btn-accent">创建订阅</button>
        </div>
        <div style="overflow:auto;">
          <table>
            <thead>
              <tr>
                <th>名称</th><th>订阅链接</th><th>节点数</th><th>操作</th>
              </tr>
            </thead>
            <tbody id="subsBody"></tbody>
          </table>
        </div>
      </section>

      <section id="panel-rules" class="panel">
        <div class="card">
          <div class="row">
            <div class="field">
              <label>规则预设</label>
              <select id="rulesPreset" class="select">
                <option value="loyalsoldier">Loyalsoldier</option>
                <option value="none">无</option>
              </select>
            </div>
            <div class="field">
              <label>默认出站</label>
              <select id="rulesOutbound" class="select">
                <option value="proxy">proxy</option>
                <option value="direct">direct</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>自定义规则（每行一条）</label>
            <textarea id="rulesCustom" class="textarea" placeholder="DOMAIN-SUFFIX,example.com,DIRECT"></textarea>
          </div>
          <button id="saveRulesBtn" class="btn btn-accent">保存规则</button>
        </div>
      </section>

      <section id="panel-stats" class="panel">
        <div id="statsCards" class="grid-3"></div>
        <div style="height: 12px;"></div>
        <div class="card">
          <div style="overflow:auto;">
            <table>
              <thead>
                <tr><th>订阅ID</th><th>访问次数</th><th>最后访问</th><th>UA</th></tr>
              </thead>
              <tbody id="statsBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="panel-system" class="panel">
        <div class="card" style="margin-bottom: 12px;">
          <h3 style="margin-top:0;">导入 / 导出</h3>
          <div class="toolbar">
            <button id="exportBtn" class="btn btn-accent">导出配置</button>
            <input id="importInput" type="file" accept="application/json" class="input" style="max-width: 320px;" />
            <button id="importBtn" class="btn">导入配置</button>
          </div>
        </div>
        <div class="card">
          <h3 style="margin-top:0;">危险操作</h3>
          <button id="resetBtn" class="btn btn-bad">重置所有数据</button>
        </div>
      </section>
    </main>
  </section>

  <section id="modal" class="modal">
    <div class="modal-card">
      <div class="modal-head">
        <h3 id="modalTitle" style="margin:0;">编辑</h3>
        <button id="modalClose" class="btn">关闭</button>
      </div>
      <form id="modalForm"></form>
    </div>
  </section>

  <script>
    var token = localStorage.getItem("token") || "";
    var cache = {
      nodes: [],
      subscriptions: [],
      rules: null,
      stats: null
    };

    var loginSection = document.getElementById("loginSection");
    var appSection = document.getElementById("appSection");
    var modal = document.getElementById("modal");
    var modalTitle = document.getElementById("modalTitle");
    var modalForm = document.getElementById("modalForm");

    function toast(msg, ok) {
      var wrap = document.getElementById("toast");
      var el = document.createElement("div");
      el.className = "toast-item " + (ok ? "toast-ok" : "toast-bad");
      el.textContent = msg;
      wrap.appendChild(el);
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 3000);
    }

    function fmtTs(ts) {
      if (!ts) return "-";
      var d = new Date(ts);
      return d.toLocaleString();
    }

    async function request(path, method, body, noAuth) {
      var headers = { "Content-Type": "application/json" };
      if (!noAuth && token) headers.Authorization = "Bearer " + token;
      var resp = await fetch(path, {
        method: method || "GET",
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
      });
      var text = await resp.text();
      var data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
      if (!resp.ok) {
        throw new Error(data.error || ("HTTP " + resp.status));
      }
      return data;
    }

    function showPanel(name) {
      Array.from(document.querySelectorAll(".panel")).forEach(function (p) {
        p.classList.remove("active");
      });
      Array.from(document.querySelectorAll(".nav-btn")).forEach(function (b) {
        b.classList.remove("active");
      });
      var panel = document.getElementById("panel-" + name);
      if (panel) panel.classList.add("active");
      var btn = document.querySelector('.nav-btn[data-panel="' + name + '"]');
      if (btn) btn.classList.add("active");
    }

    function protocolFields(type, data) {
      data = data || {};
      var shared = '' +
        '<div class="row">' +
        '  <div class="field"><label>名称</label><input class="input" name="name" value="' + (data.name || "") + '" required /></div>' +
        '  <div class="field"><label>协议</label><select class="select" name="type" id="nodeTypeSelect">' +
        ["hysteria2", "shadowsocks", "vmess", "vless", "trojan"].map(function (t) {
          return '<option value="' + t + '" ' + (t === type ? "selected" : "") + '>' + t + '</option>';
        }).join("") +
        '  </select></div>' +
        '</div>' +
        '<div class="row">' +
        '  <div class="field"><label>服务器</label><input class="input" name="server" value="' + (data.server || "") + '" required /></div>' +
        '  <div class="field"><label>端口</label><input class="input" type="number" name="port" value="' + (data.port || 443) + '" required /></div>' +
        '</div>' +
        '<div class="field"><label><input type="checkbox" name="enabled" ' + (data.enabled !== false ? "checked" : "") + ' /> 启用</label></div>';

      var extra = "";
      if (type === "hysteria2") {
        extra = '' +
          '<div class="row">' +
          '  <div class="field"><label>密码</label><input class="input" name="password" value="' + (data.password || "") + '" /></div>' +
          '  <div class="field"><label>SNI</label><input class="input" name="sni" value="' + (data.sni || "") + '" /></div>' +
          '</div>' +
          '<div class="field"><label><input type="checkbox" name="skipCertVerify" ' + (data.skipCertVerify ? "checked" : "") + ' /> 跳过证书校验</label></div>';
      }
      if (type === "shadowsocks") {
        extra = '' +
          '<div class="row">' +
          '  <div class="field"><label>加密方式</label><input class="input" name="method" value="' + (data.method || "2022-blake3-aes-128-gcm") + '" /></div>' +
          '  <div class="field"><label>密码</label><input class="input" name="password" value="' + (data.password || "") + '" /></div>' +
          '</div>';
      }
      if (type === "vmess") {
        extra = '' +
          '<div class="row">' +
          '  <div class="field"><label>UUID</label><input class="input" name="uuid" value="' + (data.uuid || "") + '" /></div>' +
          '  <div class="field"><label>network</label><select class="select" name="network">' +
          ["tcp", "ws", "grpc", "h2"].map(function (n) {
            return '<option value="' + n + '" ' + ((data.network || "tcp") === n ? "selected" : "") + '>' + n + '</option>';
          }).join("") +
          '</select></div>' +
          '</div>' +
          '<div class="row">' +
          '  <div class="field"><label>host</label><input class="input" name="host" value="' + (data.host || "") + '" /></div>' +
          '  <div class="field"><label>path</label><input class="input" name="path" value="' + (data.path || "") + '" /></div>' +
          '</div>' +
          '<div class="field"><label><input type="checkbox" name="tls" ' + (data.tls ? "checked" : "") + ' /> TLS</label></div>';
      }
      if (type === "vless") {
        extra = '' +
          '<div class="row">' +
          '  <div class="field"><label>UUID</label><input class="input" name="uuid" value="' + (data.uuid || "") + '" /></div>' +
          '  <div class="field"><label>network</label><select class="select" name="network">' +
          ["tcp", "ws", "grpc"].map(function (n) {
            return '<option value="' + n + '" ' + ((data.network || "tcp") === n ? "selected" : "") + '>' + n + '</option>';
          }).join("") +
          '</select></div>' +
          '</div>' +
          '<div class="row">' +
          '  <div class="field"><label>security</label><select class="select" name="security">' +
          ["tls", "reality"].map(function (n) {
            return '<option value="' + n + '" ' + ((data.security || "tls") === n ? "selected" : "") + '>' + n + '</option>';
          }).join("") +
          '</select></div>' +
          '  <div class="field"><label>flow</label><input class="input" name="flow" value="' + (data.flow || "") + '" /></div>' +
          '</div>' +
          '<div class="row">' +
          '  <div class="field"><label>pbk</label><input class="input" name="pbk" value="' + (data.pbk || "") + '" /></div>' +
          '  <div class="field"><label>sid</label><input class="input" name="sid" value="' + (data.sid || "") + '" /></div>' +
          '</div>' +
          '<div class="row">' +
          '  <div class="field"><label>fp</label><input class="input" name="fp" value="' + (data.fp || "chrome") + '" /></div>' +
          '  <div class="field"><label>sni</label><input class="input" name="sni" value="' + (data.sni || "") + '" /></div>' +
          '</div>';
      }
      if (type === "trojan") {
        extra = '' +
          '<div class="row">' +
          '  <div class="field"><label>密码</label><input class="input" name="password" value="' + (data.password || "") + '" /></div>' +
          '  <div class="field"><label>network</label><select class="select" name="network">' +
          ["tcp", "ws", "grpc"].map(function (n) {
            return '<option value="' + n + '" ' + ((data.network || "tcp") === n ? "selected" : "") + '>' + n + '</option>';
          }).join("") +
          '</select></div>' +
          '</div>' +
          '<div class="field"><label>sni</label><input class="input" name="sni" value="' + (data.sni || "") + '" /></div>';
      }

      return shared + extra + '<div style="display:flex;gap:8px;"><button class="btn btn-accent" type="submit">保存</button></div>';
    }

    function subForm(data) {
      data = data || {};
      var options = '<option value="all" ' + ((data.nodeIds || ["all"]).includes("all") ? "selected" : "") + '>all</option>' +
        cache.nodes.map(function (n) {
          var selected = (data.nodeIds || []).includes(n.id) ? "selected" : "";
          return '<option value="' + n.id + '" ' + selected + '>' + n.name + '</option>';
        }).join("");

      return '' +
        '<div class="row">' +
        '  <div class="field"><label>名称</label><input class="input" name="name" value="' + (data.name || "") + '" required /></div>' +
        '  <div class="field"><label>token</label><input class="input" name="token" value="' + (data.token || "") + '" placeholder="留空自动生成" /></div>' +
        '</div>' +
        '<div class="row">' +
        '  <div class="field"><label>总流量 GB</label><input class="input" type="number" name="totalGB" value="' + (data.totalGB || 0) + '" /></div>' +
        '  <div class="field"><label>过期时间（毫秒时间戳）</label><input class="input" type="number" name="expireTime" value="' + (data.expireTime || 0) + '" /></div>' +
        '</div>' +
        '<div class="field"><label>节点选择（可多选，包含 all）</label><select class="select" name="nodeIds" multiple size="8">' + options + '</select></div>' +
        '<button class="btn btn-accent" type="submit">保存</button>';
    }

    function collectForm(form) {
      var obj = {};
      var els = form.querySelectorAll("input,select,textarea");
      els.forEach(function (el) {
        var name = el.name;
        if (!name) return;
        if (el.type === "checkbox") {
          obj[name] = el.checked;
          return;
        }
        if (el.multiple) {
          obj[name] = Array.from(el.selectedOptions).map(function (o) { return o.value; });
          return;
        }
        if (el.type === "number") {
          obj[name] = Number(el.value || 0);
          return;
        }
        obj[name] = el.value;
      });
      return obj;
    }

    function openModal(title, html, onSubmit, onAfterRender) {
      modalTitle.textContent = title;
      modalForm.innerHTML = html;
      modal.classList.add("show");
      modalForm.onsubmit = async function (e) {
        e.preventDefault();
        try {
          var data = collectForm(modalForm);
          await onSubmit(data);
          modal.classList.remove("show");
        } catch (err) {
          toast(err.message || "操作失败", false);
        }
      };
      if (onAfterRender) onAfterRender();
    }

    function closeModal() {
      modal.classList.remove("show");
    }

    function renderNodes() {
      var body = document.getElementById("nodesBody");
      body.innerHTML = cache.nodes.map(function (n) {
        return '<tr>' +
          '<td>' + n.name + '</td>' +
          '<td><span class="tag">' + n.type + '</span></td>' +
          '<td class="mono">' + n.server + '</td>' +
          '<td>' + n.port + '</td>' +
          '<td>' + (n.enabled ? '<span class="tag ok">启用</span>' : '<span class="tag bad">停用</span>') + '</td>' +
          '<td><div class="actions">' +
          '<button class="btn" data-action="edit-node" data-id="' + n.id + '">编辑</button>' +
          '<button class="btn" data-action="toggle-node" data-id="' + n.id + '">' + (n.enabled ? "禁用" : "启用") + '</button>' +
          '<button class="btn btn-bad" data-action="del-node" data-id="' + n.id + '">删除</button>' +
          '</div></td>' +
          '</tr>';
      }).join("");
    }

    function renderSubs() {
      var body = document.getElementById("subsBody");
      var base = location.origin;
      body.innerHTML = cache.subscriptions.map(function (s) {
        var count = (s.nodeIds || []).includes("all") ? "全部" : (s.nodeIds || []).length;
        var link = base + "/sub/" + s.token;
        return '<tr>' +
          '<td>' + s.name + '</td>' +
          '<td class="mono"><a href="#" data-action="copy-link" data-link="' + link + '">' + link + '</a></td>' +
          '<td>' + count + '</td>' +
          '<td><div class="actions">' +
          '<button class="btn" data-action="edit-sub" data-id="' + s.id + '">编辑</button>' +
          '<button class="btn btn-bad" data-action="del-sub" data-id="' + s.id + '">删除</button>' +
          '</div></td>' +
          '</tr>';
      }).join("");
    }

    function renderRules() {
      var r = cache.rules || { preset: "loyalsoldier", customRules: [], defaultOutbound: "proxy" };
      document.getElementById("rulesPreset").value = r.preset || "loyalsoldier";
      document.getElementById("rulesOutbound").value = r.defaultOutbound || "proxy";
      document.getElementById("rulesCustom").value = (r.customRules || []).join("\n");
    }

    function renderStats() {
      var s = cache.stats || {};
      var totalVisits = Object.values(s).reduce(function (sum, item) {
        return sum + (item.visits || 0);
      }, 0);
      document.getElementById("statsCards").innerHTML = '' +
        '<div class="card"><div>节点总数</div><div class="stat-value">' + cache.nodes.length + '</div></div>' +
        '<div class="card"><div>订阅总数</div><div class="stat-value">' + cache.subscriptions.length + '</div></div>' +
        '<div class="card"><div>总访问次数</div><div class="stat-value">' + totalVisits + '</div></div>';

      document.getElementById("statsBody").innerHTML = Object.keys(s).map(function (id) {
        var item = s[id] || {};
        var uas = item.uas || [];
        return '<tr>' +
          '<td class="mono">' + id + '</td>' +
          '<td>' + (item.visits || 0) + '</td>' +
          '<td>' + fmtTs(item.lastVisit || 0) + '</td>' +
          '<td class="mono">' + uas.join("\n") + '</td>' +
          '</tr>';
      }).join("");
    }

    async function loadAll() {
      cache.nodes = (await request("/api/nodes")).items || [];
      cache.subscriptions = (await request("/api/subscriptions")).items || [];
      cache.rules = await request("/api/rules");
      cache.stats = await request("/api/stats");

      renderNodes();
      renderSubs();
      renderRules();
      renderStats();
    }

    async function boot() {
      if (!token) {
        loginSection.classList.remove("hidden");
        appSection.classList.add("hidden");
        return;
      }
      try {
        await loadAll();
        loginSection.classList.add("hidden");
        appSection.classList.remove("hidden");
      } catch (e) {
        token = "";
        localStorage.removeItem("token");
        loginSection.classList.remove("hidden");
        appSection.classList.add("hidden");
      }
    }

    document.getElementById("loginBtn").addEventListener("click", async function () {
      var pwd = document.getElementById("passwordInput").value;
      try {
        var data = await request("/api/login", "POST", { password: pwd }, true);
        token = data.token;
        localStorage.setItem("token", token);
        toast("登录成功", true);
        await boot();
      } catch (e) {
        toast(e.message || "登录失败", false);
      }
    });

    document.getElementById("passwordInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        document.getElementById("loginBtn").click();
      }
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
      token = "";
      localStorage.removeItem("token");
      boot();
    });

    Array.from(document.querySelectorAll(".nav-btn[data-panel]")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        showPanel(btn.getAttribute("data-panel"));
      });
    });

    document.getElementById("modalClose").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    document.getElementById("addNodeBtn").addEventListener("click", function () {
      var currentType = "hysteria2";
      var currentData = { enabled: true, port: 443 };
      var rerender = function () {
        openModal("添加节点", protocolFields(currentType, currentData), async function (formData) {
          await request("/api/nodes", "POST", formData);
          await loadAll();
          toast("节点已添加", true);
        }, function () {
          var typeSelect = document.getElementById("nodeTypeSelect");
          if (typeSelect) {
            typeSelect.addEventListener("change", function () {
              currentData = collectForm(modalForm);
              currentType = typeSelect.value;
              rerender();
            });
          }
        });
      };
      rerender();
    });

    document.getElementById("checkNodeBtn").addEventListener("click", async function () {
      try {
        var result = await request("/api/check");
        var online = (result.items || []).filter(function (x) { return x.online; }).length;
        toast("检测完成，在线 " + online + "/" + (result.items || []).length, true);
      } catch (e) {
        toast(e.message || "检测失败", false);
      }
    });

    document.getElementById("nodesBody").addEventListener("click", async function (e) {
      var target = e.target;
      if (!(target instanceof HTMLElement)) return;
      var action = target.getAttribute("data-action");
      var id = target.getAttribute("data-id");
      if (!action || !id) return;
      var node = cache.nodes.find(function (x) { return x.id === id; });
      if (!node) return;

      if (action === "edit-node") {
        var type = node.type;
        var currentData = Object.assign({}, node);
        var rerender = function () {
          openModal("编辑节点", protocolFields(type, currentData), async function (formData) {
            await request("/api/nodes/" + id, "PUT", formData);
            await loadAll();
            toast("节点已更新", true);
          }, function () {
            var typeSelect = document.getElementById("nodeTypeSelect");
            if (typeSelect) {
              typeSelect.addEventListener("change", function () {
                currentData = collectForm(modalForm);
                type = typeSelect.value;
                rerender();
              });
            }
          });
        };
        rerender();
      }

      if (action === "toggle-node") {
        await request("/api/nodes/" + id, "PUT", { enabled: !node.enabled });
        await loadAll();
        toast("状态已更新", true);
      }

      if (action === "del-node") {
        if (!confirm("确定删除该节点？")) return;
        await request("/api/nodes/" + id, "DELETE");
        await loadAll();
        toast("节点已删除", true);
      }
    });

    document.getElementById("addSubBtn").addEventListener("click", function () {
      openModal("创建订阅", subForm({ nodeIds: ["all"] }), async function (formData) {
        if (!formData.nodeIds || !formData.nodeIds.length) formData.nodeIds = ["all"];
        await request("/api/subscriptions", "POST", formData);
        await loadAll();
        toast("订阅已创建", true);
      });
    });

    document.getElementById("subsBody").addEventListener("click", async function (e) {
      var target = e.target;
      if (!(target instanceof HTMLElement)) return;
      var action = target.getAttribute("data-action");
      var id = target.getAttribute("data-id");

      if (action === "copy-link") {
        e.preventDefault();
        var link = target.getAttribute("data-link") || "";
        await navigator.clipboard.writeText(link);
        toast("订阅链接已复制", true);
      }

      if (action === "edit-sub" && id) {
        var sub = cache.subscriptions.find(function (x) { return x.id === id; });
        if (!sub) return;
        openModal("编辑订阅", subForm(sub), async function (formData) {
          if (!formData.nodeIds || !formData.nodeIds.length) formData.nodeIds = ["all"];
          await request("/api/subscriptions/" + id, "PUT", formData);
          await loadAll();
          toast("订阅已更新", true);
        });
      }

      if (action === "del-sub" && id) {
        if (!confirm("确定删除该订阅？")) return;
        await request("/api/subscriptions/" + id, "DELETE");
        await loadAll();
        toast("订阅已删除", true);
      }
    });

    document.getElementById("saveRulesBtn").addEventListener("click", async function () {
      try {
        var customRules = document.getElementById("rulesCustom").value
          .split("\n")
          .map(function (x) { return x.trim(); })
          .filter(Boolean);
        await request("/api/rules", "PUT", {
          preset: document.getElementById("rulesPreset").value,
          defaultOutbound: document.getElementById("rulesOutbound").value,
          customRules: customRules
        });
        await loadAll();
        toast("规则已保存", true);
      } catch (e) {
        toast(e.message || "保存失败", false);
      }
    });

    document.getElementById("exportBtn").addEventListener("click", async function () {
      try {
        var data = await request("/api/export");
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "awacat-export.json";
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        toast(e.message || "导出失败", false);
      }
    });

    document.getElementById("importBtn").addEventListener("click", async function () {
      var input = document.getElementById("importInput");
      var file = input.files && input.files[0];
      if (!file) {
        toast("请先选择 JSON 文件", false);
        return;
      }
      try {
        var text = await file.text();
        var data = JSON.parse(text);
        await request("/api/import", "POST", data);
        await loadAll();
        toast("导入成功", true);
      } catch (e) {
        toast(e.message || "导入失败", false);
      }
    });

    document.getElementById("resetBtn").addEventListener("click", async function () {
      if (!confirm("确定重置所有数据？")) return;
      try {
        await request("/api/reset", "POST", {});
        await loadAll();
        toast("数据已重置", true);
      } catch (e) {
        toast(e.message || "重置失败", false);
      }
    });

    boot();
  </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    await ensureInitialized(env);

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    try {
      if (path === "/") {
        return redirectResponse("/admin");
      }

      if (path === "/admin" && method === "GET") {
        return htmlResponse(ADMIN_HTML);
      }

      if (path.startsWith("/sub/") && method === "GET") {
        const token = decodeURIComponent(path.slice(5));
        return await handleSubscriptionRequest(token, request, env, url);
      }

      if (path === "/api/login" && method === "POST") {
        const body = await readJson(request);
        if (!body.password || body.password !== env.ADMIN_PASSWORD) {
          return jsonResponse({ error: "密码错误" }, 401);
        }
        const jwt = await signJwt(
          {
            sub: "admin",
            iat: nowSeconds(),
            exp: nowSeconds() + SEVEN_DAYS_SECONDS
          },
          env.JWT_SECRET
        );
        return jsonResponse({ token: jwt });
      }

      if (path.startsWith("/api/")) {
        const ok = await verifyAuth(request, env.JWT_SECRET);
        if (!ok) {
          return jsonResponse({ error: "未授权" }, 401);
        }

        if (path === "/api/nodes" && method === "GET") {
          const nodes = await getNodes(env);
          return jsonResponse({ items: sortNodes(nodes) });
        }

        if (path === "/api/nodes" && method === "POST") {
          const body = await readJson(request);
          const nodes = await getNodes(env);
          const created = normalizeNode(
            {
              ...body,
              id: crypto.randomUUID(),
              sort: nodes.length
            },
            true
          );
          nodes.push(created);
          await setNodes(env, nodes);
          return jsonResponse({ item: created }, 201);
        }

        if (path === "/api/nodes/reorder" && method === "POST") {
          const body = await readJson(request);
          const ids = Array.isArray(body.ids) ? body.ids : [];
          const nodes = await getNodes(env);
          const map = new Map(nodes.map((n) => [n.id, n]));
          let idx = 0;
          for (const id of ids) {
            const n = map.get(id);
            if (n) {
              n.sort = idx;
              idx += 1;
            }
          }
          for (const n of nodes) {
            if (!ids.includes(n.id)) {
              n.sort = idx;
              idx += 1;
            }
          }
          await setNodes(env, nodes);
          return jsonResponse({ success: true });
        }

        if (path.startsWith("/api/nodes/") && ["PUT", "DELETE"].includes(method)) {
          const id = decodeURIComponent(path.slice("/api/nodes/".length));
          const nodes = await getNodes(env);
          const idx = nodes.findIndex((n) => n.id === id);
          if (idx < 0) {
            return jsonResponse({ error: "节点不存在" }, 404);
          }

          if (method === "DELETE") {
            nodes.splice(idx, 1);
            await setNodes(env, nodes);
            await removeNodeFromSubscriptions(env, id);
            return jsonResponse({ success: true });
          }

          if (method === "PUT") {
            const body = await readJson(request);
            const updated = normalizeNode(
              {
                ...nodes[idx],
                ...body,
                id
              },
              false
            );
            nodes[idx] = updated;
            await setNodes(env, nodes);
            return jsonResponse({ item: updated });
          }
        }

        if (path === "/api/subscriptions" && method === "GET") {
          const subs = await getSubscriptions(env);
          return jsonResponse({ items: subs });
        }

        if (path === "/api/subscriptions" && method === "POST") {
          const body = await readJson(request);
          const subs = await getSubscriptions(env);
          const token = body.token?.trim() || randomToken();
          if (subs.some((s) => s.token === token)) {
            return jsonResponse({ error: "token 已存在" }, 409);
          }
          const created = normalizeSubscription(
            {
              ...body,
              id: crypto.randomUUID(),
              token,
              createdAt: Date.now()
            },
            true
          );
          subs.push(created);
          await setSubscriptions(env, subs);
          return jsonResponse({ item: created }, 201);
        }

        if (path.startsWith("/api/subscriptions/") && ["PUT", "DELETE"].includes(method)) {
          const id = decodeURIComponent(path.slice("/api/subscriptions/".length));
          const subs = await getSubscriptions(env);
          const idx = subs.findIndex((s) => s.id === id);
          if (idx < 0) {
            return jsonResponse({ error: "订阅不存在" }, 404);
          }

          if (method === "DELETE") {
            subs.splice(idx, 1);
            await setSubscriptions(env, subs);
            return jsonResponse({ success: true });
          }

          const body = await readJson(request);
          const nextToken = (body.token ?? subs[idx].token).trim();
          if (
            nextToken !== subs[idx].token &&
            subs.some((s) => s.token === nextToken)
          ) {
            return jsonResponse({ error: "token 已存在" }, 409);
          }
          const updated = normalizeSubscription(
            {
              ...subs[idx],
              ...body,
              id,
              token: nextToken
            },
            false
          );
          subs[idx] = updated;
          await setSubscriptions(env, subs);
          return jsonResponse({ item: updated });
        }

        if (path === "/api/rules" && method === "GET") {
          return jsonResponse(await getRules(env));
        }

        if (path === "/api/rules" && method === "PUT") {
          const body = await readJson(request);
          const rules = normalizeRules(body);
          await setRules(env, rules);
          return jsonResponse(rules);
        }

        if (path === "/api/stats" && method === "GET") {
          return jsonResponse(await getStats(env));
        }

        if (path === "/api/check" && method === "GET") {
          const nodes = sortNodes(await getNodes(env)).filter((n) => n.enabled);
          const items = await Promise.all(
            nodes.map((node) => checkNode(node))
          );
          return jsonResponse({ items });
        }

        if (path === "/api/export" && method === "GET") {
          return jsonResponse(await exportAll(env));
        }

        if (path === "/api/import" && method === "POST") {
          const body = await readJson(request);
          await importAll(env, body);
          return jsonResponse({ success: true });
        }

        if (path === "/api/reset" && method === "POST") {
          await resetAll(env);
          return jsonResponse({ success: true });
        }
      }

      return jsonResponse({ error: "Not Found" }, 404);
    } catch (err) {
      return jsonResponse(
        {
          error: "服务器错误",
          detail: String(err && err.message ? err.message : err)
        },
        500
      );
    }
  }
};

async function ensureInitialized(env) {
  const initFlag = await env.KV.get(KV_KEYS.INIT);
  if (initFlag === "1") {
    return;
  }

  await env.KV.put(KV_KEYS.NODES, JSON.stringify(DEFAULT_NODES));
  await env.KV.put(KV_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
  await env.KV.put(KV_KEYS.RULES, JSON.stringify(DEFAULT_RULES));
  await env.KV.put(KV_KEYS.STATS, JSON.stringify({}));
  await env.KV.put(KV_KEYS.INIT, "1");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...extraHeaders
    }
  });
}

function htmlResponse(html) {
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders()
    }
  });
}

function redirectResponse(to) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: to,
      ...corsHeaders()
    }
  });
}

async function readJson(request) {
  const text = await request.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function toBase64Url(bytes) {
  let bin = "";
  for (const b of bytes) {
    bin += String.fromCharCode(b);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

async function hmacSha256(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return new Uint8Array(sig);
}

async function signJwt(payload, secret) {
  const enc = new TextEncoder();
  const headerPart = toBase64Url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payloadPart = toBase64Url(enc.encode(JSON.stringify(payload)));
  const data = `${headerPart}.${payloadPart}`;
  const signature = await hmacSha256(data, secret);
  return `${data}.${toBase64Url(signature)}`;
}

async function verifyJwt(token, secret) {
  if (!token || typeof token !== "string") {
    return null;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, sigPart] = parts;
  const enc = new TextEncoder();
  const data = `${headerPart}.${payloadPart}`;
  const expected = toBase64Url(await hmacSha256(data, secret));
  if (sigPart !== expected) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart)));
  } catch {
    return null;
  }

  if (!payload.exp || nowSeconds() > payload.exp) {
    return null;
  }
  return payload;
}

async function verifyAuth(request, secret) {
  const auth = request.headers.get("Authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return false;
  }
  const payload = await verifyJwt(match[1], secret);
  return Boolean(payload);
}

async function getNodes(env) {
  const raw = await env.KV.get(KV_KEYS.NODES);
  if (!raw) return [];
  const list = JSON.parse(raw);
  return Array.isArray(list) ? list.map((n) => normalizeNode(n, false)) : [];
}

async function setNodes(env, nodes) {
  await env.KV.put(KV_KEYS.NODES, JSON.stringify(sortNodes(nodes)));
}

async function getSubscriptions(env) {
  const raw = await env.KV.get(KV_KEYS.SUBSCRIPTIONS);
  if (!raw) return [];
  const list = JSON.parse(raw);
  return Array.isArray(list) ? list.map((s) => normalizeSubscription(s, false)) : [];
}

async function setSubscriptions(env, subs) {
  await env.KV.put(KV_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
}

async function getRules(env) {
  const raw = await env.KV.get(KV_KEYS.RULES);
  if (!raw) return { ...DEFAULT_RULES };
  return normalizeRules(JSON.parse(raw));
}

async function setRules(env, rules) {
  await env.KV.put(KV_KEYS.RULES, JSON.stringify(normalizeRules(rules)));
}

async function getStats(env) {
  const raw = await env.KV.get(KV_KEYS.STATS);
  if (!raw) return {};
  const obj = JSON.parse(raw);
  return obj && typeof obj === "object" ? obj : {};
}

async function setStats(env, stats) {
  await env.KV.put(KV_KEYS.STATS, JSON.stringify(stats || {}));
}

function sortNodes(nodes) {
  return [...nodes].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

function normalizeNode(input, forCreate = false) {
  const node = {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || "未命名节点"),
    type: String(input.type || "hysteria2"),
    server: String(input.server || ""),
    port: Number(input.port || 443),
    enabled: input.enabled !== false,
    sort: Number.isFinite(Number(input.sort)) ? Number(input.sort) : 0,

    password: input.password ? String(input.password) : "",
    sni: input.sni ? String(input.sni) : "",
    skipCertVerify: Boolean(input.skipCertVerify),

    method: input.method ? String(input.method) : "2022-blake3-aes-128-gcm",

    uuid: input.uuid ? String(input.uuid) : "",
    network: input.network ? String(input.network) : "tcp",
    host: input.host ? String(input.host) : "",
    path: input.path ? String(input.path) : "",
    tls: Boolean(input.tls),

    security: input.security ? String(input.security) : "tls",
    flow: input.flow ? String(input.flow) : "",
    pbk: input.pbk ? String(input.pbk) : "",
    sid: input.sid ? String(input.sid) : "",
    fp: input.fp ? String(input.fp) : "chrome"
  };

  if (forCreate && node.type === "hysteria2" && !node.password) {
    node.password = "password";
  }

  return node;
}

function normalizeSubscription(input, forCreate = false) {
  const nodeIds = Array.isArray(input.nodeIds) && input.nodeIds.length
    ? input.nodeIds.map(String)
    : ["all"];

  return {
    id: String(input.id || crypto.randomUUID()),
    name: String(input.name || "未命名订阅"),
    token: String(input.token || (forCreate ? randomToken() : "")),
    nodeIds,
    totalGB: Number(input.totalGB || 0),
    expireTime: Number(input.expireTime || 0),
    createdAt: Number(input.createdAt || Date.now()),
    proxyGroups: Array.isArray(input.proxyGroups) ? input.proxyGroups : []
  };
}

function normalizeRules(input) {
  const preset = input?.preset === "none" ? "none" : "loyalsoldier";
  const defaultOutbound = input?.defaultOutbound === "direct" ? "direct" : "proxy";
  const customRules = Array.isArray(input?.customRules)
    ? input.customRules.map((r) => String(r).trim()).filter(Boolean)
    : [];
  return { preset, customRules, defaultOutbound };
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function removeNodeFromSubscriptions(env, nodeId) {
  const subs = await getSubscriptions(env);
  let changed = false;
  for (const s of subs) {
    if (Array.isArray(s.nodeIds) && !s.nodeIds.includes("all")) {
      const next = s.nodeIds.filter((id) => id !== nodeId);
      if (next.length !== s.nodeIds.length) {
        s.nodeIds = next.length ? next : ["all"];
        changed = true;
      }
    }
  }
  if (changed) {
    await setSubscriptions(env, subs);
  }
}

async function handleSubscriptionRequest(token, request, env, url) {
  const subs = await getSubscriptions(env);
  const sub = subs.find((s) => s.token === token);
  if (!sub) {
    return jsonResponse({ error: "订阅不存在" }, 404);
  }
  if (sub.expireTime > 0 && Date.now() > sub.expireTime) {
    return jsonResponse({ error: "订阅已过期" }, 410);
  }

  const nodes = await getNodes(env);
  const enabled = sortNodes(nodes).filter((n) => n.enabled);
  const selected = sub.nodeIds.includes("all")
    ? enabled
    : enabled.filter((n) => sub.nodeIds.includes(n.id));
  const rules = await getRules(env);

  const forceFormat = (url.searchParams.get("format") || "").toLowerCase();
  const ua = (request.headers.get("User-Agent") || "").toLowerCase();
  const useClash =
    forceFormat === "clash" ||
    (forceFormat !== "base64" && /(clash|mihomo|stash)/i.test(ua));

  let content;
  let contentType;
  if (useClash) {
    content = buildClashYaml(selected, rules);
    contentType = "text/yaml; charset=utf-8";
  } else {
    content = buildBase64Subscription(selected);
    contentType = "text/plain; charset=utf-8";
  }

  await recordSubscriptionStats(env, sub.id, request.headers.get("User-Agent") || "unknown");

  const totalBytes = Math.max(0, Math.floor((sub.totalGB || 0) * 1073741824));
  const expire = Math.max(0, Math.floor((sub.expireTime || 0) / 1000));

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "subscription-userinfo": `upload=0; download=0; total=${totalBytes}; expire=${expire}`,
      "Profile-Update-Interval": "12",
      ...corsHeaders()
    }
  });
}

async function recordSubscriptionStats(env, subId, ua) {
  const stats = await getStats(env);
  const curr = stats[subId] || {
    visits: 0,
    lastVisit: 0,
    uas: []
  };
  curr.visits += 1;
  curr.lastVisit = Date.now();
  const uas = new Set(Array.isArray(curr.uas) ? curr.uas : []);
  uas.add(String(ua || "unknown"));
  curr.uas = Array.from(uas).slice(-20);
  stats[subId] = curr;
  await setStats(env, stats);
}

function buildClashYaml(nodes, rulesConfig) {
  const proxies = nodes.map((n) => toClashProxy(n)).filter(Boolean);
  const names = proxies.map((p) => p.name);

  const ruleProviders = rulesConfig.preset === "loyalsoldier"
    ? {
        reject: {
          type: "http",
          behavior: "domain",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
          path: "./ruleset/reject.yaml",
          interval: 86400
        },
        icloud: {
          type: "http",
          behavior: "domain",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
          path: "./ruleset/icloud.yaml",
          interval: 86400
        },
        apple: {
          type: "http",
          behavior: "domain",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
          path: "./ruleset/apple.yaml",
          interval: 86400
        },
        google: {
          type: "http",
          behavior: "domain",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
          path: "./ruleset/google.yaml",
          interval: 86400
        },
        proxy: {
          type: "http",
          behavior: "domain",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
          path: "./ruleset/proxy.yaml",
          interval: 86400
        },
        direct: {
          type: "http",
          behavior: "domain",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
          path: "./ruleset/direct.yaml",
          interval: 86400
        },
        lancidr: {
          type: "http",
          behavior: "ipcidr",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
          path: "./ruleset/lancidr.yaml",
          interval: 86400
        },
        cncidr: {
          type: "http",
          behavior: "ipcidr",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
          path: "./ruleset/cncidr.yaml",
          interval: 86400
        },
        telegramcidr: {
          type: "http",
          behavior: "ipcidr",
          url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
          path: "./ruleset/telegramcidr.yaml",
          interval: 86400
        }
      }
    : undefined;

  const rules = [];

  if (rulesConfig.preset === "loyalsoldier") {
    rules.push("RULE-SET,reject,REJECT");
    rules.push("RULE-SET,icloud,DIRECT");
    rules.push("RULE-SET,apple,DIRECT");
    rules.push("RULE-SET,google,节点选择");
    rules.push("RULE-SET,proxy,节点选择");
    rules.push("RULE-SET,direct,DIRECT");
    rules.push("RULE-SET,lancidr,DIRECT,no-resolve");
    rules.push("RULE-SET,cncidr,DIRECT,no-resolve");
    rules.push("RULE-SET,telegramcidr,节点选择,no-resolve");
  }

  for (const r of rulesConfig.customRules || []) {
    rules.push(r);
  }

  if (rulesConfig.defaultOutbound === "direct") {
    rules.push("GEOIP,CN,DIRECT");
    rules.push("MATCH,DIRECT");
  } else {
    rules.push("GEOIP,CN,DIRECT");
    rules.push("MATCH,节点选择");
  }

  const config = {
    port: 7890,
    "socks-port": 7891,
    "allow-lan": true,
    mode: "rule",
    "log-level": "info",
    ipv6: true,
    "external-controller": "127.0.0.1:9090",
    dns: {
      enable: true,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",
      nameserver: ["223.5.5.5", "119.29.29.29"],
      "fallback-filter": {
        geoip: true,
        ipcidr: ["240.0.0.0/4"]
      },
      fallback: ["tls://1.1.1.1:853", "tls://8.8.8.8:853"]
    },
    proxies,
    "proxy-groups": [
      {
        name: "节点选择",
        type: "select",
        proxies: ["自动选择", ...names, "DIRECT"]
      },
      {
        name: "自动选择",
        type: "url-test",
        url: "http://www.gstatic.com/generate_204",
        interval: 300,
        tolerance: 50,
        proxies: names.length ? names : ["DIRECT"]
      }
    ],
    rules
  };

  if (ruleProviders) {
    config["rule-providers"] = ruleProviders;
  }

  return toYAML(config);
}

function toClashProxy(node) {
  if (!node || !node.name || !node.server || !node.port) {
    return null;
  }

  if (node.type === "hysteria2") {
    return {
      name: node.name,
      type: "hysteria2",
      server: node.server,
      port: Number(node.port),
      password: node.password || "",
      sni: node.sni || undefined,
      "skip-cert-verify": Boolean(node.skipCertVerify)
    };
  }

  if (node.type === "shadowsocks") {
    return {
      name: node.name,
      type: "ss",
      server: node.server,
      port: Number(node.port),
      cipher: node.method || "2022-blake3-aes-128-gcm",
      password: node.password || ""
    };
  }

  if (node.type === "vmess") {
    return {
      name: node.name,
      type: "vmess",
      server: node.server,
      port: Number(node.port),
      uuid: node.uuid || "",
      alterId: 0,
      cipher: "auto",
      network: node.network || "tcp",
      tls: Boolean(node.tls),
      servername: node.sni || undefined,
      "ws-opts": node.network === "ws" ? { path: node.path || "/", headers: node.host ? { Host: node.host } : undefined } : undefined,
      "grpc-opts": node.network === "grpc" ? { "grpc-service-name": node.path || "" } : undefined
    };
  }

  if (node.type === "vless") {
    return {
      name: node.name,
      type: "vless",
      server: node.server,
      port: Number(node.port),
      uuid: node.uuid || "",
      network: node.network || "tcp",
      tls: node.security === "tls" || node.security === "reality",
      flow: node.flow || undefined,
      servername: node.sni || undefined,
      "reality-opts": node.security === "reality"
        ? {
            "public-key": node.pbk || "",
            "short-id": node.sid || "",
            fingerprint: node.fp || "chrome"
          }
        : undefined,
      "ws-opts": node.network === "ws" ? { path: node.path || "/", headers: node.host ? { Host: node.host } : undefined } : undefined,
      "grpc-opts": node.network === "grpc" ? { "grpc-service-name": node.path || "" } : undefined
    };
  }

  if (node.type === "trojan") {
    return {
      name: node.name,
      type: "trojan",
      server: node.server,
      port: Number(node.port),
      password: node.password || "",
      sni: node.sni || undefined,
      network: node.network || "tcp",
      "ws-opts": node.network === "ws" ? { path: node.path || "/", headers: node.host ? { Host: node.host } : undefined } : undefined,
      "grpc-opts": node.network === "grpc" ? { "grpc-service-name": node.path || "" } : undefined
    };
  }

  return null;
}

function buildBase64Subscription(nodes) {
  const lines = nodes.map((n) => toUriLine(n)).filter(Boolean);
  return utf8ToBase64(lines.join("\n"));
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) {
    bin += String.fromCharCode(b);
  }
  return btoa(bin);
}

function toUriLine(node) {
  const name = encodeURIComponent(node.name || "node");
  const server = node.server;
  const port = Number(node.port || 0);

  if (!server || !port) {
    return "";
  }

  if (node.type === "hysteria2") {
    const params = new URLSearchParams();
    if (node.sni) params.set("sni", node.sni);
    if (node.skipCertVerify) params.set("insecure", "1");
    const query = params.toString();
    return `hysteria2://${encodeURIComponent(node.password || "")}@${server}:${port}${query ? `?${query}` : ""}#${name}`;
  }

  if (node.type === "shadowsocks") {
    const userInfo = utf8ToBase64(`${node.method || "2022-blake3-aes-128-gcm"}:${node.password || ""}`);
    return `ss://${userInfo}@${server}:${port}#${name}`;
  }

  if (node.type === "vmess") {
    const cfg = {
      v: "2",
      ps: node.name || "",
      add: server,
      port: String(port),
      id: node.uuid || "",
      aid: "0",
      scy: "auto",
      net: node.network || "tcp",
      type: "none",
      host: node.host || "",
      path: node.path || "",
      tls: node.tls ? "tls" : "",
      sni: node.sni || ""
    };
    return `vmess://${utf8ToBase64(JSON.stringify(cfg))}`;
  }

  if (node.type === "vless") {
    const params = new URLSearchParams();
    params.set("type", node.network || "tcp");
    if (node.security) params.set("security", node.security);
    if (node.sni) params.set("sni", node.sni);
    if (node.pbk) params.set("pbk", node.pbk);
    if (node.sid) params.set("sid", node.sid);
    params.set("fp", node.fp || "chrome");
    if (node.flow) params.set("flow", node.flow);
    return `vless://${node.uuid || ""}@${server}:${port}?${params.toString()}#${name}`;
  }

  if (node.type === "trojan") {
    const params = new URLSearchParams();
    if (node.sni) params.set("sni", node.sni);
    params.set("type", node.network || "tcp");
    return `trojan://${encodeURIComponent(node.password || "")}@${server}:${port}?${params.toString()}#${name}`;
  }

  return "";
}

function yamlQuote(str) {
  const escaped = str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  return `"${escaped}"`;
}

function isSimpleYamlString(str) {
  return /^[A-Za-z0-9_\-./:@]+$/.test(str);
}

function toYamlScalar(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    if (value === "") return '""';
    if (isSimpleYamlString(value)) return value;
    return yamlQuote(value);
  }
  return yamlQuote(String(value));
}

function toYAML(value, indent = 0) {
  const pad = "  ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          const child = toYAML(item, indent + 1);
          if (Array.isArray(item) || child.includes("\n")) {
            return `${pad}-\n${child}`;
          }
          return `${pad}- ${child.trimStart()}`;
        }
        return `${pad}- ${toYamlScalar(item)}`;
      })
      .join("\n");
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) {
      return "{}";
    }
    return entries
      .map(([k, v]) => {
        const key = isSimpleYamlString(k) ? k : yamlQuote(k);
        if (v && typeof v === "object") {
          const child = toYAML(v, indent + 1);
          if (Array.isArray(v)) {
            if (v.length === 0) {
              return `${pad}${key}: []`;
            }
            return `${pad}${key}:\n${child}`;
          }
          if (Object.keys(v).length === 0) {
            return `${pad}${key}: {}`;
          }
          return `${pad}${key}:\n${child}`;
        }
        return `${pad}${key}: ${toYamlScalar(v)}`;
      })
      .join("\n");
  }

  return `${pad}${toYamlScalar(value)}`;
}

async function checkNode(node) {
  const started = Date.now();
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort("timeout"), 3000);
  const target = `https://${node.server}:${node.port}`;

  try {
    await fetch(target, {
      method: "HEAD",
      redirect: "manual",
      signal: ctrl.signal
    });
    return {
      id: node.id,
      name: node.name,
      online: true,
      latency: Date.now() - started,
      error: ""
    };
  } catch (err) {
    return {
      id: node.id,
      name: node.name,
      online: false,
      latency: Date.now() - started,
      error: String(err && err.message ? err.message : err)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function exportAll(env) {
  return {
    nodes: await getNodes(env),
    subscriptions: await getSubscriptions(env),
    rules: await getRules(env),
    stats: await getStats(env),
    exportedAt: Date.now()
  };
}

async function importAll(env, payload) {
  const nodes = Array.isArray(payload.nodes) ? payload.nodes.map((n) => normalizeNode(n, false)) : [];
  const subscriptions = Array.isArray(payload.subscriptions)
    ? payload.subscriptions.map((s) => normalizeSubscription(s, false))
    : [];
  const rules = normalizeRules(payload.rules || DEFAULT_RULES);
  const stats = payload.stats && typeof payload.stats === "object" ? payload.stats : {};

  await setNodes(env, nodes);
  await setSubscriptions(env, subscriptions);
  await setRules(env, rules);
  await setStats(env, stats);
  await env.KV.put(KV_KEYS.INIT, "1");
}

async function resetAll(env) {
  await env.KV.put(KV_KEYS.NODES, JSON.stringify(DEFAULT_NODES));
  await env.KV.put(KV_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
  await env.KV.put(KV_KEYS.RULES, JSON.stringify(DEFAULT_RULES));
  await env.KV.put(KV_KEYS.STATS, JSON.stringify({}));
  await env.KV.put(KV_KEYS.INIT, "1");
}
