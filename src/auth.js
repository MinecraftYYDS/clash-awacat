const encoder = new TextEncoder();

function toBase64(input) {
  if (typeof input === 'string') return btoa(input);
  let binary = '';
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(str) {
  return atob(str);
}

async function getHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createJWT(payload, secret) {
  const now = Date.now();
  const body = {
    ...payload,
    exp: payload.exp || now + 7 * 24 * 60 * 60 * 1000,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const h = toBase64(JSON.stringify(header));
  const p = toBase64(JSON.stringify(body));
  const data = h + '.' + p;

  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const s = toBase64(signature);

  return data + '.' + s;
}

export async function verifyJWT(token, secret) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [h, p, s] = parts;
  const data = h + '.' + p;

  try {
    const key = await getHmacKey(secret);
    const signatureBytes = Uint8Array.from(fromBase64(s), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(data)
    );
    if (!ok) return null;

    const payload = JSON.parse(fromBase64(p));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
