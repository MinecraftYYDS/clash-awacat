function utf8Base64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function nodeToURI(node) {
  if (!node || !node.type) return '';

  const name = encodeURIComponent(node.name || 'Unnamed');

  if (node.type === 'hysteria2') {
    const params = new URLSearchParams();
    if (node.sni) params.set('sni', node.sni);
    if (node.skipCertVerify === true) params.set('insecure', '1');
    const query = params.toString();
    return 'hysteria2://' +
      encodeURIComponent(node.password || '') +
      '@' + node.server + ':' + node.port +
      (query ? '?' + query : '') +
      '#' + name;
  }

  if (node.type === 'shadowsocks') {
    const auth = utf8Base64((node.method || '') + ':' + (node.password || ''));
    return 'ss://' + auth + '@' + node.server + ':' + node.port + '#' + name;
  }

  if (node.type === 'vmess') {
    const cfg = {
      v: '2',
      ps: node.name || '',
      add: node.server || '',
      port: Number(node.port) || node.port || 0,
      id: node.uuid || '',
      aid: 0,
      net: node.network || 'tcp',
      type: 'none',
      host: node.host || '',
      path: node.path || '',
      tls: node.tls ? 'tls' : '',
    };
    return 'vmess://' + utf8Base64(JSON.stringify(cfg));
  }

  if (node.type === 'vless') {
    const params = new URLSearchParams();
    if (node.network) params.set('type', node.network);
    if (node.security) params.set('security', node.security);
    if (node.sni) params.set('sni', node.sni);
    if (node.flow) params.set('flow', node.flow);
    if (node.pbk) params.set('pbk', node.pbk);
    if (node.sid) params.set('sid', node.sid);
    if (node.fp) params.set('fp', node.fp);

    const query = params.toString();
    return 'vless://' +
      (node.uuid || '') +
      '@' + node.server + ':' + node.port +
      (query ? '?' + query : '') +
      '#' + name;
  }

  if (node.type === 'trojan') {
    const params = new URLSearchParams();
    if (node.sni) params.set('sni', node.sni);
    if (node.skipCertVerify === true) params.set('allowInsecure', '1');
    if (node.network) params.set('type', node.network);
    const query = params.toString();

    return 'trojan://' +
      encodeURIComponent(node.password || '') +
      '@' + node.server + ':' + node.port +
      (query ? '?' + query : '') +
      '#' + name;
  }

  return '';
}

export function nodeToClash(node) {
  if (!node || !node.type) return null;

  if (node.type === 'hysteria2') {
    return {
      name: node.name,
      type: 'hysteria2',
      server: node.server,
      port: Number(node.port),
      password: node.password,
      sni: node.sni || node.server,
      'skip-cert-verify': Boolean(node.skipCertVerify),
    };
  }

  if (node.type === 'shadowsocks') {
    return {
      name: node.name,
      type: 'ss',
      server: node.server,
      port: Number(node.port),
      cipher: node.method,
      password: node.password,
    };
  }

  if (node.type === 'vmess') {
    return {
      name: node.name,
      type: 'vmess',
      server: node.server,
      port: Number(node.port),
      uuid: node.uuid,
      alterId: 0,
      cipher: 'auto',
      network: node.network || 'tcp',
      tls: Boolean(node.tls),
      'skip-cert-verify': Boolean(node.skipCertVerify),
      servername: node.sni || '',
      host: node.host || undefined,
      path: node.path || undefined,
    };
  }

  if (node.type === 'vless') {
    const out = {
      name: node.name,
      type: 'vless',
      server: node.server,
      port: Number(node.port),
      uuid: node.uuid,
      network: node.network || 'tcp',
      tls: true,
      'skip-cert-verify': Boolean(node.skipCertVerify),
      servername: node.sni || '',
    };

    if (node.security === 'reality') {
      out['reality-opts'] = {
        'public-key': node.pbk || '',
        'short-id': node.sid || '',
      };
      out.flow = node.flow || '';
      out['client-fingerprint'] = node.fp || 'chrome';
    }

    return out;
  }

  if (node.type === 'trojan') {
    return {
      name: node.name,
      type: 'trojan',
      server: node.server,
      port: Number(node.port),
      password: node.password,
      sni: node.sni || node.server,
      'skip-cert-verify': Boolean(node.skipCertVerify),
      network: node.network || 'tcp',
    };
  }

  return null;
}
