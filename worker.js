/**
 * Kayro Interactive — Cloudflare Worker Backend
 * Handles: AI proxy, flight search/booking (Duffel), hotel search (Amadeus), payments (Stripe)
 * Deploy: wrangler deploy
 */

const ALLOWED_ORIGINS = [
  'https://kayrointer.com',
  'https://www.kayrointer.com',
];

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
    'Access-Control-Allow-Credentials': 'true',
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
      // agent_* models (Claude Platform Agents) must always go to Anthropic directly
      if (path === '/api/ai') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        const limitMsg = await checkUsageLimits(env, authR.session.uid, authR.session.plan);
        if (limitMsg) return json({ error: limitMsg }, 402, origin);
        await recordUsage(env, authR.session.uid);

        // HIGH-1: enforce model allowlist per plan
        const cloned = request.clone();
        let bodyPeeked;
        try { bodyPeeked = await cloned.json(); } catch (_) {}
        if (bodyPeeked) {
          const model = String(bodyPeeked.model || 'claude-sonnet-4-6');
          const effectivePlan = authR.session.email === ADMIN_EMAIL ? 'enterprise' : (authR.session.plan || 'free');
          const allowed = PLAN_ALLOWED_MODELS[effectivePlan];
          if (allowed && !model.startsWith('agent_') && !allowed.has(model)) {
            if (!model.includes('opus') && effectivePlan === 'free') {
              // Free plan: silently fall back to Haiku so the user gets a real response.
              // Opus is still hard-blocked (cost too high to absorb).
              bodyPeeked.model = 'claude-haiku-4-5-20251001';
              request = new Request(request.url, {
                method: request.method,
                headers: request.headers,
                body: JSON.stringify(bodyPeeked),
              });
            } else {
              const isOpus = model.includes('opus');
              const hint = isOpus ? 'Scale or Enterprise' : 'Growth or higher';
              return json({ error: `PLAN_GATE:${effectivePlan}:${model}:Upgrade to ${hint} to use this model.` }, 403, origin);
            }
          }
        }

        let useAI = handleAI;
        if (env.AWS_ACCESS_KEY_ID && bodyPeeked && !String(bodyPeeked.model || '').startsWith('agent_')) {
          useAI = handleAIBedrock;
        }
        return useAI(request, env, origin, authR.session.uid);
      }
      if (path === '/api/agent/session') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleAgentSession(request, env, origin);
      }
      if (path === '/api/agent/turn') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        const limitMsg = await checkUsageLimits(env, authR.session.uid, authR.session.plan);
        if (limitMsg) return json({ error: limitMsg }, 402, origin);
        await recordUsage(env, authR.session.uid);
        return handleAgentTurn(request, env, origin, authR.session.uid);
      }
      if (path === '/api/ping')                return handlePing(request, env, origin);

      // CRITICAL-5: email relay requires auth + rate limit
      if (path === '/api/send-email') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rlWait = await rlCheck(env, 'email', ip);
        if (rlWait !== null) return json({ error: `Too many emails. Try again in ${Math.ceil(rlWait/60)} minute(s).` }, 429, origin);
        await rlRecord(env, 'email', ip);
        return handleSendEmail(request, env, origin, authR.session);
      }

      // HIGH-3: Hunter proxy requires auth + per-user daily quota
      if (path.startsWith('/api/hunter')) {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleHunter(request, env, origin, path, authR.session);
      }

      // CRITICAL-6: Tavily proxy — key stays server-side, quota enforced in KV
      if (path === '/api/search') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleSearch(request, env, origin, authR.session);
      }
      if (path.startsWith('/api/auth'))       return handleAuth(request, env, origin, path);
      if (path === '/api/usage/me')            return handleUsageMe(request, env, origin);
      if (path === '/api/admin/usage')         return handleAdminUsage(request, env, origin);
      if (path === '/api/enterprise-lead') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rlWait = await rlCheck(env, 'lead', ip);
        if (rlWait !== null) return json({ error: `Too many requests. Try again in ${Math.ceil(rlWait/60)} minute(s).` }, 429, origin);
        await rlRecord(env, 'lead', ip);
        return handleEnterpriseLead(request, env, origin);
      }

      // Flights (Duffel) — all endpoints require a valid session
      if (path === '/api/flights/search') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleFlightSearch(request, env, origin);
      }
      if (path === '/api/flights/offers') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleFlightOffers(request, env, origin);
      }
      if (path === '/api/flights/book') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleFlightBook(request, env, origin);
      }
      if (path.startsWith('/api/flights/order/')) {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleFlightOrder(request, env, origin, path);
      }

      // Hotels (Amadeus) — all endpoints require a valid session
      if (path === '/api/hotels/search') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleHotelSearch(request, env, origin);
      }
      if (path === '/api/hotels/offers') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleHotelOffers(request, env, origin);
      }
      if (path === '/api/hotels/book') {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        return handleHotelBook(request, env, origin);
      }

      // Payments (Stripe) — CRITICAL-2: all require auth
      if (path.startsWith('/api/payments/')) {
        const authR = await requireSession(request, env, origin);
        if (!authR.ok) return authR.response;
        if (path === '/api/payments/customer') return handleStripeCustomer(request, env, origin, authR.session);
        if (path === '/api/payments/setup')    return handleSetupIntent(request, env, origin, authR.session);
        if (path === '/api/payments/methods')  return handleListCards(request, env, origin, authR.session);
        if (path === '/api/payments/remove')   return handleRemoveCard(request, env, origin, authR.session);
        if (path === '/api/payments/charge')   return handleCharge(request, env, origin, authR.session);
      }

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
// MODEL COST RATES — $/M tokens (Anthropic list price, verify at anthropic.com/pricing)
// ══════════════════════════════════════════════════════════════
const MODEL_COSTS = {
  'claude-opus-4-7':            { input: 15.00, output: 75.00 },
  'claude-opus-4-6':            { input: 15.00, output: 75.00 },
  'claude-sonnet-4-6':          { input:  3.00, output: 15.00 },
  'claude-sonnet-4-5':          { input:  3.00, output: 15.00 },
  'claude-haiku-4-5-20251001':  { input:  0.80, output:  4.00 },
  'claude-haiku-4-5':           { input:  0.80, output:  4.00 },
  'claude-3-5-sonnet-20241022': { input:  3.00, output: 15.00 },
  'claude-3-5-haiku-20241022':  { input:  0.80, output:  4.00 },
  'claude-3-haiku-20240307':    { input:  0.25, output:  1.25 },
};
const RESALE_RATE = 18.00; // $/M tokens — what you charge users
const ADMIN_EMAIL  = 'obaalbaki11@gmail.com'; // owner always gets enterprise access

