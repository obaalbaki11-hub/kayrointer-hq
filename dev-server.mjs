/**
 * Local dev server for Alibi (and anything else on /api/*).
 *
 *   node dev-server.mjs            → http://127.0.0.1:8788/alibi.html
 *   node dev-server.mjs --port 3000
 *   node dev-server.mjs --mock     → canned suspects, no API key, no tokens spent
 *   node dev-server.mjs --limits   → enforce the real per-IP / daily caps
 *
 * It serves the repo's static files and routes /api/* straight into the real
 * `worker.js` fetch handler, with an in-memory stand-in for the USERS KV namespace.
 * So you are exercising the actual Worker code — routing, prompts, redaction, the
 * question budget — not a reimplementation of it.
 *
 * The API key is read from ANTHROPIC_KEY in the environment, or from a `.dev.vars`
 * file beside this one (same format wrangler uses: KEY=value per line). `.dev.vars`
 * is gitignored — keep the key there, not in a shell history.
 *
 * Differences from production, on purpose:
 *   - KV lives in memory and dies with the process, so cases don't survive a restart.
 *   - Rate limits are OFF by default, because a 4-cases-per-hour cap is miserable to
 *     develop against. Pass --limits to exercise them for real.
 *
 * This binds to 127.0.0.1 only. It holds an API key — don't put it on 0.0.0.0.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, normalize, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? argv[i + 1] : d; };

const PORT = parseInt(val('--port', process.env.PORT || '8788'), 10);
const MOCK = has('--mock') || process.env.ALIBI_MOCK === '1';
const LIMITS = has('--limits');

// ── secrets ───────────────────────────────────────────────────
function loadDevVars() {
  const out = {};
  const f = join(ROOT, '.dev.vars');
  if (!existsSync(f)) return out;
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m || line.trim().startsWith('#')) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// ── KV stand-in ───────────────────────────────────────────────
// Implements the slice of the Workers KV API that worker.js actually uses.
function memoryKV() {
  const store = new Map(); // key → { value, expiresAt }
  return {
    async get(key, opt) {
      const hit = store.get(key);
      if (!hit) return null;
      if (hit.expiresAt && Date.now() > hit.expiresAt) { store.delete(key); return null; }
      return opt?.type === 'json' ? JSON.parse(hit.value) : hit.value;
    },
    async put(key, value, opt) {
      store.set(key, {
        value: String(value),
        expiresAt: opt?.expirationTtl ? Date.now() + opt.expirationTtl * 1000 : 0,
      });
    },
    async delete(key) { store.delete(key); },
    _store: store,
  };
}

// ── offline mock of the Anthropic API ─────────────────────────
// Lets you iterate on the interface without a key and without spending tokens.
// Only installed under --mock, and only for api.anthropic.com.
const MOCK_CASE = {
  title: 'The Eleven Minutes',
  crime: 'During an eleven-minute power cut at closing, the only signed copy of the will was fed through the office shredder. Four people had keys. All four say they were somewhere else.',
  scene: 'The back office of a wedding venue, twenty minutes after the last guest left.',
  victim: 'Ada Wren, 88, whose bequest was in that envelope.',
  window: 'between 9:40pm and 10:15pm',
  evidence: [
    'The shredder bin held confetti-cut paper, still warm.',
    'The only working camera faced the car park.',
    'The fuse box was opened with a flathead screwdriver.',
    'The office door locks only from the inside.',
  ],
  trueTimeline: [
    { time: '9:41pm', event: 'Dara pulls the main fuse with a flathead from the bar toolkit.' },
    { time: '9:44pm', event: 'Dara lets himself into the back office.' },
    { time: '9:47pm', event: 'Marguerite crosses the corridor and sees him, but says nothing.' },
    { time: '9:52pm', event: 'The will goes through the shredder.' },
    { time: '10:10pm', event: 'Wren is in the car park on the phone, not at the bar.' },
    { time: '10:15pm', event: 'Power restored; Dara is out front, on hold to nobody.' },
  ],
  culpritId: 's3',
  suspects: [
    { id: 's1', name: 'Wren Alcott', age: 31, role: 'bar manager', demeanor: 'Fast, jokey, deflects.', publicAlibi: 'I was restocking the bar the entire time, ask anyone.', truth: 'In the car park on the phone from 10:04pm.', secret: 'Skimming forty pounds a week from the till.', lie: 'Insists she never left the bar.', crackPoint: 'The car park camera timestamp at 10:10pm.', knows: ['I saw Dara heading down the corridor before the lights went.'] },
    { id: 's2', name: 'Marguerite Obi', age: 45, role: 'head caterer', demeanor: 'Clipped, formal, goes quiet when pressed.', publicAlibi: 'In the walk-in fridge doing stock counts.', truth: 'In the fridge from 9:46pm, crossing the corridor once at 9:47pm.', secret: 'Was crying over a diagnosis she has told nobody.', lie: 'Claims she never left the fridge.', crackPoint: 'The corridor crossing at 9:47pm.', knows: ['Dara came out of that corridor with a screwdriver in his hand.'] },
    { id: 's3', name: 'Dara Whitlock', age: 52, role: 'venue owner', demeanor: 'Warm, helpful, never rattled.', publicAlibi: 'Out front waiting for the electrician to call me back.', truth: 'Cut the power, shredded the will, stood out front pretending to be on hold.', secret: 'The will left the venue to the granddaughter; he has already remortgaged it.', lie: 'Claims he was on a call that never happened.', crackPoint: 'There is no call on the electrician’s log at 9:44pm.', knows: ['Wren was not behind that bar, whatever she says.'] },
    { id: 's4', name: 'Foss Nagy', age: 24, role: 'DJ', demeanor: 'Nervy, over-explains everything.', publicAlibi: 'Packing down my gear on the dance floor, lights off.', truth: 'On the dance floor the whole time, packing down by phone torch.', secret: 'Has been lying about having a licence and drove the van himself.', lie: 'Vague about how his gear got to the venue.', crackPoint: 'The van on the car park camera.', knows: ['Marguerite was in and out of that corridor, not just the fridge.'] },
  ],
};

const MOCK_REPLIES = [
  { reply: 'The bar. Where else would I be at closing? Eleven crates to count and no light to do it by.', claims: [{ text: 'Was behind the bar during the power cut.', time: '9:45pm' }], rattled: 0 },
  { reply: "I'm not being funny, but you've asked me that twice now. The bar. All night.", claims: [{ text: 'Repeats being at the bar all night.' }], rattled: 1 },
  { reply: "Fine. FINE. I wasn't at the bar at ten past — I was in the car park on the phone to my sister, and I'd rather you didn't ask what about.", claims: [{ text: 'Was in the car park, not the bar, at 10:10pm.', time: '10:10pm' }], rattled: 3 },
];

function installMock() {
  const real = globalThis.fetch;
  globalThis.fetch = async (url, opt) => {
    const href = typeof url === 'string' ? url : url?.url || '';
    if (!href.includes('api.anthropic.com')) return real(url, opt);
    const body = JSON.parse(opt.body);
    // Pick the reply from how far into THIS interview we are (messages replay as
    // user/assistant pairs plus the new question), not from a counter on this process.
    // That keeps a suspect's answers the same on every run and stops one interview,
    // or an earlier curl, from shifting another's.
    const priorTurns = Math.floor(Math.max(0, (body.messages?.length || 1) - 1) / 2);
    const payload = body.system ? MOCK_REPLIES[Math.min(priorTurns, MOCK_REPLIES.length - 1)] : MOCK_CASE;
    await new Promise((r) => setTimeout(r, 400)); // so the loading states are visible
    return new Response(JSON.stringify({
      id: 'msg_mock', type: 'message', role: 'assistant', stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify(payload) }],
      usage: { input_tokens: 0, output_tokens: 0 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
}

// ── static files ──────────────────────────────────────────────
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

async function serveStatic(pathname, res) {
  let rel = decodeURIComponent(pathname);
  if (rel.includes('\0')) return send(res, 400, 'Bad request');
  if (rel.endsWith('/')) rel += 'index.html';
  rel = normalize(rel).replace(/^(\.\.[/\\])+/, '');

  // Never serve dotfiles — .dev.vars and .git live here.
  if (rel.split(/[/\\]/).some((seg) => seg.startsWith('.'))) return send(res, 403, 'Forbidden');

  const file = join(ROOT, rel);
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  try {
    const info = await stat(file);
    if (info.isDirectory()) return serveStatic(pathname.replace(/\/?$/, '/'), res);
    const buf = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  } catch {
    send(res, 404, 'Not found');
  }
}

function send(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

// ── boot ──────────────────────────────────────────────────────
if (MOCK) installMock();

const { default: worker } = await import('./worker.js');
const vars = loadDevVars();
const KEY = process.env.ANTHROPIC_KEY || vars.ANTHROPIC_KEY || vars.ANTHROPIC_API_KEY || (MOCK ? 'mock-key' : '');
const env = { ...vars, USERS: memoryKV(), ANTHROPIC_KEY: KEY };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (!url.pathname.startsWith('/api/')) return serveStatic(url.pathname, res);

  // Without --limits, clear the rate-limit bookkeeping before each call so an
  // afternoon of testing doesn't run into the per-IP hourly cap.
  if (!LIMITS) {
    for (const k of [...env.USERS._store.keys()]) {
      if (k.startsWith('rl:') || k.includes(':global:')) env.USERS._store.delete(k);
    }
  }

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const request = new Request(url.href, {
    method: req.method,
    headers: { ...req.headers, 'CF-Connecting-IP': '127.0.0.1' },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  });

  const started = Date.now();
  try {
    const out = await worker.fetch(request, env);
    const text = await out.text();
    res.writeHead(out.status, Object.fromEntries(out.headers));
    res.end(text);
    let tag = '';
    try { tag = JSON.parse(body?.toString() || '{}').action || ''; } catch {}
    console.log(`  ${req.method} ${url.pathname}${tag ? ' [' + tag + ']' : ''} → ${out.status} (${Date.now() - started}ms)`);
  } catch (e) {
    console.error('  worker threw:', e);
    send(res, 500, 'Worker error: ' + e.message);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Alibi dev server\n  ────────────────`);
  console.log(`  Play:      http://127.0.0.1:${PORT}/alibi.html`);
  console.log(`  Site:      http://127.0.0.1:${PORT}/`);
  console.log(`  Model:     ${MOCK ? 'MOCK — canned suspects, no tokens spent' : (KEY ? 'live (claude-opus-5)' : 'NO KEY — put ANTHROPIC_KEY in .dev.vars, or run with --mock')}`);
  console.log(`  Limits:    ${LIMITS ? 'enforced (4 cases/hr, 70 questions/hr)' : 'off for dev — pass --limits to enforce'}`);
  console.log(`  KV:        in-memory (cases reset when this process stops)\n`);
});
