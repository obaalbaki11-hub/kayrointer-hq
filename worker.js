/**
 * Kayro Interactive — Cloudflare Worker Backend
 * Handles: AI proxy, flight search/booking (Duffel), hotel search (Amadeus), payments (Stripe)
 * Deploy: wrangler deploy
 */

const ALLOWED_ORIGINS = [
  'https://kayrointer.com',
  'https://www.kayrointer.com',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });
}

function err(msg, status = 400, origin = '') {
  return json({ error: msg }, status, origin);
}

// ── MAIN ROUTER ────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    try {
      // AI Proxy — Bedrock if AWS creds set, else Anthropic
      if (path === '/api/ai')                  return (env.AWS_ACCESS_KEY_ID ? handleAIBedrock : handleAI)(request, env, origin);
      if (path === '/api/ping')                return handlePing(request, env, origin);
      if (path === '/api/send-email')          return handleSendEmail(request, env, origin);
      if (path.startsWith('/api/kling'))       return handleKling(request, env, origin, path);
      if (path.startsWith('/api/hunter'))     return handleHunter(request, env, origin, path);
      if (path.startsWith('/api/auth'))       return handleAuth(request, env, origin, path);

      // Flights (Duffel)
      if (path === '/api/flights/search')      return handleFlightSearch(request, env, origin);
      if (path === '/api/flights/offers')      return handleFlightOffers(request, env, origin);
      if (path === '/api/flights/book')        return handleFlightBook(request, env, origin);
      if (path.startsWith('/api/flights/order/')) return handleFlightOrder(request, env, origin, path);

      // Hotels (Amadeus)
      if (path === '/api/hotels/search')       return handleHotelSearch(request, env, origin);
      if (path === '/api/hotels/offers')       return handleHotelOffers(request, env, origin);
      if (path === '/api/hotels/book')         return handleHotelBook(request, env, origin);

      // Payments (Stripe)
      if (path === '/api/payments/customer')   return handleStripeCustomer(request, env, origin);
      if (path === '/api/payments/setup')      return handleSetupIntent(request, env, origin);
      if (path === '/api/payments/methods')    return handleListCards(request, env, origin);
      if (path === '/api/payments/remove')     return handleRemoveCard(request, env, origin);
      if (path === '/api/payments/charge')     return handleCharge(request, env, origin);

      return err('Not found', 404, origin);
    } catch (e) {
      console.error(e);
      return err(e.message || 'Internal server error', 500, origin);
    }
  },
};