// HIGH-1: Per-plan model allowlist. null = all models allowed.
const PLAN_ALLOWED_MODELS = {
  free:       new Set(['claude-haiku-4-5-20251001','claude-haiku-4-5','claude-3-haiku-20240307','claude-3-5-haiku-20241022']),
  growth:     new Set(['claude-haiku-4-5-20251001','claude-haiku-4-5','claude-3-haiku-20240307','claude-3-5-haiku-20241022','claude-sonnet-4-6','claude-sonnet-4-5','claude-3-5-sonnet-20241022']),
  scale:      null,
  enterprise: null,
};

function modelCostUSD(model, inputTokens, outputTokens) {
  const rates = MODEL_COSTS[model] || MODEL_COSTS['claude-sonnet-4-6'];
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
}

// Records per-user and global token usage to KV
async function recordTokenUsage(env, uid, model, inputTokens, outputTokens) {
  if (!env.USERS || !uid) return;
  const date = todayKey();
  const cost = modelCostUSD(model, inputTokens, outputTokens);
  const revenue = ((inputTokens + outputTokens) / 1_000_000) * RESALE_RATE;

  // Per-user daily detail
  const key = `tokens:${uid}:${date}`;
  const raw = (await env.USERS.get(key, { type: 'json' })) ||
    { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0, revenueUSD: 0, models: {} };
  raw.calls++;
  raw.inputTokens += inputTokens;
  raw.outputTokens += outputTokens;
  raw.costUSD      = parseFloat(((raw.costUSD || 0)    + cost).toFixed(8));
  raw.revenueUSD   = parseFloat(((raw.revenueUSD || 0) + revenue).toFixed(8));
  const m = raw.models[model] || { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0 };
  m.calls++; m.inputTokens += inputTokens; m.outputTokens += outputTokens;
  m.costUSD = parseFloat(((m.costUSD || 0) + cost).toFixed(8));
  raw.models[model] = m;
  await env.USERS.put(key, JSON.stringify(raw), { expirationTtl: 90 * 24 * 60 * 60 });

  // Global daily aggregate (best-effort; race conditions are acceptable for analytics)
  const gKey = `tokens:global:${date}`;
  const g = (await env.USERS.get(gKey, { type: 'json' })) ||
    { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0, revenueUSD: 0, models: {} };
  g.calls++; g.inputTokens += inputTokens; g.outputTokens += outputTokens;
  g.costUSD    = parseFloat(((g.costUSD || 0)    + cost).toFixed(8));
  g.revenueUSD = parseFloat(((g.revenueUSD || 0) + revenue).toFixed(8));
  const gm = g.models[model] || { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0 };
  gm.calls++; gm.inputTokens += inputTokens; gm.outputTokens += outputTokens;
  gm.costUSD = parseFloat(((gm.costUSD || 0) + cost).toFixed(8));
  g.models[model] = gm;
  await env.USERS.put(gKey, JSON.stringify(g), { expirationTtl: 90 * 24 * 60 * 60 });
}

// TransformStream that taps the Anthropic SSE to extract token counts without blocking the response
function makeUsageTapper(env, uid, model) {
  let buf = '';
  let inputTokens = 0, outputTokens = 0;
  const dec = new TextDecoder();
  return new TransformStream({
    transform(chunk, controller) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop(); // keep any incomplete line
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const ev = JSON.parse(line.slice(6));
          if (ev.type === 'message_start' && ev.message?.usage?.input_tokens) {
            inputTokens = ev.message.usage.input_tokens;
          } else if (ev.type === 'message_delta' && ev.usage?.output_tokens) {
            outputTokens = ev.usage.output_tokens;
          }
        } catch {}
      }
      controller.enqueue(chunk);
    },
    flush() {
      if ((inputTokens || outputTokens) && uid) {
        recordTokenUsage(env, uid, model, inputTokens, outputTokens).catch(() => {});
      }
    },
  });
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

