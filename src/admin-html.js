export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sub Panel</title>
  <style>
    :root {
      --bg: #0f0f1a;
      --surface: #1a1a2e;
      --surface2: #16213e;
      --primary: #e94560;
      --text: #eeeeee;
      --text2: #aaaaaa;
      --border: #2a2a3e;
      --success: #4caf50;
      --warning: #ff9800;
      --danger: #c62828;
      --info: #1e88e5;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at 20% 20%, #1d1d38 0%, var(--bg) 45%), var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      min-height: 100vh;
    }

    .login-wrap {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }

    .card {
      background: rgba(26, 26, 46, 0.95);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    }

    .login-card { width: 100%; max-width: 360px; }

    h1, h2, h3 { margin: 0 0 12px; }
    .muted { color: var(--text2); }

    input, select, textarea, button {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: #121224;
      color: var(--text);
      padding: 10px 12px;
      font-size: 14px;
    }

    textarea { min-height: 140px; resize: vertical; }

    button {
      cursor: pointer;
      background: var(--surface2);
      transition: opacity 0.2s ease;
    }

    button:hover { opacity: 0.92; }
    button.primary { background: var(--primary); border-color: transparent; }
    button.info { background: var(--info); border-color: transparent; }
    button.warn { background: var(--warning); border-color: transparent; }
    button.danger { background: var(--danger); border-color: transparent; }

    .row { display: flex; gap: 10px; }
    .row > * { flex: 1; }
    .mb8 { margin-bottom: 8px; }
    .mb12 { margin-bottom: 12px; }
    .mb16 { margin-bottom: 16px; }

    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 200px;
      background: rgba(26, 26, 46, 0.95);
      border-right: 1px solid var(--border);
      padding: 18px 12px;
      position: sticky;
      top: 0;
      height: 100vh;
    }

    .brand { font-size: 20px; font-weight: 700; margin-bottom: 14px; }

    .nav-btn {
      text-align: left;
      margin-bottom: 8px;
      background: transparent;
      border: 1px solid transparent;
    }

    .nav-btn.active {
      background: var(--surface2);
      border-color: var(--border);
    }

    .content {
      flex: 1;
      padding: 16px;
      max-width: 100%;
      overflow-x: auto;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: rgba(22, 33, 62, 0.75);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }

    th, td {
      border-bottom: 1px solid var(--border);
      text-align: left;
      padding: 10px;
      font-size: 14px;
      white-space: nowrap;
    }

    td.wrap { white-space: normal; word-break: break-all; }

    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 12px;
      border: 1px solid var(--border);
      color: var(--text2);
    }

    .tag.ok { color: #d7ffd8; border-color: #2f6f34; background: #1e3c21; }
    .tag.off { color: #ffd6d6; border-color: #7c2a2a; background: #3a1a1a; }

    .actions { display: flex; gap: 8px; }
    .actions button { width: auto; min-width: 64px; padding: 6px 10px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      margin-bottom: 12px;
    }

    .stat {
      background: rgba(22, 33, 62, 0.85);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
    }

    .stat .num { font-size: 26px; font-weight: 700; margin-top: 6px; }

    .ua-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .ua-chip {
      font-size: 12px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.22);
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
    }

    .modal {
      width: 100%;
      max-width: 620px;
      max-height: calc(100vh - 32px);
      overflow: auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
    }

    .toast {
      position: fixed;
      right: 16px;
      bottom: 16px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      color: #fff;
      z-index: 2000;
      animation: fadein 0.2s ease;
    }

    .toast-ok { background: #2e7d32; }
    .toast-err { background: #b71c1c; }

    @keyframes fadein {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .content { padding: 12px; }
      table { min-width: 620px; }
    }
  </style>
</head>
<body>
  <div id="app"></div>

  <script>
    var token = localStorage.getItem('token');
    var currentPage = 'nodes';
    var state = { nodes: [], subs: [], rules: {}, stats: {} };

    function toast(message, success) {
      var el = document.createElement('div');
      el.className = 'toast ' + (success !== false ? 'toast-ok' : 'toast-err');
      el.textContent = message;
      document.body.appendChild(el);
      setTimeout(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 3000);
    }

    async function api(path, options) {
      options = options || {};
      var headers = options.headers || {};
      headers['Content-Type'] = 'application/json';
      if (token) headers['Authorization'] = 'Bearer ' + token;

      var init = {
        method: options.method || 'GET',
        headers: headers
      };

      if (options.body !== undefined) {
        init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      }

      var res = await fetch('/api' + path, init);
      if (res.status === 401) {
        token = null;
        localStorage.removeItem('token');
        render();
        return null;
      }

      var data = null;
      try { data = await res.json(); } catch (_) { data = null; }

      if (!res.ok) {
        toast((data && data.error) ? data.error : '请求失败', false);
        return null;
      }

      return data;
    }

    async function loadData() {
      if (!token) return;
      var nodes = await api('/nodes');
      var subs = await api('/subscriptions');
      var rules = await api('/rules');
      var stats = await api('/stats');

      state.nodes = Array.isArray(nodes) ? nodes : [];
      state.subs = Array.isArray(subs) ? subs : [];
      state.rules = rules || { preset: 'loyalsoldier', customRules: [], defaultOutbound: 'proxy' };
      state.stats = stats || {};
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderLogin() {
      return '' +
        '<div class="login-wrap">' +
          '<div class="card login-card">' +
            '<h1>Sub Panel</h1>' +
            '<p class="muted mb16">请输入管理密码</p>' +
            '<input id="pwd" type="password" placeholder="管理密码" class="mb12" />' +
            '<button class="primary" onclick="doLogin()">登录</button>' +
          '</div>' +
        '</div>';
    }

    function navBtn(id, title) {
      var cls = 'nav-btn' + (currentPage === id ? ' active' : '');
      return '<button class="' + cls + '" onclick="goPage(\\\'' + id + '\\\')">' + title + '</button>';
    }

    function renderLayout() {
      return '' +
      '<div class="layout">' +
        '<aside class="sidebar">' +
          '<div class="brand">Sub Panel</div>' +
          navBtn('nodes', '节点管理') +
          navBtn('subs', '订阅管理') +
          navBtn('rules', '规则配置') +
          navBtn('stats', '统计信息') +
          navBtn('settings', '系统设置') +
          '<div style="margin-top:16px"><button class="danger" onclick="logout()">退出登录</button></div>' +
        '</aside>' +
        '<main class="content">' + renderCurrentPage() + '</main>' +
      '</div>';
    }

    function renderCurrentPage() {
      if (currentPage === 'subs') return renderSubsPage();
      if (currentPage === 'rules') return renderRulesPage();
      if (currentPage === 'stats') return renderStatsPage();
      if (currentPage === 'settings') return renderSettingsPage();
      return renderNodesPage();
    }

    function renderNodesPage() {
      var rows = state.nodes.map(function (n) {
        return '' +
        '<tr>' +
          '<td>' + escapeHtml(n.name) + '</td>' +
          '<td>' + escapeHtml(n.type) + '</td>' +
          '<td>' + escapeHtml(n.server) + '</td>' +
          '<td>' + escapeHtml(n.port) + '</td>' +
          '<td>' + (n.enabled === false ? '<span class="tag off">禁用</span>' : '<span class="tag ok">启用</span>') + '</td>' +
          '<td>' +
            '<div class="actions">' +
              '<button class="info" onclick="openNodeModal(\\\'' + n.id + '\\\')">编辑</button>' +
              '<button class="warn" onclick="toggleNode(\\\'' + n.id + '\\\')">' + (n.enabled === false ? '启用' : '禁用') + '</button>' +
              '<button class="danger" onclick="deleteNode(\\\'' + n.id + '\\\')">删除</button>' +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');

      return '' +
      '<h2 class="mb12">节点管理</h2>' +
      '<div class="toolbar">' +
        '<button class="info" style="width:auto" onclick="checkNodes()">检测状态</button>' +
        '<button class="primary" style="width:auto" onclick="openNodeModal()">添加节点</button>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table>' +
          '<thead><tr><th>名称</th><th>协议</th><th>服务器</th><th>端口</th><th>状态</th><th>操作</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';
    }

    function renderSubsPage() {
      var origin = location.origin;
      var rows = state.subs.map(function (s) {
        var url = origin + '/sub/' + s.token;
        var nodesText = (!s.nodeIds || s.nodeIds.indexOf('all') >= 0) ? '全部节点' : String(s.nodeIds.length) + ' 个节点';

        return '' +
          '<tr>' +
            '<td>' + escapeHtml(s.name) + '</td>' +
            '<td class="wrap"><a href="javascript:void(0)" onclick="copyText(\\\'' + escapeHtml(url).replace(/'/g, '&#39;') + '\\\')">' + escapeHtml(url) + '</a></td>' +
            '<td>' + escapeHtml(nodesText) + '</td>' +
            '<td>' +
              '<div class="actions">' +
                '<button class="info" onclick="openSubModal(\\\'' + s.id + '\\\')">编辑</button>' +
                '<button class="danger" onclick="deleteSub(\\\'' + s.id + '\\\')">删除</button>' +
              '</div>' +
            '</td>' +
          '</tr>';
      }).join('');

      return '' +
        '<h2 class="mb12">订阅管理</h2>' +
        '<div class="toolbar"><button class="primary" style="width:auto" onclick="openSubModal()">创建订阅</button></div>' +
        '<div class="table-wrap mb12">' +
          '<table>' +
            '<thead><tr><th>名称</th><th>订阅链接</th><th>节点</th><th>操作</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="card">' +
          '<div>Clash/Mihomo: 直接导入订阅链接</div>' +
          '<div>Shadowrocket: 添加订阅链接，或在链接后加 ?format=base64</div>' +
          '<div>强制 Clash 格式: ?format=clash</div>' +
        '</div>';
    }

    function renderRulesPage() {
      var rulesText = (state.rules.customRules || []).join('\n');
      return '' +
      '<h2 class="mb12">规则配置</h2>' +
      '<div class="card">' +
        '<label class="mb8">规则预设</label>' +
        '<select id="rulesPreset" class="mb12">' +
          '<option value="loyalsoldier" ' + (state.rules.preset === 'none' ? '' : 'selected') + '>Loyalsoldier (推荐)</option>' +
          '<option value="none" ' + (state.rules.preset === 'none' ? 'selected' : '') + '>无预设</option>' +
        '</select>' +

        '<label class="mb8">默认出站</label>' +
        '<select id="rulesOutbound" class="mb12">' +
          '<option value="proxy" ' + ((state.rules.defaultOutbound || 'proxy') === 'proxy' ? 'selected' : '') + '>代理</option>' +
          '<option value="direct" ' + ((state.rules.defaultOutbound || 'proxy') === 'direct' ? 'selected' : '') + '>直连</option>' +
        '</select>' +

        '<label class="mb8">自定义规则（每行一条，TYPE,VALUE,POLICY）</label>' +
        '<textarea id="customRules" class="mb12">' + escapeHtml(rulesText) + '</textarea>' +
        '<button class="primary" style="width:auto" onclick="saveRules()">保存规则</button>' +
      '</div>' +
      '<div class="card" style="margin-top:12px">' +
        '<div class="muted">Loyalsoldier 会自动加入常见分流规则；自定义规则会插入到预设规则后方。</div>' +
      '</div>';
    }

    function renderStatsPage() {
      var totalVisits = 0;
      Object.keys(state.stats || {}).forEach(function (id) {
        totalVisits += Number((state.stats[id] || {}).visits || 0);
      });

      var statCards = '' +
        '<div class="grid">' +
          '<div class="stat"><div class="muted">节点总数</div><div class="num">' + state.nodes.length + '</div></div>' +
          '<div class="stat"><div class="muted">订阅总数</div><div class="num">' + state.subs.length + '</div></div>' +
          '<div class="stat"><div class="muted">总访问次数</div><div class="num">' + totalVisits + '</div></div>' +
        '</div>';

      var details = state.subs.map(function (s) {
        var st = state.stats[s.id] || { visits: 0, lastVisit: 0, uas: [] };
        var uas = (st.uas || []).map(function (ua) {
          return '<span class="ua-chip" title="' + escapeHtml(ua) + '">' + escapeHtml(ua) + '</span>';
        }).join('');
        var lastVisit = st.lastVisit ? new Date(st.lastVisit).toLocaleString() : '暂无';

        return '' +
          '<div class="card mb12">' +
            '<div class="row mb8"><div><strong>' + escapeHtml(s.name) + '</strong></div><div style="text-align:right"><span class="tag">访问 ' + Number(st.visits || 0) + '</span></div></div>' +
            '<div class="muted mb8">最后访问: ' + escapeHtml(lastVisit) + '</div>' +
            '<div class="ua-list">' + (uas || '<span class="muted">暂无 UA</span>') + '</div>' +
          '</div>';
      }).join('');

      return '<h2 class="mb12">统计信息</h2>' + statCards + details;
    }

    function renderSettingsPage() {
      return '' +
        '<h2 class="mb12">系统设置</h2>' +
        '<div class="card mb12">' +
          '<div class="toolbar">' +
            '<button class="info" style="width:auto" onclick="exportAll()">导出配置</button>' +
            '<button class="warn" style="width:auto" onclick="importAll()">导入配置</button>' +
            '<button class="danger" style="width:auto" onclick="resetAll()">重置数据</button>' +
          '</div>' +
          '<div class="muted">导入会覆盖当前 KV 中的数据，请先导出备份。</div>' +
        '</div>';
    }

    function render() {
      var app = document.getElementById('app');
      if (!token) {
        app.innerHTML = renderLogin();
        var pwd = document.getElementById('pwd');
        if (pwd) {
          pwd.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') doLogin();
          });
          setTimeout(function () { pwd.focus(); }, 0);
        }
        return;
      }

      app.innerHTML = renderLayout();
    }

    async function doLogin() {
      var pwdEl = document.getElementById('pwd');
      var pwd = pwdEl ? pwdEl.value : '';
      var res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      var data = null;
      try { data = await res.json(); } catch (_) { data = null; }
      if (!res.ok || !data || !data.token) {
        toast((data && data.error) ? data.error : '登录失败', false);
        return;
      }
      token = data.token;
      localStorage.setItem('token', token);
      await loadData();
      render();
      toast('登录成功');
    }

    function logout() {
      token = null;
      localStorage.removeItem('token');
      render();
    }

    function goPage(page) {
      currentPage = page;
      render();
    }

    function closeModal() {
      var el = document.querySelector('.modal-overlay');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function openModal(title, bodyHtml, saveFnName) {
      closeModal();
      var html = '' +
        '<div class="modal-overlay" onclick="if(event.target===this) closeModal()">' +
          '<div class="modal">' +
            '<h3 class="mb12">' + escapeHtml(title) + '</h3>' +
            bodyHtml +
            '<div class="actions" style="margin-top:12px">' +
              '<button onclick="closeModal()">取消</button>' +
              '<button class="primary" onclick="' + saveFnName + '()">保存</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.insertAdjacentHTML('beforeend', html);
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).then(function () {
        toast('已复制到剪贴板');
      }).catch(function () {
        toast('复制失败', false);
      });
    }

    async function refreshAll() {
      await loadData();
      render();
    }

    async function checkNodes() {
      var result = await api('/check');
      if (!result) return;
      var lines = result.map(function (item) {
        return item.id + ' | ' + (item.online ? '在线' : '离线') + ' | ' + item.latency + 'ms';
      });
      alert(lines.join('\n') || '无节点');
    }

    function openNodeModal(id) {
      var node = id ? state.nodes.find(function (n) { return n.id === id; }) : null;
      node = node || {
        name: '', type: 'hysteria2', server: '', port: 443, sni: '', skipCertVerify: false,
        password: '', method: 'aes-256-gcm', uuid: '', network: 'tcp', host: '', path: '', tls: false,
        security: 'tls', flow: '', pbk: '', sid: '', fp: 'chrome', enabled: true
      };

      var html = '' +
        '<input id="n_name" class="mb8" placeholder="名称" value="' + escapeHtml(node.name) + '" />' +
        '<div class="row mb8">' +
          '<select id="n_type" onchange="renderNodeExtras()">' +
            '<option value="hysteria2" ' + (node.type === 'hysteria2' ? 'selected' : '') + '>hysteria2</option>' +
            '<option value="shadowsocks" ' + (node.type === 'shadowsocks' ? 'selected' : '') + '>shadowsocks</option>' +
            '<option value="vmess" ' + (node.type === 'vmess' ? 'selected' : '') + '>vmess</option>' +
            '<option value="vless" ' + (node.type === 'vless' ? 'selected' : '') + '>vless</option>' +
            '<option value="trojan" ' + (node.type === 'trojan' ? 'selected' : '') + '>trojan</option>' +
          '</select>' +
          '<input id="n_server" placeholder="服务器" value="' + escapeHtml(node.server) + '" />' +
          '<input id="n_port" type="number" placeholder="端口" value="' + escapeHtml(node.port) + '" />' +
        '</div>' +
        '<div class="row mb8">' +
          '<input id="n_sni" placeholder="SNI" value="' + escapeHtml(node.sni || '') + '" />' +
          '<label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--border);border-radius:6px;">' +
            '<input id="n_skip" type="checkbox" style="width:auto" ' + (node.skipCertVerify ? 'checked' : '') + ' />跳过证书验证' +
          '</label>' +
        '</div>' +
        '<div id="nodeExtras"></div>';

      window.__editingNodeId = id || '';
      window.__editingNodeData = node;
      openModal(id ? '编辑节点' : '添加节点', html, 'saveNode');
      renderNodeExtras();
    }

    function renderNodeExtras() {
      var typeEl = document.getElementById('n_type');
      var box = document.getElementById('nodeExtras');
      if (!typeEl || !box) return;

      var type = typeEl.value;
      var n = window.__editingNodeData || {};
      var html = '';

      if (type === 'hysteria2') {
        html += '<input id="n_password" class="mb8" placeholder="密码" value="' + escapeHtml(n.password || '') + '" />';
      }

      if (type === 'shadowsocks') {
        html += '<div class="row mb8">' +
          '<select id="n_method">' +
            '<option value="aes-128-gcm" ' + ((n.method || '') === 'aes-128-gcm' ? 'selected' : '') + '>aes-128-gcm</option>' +
            '<option value="aes-256-gcm" ' + ((n.method || '') === 'aes-256-gcm' ? 'selected' : '') + '>aes-256-gcm</option>' +
            '<option value="chacha20-ietf-poly1305" ' + ((n.method || '') === 'chacha20-ietf-poly1305' ? 'selected' : '') + '>chacha20-ietf-poly1305</option>' +
            '<option value="2022-blake3-aes-128-gcm" ' + ((n.method || '') === '2022-blake3-aes-128-gcm' ? 'selected' : '') + '>2022-blake3-aes-128-gcm</option>' +
          '</select>' +
          '<input id="n_password" placeholder="密码" value="' + escapeHtml(n.password || '') + '" />' +
        '</div>';
      }

      if (type === 'vmess') {
        html += '<input id="n_uuid" class="mb8" placeholder="UUID" value="' + escapeHtml(n.uuid || '') + '" />';
        html += '<div class="row mb8">' +
          '<select id="n_network">' +
            '<option value="tcp" ' + ((n.network || 'tcp') === 'tcp' ? 'selected' : '') + '>tcp</option>' +
            '<option value="ws" ' + ((n.network || '') === 'ws' ? 'selected' : '') + '>ws</option>' +
            '<option value="grpc" ' + ((n.network || '') === 'grpc' ? 'selected' : '') + '>grpc</option>' +
            '<option value="h2" ' + ((n.network || '') === 'h2' ? 'selected' : '') + '>h2</option>' +
          '</select>' +
          '<input id="n_host" placeholder="Host" value="' + escapeHtml(n.host || '') + '" />' +
          '<input id="n_path" placeholder="Path" value="' + escapeHtml(n.path || '') + '" />' +
        '</div>';
        html += '<label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--border);border-radius:6px;">' +
          '<input id="n_tls" type="checkbox" style="width:auto" ' + (n.tls ? 'checked' : '') + ' />TLS' +
          '</label>';
      }

      if (type === 'vless') {
        html += '<input id="n_uuid" class="mb8" placeholder="UUID" value="' + escapeHtml(n.uuid || '') + '" />';
        html += '<div class="row mb8">' +
          '<select id="n_network">' +
            '<option value="tcp" ' + ((n.network || 'tcp') === 'tcp' ? 'selected' : '') + '>tcp</option>' +
            '<option value="ws" ' + ((n.network || '') === 'ws' ? 'selected' : '') + '>ws</option>' +
            '<option value="grpc" ' + ((n.network || '') === 'grpc' ? 'selected' : '') + '>grpc</option>' +
            '<option value="h2" ' + ((n.network || '') === 'h2' ? 'selected' : '') + '>h2</option>' +
          '</select>' +
          '<select id="n_security">' +
            '<option value="tls" ' + ((n.security || 'tls') === 'tls' ? 'selected' : '') + '>tls</option>' +
            '<option value="reality" ' + ((n.security || '') === 'reality' ? 'selected' : '') + '>reality</option>' +
          '</select>' +
          '<input id="n_flow" placeholder="Flow" value="' + escapeHtml(n.flow || '') + '" />' +
        '</div>';
        html += '<div class="row mb8">' +
          '<input id="n_pbk" placeholder="Public Key" value="' + escapeHtml(n.pbk || '') + '" />' +
          '<input id="n_sid" placeholder="Short ID" value="' + escapeHtml(n.sid || '') + '" />' +
          '<input id="n_fp" placeholder="Fingerprint" value="' + escapeHtml(n.fp || 'chrome') + '" />' +
        '</div>';
      }

      if (type === 'trojan') {
        html += '<div class="row mb8">' +
          '<input id="n_password" placeholder="密码" value="' + escapeHtml(n.password || '') + '" />' +
          '<select id="n_network">' +
            '<option value="tcp" ' + ((n.network || 'tcp') === 'tcp' ? 'selected' : '') + '>tcp</option>' +
            '<option value="ws" ' + ((n.network || '') === 'ws' ? 'selected' : '') + '>ws</option>' +
            '<option value="grpc" ' + ((n.network || '') === 'grpc' ? 'selected' : '') + '>grpc</option>' +
          '</select>' +
        '</div>';
      }

      box.innerHTML = html;
    }

    async function saveNode() {
      var type = (document.getElementById('n_type') || {}).value || 'hysteria2';
      var data = {
        name: (document.getElementById('n_name') || {}).value || '',
        type: type,
        server: (document.getElementById('n_server') || {}).value || '',
        port: Number((document.getElementById('n_port') || {}).value || 0),
        sni: (document.getElementById('n_sni') || {}).value || '',
        skipCertVerify: !!((document.getElementById('n_skip') || {}).checked),
        enabled: true
      };

      var mapFields = ['password','method','uuid','network','host','path','security','flow','pbk','sid','fp'];
      mapFields.forEach(function (k) {
        var el = document.getElementById('n_' + k);
        if (el) data[k] = el.value || '';
      });
      var tlsEl = document.getElementById('n_tls');
      if (tlsEl) data.tls = !!tlsEl.checked;

      if (!data.name || !data.server || !data.port) {
        toast('请填写名称/服务器/端口', false);
        return;
      }

      var id = window.__editingNodeId;
      var ok = id
        ? await api('/nodes/' + id, { method: 'PUT', body: data })
        : await api('/nodes', { method: 'POST', body: data });
      if (!ok) return;

      closeModal();
      await refreshAll();
      toast(id ? '节点已更新' : '节点已添加');
    }

    async function toggleNode(id) {
      var node = state.nodes.find(function (n) { return n.id === id; });
      if (!node) return;
      var ok = await api('/nodes/' + id, { method: 'PUT', body: { enabled: !node.enabled } });
      if (!ok) return;
      await refreshAll();
    }

    async function deleteNode(id) {
      if (!confirm('确认删除该节点？')) return;
      var ok = await api('/nodes/' + id, { method: 'DELETE' });
      if (!ok) return;
      await refreshAll();
      toast('节点已删除');
    }

    function openSubModal(id) {
      var sub = id ? state.subs.find(function (s) { return s.id === id; }) : null;
      sub = sub || {
        name: '', token: '', totalGB: 0, expireTime: 0, nodeIds: ['all']
      };
      var allChecked = !sub.nodeIds || sub.nodeIds.indexOf('all') >= 0;

      var nodeChecks = state.nodes.map(function (n) {
        var checked = allChecked ? false : (sub.nodeIds || []).indexOf(n.id) >= 0;
        return '<label style="display:block;margin:4px 0"><input class="subNode" type="checkbox" value="' + n.id + '" ' + (checked ? 'checked' : '') + ' /> ' + escapeHtml(n.name) + '</label>';
      }).join('');

      var html = '' +
        '<input id="s_name" class="mb8" placeholder="订阅名称" value="' + escapeHtml(sub.name || '') + '" />' +
        '<input id="s_token" class="mb8" placeholder="Token（留空自动生成）" value="' + escapeHtml(sub.token || '') + '" />' +
        '<div class="row mb8">' +
          '<input id="s_total" type="number" placeholder="总流量 GB（0=无限）" value="' + escapeHtml(sub.totalGB || 0) + '" />' +
          '<input id="s_expire" type="number" placeholder="过期时间戳 ms（0=永久）" value="' + escapeHtml(sub.expireTime || 0) + '" />' +
        '</div>' +
        '<label class="mb8" style="display:flex;align-items:center;gap:8px"><input id="s_all" type="checkbox" style="width:auto" ' + (allChecked ? 'checked' : '') + ' onchange="toggleSubNodesVisible()" />包含全部节点</label>' +
        '<div id="subNodesBox" style="' + (allChecked ? 'display:none;' : '') + 'max-height:200px;overflow:auto;border:1px solid var(--border);border-radius:6px;padding:8px">' + nodeChecks + '</div>';

      window.__editingSubId = id || '';
      openModal(id ? '编辑订阅' : '创建订阅', html, 'saveSub');
    }

    function toggleSubNodesVisible() {
      var all = (document.getElementById('s_all') || {}).checked;
      var box = document.getElementById('subNodesBox');
      if (box) box.style.display = all ? 'none' : 'block';
    }

    async function saveSub() {
      var all = !!((document.getElementById('s_all') || {}).checked);
      var nodeIds = ['all'];

      if (!all) {
        nodeIds = Array.from(document.querySelectorAll('.subNode:checked')).map(function (el) { return el.value; });
        if (!nodeIds.length) {
          toast('请至少选择一个节点', false);
          return;
        }
      }

      var data = {
        name: (document.getElementById('s_name') || {}).value || '未命名订阅',
        token: (document.getElementById('s_token') || {}).value || '',
        totalGB: Number((document.getElementById('s_total') || {}).value || 0),
        expireTime: Number((document.getElementById('s_expire') || {}).value || 0),
        nodeIds: nodeIds
      };

      var id = window.__editingSubId;
      var ok = id
        ? await api('/subscriptions/' + id, { method: 'PUT', body: data })
        : await api('/subscriptions', { method: 'POST', body: data });
      if (!ok) return;

      closeModal();
      await refreshAll();
      toast(id ? '订阅已更新' : '订阅已创建');
    }

    async function deleteSub(id) {
      if (!confirm('确认删除该订阅？')) return;
      var ok = await api('/subscriptions/' + id, { method: 'DELETE' });
      if (!ok) return;
      await refreshAll();
      toast('订阅已删除');
    }

    async function saveRules() {
      var preset = (document.getElementById('rulesPreset') || {}).value || 'loyalsoldier';
      var outbound = (document.getElementById('rulesOutbound') || {}).value || 'proxy';
      var txt = (document.getElementById('customRules') || {}).value || '';
      var customRules = txt.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);

      var ok = await api('/rules', {
        method: 'PUT',
        body: { preset: preset, defaultOutbound: outbound, customRules: customRules }
      });
      if (!ok) return;
      await refreshAll();
      toast('规则已保存');
    }

    async function exportAll() {
      var data = await api('/export');
      if (!data) return;
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sub-panel-export-' + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 100);
      toast('导出完成');
    }

    function importAll() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async function () {
        if (!input.files || !input.files[0]) return;
        var file = input.files[0];
        var text = await file.text();
        var obj = null;
        try { obj = JSON.parse(text); } catch (_) { obj = null; }
        if (!obj) {
          toast('JSON 格式错误', false);
          return;
        }

        var ok = await api('/import', { method: 'POST', body: obj });
        if (!ok) return;
        await refreshAll();
        toast('导入完成');
      };
      input.click();
    }

    async function resetAll() {
      if (!confirm('确认重置全部数据？')) return;
      if (!confirm('此操作不可恢复，是否继续？')) return;
      var ok = await api('/import', { method: 'POST', body: {} });
      if (!ok) return;
      await refreshAll();
      toast('数据已重置');
    }

    (async function init() {
      if (token) await loadData();
      render();
    })();
  </script>
</body>
</html>`;