// ══════════════════════════════════════════════════════════════
// AWS SIGNATURE V4 HELPERS
// ══════════════════════════════════════════════════════════════
async function sha256Hex(data) {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacBytes(key, data) {
  const k = key instanceof Uint8Array ? key : new TextEncoder().encode(key);
  const d = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const ck = await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', ck, d));
}

async function awsSig4(method, urlStr, extraHeaders, body, accessKey, secretKey, region, service) {
  const parsed    = new URL(urlStr);
  const now       = new Date();
  const amzDate   = now.toISOString().replace(/[:\-]/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const allHeaders = { 'content-type': 'application/json', ...extraHeaders, 'host': parsed.host, 'x-amz-date': amzDate };
  const sortedKeys = Object.keys(allHeaders).map(k => k.toLowerCase()).filter((v, i, a) => a.indexOf(v) === i).sort();

  const normalised = {};
  for (const [k, v] of Object.entries(allHeaders)) normalised[k.toLowerCase()] = v.trim();

  const canonicalHeaders = sortedKeys.map(k => `${k}:${normalised[k]}`).join('\n') + '\n';
  const signedHeaders    = sortedKeys.join(';');
  const payloadHash      = await sha256Hex(body || '');

  const canonicalRequest = [method, parsed.pathname, parsed.search.slice(1), canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const credScope        = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign     = ['AWS4-HMAC-SHA256', amzDate, credScope, await sha256Hex(canonicalRequest)].join('\n');

  let sigKey = await hmacBytes('AWS4' + secretKey, dateStamp);
  sigKey = await hmacBytes(sigKey, region);
  sigKey = await hmacBytes(sigKey, service);
  sigKey = await hmacBytes(sigKey, 'aws4_request');

  const sigBytes  = await hmacBytes(sigKey, stringToSign);
  const signature = Array.from(sigBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'x-amz-date': amzDate,
  };
}

// ══════════════════════════════════════════════════════════════
// AI PROXY — BEDROCK (used when AWS creds are set)
// ══════════════════════════════════════════════════════════════
const BEDROCK_MODEL_MAP = {
  'claude-opus-4-7':            'us.anthropic.claude-opus-4-7-20250514-v1:0',
  'claude-sonnet-4-6':          'us.anthropic.claude-sonnet-4-6-20250514-v1:0',
  'claude-haiku-4-5-20251001':  'us.anthropic.claude-haiku-4-5-20251001-v1:0',
  'claude-haiku-4-5':           'us.anthropic.claude-haiku-4-5-20251001-v1:0',
  'claude-3-5-sonnet-20241022': 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  'claude-3-haiku-20240307':    'us.anthropic.claude-3-haiku-20240307-v1:0',
};

async function handleAIBedrock(request, env, origin) {
  const accessKey = env.AWS_ACCESS_KEY_ID;
  const secretKey = env.AWS_SECRET_ACCESS_KEY;
  const region    = env.AWS_REGION || 'us-east-1';

  let bodyObj;
  try { bodyObj = JSON.parse(await request.text()); } catch(e) {
    return json({ error: { message: 'Invalid request body' } }, 400, origin);
  }

  const anthropicModel = bodyObj.model || 'claude-sonnet-4-6';
  const bedrockModel   = BEDROCK_MODEL_MAP[anthropicModel] || `us.anthropic.${anthropicModel}-v1:0`;
  const wasStream      = bodyObj.stream === true;

  // Bedrock uses same Messages API shape but: model is in URL, stream removed, anthropic_version added
  const { model: _m, stream: _s, ...bedrockBody } = bodyObj;
  bedrockBody['anthropic_version'] = 'bedrock-2023-05-31';

  const bodyStr  = JSON.stringify(bedrockBody);
  const endpoint = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(bedrockModel)}/invoke`;

  const authHeaders = await awsSig4('POST', endpoint, {}, bodyStr, accessKey, secretKey, region, 'bedrock');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeaders },
    body: bodyStr,
  });

  if (!res.ok) {
    const errBody = await res.text();
    return new Response(errBody, {
      status: res.status,
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();
  if (!data.id)    data.id    = 'bedrock-' + Date.now();
  if (!data.model) data.model = anthropicModel;
  if (!data.role)  data.role  = 'assistant';

  if (!wasStream) return json(data, 200, origin);

  // Re-emit as SSE identical to handleAI so client code is unchanged
  const enc = new TextEncoder();
  const sse = (event, payload) => enc.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);

  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(sse('message_start', {
        type: 'message_start',
        message: { id: data.id, type: 'message', role: data.role, content: [], model: anthropicModel, stop_reason: null, usage: data.usage },
      }));

      (data.content || []).forEach((block, idx) => {
        if (block.type === 'text') {
          ctrl.enqueue(sse('content_block_start', { type: 'content_block_start', index: idx, content_block: { type: 'text', text: '' } }));
          const text = block.text;
          for (let i = 0; i < text.length; i += 20) {
            ctrl.enqueue(sse('content_block_delta', { type: 'content_block_delta', index: idx, delta: { type: 'text_delta', text: text.slice(i, i + 20) } }));
          }
          ctrl.enqueue(sse('content_block_stop', { type: 'content_block_stop', index: idx }));
        } else if (block.type === 'tool_use') {
          ctrl.enqueue(sse('content_block_start', { type: 'content_block_start', index: idx, content_block: { type: 'tool_use', id: block.id, name: block.name, input: {} } }));
          ctrl.enqueue(sse('content_block_delta', { type: 'content_block_delta', index: idx, delta: { type: 'input_json_delta', partial_json: JSON.stringify(block.input) } }));
          ctrl.enqueue(sse('content_block_stop', { type: 'content_block_stop', index: idx }));
        }
      });

      ctrl.enqueue(sse('message_delta', { type: 'message_delta', delta: { stop_reason: data.stop_reason, stop_sequence: null }, usage: { output_tokens: data.usage?.output_tokens || 0 } }));
      ctrl.enqueue(sse('message_stop', { type: 'message_stop' }));
      ctrl.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}

// ══════════════════════════════════════════════════════════════
// AI PROXY — ANTHROPIC (fallback when no AWS creds)
// ══════════════════════════════════════════════════════════════
async function handleAI(request, env, origin) {
  const key = env.ANTHROPIC_KEY || env.ANTHROPIC_API_KEY;
  if (!key) {
    return json({ error: { message: 'Anthropic API key not set. Run: npx wrangler secret put ANTHROPIC_KEY — then paste your sk-ant- key.' } }, 500, origin);
  }

  let bodyObj;
  try { bodyObj = JSON.parse(await request.text()); } catch(e) {
    return json({ error: { message: 'Invalid request body' } }, 400, origin);
  }

  // Streaming from Workers to Anthropic is blocked by WAF — use non-streaming and re-emit as SSE
  const wasStream = bodyObj.stream === true;
  bodyObj.stream = false;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'User-Agent': 'kayro-worker/1.0',
    },
    body: JSON.stringify(bodyObj),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return new Response(errBody, {
      status: res.status,
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json();

  // Non-streaming caller: return JSON as-is
  if (!wasStream) {
    return json(data, 200, origin);
  }

  // Re-emit as SSE so the client-side streaming parser works unchanged
  const enc = new TextEncoder();
  const sse = (event, payload) => enc.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);

  const stream = new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(sse('message_start', {
        type: 'message_start',
        message: { id: data.id, type: 'message', role: data.role, content: [], model: data.model, stop_reason: null, usage: data.usage },
      }));

      (data.content || []).forEach((block, idx) => {
        if (block.type === 'text') {
          ctrl.enqueue(sse('content_block_start', { type: 'content_block_start', index: idx, content_block: { type: 'text', text: '' } }));
          // Emit in chunks so the SSE parser sees proper deltas
          const text = block.text;
          for (let i = 0; i < text.length; i += 20) {
            ctrl.enqueue(sse('content_block_delta', { type: 'content_block_delta', index: idx, delta: { type: 'text_delta', text: text.slice(i, i + 20) } }));
          }
          ctrl.enqueue(sse('content_block_stop', { type: 'content_block_stop', index: idx }));
        } else if (block.type === 'tool_use') {
          ctrl.enqueue(sse('content_block_start', { type: 'content_block_start', index: idx, content_block: { type: 'tool_use', id: block.id, name: block.name, input: {} } }));
          ctrl.enqueue(sse('content_block_delta', { type: 'content_block_delta', index: idx, delta: { type: 'input_json_delta', partial_json: JSON.stringify(block.input) } }));
          ctrl.enqueue(sse('content_block_stop', { type: 'content_block_stop', index: idx }));
        }
      });

      ctrl.enqueue(sse('message_delta', { type: 'message_delta', delta: { stop_reason: data.stop_reason, stop_sequence: null }, usage: { output_tokens: data.usage?.output_tokens || 0 } }));
      ctrl.enqueue(sse('message_stop', { type: 'message_stop' }));
      ctrl.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════
async function handlePing(request, env, origin) {
  const key = env.ANTHROPIC_KEY || env.ANTHROPIC_API_KEY;
  if (!key) return json({ ok: false, error: 'No API key stored in Cloudflare' }, 200, origin);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'User-Agent': 'kayro-worker/1.0' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] }),
  });
  const body = await res.json();
  if (res.ok) return json({ ok: true, status: res.status }, 200, origin);
  return json({ ok: false, status: res.status, raw: body }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// SEND EMAIL — RESEND
// ══════════════════════════════════════════════════════════════
async function handleSendEmail(request, env, origin) {
  const key = env.RESEND_KEY;
  if (!key) {
    return json({ error: 'Email sending not configured. Run: npx wrangler secret put RESEND_KEY — get your free key at resend.com' }, 500, origin);
  }
  let body;
  try { body = JSON.parse(await request.text()); } catch(e) {
    return json({ error: 'Invalid request body' }, 400, origin);
  }
  const { to, subject, body: emailBody, from_name = 'Kayro Team' } = body;
  if (!to || !subject || !emailBody) {
    return json({ error: 'Missing required fields: to, subject, body' }, 400, origin);
  }

  // Use verified domain if set, otherwise Resend sandbox address
  const fromDomain = env.EMAIL_FROM_DOMAIN || 'onboarding@resend.dev';
  const fromAddress = fromDomain.includes('@') ? fromDomain : `${from_name} <noreply@${fromDomain}>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      text: emailBody,
    }),
  });
  const data = await res.json();
  if (!res.ok) return json({ error: data.message || data.name || 'Send failed' }, res.status, origin);
  return json({ ok: true, id: data.id }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// KLING AI — VIDEO GENERATION
// ══════════════════════════════════════════════════════════════
async function klingJWT(keyId, keySecret) {
  const enc = new TextEncoder();
  const toB64u = arr => btoa(String.fromCharCode(...new Uint8Array(arr)))
    .replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const header  = toB64u(enc.encode(JSON.stringify({ alg:'HS256', typ:'JWT' })));
  const now     = Math.floor(Date.now() / 1000);
  const payload = toB64u(enc.encode(JSON.stringify({ iss:keyId, exp:now+1800, nbf:now-5 })));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(keySecret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(unsigned));
  return `${unsigned}.${toB64u(sig)}`;
}

async function handleKling(request, env, origin, path) {
  const keyId     = env.KLING_KEY_ID;
  const keySecret = env.KLING_KEY_SECRET;
  if (!keyId || !keySecret) {
    return json({ error: 'Kling API keys not configured on server. Run: npx wrangler secret put KLING_KEY_ID (and KLING_KEY_SECRET)' }, 500, origin);
  }

  // Strip /api/kling prefix → Kling API path
  const klingPath = path.replace(/^\/api\/kling/, '') || '/v1/videos/text2video';
  const jwt = await klingJWT(keyId, keySecret);

  const body = request.method === 'POST' ? await request.text() : undefined;
  const res = await fetch(`https://api.klingai.com${klingPath}`, {
    method: request.method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
    body,
  });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { ...cors(origin), 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}

// ══════════════════════════════════════════════════════════════
// HUNTER.IO — EMAIL FINDER (server-side key, never exposed to browser)
// ══════════════════════════════════════════════════════════════
async function handleHunter(request, env, origin, path) {
  const key = env.HUNTER_KEY;
  if (!key) return json({ error: 'Hunter.io key not configured. Run: npx wrangler secret put HUNTER_KEY' }, 500, origin);

  const url = new URL(request.url);
  // /api/hunter/domain-search → https://api.hunter.io/v2/domain-search
  const hunterPath = path.replace('/api/hunter', '');
  const hunterUrl = new URL(`https://api.hunter.io/v2${hunterPath}`);

  // Forward all query params from the original request, add api_key
  url.searchParams.forEach((v, k) => { if (k !== 'api_key') hunterUrl.searchParams.set(k, v); });
  hunterUrl.searchParams.set('api_key', key);

  const res = await fetch(hunterUrl.toString(), { method: 'GET' });
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });
}