async function handleAIBedrock(request, env, origin, uid = null) {
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

  // Record token usage (Bedrock returns full counts in the response JSON)
  if (data.usage && uid) {
    recordTokenUsage(env, uid, anthropicModel, data.usage.input_tokens || 0, data.usage.output_tokens || 0).catch(() => {});
  }

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
async function handleAI(request, env, origin, uid = null) {
  const key = env.ANTHROPIC_KEY || env.ANTHROPIC_API_KEY;
  if (!key) {
    return json({ error: { message: 'Anthropic API key not set. Run: npx wrangler secret put ANTHROPIC_KEY — then paste your sk-ant- key.' } }, 500, origin);
  }

  let bodyObj;
  try { bodyObj = JSON.parse(await request.text()); } catch(e) {
    return json({ error: { message: 'Invalid request body' } }, 400, origin);
  }

  const wasStream = bodyObj.stream === true;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(bodyObj),
    signal: AbortSignal.timeout(120000),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errBody;
    try { errBody = JSON.parse(errText); } catch { errBody = { error: { message: errText } }; }
    // Surface rate-limit info clearly
    if (res.status === 429) errBody.error = { message: 'Rate limit hit — add AWS Bedrock creds to bypass, or wait a moment.' };
    return new Response(JSON.stringify(errBody), {
      status: res.status,
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
    });
  }

  // Streaming: tap SSE to extract token counts, then proxy to client
  if (wasStream) {
    const model = bodyObj.model || 'claude-sonnet-4-6';
    const tapper = makeUsageTapper(env, uid, model);
    return new Response(res.body.pipeThrough(tapper), {
      status: 200,
      headers: { ...cors(origin), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
    });
  }

  // Non-streaming: extract token counts from response and record
  const responseData = await res.json();
  if (responseData.usage && uid) {
    const model = bodyObj.model || 'claude-sonnet-4-6';
    recordTokenUsage(env, uid, model, responseData.usage.input_tokens || 0, responseData.usage.output_tokens || 0).catch(() => {});
  }
  return json(responseData, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// MANAGED AGENTS — SESSIONS API
// ══════════════════════════════════════════════════════════════
const AGENT_BETA = 'managed-agents-2026-04-01';
const AGENT_ENV_ID = 'env_01SRmdRthMHQsJpVQaEXKqe3';

async function handleAgentSession(request, env, origin) {
  const key = env.ANTHROPIC_KEY || env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: 'No Anthropic API key configured' }, 500, origin);
  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}
  const { agent_id } = body;
  if (!agent_id) return json({ error: 'agent_id required' }, 400, origin);

  const res = await fetch(`https://api.anthropic.com/v1/sessions?beta=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': AGENT_BETA,
    },
    body: JSON.stringify({
      agent: { type: 'agent', id: agent_id },
      environment_id: AGENT_ENV_ID,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const t = await res.text();
    return new Response(t, { status: res.status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });
  }
  return json(await res.json(), 200, origin);
}

async function handleAgentTurn(request, env, origin, uid) {
  const key = env.ANTHROPIC_KEY || env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: 'No Anthropic API key configured' }, 500, origin);
  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}
  const { session_id, messages, model } = body;
  if (!session_id || !messages) return json({ error: 'session_id and messages required' }, 400, origin);

  // Estimate input tokens from the messages payload (chars / 4)
  const estInputTokens = Math.round(JSON.stringify(messages).length / 4);

  const agentHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': AGENT_BETA,
  };

  // Convert messages → events format expected by Sessions API
  const events = messages.map(msg => ({
    type: 'user.message',
    content: typeof msg.content === 'string'
      ? [{ type: 'text', text: msg.content }]
      : msg.content,
  }));

  // 1. Establish the SSE stream connection first (await headers so the TCP socket is open)
  const streamRes = await fetch(`https://api.anthropic.com/v1/sessions/${session_id}/events/stream?beta=true`, {
    method: 'GET',
    headers: { ...agentHeaders, 'Accept': 'text/event-stream' },
    signal: AbortSignal.timeout(120000),
  });

  if (!streamRes.ok) {
    const t = await streamRes.text();
    return new Response(t, { status: streamRes.status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });
  }

  // 2. Now send the user event — stream is already connected, won't miss the response
  const sendRes = await fetch(`https://api.anthropic.com/v1/sessions/${session_id}/events?beta=true`, {
    method: 'POST',
    headers: agentHeaders,
    body: JSON.stringify({ events }),
    signal: AbortSignal.timeout(30000),
  });

  if (!sendRes.ok) {
    const t = await sendRes.text();
    return new Response(t, { status: sendRes.status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });
  }

  // 3. Pipe the stream with a tapper that estimates output tokens from agent.message text content.
  //    These are labeled (~est) in the dashboard since char/4 is an approximation, not Sessions API usage events.
  let estOutputChars = 0;
  const dec = new TextDecoder();
  const estModelKey = `${model || 'agent_session'} (~est)`;
  const tapper = new TransformStream({
    transform(chunk, ctrl) {
      const text = dec.decode(chunk, { stream: true });
      // Parse agent.message SSE events to count actual output text characters
      for (const line of text.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const ev = JSON.parse(line.slice(6));
          if (ev.content) {
            for (const block of ev.content) {
              if (block.type === 'text') estOutputChars += (block.text || '').length;
            }
          }
        } catch {}
      }
      ctrl.enqueue(chunk);
    },
    flush() {
      if (uid) {
        const estOutput = Math.max(1, Math.round(estOutputChars / 4));
        recordTokenUsage(env, uid, estModelKey, estInputTokens, estOutput).catch(() => {});
      }
    },
  });

  return new Response(streamRes.body.pipeThrough(tapper), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
  });
}

// ══════════════════════════════════════════════════════════════
// USAGE ENDPOINTS
// ══════════════════════════════════════════════════════════════

// GET /api/usage/me — authenticated user's own token usage for a given date
async function handleUsageMe(request, env, origin) {
  const authR = await requireSession(request, env, origin);
  if (!authR.ok) return authR.response;
  if (!env.USERS) return json({ error: 'Usage tracking not available (KV not configured)' }, 503, origin);

  const url = new URL(request.url);
  const date = url.searchParams.get('date') || todayKey();
  const uid  = authR.session.uid;

  const [tokenData, msgData] = await Promise.all([
    env.USERS.get(`tokens:${uid}:${date}`, { type: 'json' }),
    env.USERS.get(`usage:${uid}:${date}`,  { type: 'json' }),
  ]);

  const plan  = authR.session.plan || 'free';
  const limit = (PLAN_LIMITS[plan] || PLAN_LIMITS.free).messages;
  const t = tokenData || { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0, revenueUSD: 0, models: {} };
  const marginUSD = parseFloat(((t.revenueUSD || 0) - (t.costUSD || 0)).toFixed(8));

  return json({
    date, uid, plan, dailyMsgLimit: limit,
    messages:    (msgData || {}).messages || 0,
    calls:       t.calls,
    inputTokens: t.inputTokens,
    outputTokens: t.outputTokens,
    totalTokens: t.inputTokens + t.outputTokens,
    costUSD:     t.costUSD,
    revenueUSD:  t.revenueUSD,
    marginUSD,
    marginPct:   t.costUSD > 0 ? parseFloat(((marginUSD / t.revenueUSD) * 100).toFixed(1)) : null,
    models:      t.models,
  }, 200, origin);
}

