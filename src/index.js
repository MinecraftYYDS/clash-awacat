import { initKV } from './kv.js';
import { handleAPI } from './api.js';
import { handleSubscription } from './subscription.js';
import { ADMIN_HTML } from './admin-html.js';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  };
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders(),
    },
  });
}

export default {
  async fetch(request, env) {
    await initKV(env.KV);

    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (path === '/') {
      return Response.redirect(url.origin + '/admin', 302);
    }

    if (path === '/admin') {
      return html(ADMIN_HTML);
    }

    if (path.startsWith('/sub/')) {
      const token = path.slice('/sub/'.length);
      if (!token) return new Response('Not Found', { status: 404 });
      return handleSubscription(token, request, env);
    }

    if (path.startsWith('/api/')) {
      return handleAPI(path, request, env);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders() });
  },
};
