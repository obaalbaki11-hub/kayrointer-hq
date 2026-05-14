#!/bin/bash
echo ""
echo "=== Kayro AI Key Setup ==="
echo ""
echo "1. Go to: https://console.anthropic.com/settings/api-keys"
echo "2. Click 'Create Key', name it 'kayro-backend'"
echo "3. Copy the full key (starts with sk-ant-)"
echo ""
read -p "Paste your Anthropic API key here: " -r KEY
KEY=$(echo "$KEY" | tr -d '[:space:]')

if [[ ! "$KEY" == sk-ant-* ]]; then
  echo "❌ That doesn't look like an Anthropic key (should start with sk-ant-)"
  exit 1
fi

echo ""
echo "Testing key with Anthropic..."
RESULT=$(curl -s -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":5,"messages":[{"role":"user","content":"hi"}]}')

if echo "$RESULT" | grep -q '"type":"message"'; then
  echo "✅ Key is VALID! Saving to Cloudflare..."
  echo "$KEY" | npx wrangler secret put ANTHROPIC_KEY
  echo ""
  echo "✅ Done! Your AI should now be working."
else
  echo "❌ Key is INVALID. Anthropic says:"
  echo "$RESULT"
  echo ""
  echo "Make sure you copied the FULL key from https://console.anthropic.com/settings/api-keys"
fi