// GET /api/admin/usage — admin-only global usage dashboard (gated to owner email)
// Optional: ?date=YYYYMMDD for a specific day, defaults to today
// Returns today's global aggregate + last 7 days
async function handleAdminUsage(request, env, origin) {
  const authR = await requireSession(request, env, origin);
  if (!authR.ok) return authR.response;
  if (authR.session.email !== ADMIN_EMAIL) return json({ error: 'Forbidden' }, 403, origin);
  if (!env.USERS) return json({ error: 'KV not configured' }, 503, origin);

  const url  = new URL(request.url);
  const date = url.searchParams.get('date') || todayKey();

  // Fetch last 7 days of global aggregates in parallel
  const dateKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  });
  const rows = await Promise.all(
    dateKeys.map(dk => env.USERS.get(`tokens:global:${dk}`, { type: 'json' })
      .then(v => ({ date: dk, ...(v || { calls: 0, inputTokens: 0, outputTokens: 0, costUSD: 0, revenueUSD: 0 }) })))
  );

  const today = rows[0];
  const marginUSD = parseFloat(((today.revenueUSD || 0) - (today.costUSD || 0)).toFixed(6));
  const blendedCostPerM = today.inputTokens + today.outputTokens > 0
    ? parseFloat(((today.costUSD / ((today.inputTokens + today.outputTokens) / 1_000_000))).toFixed(2))
    : 0;

  return json({
    today: {
      ...today,
      marginUSD,
      marginPct: today.costUSD > 0 ? parseFloat(((marginUSD / (today.revenueUSD || 1)) * 100).toFixed(1)) : null,
      blendedCostPerMTokens: blendedCostPerM,
      resalePricePerMTokens: RESALE_RATE,
    },
    last7Days: rows,
    modelRates: MODEL_COSTS,
    resaleRate: RESALE_RATE,
  }, 200, origin);
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
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json();
  if (res.ok) return json({ ok: true, status: res.status }, 200, origin);
  return json({ ok: false, status: res.status, raw: body }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// ENTERPRISE LEAD CAPTURE
// ══════════════════════════════════════════════════════════════
async function handleEnterpriseLead(request, env, origin) {
  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}
  const { name, company, need, email: contactEmail } = body;
  if (!name || !company) return json({ error: 'name and company are required' }, 400, origin);

  const leadId = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const lead = { id: leadId, name, company, need: need || '', contactEmail: contactEmail || '', submittedAt: new Date().toISOString() };

  // Persist to KV so no lead is lost even if email fails
  if (env.USERS) {
    await env.USERS.put(`lead:${leadId}`, JSON.stringify(lead), { expirationTtl: 365 * 24 * 60 * 60 });
  }

  // Notify via Resend — fire-and-forget, non-blocking
  if (env.RESEND_KEY) {
    const fromAddr = env.EMAIL_FROM_DOMAIN
      ? (env.EMAIL_FROM_DOMAIN.includes('@') ? env.EMAIL_FROM_DOMAIN : `Kayro HQ <noreply@${env.EMAIL_FROM_DOMAIN}>`)
      : 'onboarding@resend.dev';
    const text = `New Enterprise inquiry — Kayro Interactive\n\nName: ${name}\nCompany: ${company}\nContact email: ${contactEmail || '(not provided)'}\nWhat they need:\n${need || '(not specified)'}\n\nSubmitted: ${lead.submittedAt}\nLead ID: ${leadId}`;
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddr, to: ['obaalbaki11@gmail.com'], subject: `🏢 Enterprise Lead: ${company} — ${name}`, text }),
      signal: AbortSignal.timeout(15000),
    }).catch(() => {});
  }

  return json({ ok: true, leadId }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// SEND EMAIL — RESEND
// ══════════════════════════════════════════════════════════════
const EMAIL_USER_DAILY = 20;

async function handleSendEmail(request, env, origin, session = null) {
  const key = env.RESEND_KEY;
  if (!key) {
    return json({ error: 'Email sending not configured. Run: npx wrangler secret put RESEND_KEY — get your free key at resend.com' }, 500, origin);
  }

  // Per-user daily cap (optimistic increment before send — failed sends still count)
  if (session?.uid && env.USERS) {
    const dayKey = `email:${session.uid}:${todayKey()}`;
    const raw  = await env.USERS.get(dayKey, { type: 'json' });
    const used = (raw || {}).count || 0;
    if (used >= EMAIL_USER_DAILY) return json({ error: `Daily email limit reached (${EMAIL_USER_DAILY}/day).` }, 429, origin);
    await env.USERS.put(dayKey, JSON.stringify({ count: used + 1 }), { expirationTtl: 2 * 24 * 60 * 60 });
  }

  let body;
  try { body = JSON.parse(await request.text()); } catch(e) {
    return json({ error: 'Invalid request body' }, 400, origin);
  }
  const { to, subject, body: emailBody, from_name = 'Kayro Team' } = body;
  if (!to || !subject || !emailBody) {
    return json({ error: 'Missing required fields: to, subject, body' }, 400, origin);
  }

  const fromDomain = env.EMAIL_FROM_DOMAIN || 'onboarding@resend.dev';
  const fromAddress = fromDomain.includes('@') ? fromDomain : `${from_name} <noreply@${fromDomain}>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromAddress, to: [to], subject, text: emailBody }),
    signal: AbortSignal.timeout(15000),
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) return json({ error: data.message || data.name || 'Send failed' }, res.status, origin);
  return json({ ok: true, id: data.id }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// HUNTER.IO — EMAIL FINDER (server-side key, never exposed to browser)
// ══════════════════════════════════════════════════════════════
async function handleHunter(request, env, origin, path, session) {
  const key = env.HUNTER_KEY;
  if (!key) return json({ error: 'Hunter.io key not configured. Run: npx wrangler secret put HUNTER_KEY' }, 500, origin);

  const plan  = session?.plan || 'free';
  const limit = HUNTER_LIMITS[plan] ?? 0;
  if (limit === 0) return json({ error: 'Email finder not available on your plan.' }, 403, origin);

  if (session?.uid && env.USERS) {
    const dayKey = `hunter:${session.uid}:${todayKey()}`;
    const raw  = await env.USERS.get(dayKey, { type: 'json' });
    const used = (raw || {}).count || 0;
    if (used >= limit) return json({ error: `Daily Hunter quota reached (${limit}/day on ${plan} plan).`, quota: { used, limit } }, 429, origin);
    await env.USERS.put(dayKey, JSON.stringify({ count: used + 1 }), { expirationTtl: 2 * 24 * 60 * 60 });
  }

  const url       = new URL(request.url);
  const hunterPath = path.replace('/api/hunter', '');
  const hunterUrl  = new URL(`https://api.hunter.io/v2${hunterPath}`);
  url.searchParams.forEach((v, k) => { if (k !== 'api_key') hunterUrl.searchParams.set(k, v); });
  hunterUrl.searchParams.set('api_key', key);

  let res;
  try {
    res = await fetch(hunterUrl.toString(), { method: 'GET', signal: AbortSignal.timeout(15000) });
  } catch {
    return json({ error: 'Hunter.io request timed out or failed.' }, 502, origin);
  }
  const data = await res.text();
  return new Response(data, { status: res.status, headers: { ...cors(origin), 'Content-Type': 'application/json' } });
}

// ══════════════════════════════════════════════════════════════
// SEARCH — Tavily proxy (CRITICAL-6: key never reaches browser)
// ══════════════════════════════════════════════════════════════
const SEARCH_LIMITS = {
  free:       0,
  growth:     5,
  scale:      15,
  enterprise: 30,
};

const HUNTER_LIMITS = {
  free:       0,
  growth:     10,
  scale:      50,
  enterprise: 200,
};

async function handleSearch(request, env, origin, session) {
  if (!env.TAVILY_KEY) return json({ error: 'Search not configured.' }, 500, origin);

  let _body;
  try { _body = await request.json(); } catch { return err('query required', 400, origin); }
  const { query, max_results = 5 } = _body;
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return err('query required', 400, origin);
  }

  const plan  = session.plan || 'free';
  const limit = SEARCH_LIMITS[plan] ?? 0;
  if (limit === 0) return json({ error: 'Web search not available on your plan.' }, 403, origin);

  const uid    = session.uid;
  const dayKey = `search:${uid}:${todayKey()}`;
  const raw    = env.USERS ? await env.USERS.get(dayKey, { type: 'json' }) : null;
  const used   = (raw || {}).count || 0;

  if (used >= limit) {
    return json({ error: `Daily search quota reached (${limit}/day on ${plan} plan).`, quota: { used, limit } }, 429, origin);
  }

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      api_key: env.TAVILY_KEY,
      query: query.trim(),
      max_results: Math.min(Number(max_results) || 5, 10),
      include_answer: false,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    return json({ error: `Search failed: ${res.status}`, detail: txt }, 502, origin);
  }

  const data = await res.json();

  if (env.USERS) {
    await env.USERS.put(dayKey, JSON.stringify({ count: used + 1 }), { expirationTtl: 2 * 24 * 60 * 60 });
  }

  return json({ results: data.results || [], quota: { used: used + 1, limit } }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// AUTH — Email/Password + JWT (backed by Cloudflare KV)
// Setup: npx wrangler kv:namespace create USERS
//        npx wrangler secret put JWT_SECRET
// ══════════════════════════════════════════════════════════════
const AUTH_TOKEN_TTL   = 30 * 24 * 60 * 60; // 30 days  — KV-backed Worker JWTs (email/password)
const AUTH_SESSION_TTL = 24 * 60 * 60;        // 24 hours — httpOnly session cookies (all auth paths)

// Daily message caps per plan (server-side source of truth for C4)
const PLAN_LIMITS = {
  free:       { messages: 10  },
  growth:     { messages: 25  },
  scale:      { messages: 80  },
  enterprise: { messages: Infinity },
};

function parseCookie(header, name) {
  if (!header) return null;
  const entry = header.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return entry ? entry.slice(name.length + 1) : null;
}

function sessionCookie(token, clear = false) {
  return [
    `kayro_session=${clear ? '' : token}`,
    'HttpOnly', 'Secure', 'SameSite=None', 'Path=/',
    clear ? 'Max-Age=0' : `Max-Age=${AUTH_SESSION_TTL}`,
  ].join('; ');
}

// Returns { ok: true, session } or { ok: false, response } — never throws
async function requireSession(request, env, origin) {
  if (!env.JWT_SECRET) return { ok: false, response: json({ error: 'Server misconfigured.' }, 500, origin) };
  const token = parseCookie(request.headers.get('Cookie'), 'kayro_session');
  if (!token) return { ok: false, response: json({ error: 'Authentication required.' }, 401, origin) };
  const payload = await jwtVerify(token, env.JWT_SECRET);
  if (!payload) return { ok: false, response: json({ error: 'Session expired. Please sign in again.' }, 401, origin) };
  return { ok: true, session: payload };
}

function todayKey() { return new Date().toISOString().slice(0, 10).replace(/-/g, ''); }

async function checkUsageLimits(env, uid, plan) {
  const limit = (PLAN_LIMITS[plan] || PLAN_LIMITS.free).messages;
  if (limit === Infinity || !env.USERS) return null;
  const raw = await env.USERS.get(`usage:${uid}:${todayKey()}`, { type: 'json' });
  const used = (raw || {}).messages || 0;
  if (used >= limit) return `DAILY_CAP_REACHED:${plan || 'free'}:${limit}`;
  return null;
}

async function recordUsage(env, uid) {
  if (!env.USERS) return;
  const key = `usage:${uid}:${todayKey()}`;
  const raw = await env.USERS.get(key, { type: 'json' });
  const msgs = ((raw || {}).messages || 0) + 1;
  await env.USERS.put(key, JSON.stringify({ messages: msgs }), { expirationTtl: 2 * 24 * 60 * 60 });
}

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

async function hashPassword(password, salt, iterations = 600000) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', salt: enc.encode(salt), iterations, hash:'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

// ── RATE LIMITING (KV-backed; degrades gracefully if KV not configured yet) ───
const RL_CONFIG = {
  signin:   { max: 10, window: 15 * 60 }, // 10 failures per 15 min per IP
  signup:   { max:  5, window: 60 * 60 }, //  5 attempts per hour per IP
  guest:    { max: 20, window: 60 * 60 }, // 20 guest sessions per hour per IP
  email:    { max: 10, window: 60 * 60 }, // 10 emails per IP per hour
  plancode: { max:  5, window: 60 * 60 }, //  5 code attempts per IP per hour
  lead:     { max:  3, window: 60 * 60 }, //  3 enterprise leads per IP per hour
};

async function rlCheck(env, action, ip) {
  if (!env.USERS) return null;
  const cfg = RL_CONFIG[action] || RL_CONFIG.signin;
  const raw = await env.USERS.get(`rl:${action}:${ip}`, { type: 'json' });
  if (!raw) return null;
  const waitSecs = Math.ceil((raw.resetAt - Date.now()) / 1000);
  if (raw.count >= cfg.max && waitSecs > 0) return waitSecs;
  return null;
}

async function rlRecord(env, action, ip) {
  if (!env.USERS) return;
  const cfg = RL_CONFIG[action] || RL_CONFIG.signin;
  const key = `rl:${action}:${ip}`;
  const now = Date.now();
  const raw = await env.USERS.get(key, { type: 'json' });
  const resetAt = (raw && raw.resetAt > now) ? raw.resetAt : now + cfg.window * 1000;
  const count   = (raw && raw.resetAt > now) ? raw.count + 1 : 1;
  await env.USERS.put(key, JSON.stringify({ count, resetAt }), { expirationTtl: cfg.window });
}

async function rlClear(env, action, ip) {
  if (!env.USERS) return;
  await env.USERS.delete(`rl:${action}:${ip}`);
}

async function handleAuth(request, env, origin, path) {
  const secret = env.JWT_SECRET;
  if (!secret) return json({ error: 'JWT_SECRET not set. Run: npx wrangler secret put JWT_SECRET' }, 500, origin);
  const hasKV = !!(env.USERS);

  const sub = path.replace('/api/auth', '') || '/';
  const ip  = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

  // ── GET /api/auth/me — verify token ─────────────────────────
  if (sub === '/me') {
    const token = (request.headers.get('Authorization') || '').replace('Bearer ','');
    if (!token) return json({ error: 'No token' }, 401, origin);
    const payload = await jwtVerify(token, secret);
    if (!payload) return json({ error: 'Invalid or expired token' }, 401, origin);
    return json({ uid: payload.uid, email: payload.email, name: payload.name, plan: payload.plan || 'free' }, 200, origin);
  }

  // ── Session / cookie endpoints — each function parses its own body ──────────
  if (sub === '/firebase') return handleFirebaseAuth(request, env, origin);
  if (sub === '/session')  return handleSessionFromJWT(request, env, origin);
  if (sub === '/guest')    return handleGuestAuth(request, env, origin);
  if (sub === '/logout')   return handleLogout(request, env, origin);
  if (sub === '/plan')     return handlePlanActivation(request, env, origin);

  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}

  // ── POST /api/auth/signup ────────────────────────────────────
  if (sub === '/signup') {
    const { email, password, name } = body;
    if (!email || !password) return json({ error: 'Email and password required' }, 400, origin);
    if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400, origin);

    // C3: rate limit — 5 signups per IP per hour
    const wait = await rlCheck(env, 'signup', ip);
    if (wait !== null) return json({ error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` }, 429, origin);

    if (!hasKV) return json({ error: 'User database not set up. Contact Kayro admin.' }, 503, origin);

    const existing = await env.USERS.get(`u:${email.toLowerCase()}`);
    if (existing) { await rlRecord(env, 'signup', ip); return json({ error: 'Account already exists. Sign in instead.' }, 409, origin); }

    const salt = crypto.randomUUID();
    const hash = await hashPassword(password, salt, 600000); // M4: 600k iterations for all new passwords
    const uid  = 'u_' + crypto.randomUUID().replace(/-/g,'').slice(0,16);
    const user = { uid, email: email.toLowerCase(), name: name || email.split('@')[0], hash, salt, iterations: 600000, plan:'free', created: Date.now() };
    await env.USERS.put(`u:${email.toLowerCase()}`, JSON.stringify(user));

    const token = await jwtSign({ uid, email: user.email, name: user.name, plan:'free', exp: Math.floor(Date.now()/1000) + AUTH_TOKEN_TTL }, secret);
    return json({ token, uid, email: user.email, name: user.name, plan:'free' }, 201, origin);
  }

  // ── POST /api/auth/signin ────────────────────────────────────
  if (sub === '/signin') {
    const { email, password } = body;
    if (!email || !password) return json({ error: 'Email and password required' }, 400, origin);

    // C3: rate limit — 10 failures per IP per 15 min
    const wait = await rlCheck(env, 'signin', ip);
    if (wait !== null) return json({ error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` }, 429, origin);

    if (!hasKV) return json({ error: 'User database not set up. Contact Kayro admin.' }, 503, origin);

    // C2: both "no account" and "wrong password" return the same generic message + status
    const INVALID = 'Invalid email or password.';

    const raw = await env.USERS.get(`u:${email.toLowerCase()}`);
    if (!raw) { await rlRecord(env, 'signin', ip); return json({ error: INVALID }, 401, origin); }

    const user = JSON.parse(raw);
    // M4: verify using the stored iteration count (100k for old accounts, 600k for new)
    const hash = await hashPassword(password, user.salt, user.iterations || 100000);
    if (hash !== user.hash) { await rlRecord(env, 'signin', ip); return json({ error: INVALID }, 401, origin); }

    // Success — clear rate limit counter
    await rlClear(env, 'signin', ip);

    // M4: transparently re-hash with 600k iterations on next login for legacy accounts
    if (!user.iterations || user.iterations < 600000) {
      user.hash = await hashPassword(password, user.salt, 600000);
      user.iterations = 600000;
      await env.USERS.put(`u:${email.toLowerCase()}`, JSON.stringify(user));
    }

    const token = await jwtSign({ uid: user.uid, email: user.email, name: user.name, plan: user.plan || 'free', exp: Math.floor(Date.now()/1000) + AUTH_TOKEN_TTL }, secret);
    return json({ token, uid: user.uid, email: user.email, name: user.name, plan: user.plan || 'free' }, 200, origin);
  }

  return json({ error: 'Unknown auth endpoint' }, 404, origin);
}

