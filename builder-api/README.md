# Kayro Project Builder API

The AI behind `kayrointer.com/start`. A small Cloudflare Worker that takes a visitor's brief and
streams back a homepage design. The site itself is static, so this is the only moving part.

## Deploy

```sh
cd builder-api
npx wrangler deploy
npx wrangler secret put ANTHROPIC_KEY    # paste the Anthropic API key when asked
```

Check it: open `https://kayrointer.com/api/builder`. It should show `{"ok":true}`.
Until it does, `/start` falls back to a template-based quick preview.

## Notes

- If `wrangler deploy` says the `kayrointer.com` zone isn't in this account, delete the `routes`
  block in `wrangler.toml`, deploy again, and set `AI_ENDPOINT` in `/start.html` to the
  `workers.dev` URL that wrangler prints (ending in `/api/builder`).
- Limits: 4 designs a minute per visitor. For a hard daily cap, switch on the `CAP` namespace in
  `wrangler.toml`. A monthly spend limit on the API key in the Anthropic console is worth setting too.
- The prompt and the markup classes live in `api.js`. They must match the design kit in
  `/start.html`. Change them together.
- `MODEL` in `wrangler.toml` picks the Claude model.
