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
