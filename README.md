# Bud

Bud is a student-facing AI assistant with a small multi-agent kernel behind it: Orbit (orchestrator), Guardian
(safety layer), Spark (execution substrate), and independent specialist agents (Scholar for academics, Oracle for
research/verification, Coach for planning and productivity).

## How it works

Every message flows: **User → Bud → Orbit → Spark → Specialist(s) → Spark → Orbit → Bud → User**. Bud never talks
to a specialist directly; Orbit decides which specialists a message needs and Spark dispatches to them. See
`AGENTS.md` for the full architecture.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, TanStack Router) for the app and server routes
- Tailwind CSS 4 for styling
- Netlify AI Gateway for LLM access (Anthropic, OpenAI, and Gemini SDKs, zero-config — no API keys to manage)
- Deployed on Netlify

## Running locally

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`. AI Gateway credentials are only injected on Netlify deploys, so
for local AI responses either deploy once first, or set one of `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or
`GEMINI_API_KEY` in your local environment.

## Building

```bash
npm run build
```
