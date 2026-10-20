# kayrointer.com (Kayro Interactive)

Kayro Interactive: independent studio in Dubai that launches its own ventures (ROTH, bell2bell) and builds for clients (Synuthane, Boston Arab Society). Solo-run by Omar.

## Code
Safe on GitHub: `obaalbaki11-hub/kayrointer-hq` (public, 225 commits, last 2026-10-08). Clone it fresh; only uncommitted local edits after Oct 8 were lost. A copy of the revamp page is also in the artifact "Kayro Interactive" (`../../artifacts/kayro-interactive/index.html`, updated 2026-10-07); diff it against `index.html` to catch anything missing.

Contents: static pages (index, app, pitch, player, privacy, app-privacy, solo-founder), `worker.js` + `wrangler.toml` (rate-limited `/api/demo`, server-side key), `remotion/` brand videos (KayroBrandSpot, KayroCarousel, KayroReel), work screenshots in `assets/work/`.

## Brand
Blue #1162FF, cyan #08D6EE, navy #03183A, ink #161616. Monochrome UI, Inter + JetBrains Mono.

## Rules
- Public repo: never commit secrets. Check `set-key.sh` holds no key.
- Keep app.html, privacy.html and API routes. No deploy without approval.
