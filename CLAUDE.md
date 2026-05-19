# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the server

```bash
OPENAI_API_KEY=sk-... npm start
# Demo available at http://localhost:3000/maestro-ia-demo.html
```

No build step — `npm start` runs `node server.js` directly. Node 18+ required.

## Architecture

Two files make up the entire app:

**`server.js`** — Express proxy that:
- Accepts POST `/api/chat` with Anthropic-style body (`{ system, messages }`)
- Translates it to OpenAI `/v1/chat/completions` format (hardcoded to `gpt-4o-mini`)
- Returns Anthropic-style response (`{ content: [{ type: 'text', text }] }`)
- Serves `maestro-ia-demo.html` as a static file

**`maestro-ia-demo.html`** — Self-contained single-page app (no framework, no bundler):
- Simulates a WhatsApp-style chat UI
- Supports 7 business sectors (peluquería, restaurante, dental, inmobiliaria, gimnasio, ecommerce, academia), each with its own system prompt, quick-reply suggestions, and branding
- The `S` object (line 356) holds all sector configs; add new sectors there
- Sends requests to `/api/chat` using Anthropic request format (the `model` field in the fetch body is ignored by the server)

## Key design note

The frontend intentionally uses Anthropic request format while the server translates to OpenAI. To switch the backend to Anthropic/Claude, update `server.js` to call `api.anthropic.com/v1/messages` and change the env var to `ANTHROPIC_API_KEY`. The frontend would need no changes.