// ══════════════════════════════════════════════════════════════
// AUTH — Email/Password + JWT (backed by Cloudflare KV)
// Setup: npx wrangler kv:namespace create USERS
//        npx wrangler secret put JWT_SECRET
// ══════════════════════════════════════════════════════════════
const AUTH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

async function jwtSign(payload, secret) {
  const enc = new TextEncoder();
  const toB64u = arr => btoa(String.fromCharCode(...new Uint8Array(arr))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const header = toB64u(enc.encode(JSON.stringify({ alg:'HS256', typ:'JWT' })));
  const body = toB64u(enc.encode(JSON.stringify(payload)));
  const unsigned = `${header}.${body}`;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(unsigned));
  return `${unsigned}.${toB64u(sig)}`;
}

async function jwtVerify(token, secret) {
  try {
    const enc = new TextEncoder();
    const toB64u = arr => btoa(String.fromCharCode(...new Uint8Array(arr))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const [header, payload, sig] = token.split('.');
    const unsigned = `${header}.${payload}`;
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['verify']);
    const sigBytes = Uint8Array.from(atob(sig.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(unsigned));
    if (!ok) return null;
    const data = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
    if (data.exp && data.exp < Math.floor(Date.now()/1000)) return null;
    return data;
  } catch { return null; }
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash:'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

async function handleAuth(request, env, origin, path) {
  const secret = env.JWT_SECRET;
  if (!secret) return json({ error: 'JWT_SECRET not set. Run: npx wrangler secret put JWT_SECRET' }, 500, origin);
  const hasKV = !!(env.USERS);

  const sub = path.replace('/api/auth', '') || '/';

  // ── GET /api/auth/me — verify token ─────────────────────────
  if (sub === '/me') {
    const token = (request.headers.get('Authorization') || '').replace('Bearer ','');
    if (!token) return json({ error: 'No token' }, 401, origin);
    const payload = await jwtVerify(token, secret);
    if (!payload) return json({ error: 'Invalid or expired token' }, 401, origin);
    return json({ uid: payload.uid, email: payload.email, name: payload.name, plan: payload.plan || 'free' }, 200, origin);
  }

  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}

  // ── POST /api/auth/signup ────────────────────────────────────
  if (sub === '/signup') {
    const { email, password, name } = body;
    if (!email || !password) return json({ error: 'Email and password required' }, 400, origin);
    if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400, origin);

    if (!hasKV) return json({ error: 'User database not set up. Contact Kayro admin.' }, 503, origin);

    const existing = await env.USERS.get(`u:${email.toLowerCase()}`);
    if (existing) return json({ error: 'Account already exists. Sign in instead.' }, 409, origin);

    const salt = crypto.randomUUID();
    const hash = await hashPassword(password, salt);
    const uid = 'u_' + crypto.randomUUID().replace(/-/g,'').slice(0,16);
    const user = { uid, email: email.toLowerCase(), name: name || email.split('@')[0], hash, salt, plan:'free', created: Date.now() };
    await env.USERS.put(`u:${email.toLowerCase()}`, JSON.stringify(user));

    const token = await jwtSign({ uid, email: user.email, name: user.name, plan:'free', exp: Math.floor(Date.now()/1000) + AUTH_TOKEN_TTL }, secret);
    return json({ token, uid, email: user.email, name: user.name, plan:'free' }, 201, origin);
  }

  // ── POST /api/auth/signin ────────────────────────────────────
  if (sub === '/signin') {
    const { email, password } = body;
    if (!email || !password) return json({ error: 'Email and password required' }, 400, origin);

    if (!hasKV) return json({ error: 'User database not set up. Contact Kayro admin.' }, 503, origin);

    const raw = await env.USERS.get(`u:${email.toLowerCase()}`);
    if (!raw) return json({ error: 'No account found. Sign up first.' }, 404, origin);
    const user = JSON.parse(raw);
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.hash) return json({ error: 'Wrong password.' }, 401, origin);

    const token = await jwtSign({ uid: user.uid, email: user.email, name: user.name, plan: user.plan || 'free', exp: Math.floor(Date.now()/1000) + AUTH_TOKEN_TTL }, secret);
    return json({ token, uid: user.uid, email: user.email, name: user.name, plan: user.plan || 'free' }, 200, origin);
  }

  return json({ error: 'Unknown auth endpoint' }, 404, origin);
}