// ── POST /api/auth/firebase — exchange Firebase ID token for session cookie ──
// Firebase Web API key is public (it's in app.js already); using it here is safe.
const FIREBASE_REST_KEY = 'AIzaSyDbNHzaw0A_itQxpqwOQfsUb3of52RR6pY';

async function handleFirebaseAuth(request, env, origin) {
  const secret = env.JWT_SECRET;
  if (!secret) return json({ error: 'JWT_SECRET not set' }, 500, origin);

  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}
  const { idToken } = body;
  if (!idToken) return json({ error: 'idToken required' }, 400, origin);

  // Verify the Firebase ID token via the Firebase REST accounts:lookup endpoint.
  // This is exactly what the Firebase Admin SDK does internally.
  const firebaseRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_REST_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }), signal: AbortSignal.timeout(10000) }
  );
  if (!firebaseRes.ok) return json({ error: 'Invalid or expired Firebase token' }, 401, origin);
  const fbData = await firebaseRes.json();
  if (!fbData.users?.[0]) return json({ error: 'Invalid or expired Firebase token' }, 401, origin);

  const { localId: uid, email = '', displayName } = fbData.users[0];
  const name = displayName || email.split('@')[0] || 'User';

  // Server-side plan lookup — localStorage value is never trusted
  const kvPlan = env.USERS ? await env.USERS.get(`plan:${uid}`) : null;
  const plan = kvPlan || (email === ADMIN_EMAIL ? 'enterprise' : 'free');
  // Persist the elevated plan so KV is authoritative for future lookups
  if (!kvPlan && plan !== 'free' && env.USERS) await env.USERS.put(`plan:${uid}`, plan);

  const sessionToken = await jwtSign(
    { uid, email, name, plan, isGuest: false, exp: Math.floor(Date.now()/1000) + AUTH_SESSION_TTL },
    secret
  );
  return new Response(JSON.stringify({ uid, email, name, plan }), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(sessionToken) },
  });
}

