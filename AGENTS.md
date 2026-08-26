# AGENTS.md

This document describes the UNIBUD architecture for developers and AI agents working on this codebase.

## Project Overview

Bud is a student-facing AI assistant built on TanStack Start and deployed on Netlify. Behind Bud sits a small
multi-agent kernel: Orbit (orchestrator), Guardian (safety layer), Spark (execution substrate), and a set of
independent specialist agents (Scholar, Oracle, Coach, plus several frozen agents reserved for future work).

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| AI | Netlify AI Gateway (Anthropic / OpenAI / Gemini SDKs, zero-config) |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── src
│   ├── routes
│   │   ├── __root.tsx        # HTML shell, page title
│   │   ├── index.tsx         # Bud chat UI
│   │   └── api.chat.ts       # POST /api/chat — entry point into the Bud pipeline
│   ├── lib
│   │   └── ai-hook.ts        # useBudChat — client-side chat state, talks to /api/chat
│   ├── server
│   │   ├── providers/LLMProvider.ts     # Provider abstraction over AI Gateway SDKs
│   │   ├── registry/AgentRegistry.ts    # Every agent's metadata + active/frozen status
│   │   ├── guardian/GuardianService.ts  # Input/output safety checks
│   │   ├── spark/SparkService.ts        # Execution substrate (dispatch + aggregate)
│   │   ├── orbit/OrbitService.ts        # Orchestrator (routing authority)
│   │   ├── bud/BudService.ts            # User-facing entry point
│   │   └── specialists/                 # ScholarService, OracleService, CoachService
│   └── styles.css
├── netlify.toml
├── package.json
└── tsconfig.json
```

## The Agent Flow

```
USER -> Bud -> Orbit -> Spark -> Specialist(s) -> Spark -> Orbit -> Bud -> USER
```

- **Bud** (`server/bud/BudService.ts`) is the only agent the client talks to. It never calls a specialist
  directly — it delegates the entire request to Orbit, then formats Orbit's aggregated answer for the student.
- **Orbit** (`server/orbit/OrbitService.ts`) is the routing authority. It runs Guardian's pre-check, chooses which
  specialists a message needs via capability-keyword matching (not hard-coded to any one specialist), hands the
  plan to Spark, and runs Guardian's output-check on the aggregated result.
- **Spark** (`server/spark/SparkService.ts`) is the execution/coordination substrate, not a specialist itself. It
  holds an execution map from agent id to a bound specialist function, checks each agent is `active` in the
  registry before dispatching, executes each specialist independently, and aggregates results/errors. It never
  decides routing and never replaces Orbit.
- **Guardian** (`server/guardian/GuardianService.ts`) enforces safety policy on input and output using explicit
  regex categories (self-harm, exploitation, hate speech, weapons instructions) — never simplistic substring
  checks like `message.includes("harm")`.
- **Specialists** (`server/specialists/*.ts`) are independent — each only knows its own provider call and system
  prompt, and never calls another specialist. Scholar, Oracle, and Coach are `active` in the registry; Atlas,
  Pulse, Vision, Community, Creator, Voice, Navigator, Architect, and Artist are defined but `frozen` until their
  execution contracts are added to Spark's execution map.

## Provider Abstraction

`server/providers/LLMProvider.ts` wraps the Anthropic, OpenAI, and Gemini SDKs behind a single `LLMProvider`
interface. All provider calls happen server-side (in the TanStack Start server route), so no API key is ever sent
to the browser. Credentials come from Netlify's AI Gateway, which injects `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
and `GEMINI_API_KEY` automatically at runtime — the SDK constructors are zero-config (`new Anthropic()`,
`new OpenAI()`, `new GoogleGenAI({})`) and pick these up on their own. `resolveDefaultProvider()` prefers
Anthropic, then OpenAI, then Gemini, based on whichever key is present.

## Environment Variables

No API keys need to be set manually — Netlify's AI Gateway injects them once the site has at least one
production deploy. If you want to force one provider, set `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or
`GEMINI_API_KEY` yourself and Netlify will respect it instead of overriding it.

`WEB_SEARCH_API_KEY` is optional — Oracle uses it to unlock live research; without it Oracle truthfully reports
that it can only reason from provided context.

## Development Commands

```bash
npm run dev      # Start the dev server
npm run build    # Production build
```

## Conventions

- Server-only agent code lives under `src/server/`; nothing in that tree should be imported into client bundles.
- Import paths use the `@/` alias for `src/*`.
- TypeScript strict mode is enabled — no unused locals/parameters.
- Extending the routing logic in `OrbitService.routeToAgents` is the right place to add new capability keywords;
  wiring a new specialist requires both flipping its `AgentRegistry` status to `active` and registering it in
  `SparkService`'s execution map.