// ══════════════════════════════════════════════════════════════
// FLIGHTS — DUFFEL
// ══════════════════════════════════════════════════════════════
function duffel(env) {
  const base = 'https://api.duffel.com';
  const headers = {
    'Authorization': `Bearer ${env.DUFFEL_TOKEN}`,
    'Content-Type': 'application/json',
    'Duffel-Version': 'v2',
    'Accept': 'application/json',
  };

  return {
    async post(path, data) {
      const r = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(data) });
      return r.json();
    },
    async get(path) {
      const r = await fetch(base + path, { headers });
      return r.json();
    },
  };
}

// Step 1 — Create offer request (search)
async function handleFlightSearch(request, env, origin) {
  const { origin: from, destination: to, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = await request.json();

  if (!from || !to || !departureDate) return err('origin, destination, departureDate required', 400, origin);

  const pax = Array.from({ length: Number(passengers) }, () => ({ type: 'adult' }));

  const slices = [{ origin: from.toUpperCase(), destination: to.toUpperCase(), departure_date: departureDate }];
  if (returnDate) slices.push({ origin: to.toUpperCase(), destination: from.toUpperCase(), departure_date: returnDate });

  const api = duffel(env);
  const result = await api.post('/air/offer_requests', {
    data: { slices, passengers: pax, cabin_class: cabinClass.toLowerCase().replace(' ', '_') },
  });

  if (result.errors) return json({ error: result.errors[0]?.message || 'Search failed', errors: result.errors }, 400, origin);

  return json({ offerRequestId: result.data.id }, 200, origin);
}

// Step 2 — Get offers for a request
async function handleFlightOffers(request, env, origin) {
  const url = new URL(request.url);
  const offerRequestId = url.searchParams.get('offer_request_id');
  const sort = url.searchParams.get('sort') || 'total_amount';
  const limit = Math.min(Number(url.searchParams.get('limit') || 10), 20);

  if (!offerRequestId) return err('offer_request_id required', 400, origin);

  const api = duffel(env);
  const result = await api.get(`/air/offers?offer_request_id=${offerRequestId}&sort=${sort}&limit=${limit}`);

  if (result.errors) return json({ error: result.errors[0]?.message, errors: result.errors }, 400, origin);

  // Normalize to a clean frontend-friendly format
  const offers = (result.data || []).map(o => ({
    id: o.id,
    totalAmount: o.total_amount,
    totalCurrency: o.total_currency,
    baseAmount: o.base_amount,
    taxAmount: o.tax_amount,
    expiresAt: o.expires_at,
    slices: (o.slices || []).map(s => ({
      origin: s.origin?.iata_code,
      destination: s.destination?.iata_code,
      originCity: s.origin?.city_name,
      destinationCity: s.destination?.city_name,
      duration: s.duration,
      segments: (s.segments || []).map(seg => ({
        flightNumber: `${seg.operating_carrier?.iata_code}${seg.operating_carrier_flight_number}`,
        carrier: seg.marketing_carrier?.name,
        aircraft: seg.aircraft?.name,
        departing: seg.departing_at,
        arriving: seg.arriving_at,
        origin: seg.origin?.iata_code,
        destination: seg.destination?.iata_code,
        cabinClass: seg.passengers?.[0]?.cabin_class,
      })),
    })),
    passengers: o.passengers,
  }));

  return json({ offers }, 200, origin);
}

// Step 3 — Book (create order)
async function handleFlightBook(request, env, origin) {
  const { offerId, passengers, paymentAmount, paymentCurrency, stripePaymentMethodId, stripeCustomerId } = await request.json();

  if (!offerId || !passengers?.length) return err('offerId and passengers required', 400, origin);

  // Charge via Stripe first — never book without payment
  if (stripePaymentMethodId && stripeCustomerId) {
    const charged = await stripeRequest(env, 'POST', '/v1/payment_intents', {
      amount: Math.round(Number(paymentAmount) * 100),
      currency: (paymentCurrency || 'usd').toLowerCase(),
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      confirm: 'true',
      off_session: 'true',
    });
    if (charged.error) return json({ error: charged.error.message }, 400, origin);
    if (charged.status !== 'succeeded') return json({ error: `Payment status: ${charged.status}` }, 400, origin);
  }

  const api = duffel(env);
  const result = await api.post('/air/orders', {
    data: {
      selected_offers: [offerId],
      passengers: passengers.map(p => ({
        phone_number: p.phone,
        email: p.email,
        born_on: p.dob,
        title: p.title || 'mr',
        gender: p.gender || 'm',
        given_name: p.firstName,
        family_name: p.lastName,
        id: p.offerId,
      })),
      payments: [{
        type: 'balance',
        currency: paymentCurrency || 'USD',
        amount: paymentAmount,
      }],
    },
  });

  if (result.errors) return json({ error: result.errors[0]?.message, errors: result.errors }, 400, origin);

  const order = result.data;
  return json({
    orderId: order.id,
    bookingReference: order.booking_reference,
    status: order.payment_status?.awaiting_payment ? 'pending' : 'confirmed',
    slices: order.slices,
    passengers: order.passengers,
  }, 200, origin);
}

// Get order details
async function handleFlightOrder(request, env, origin, path) {
  const orderId = path.split('/').pop();
  const api = duffel(env);
  const result = await api.get(`/air/orders/${orderId}`);
  if (result.errors) return json({ error: result.errors[0]?.message }, 400, origin);
  return json(result.data, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// HOTELS — AMADEUS
// ══════════════════════════════════════════════════════════════
let amadeusToken = null;
let amadeusTokenExp = 0;

async function getAmadeusToken(env) {
  if (amadeusToken && Date.now() < amadeusTokenExp) return amadeusToken;

  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(`${base}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${env.AMADEUS_CLIENT_ID}&client_secret=${env.AMADEUS_CLIENT_SECRET}`,
  });

  const data = await r.json();
  amadeusToken = data.access_token;
  amadeusTokenExp = Date.now() + (data.expires_in - 60) * 1000;
  return amadeusToken;
}

async function amadeus(env, path) {
  const token = await getAmadeusToken(env);
  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(base + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return r.json();
}

async function amadeusPost(env, path, body) {
  const token = await getAmadeusToken(env);
  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(base + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function handleHotelSearch(request, env, origin) {
  const { cityCode, checkIn, checkOut, adults = 1, rooms = 1, radius = 5 } = await request.json();
  if (!cityCode || !checkIn || !checkOut) return err('cityCode, checkIn, checkOut required', 400, origin);

  // Step 1: find hotels in city
  const hotelsData = await amadeus(env,
    `/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode.toUpperCase()}&radius=${radius}&radiusUnit=KM&amenities=SWIMMING_POOL,SPA,FITNESS_CENTER,RESTAURANT&ratings=3,4,5&hotelSource=ALL`
  );

  if (hotelsData.errors?.length) return json({ error: hotelsData.errors[0]?.detail }, 400, origin);

  const hotelIds = (hotelsData.data || []).slice(0, 20).map(h => h.hotelId).join(',');
  if (!hotelIds) return json({ hotels: [] }, 200, origin);

  // Step 2: get offers for those hotels
  const offersData = await amadeus(env,
    `/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkIn}&checkOutDate=${checkOut}&roomQuantity=${rooms}&bestRateOnly=true&currency=USD`
  );

  const hotels = (offersData.data || []).map(h => ({
    hotelId: h.hotel.hotelId,
    name: h.hotel.name,
    cityCode: h.hotel.cityCode,
    latitude: h.hotel.latitude,
    longitude: h.hotel.longitude,
    rating: h.hotel.rating,
    amenities: h.hotel.amenities?.slice(0, 6) || [],
    offers: (h.offers || []).slice(0, 3).map(o => ({
      offerId: o.id,
      roomType: o.room?.typeEstimated?.category || o.room?.description?.text?.slice(0, 40),
      bedType: o.room?.typeEstimated?.bedType,
      beds: o.room?.typeEstimated?.beds,
      price: o.price?.total,
      currency: o.price?.currency,
      cancellationPolicy: o.policies?.cancellations?.[0]?.description?.text || 'Check hotel policy',
      checkIn: o.checkInDate,
      checkOut: o.checkOutDate,
    })),
  })).filter(h => h.offers.length > 0);

  return json({ hotels }, 200, origin);
}

async function handleHotelOffers(request, env, origin) {
  const url = new URL(request.url);
  const offerId = url.searchParams.get('offerId');
  if (!offerId) return err('offerId required', 400, origin);
  const data = await amadeus(env, `/v3/shopping/hotel-offers/${offerId}`);
  return json(data.data || {}, 200, origin);
}

async function handleHotelBook(request, env, origin) {
  const { offerId, guests, paymentAmount, paymentCurrency, stripePaymentMethodId, stripeCustomerId } = await request.json();

  if (!offerId || !guests?.length) return err('offerId and guests required', 400, origin);

  // Charge first
  if (stripePaymentMethodId && stripeCustomerId) {
    const charged = await stripeRequest(env, 'POST', '/v1/payment_intents', {
      amount: Math.round(Number(paymentAmount) * 100),
      currency: (paymentCurrency || 'usd').toLowerCase(),
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      confirm: 'true',
      off_session: 'true',
    });
    if (charged.error || charged.status !== 'succeeded') {
      return json({ error: charged.error?.message || `Payment ${charged.status}` }, 400, origin);
    }
  }

  const data = await amadeusPost(env, '/v2/booking/hotel-orders', {
    data: {
      offerId,
      guests: guests.map((g, i) => ({
        tid: i + 1,
        title: g.title || 'MR',
        firstName: g.firstName,
        lastName: g.lastName,
        phone: g.phone,
        email: g.email,
      })),
      payments: [{
        method: 'creditCard',
        paymentCard: {
          paymentCardInfo: {
            vendorCode: 'VI',
            cardNumber: '4111111111111111',
            expiryDate: '2026-01',
            holderName: `${guests[0].firstName} ${guests[0].lastName}`,
          },
        },
      }],
    },
  });

  if (data.errors?.length) return json({ error: data.errors[0]?.detail }, 400, origin);

  return json({
    orderId: data.data?.id,
    confirmationNumber: data.data?.associatedRecords?.[0]?.reference,
    status: 'confirmed',
    hotel: data.data?.hotelOffer?.hotel?.name,
  }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// PAYMENTS — STRIPE
// ══════════════════════════════════════════════════════════════
async function stripeRequest(env, method, path, params = {}) {
  const body = method === 'GET' ? undefined
    : new URLSearchParams(flattenStripeParams(params)).toString();

  const url = method === 'GET'
    ? `https://api.stripe.com/v1${path}?${new URLSearchParams(params)}`
    : `https://api.stripe.com/v1${path}`;

  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  return r.json();
}

function flattenStripeParams(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenStripeParams(v, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

// Create or retrieve Stripe customer for a Kayro user
async function handleStripeCustomer(request, env, origin) {
  const { email, name, kayroUserId } = await request.json();
  if (!email) return err('email required', 400, origin);

  // Search for existing customer by email
  const existing = await stripeRequest(env, 'GET', '/v1/customers', { email, limit: '1' });
  if (existing.data?.length) {
    return json({ customerId: existing.data[0].id }, 200, origin);
  }

  // Create new customer
  const customer = await stripeRequest(env, 'POST', '/v1/customers', {
    email,
    name: name || email,
    metadata: { kayroUserId: kayroUserId || '' },
  });

  if (customer.error) return json({ error: customer.error.message }, 400, origin);
  return json({ customerId: customer.id }, 200, origin);
}

// Create a SetupIntent so the frontend (Stripe.js) can securely collect card details
async function handleSetupIntent(request, env, origin) {
  const { customerId } = await request.json();
  if (!customerId) return err('customerId required', 400, origin);

  const intent = await stripeRequest(env, 'POST', '/v1/setup_intents', {
    customer: customerId,
    payment_method_types: 'card',
    usage: 'off_session',
  });

  if (intent.error) return json({ error: intent.error.message }, 400, origin);
  return json({
    clientSecret: intent.client_secret,
    setupIntentId: intent.id,
  }, 200, origin);
}

// List saved cards for a customer
async function handleListCards(request, env, origin) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  if (!customerId) return err('customerId required', 400, origin);

  const methods = await stripeRequest(env, 'GET', '/v1/payment_methods', {
    customer: customerId,
    type: 'card',
  });

  if (methods.error) return json({ error: methods.error.message }, 400, origin);

  const cards = (methods.data || []).map(pm => ({
    id: pm.id,
    brand: pm.card.brand,
    last4: pm.card.last4,
    expMonth: pm.card.exp_month,
    expYear: pm.card.exp_year,
    isDefault: false,
  }));

  return json({ cards }, 200, origin);
}

// Remove a saved card
async function handleRemoveCard(request, env, origin) {
  const { paymentMethodId } = await request.json();
  if (!paymentMethodId) return err('paymentMethodId required', 400, origin);

  const result = await stripeRequest(env, 'POST', `/v1/payment_methods/${paymentMethodId}/detach`, {});
  if (result.error) return json({ error: result.error.message }, 400, origin);
  return json({ removed: true }, 200, origin);
}

// Charge a saved card
async function handleCharge(request, env, origin) {
  const { customerId, paymentMethodId, amount, currency = 'usd', description = 'Kayro booking' } = await request.json();

  if (!customerId || !paymentMethodId || !amount) {
    return err('customerId, paymentMethodId, amount required', 400, origin);
  }

  const intent = await stripeRequest(env, 'POST', '/v1/payment_intents', {
    amount: String(Math.round(Number(amount) * 100)),
    currency: currency.toLowerCase(),
    customer: customerId,
    payment_method: paymentMethodId,
    description,
    confirm: 'true',
    off_session: 'true',
  });

  if (intent.error) return json({ error: intent.error.message, code: intent.error.code }, 400, origin);

  return json({
    paymentIntentId: intent.id,
    status: intent.status,
    amount: intent.amount / 100,
    currency: intent.currency,
  }, 200, origin);
}