// ── POST /api/auth/session — exchange a Worker JWT for an httpOnly session cookie
async function handleSessionFromJWT(request, env, origin) {
  const secret = env.JWT_SECRET;
  if (!secret) return json({ error: 'JWT_SECRET not set' }, 500, origin);

  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}
  const { token: workerJWT } = body;
  if (!workerJWT) return json({ error: 'token required' }, 400, origin);

  const payload = await jwtVerify(workerJWT, secret);
  if (!payload) return json({ error: 'Invalid or expired token' }, 401, origin);

  // Re-read plan from KV in case it changed since the JWT was minted
  const plan = (env.USERS ? await env.USERS.get(`plan:${payload.uid}`) : null) || payload.plan || 'free';

  const sessionToken = await jwtSign(
    { uid: payload.uid, email: payload.email, name: payload.name, plan, isGuest: false, exp: Math.floor(Date.now()/1000) + AUTH_SESSION_TTL },
    secret
  );
  return new Response(JSON.stringify({ uid: payload.uid, email: payload.email, name: payload.name, plan }), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(sessionToken) },
  });
}

// ── POST /api/auth/guest — issue a guest session cookie (IP + day based UID) ─
async function handleGuestAuth(request, env, origin) {
  const secret = env.JWT_SECRET;
  if (!secret) return json({ error: 'JWT_SECRET not set' }, 500, origin);

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const wait = await rlCheck(env, 'guest', ip);
  if (wait !== null) return json({ error: `Too many requests. Try again in ${Math.ceil(wait / 60)} minute(s).` }, 429, origin);
  await rlRecord(env, 'guest', ip);

  // Rotate daily so the UID isn't permanently tied to an IP address
  const day = new Date().toISOString().slice(0, 10);
  const uid = 'guest_' + (await sha256Hex(ip + '|' + day + '|' + secret.slice(0, 8))).slice(0, 16);

  const sessionToken = await jwtSign(
    { uid, email: null, name: 'Guest', plan: 'free', isGuest: true, exp: Math.floor(Date.now()/1000) + AUTH_SESSION_TTL },
    secret
  );
  return new Response(JSON.stringify({ uid, name: 'Guest', plan: 'free', isGuest: true }), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(sessionToken) },
  });
}

