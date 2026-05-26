import { createJWT, verifyJWT } from './auth.js';
import { kGet, kSet } from './kv.js';
import { DEFAULT_NODES, DEFAULT_RULES } from './defaults.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    },
  });
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getBearerToken(request) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice(7).trim();
}

function normalizeNodeInput(data) {
  return {
    ...data,
    port: Number(data.port) || 0,
    enabled: data.enabled !== false,
    skipCertVerify: Boolean(data.skipCertVerify),
    sort: Number.isFinite(data.sort) ? data.sort : undefined,
  };
}

async function checkNodeOnline(node) {
  const started = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 3000);

  try {
    await fetch('https://' + node.server + ':' + node.port, {
      method: 'HEAD',
      signal: ac.signal,
    });
    clearTimeout(timer);
    return { id: node.id, online: true, latency: Date.now() - started };
  } catch {
    clearTimeout(timer);
    return { id: node.id, online: false, latency: Date.now() - started };
  }
}

export async function handleAPI(path, request, env) {
  const method = request.method.toUpperCase();

  if (path === '/api/login' && method === 'POST') {
    const body = await readBody(request);
    if (!env.ADMIN_PASSWORD || !env.JWT_SECRET) {
      return json({ error: 'Server env not configured' }, 500);
    }
    if (body.password !== env.ADMIN_PASSWORD) {
      return json({ error: 'Invalid password' }, 401);
    }

    const token = await createJWT({ role: 'admin' }, env.JWT_SECRET);
    return json({ token });
  }

  const bearer = getBearerToken(request);
  const payload = await verifyJWT(bearer, env.JWT_SECRET || '');
  if (!payload) {
    return json({ error: 'Unauthorized' }, 401);
  }

  if (path === '/api/nodes' && method === 'GET') {
    const nodes = await kGet(env.KV, 'nodes', []);
    return json(nodes);
  }

  if (path === '/api/nodes' && method === 'POST') {
    const nodes = await kGet(env.KV, 'nodes', []);
    const body = normalizeNodeInput(await readBody(request));

    const newNode = {
      ...body,
      id: 'id-' + crypto.randomUUID(),
      sort: nodes.length,
    };

    nodes.push(newNode);
    await kSet(env.KV, 'nodes', nodes);
    return json(newNode);
  }

  if (path === '/api/nodes/reorder' && method === 'POST') {
    const nodes = await kGet(env.KV, 'nodes', []);
    const body = await readBody(request);
    const ids = Array.isArray(body.ids) ? body.ids : [];

    const sortMap = new Map(ids.map((id, idx) => [id, idx]));
    const fallback = ids.length;

    const updated = nodes
      .map((n) => ({ ...n, sort: sortMap.has(n.id) ? sortMap.get(n.id) : fallback + (n.sort || 0) }))
      .sort((a, b) => a.sort - b.sort)
      .map((n, idx) => ({ ...n, sort: idx }));

    await kSet(env.KV, 'nodes', updated);
    return json({ ok: true });
  }

  if (path.startsWith('/api/nodes/') && method === 'PUT') {
    const id = path.slice('/api/nodes/'.length);
    const body = normalizeNodeInput(await readBody(request));
    const nodes = await kGet(env.KV, 'nodes', []);

    const idx = nodes.findIndex((n) => n.id === id);
    if (idx < 0) return json({ error: 'Node not found' }, 404);

    nodes[idx] = {
      ...nodes[idx],
      ...body,
      id: nodes[idx].id,
      sort: nodes[idx].sort,
    };

    await kSet(env.KV, 'nodes', nodes);
    return json(nodes[idx]);
  }

  if (path.startsWith('/api/nodes/') && method === 'DELETE') {
    const id = path.slice('/api/nodes/'.length);
    const nodes = await kGet(env.KV, 'nodes', []);
    const updated = nodes.filter((n) => n.id !== id).map((n, idx) => ({ ...n, sort: idx }));
    await kSet(env.KV, 'nodes', updated);
    return json({ ok: true });
  }

  if (path === '/api/subscriptions' && method === 'GET') {
    const subs = await kGet(env.KV, 'subscriptions', []);
    return json(subs);
  }

  if (path === '/api/subscriptions' && method === 'POST') {
    const body = await readBody(request);
    const subs = await kGet(env.KV, 'subscriptions', []);

    const sub = {
      id: 'sub-' + crypto.randomUUID(),
      name: body.name || '新订阅',
      token: (body.token || crypto.randomUUID().replace(/-/g, '').slice(0, 16)).trim(),
      nodeIds: Array.isArray(body.nodeIds) && body.nodeIds.length ? body.nodeIds : ['all'],
      totalGB: Number(body.totalGB) || 0,
      expireTime: Number(body.expireTime) || 0,
      createdAt: Date.now(),
    };

    if (subs.some((s) => s.token === sub.token)) {
      return json({ error: 'Token already exists' }, 400);
    }

    subs.push(sub);
    await kSet(env.KV, 'subscriptions', subs);
    return json(sub);
  }

  if (path.startsWith('/api/subscriptions/') && method === 'PUT') {
    const id = path.slice('/api/subscriptions/'.length);
    const body = await readBody(request);
    const subs = await kGet(env.KV, 'subscriptions', []);

    const idx = subs.findIndex((s) => s.id === id);
    if (idx < 0) return json({ error: 'Subscription not found' }, 404);

    const nextToken = (body.token || subs[idx].token || '').trim();
    if (!nextToken) return json({ error: 'Token is required' }, 400);
    if (subs.some((s, i) => i !== idx && s.token === nextToken)) {
      return json({ error: 'Token already exists' }, 400);
    }

    subs[idx] = {
      ...subs[idx],
      ...body,
      token: nextToken,
      nodeIds: Array.isArray(body.nodeIds) && body.nodeIds.length ? body.nodeIds : ['all'],
      totalGB: Number(body.totalGB) || 0,
      expireTime: Number(body.expireTime) || 0,
    };

    await kSet(env.KV, 'subscriptions', subs);
    return json(subs[idx]);
  }

  if (path.startsWith('/api/subscriptions/') && method === 'DELETE') {
    const id = path.slice('/api/subscriptions/'.length);
    const subs = await kGet(env.KV, 'subscriptions', []);
    await kSet(env.KV, 'subscriptions', subs.filter((s) => s.id !== id));

    const stats = await kGet(env.KV, 'stats', {});
    if (stats[id]) {
      delete stats[id];
      await kSet(env.KV, 'stats', stats);
    }

    return json({ ok: true });
  }

  if (path === '/api/rules' && method === 'GET') {
    const rules = await kGet(env.KV, 'rules', DEFAULT_RULES);
    return json(rules);
  }

  if (path === '/api/rules' && method === 'PUT') {
    const body = await readBody(request);
    const rules = {
      preset: body.preset === 'none' ? 'none' : 'loyalsoldier',
      customRules: Array.isArray(body.customRules) ? body.customRules.filter(Boolean) : [],
      defaultOutbound: body.defaultOutbound === 'direct' ? 'direct' : 'proxy',
    };
    await kSet(env.KV, 'rules', rules);
    return json(rules);
  }

  if (path === '/api/stats' && method === 'GET') {
    const stats = await kGet(env.KV, 'stats', {});
    return json(stats);
  }

  if (path === '/api/check' && method === 'GET') {
    const nodes = await kGet(env.KV, 'nodes', []);
    const checks = await Promise.all(nodes.map(checkNodeOnline));
    return json(checks);
  }

  if (path === '/api/export' && method === 'GET') {
    const nodes = await kGet(env.KV, 'nodes', []);
    const subscriptions = await kGet(env.KV, 'subscriptions', []);
    const rules = await kGet(env.KV, 'rules', DEFAULT_RULES);
    const stats = await kGet(env.KV, 'stats', {});

    return json({ nodes, subscriptions, rules, stats, exportedAt: Date.now() });
  }

  if (path === '/api/import' && method === 'POST') {
    const body = await readBody(request);

    const nodes = Array.isArray(body.nodes) ? body.nodes : DEFAULT_NODES;
    const subscriptions = Array.isArray(body.subscriptions) ? body.subscriptions : [];
    const rules = body.rules && typeof body.rules === 'object' ? {
      preset: body.rules.preset === 'none' ? 'none' : 'loyalsoldier',
      customRules: Array.isArray(body.rules.customRules) ? body.rules.customRules.filter(Boolean) : [],
      defaultOutbound: body.rules.defaultOutbound === 'direct' ? 'direct' : 'proxy',
    } : DEFAULT_RULES;
    const stats = body.stats && typeof body.stats === 'object' ? body.stats : {};

    await kSet(env.KV, 'nodes', nodes);
    await kSet(env.KV, 'subscriptions', subscriptions);
    await kSet(env.KV, 'rules', rules);
    await kSet(env.KV, 'stats', stats);

    return json({ ok: true });
  }

  return json({ error: 'Not Found' }, 404);
}