// ── POST /api/auth/logout — clear the session cookie ────────────────────────
async function handleLogout(request, env, origin) {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie('', true) },
  });
}

// ── POST /api/auth/plan — CRITICAL-1: exact-match codes, single-use, rate-limited ──
async function handlePlanActivation(request, env, origin) {
  const authR = await requireSession(request, env, origin);
  if (!authR.ok) return authR.response;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlWait = await rlCheck(env, 'plancode', ip);
  if (rlWait !== null) return json({ error: `Too many attempts. Try again in ${Math.ceil(rlWait / 60)} minute(s).` }, 429, origin);

  const secret = env.JWT_SECRET;
  let body = {};
  try { body = JSON.parse(await request.text()); } catch {}
  const { code } = body;
  if (!code || typeof code !== 'string') return json({ error: 'code required' }, 400, origin);

  const upper = code.toUpperCase().trim();
  if (upper.length < 4 || upper.length > 64) { await rlRecord(env, 'plancode', ip); return json({ error: 'Invalid plan code' }, 400, origin); }

  const { uid, email, name } = authR.session;
  let newPlan = null;

  // 1. KV-backed dynamic codes (admin creates via: wrangler kv:key put "plancode:CODE" '{"plan":"growth"}')
  if (env.USERS) {
    const codeData = await env.USERS.get(`plancode:${upper}`, { type: 'json' });
    if (codeData?.plan) {
      const usedBy = await env.USERS.get(`plancode_used:${upper}`);
      // Allow the same user to re-apply their own code (idempotent), but block other users
      if (usedBy && usedBy !== uid) {
        await rlRecord(env, 'plancode', ip);
        return json({ error: 'This code has already been used.' }, 400, origin);
      }
      newPlan = codeData.plan;
      await env.USERS.put(`plancode_used:${upper}`, uid, { expirationTtl: 730 * 24 * 60 * 60 });
    }
  }

  // Static shared codes removed — all codes must be single-use dynamic codes.
  // Generate via: wrangler kv:key put "plancode:MYCODE123" '{"plan":"growth"}' --binding USERS

  if (!newPlan) {
    await rlRecord(env, 'plancode', ip);
    return json({ error: 'Invalid plan code' }, 400, origin);
  }

  if (env.USERS) await env.USERS.put(`plan:${uid}`, newPlan);

  const sessionToken = await jwtSign(
    { uid, email, name, plan: newPlan, isGuest: false, exp: Math.floor(Date.now()/1000) + AUTH_SESSION_TTL },
    secret
  );
  return new Response(JSON.stringify({ plan: newPlan }), {
    status: 200,
    headers: { ...cors(origin), 'Content-Type': 'application/json', 'Set-Cookie': sessionCookie(sessionToken) },
  });
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
      const r = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(data), signal: AbortSignal.timeout(30000) });
      if (!r.ok) { try { return await r.json(); } catch { return { errors: [{ message: `Duffel HTTP ${r.status}` }] }; } }
      return r.json();
    },
    async get(path) {
      const r = await fetch(base + path, { headers, signal: AbortSignal.timeout(30000) });
      if (!r.ok) { try { return await r.json(); } catch { return { errors: [{ message: `Duffel HTTP ${r.status}` }] }; } }
      return r.json();
    },
  };
}

// Step 1 — Create offer request (search)
async function handleFlightSearch(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { origin: from, destination: to, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = body;

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
  let body;
  try { body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { offerId, passengers, paymentAmount, paymentCurrency, stripePaymentMethodId, stripeCustomerId } = body;

  if (!offerId || !passengers?.length) return err('offerId and passengers required', 400, origin);

  // CRITICAL-3: payment required — never book without it
  if (!stripePaymentMethodId || !stripeCustomerId) {
    return json({ error: 'Payment method required to complete booking.' }, 402, origin);
  }

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
async function getAmadeusToken(env) {
  // KV cache survives across CF isolate restarts; module-level vars do not
  if (env.USERS) {
    const cached = await env.USERS.get('amadeus_token', { type: 'json' });
    if (cached?.token && cached.exp > Date.now()) return cached.token;
  }

  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(`${base}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${env.AMADEUS_CLIENT_ID}&client_secret=${env.AMADEUS_CLIENT_SECRET}`,
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Amadeus auth failed: HTTP ${r.status}`);
  const data = await r.json();
  const token = data.access_token;
  const ttl   = Math.max(60, (data.expires_in || 1800) - 60);

  if (env.USERS && token) {
    await env.USERS.put('amadeus_token', JSON.stringify({ token, exp: Date.now() + ttl * 1000 }), { expirationTtl: ttl });
  }
  return token;
}

async function amadeus(env, path) {
  const token = await getAmadeusToken(env);
  const base  = env.AMADEUS_ENV === 'production' ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';
  const r = await fetch(base + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) { try { return await r.json(); } catch { return { errors: [{ detail: `Amadeus HTTP ${r.status}` }] }; } }
  return r.json();
}

async function amadeusPost(env, path, body) {
  const token = await getAmadeusToken(env);
  const base  = env.AMADEUS_ENV === 'production' ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';
  const r = await fetch(base + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) { try { return await r.json(); } catch { return { errors: [{ detail: `Amadeus HTTP ${r.status}` }] }; } }
  return r.json();
}

async function handleHotelSearch(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { cityCode, checkIn, checkOut, adults = 1, rooms = 1, radius = 5 } = body;
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
  let body;
  try { body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { offerId, guests, paymentAmount, paymentCurrency, stripePaymentMethodId, stripeCustomerId } = body;

  if (!offerId || !guests?.length) return err('offerId and guests required', 400, origin);

  // MEDIUM-2: Hotel booking requires a real Stripe card flow — test card removed.
  // This endpoint is disabled until Stripe payment collection is fully wired in the UI.
  return json({ error: 'Hotel booking is not yet available. Check back soon.' }, 503, origin);

  /* eslint-disable no-unreachable */
  // CRITICAL-3: payment required
  if (!stripePaymentMethodId || !stripeCustomerId) {
    return json({ error: 'Payment method required to complete booking.' }, 402, origin);
  }

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

  // TODO: replace cardNumber below with real tokenized payment data from Stripe before re-enabling
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
            cardNumber: 'REPLACE_WITH_REAL_CARD_DATA',
            expiryDate: '2099-01',
            holderName: `${guests[0].firstName} ${guests[0].lastName}`,
          },
        },
      }],
    },
  });
  /* eslint-enable no-unreachable */

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
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) { try { return await r.json(); } catch { return { error: { message: `Stripe HTTP ${r.status}` } }; } }
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

// Helper — verify a customerId belongs to the authenticated user (KV-backed)
async function verifyStripeOwner(env, origin, uid, customerId) {
  if (!env.USERS || !customerId) return null;
  const owned = await env.USERS.get(`stripe_cust:${uid}`);
  if (owned && owned !== customerId) return err('Payment account not associated with your account.', 403, origin);
  return null;
}

// Create or retrieve Stripe customer for a Kayro user — CRITICAL-2: auth required
async function handleStripeCustomer(request, env, origin, session) {
  const { uid, email: sessionEmail } = session;
  let body;
  try { body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const email = (body.email || '').toLowerCase().trim();
  const name  = body.name;
  if (!email) return err('email required', 400, origin);
  if (email !== (sessionEmail || '').toLowerCase()) return err('email must match authenticated account', 403, origin);

  // Return cached customerId if we already linked one
  if (env.USERS) {
    const cached = await env.USERS.get(`stripe_cust:${uid}`);
    if (cached) return json({ customerId: cached }, 200, origin);
  }

  const existing = await stripeRequest(env, 'GET', '/v1/customers', { email, limit: '1' });
  if (existing.data?.length) {
    const customerId = existing.data[0].id;
    if (env.USERS) await env.USERS.put(`stripe_cust:${uid}`, customerId, { expirationTtl: 730 * 24 * 60 * 60 });
    return json({ customerId }, 200, origin);
  }

  const customer = await stripeRequest(env, 'POST', '/v1/customers', { email, name: name || email, metadata: { kayroUserId: uid } });
  if (customer.error) return json({ error: customer.error.message }, 400, origin);
  if (env.USERS) await env.USERS.put(`stripe_cust:${uid}`, customer.id, { expirationTtl: 730 * 24 * 60 * 60 });
  return json({ customerId: customer.id }, 200, origin);
}

// Create SetupIntent — CRITICAL-2: auth + ownership
async function handleSetupIntent(request, env, origin, session) {
  let _body;
  try { _body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { customerId } = _body;
  if (!customerId) return err('customerId required', 400, origin);
  const ownerErr = await verifyStripeOwner(env, origin, session.uid, customerId);
  if (ownerErr) return ownerErr;

  const intent = await stripeRequest(env, 'POST', '/v1/setup_intents', {
    customer: customerId, payment_method_types: 'card', usage: 'off_session',
  });
  if (intent.error) return json({ error: intent.error.message }, 400, origin);
  return json({ clientSecret: intent.client_secret, setupIntentId: intent.id }, 200, origin);
}

// List saved cards — CRITICAL-2: auth + ownership
async function handleListCards(request, env, origin, session) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  if (!customerId) return err('customerId required', 400, origin);
  const ownerErr = await verifyStripeOwner(env, origin, session.uid, customerId);
  if (ownerErr) return ownerErr;

  const methods = await stripeRequest(env, 'GET', '/v1/payment_methods', { customer: customerId, type: 'card' });
  if (methods.error) return json({ error: methods.error.message }, 400, origin);

  const cards = (methods.data || []).map(pm => ({
    id: pm.id, brand: pm.card.brand, last4: pm.card.last4,
    expMonth: pm.card.exp_month, expYear: pm.card.exp_year, isDefault: false,
  }));
  return json({ cards }, 200, origin);
}

// Remove a saved card — CRITICAL-2: auth + ownership via Stripe lookup
async function handleRemoveCard(request, env, origin, session) {
  let _body;
  try { _body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { paymentMethodId } = _body;
  if (!paymentMethodId) return err('paymentMethodId required', 400, origin);

  // Verify this payment method belongs to the session user's customer
  if (env.USERS) {
    const ownedCustId = await env.USERS.get(`stripe_cust:${session.uid}`);
    if (ownedCustId) {
      const pm = await stripeRequest(env, 'GET', `/v1/payment_methods/${paymentMethodId}`, {});
      if (pm.customer && pm.customer !== ownedCustId) return err('Payment method not associated with your account.', 403, origin);
    }
  }

  const result = await stripeRequest(env, 'POST', `/v1/payment_methods/${paymentMethodId}/detach`, {});
  if (result.error) return json({ error: result.error.message }, 400, origin);
  return json({ removed: true }, 200, origin);
}

// Charge a saved card — CRITICAL-2: auth + ownership + amount validation
async function handleCharge(request, env, origin, session) {
  let body;
  try { body = await request.json(); } catch { return err('Invalid request body', 400, origin); }
  const { customerId, paymentMethodId, amount, currency = 'usd', description = 'Kayro booking' } = body;

  if (!customerId || !paymentMethodId || !amount) {
    return err('customerId, paymentMethodId, amount required', 400, origin);
  }
  const amountNum = Number(amount);
  if (!isFinite(amountNum) || amountNum <= 0 || amountNum > 100000) {
    return err('Invalid amount', 400, origin);
  }

  const ownerErr = await verifyStripeOwner(env, origin, session.uid, customerId);
  if (ownerErr) return ownerErr;

  const intent = await stripeRequest(env, 'POST', '/v1/payment_intents', {
    amount: String(Math.round(amountNum * 100)),
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
