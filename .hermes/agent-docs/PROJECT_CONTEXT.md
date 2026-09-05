# PROJECT CONTEXT — Canonical Hub for All Tools

> **Load this file first.** Every agent in this repo must read this and `docs/` before doing anything.

## Project Identity
SellBuy.lv is a production-grade Latvian marketplace designed to compete with SS.lv. It uses a **trust-first, AI-native** approach with Smart-ID authentication and integrated logistics (Omniva/DPD).

## Current Status (September 2026)
- **Stack:** Next.js 16.3.1 + TypeScript + Tailwind CSS + Prisma 7.10.0 + PostgreSQL 17
- **Build System:** **Webpack** (forced via `--webpack` flag) — see `docs/architecture/data-schema.md` for rationale
- **UI:** shadcn/ui with Radix primitives (no `@base-ui` dependencies)
- **Deployment:** Vercel (standalone output mode)
- **Agent System:** Autonomous crew (10 agents) on Raspberry Pi 4B

## Required Reading (in order)
1. **`.hermes/agent-docs/BUILD_GARDRAILS.md`** — Mandatory guardrails for all agents (local build before push, webpack pin, dependency rules)
2. **`docs/architecture/data-schema.md`** — Live Prisma schema + technical debt registry (React 19, Webpack pins)
3. **`docs/functional/`** — Feature specifications (categories, chat, ratings, profiles)
4. **`docs/integrations/`** — API contracts (Smart-ID, logistics)
5. **`README.md`** — High-level onboarding and project structure

## Key Decisions (Authority)
- **Why Prisma+ltree:** Faster ancestor/descendant queries for category hierarchy.
- **Why Webpack over Turbopack:** Turbopack cannot parse Tailwind v4 arbitrary property syntax (`.[--card-spacing:--spacing(4)]`). This is a documented technical debt, not a configuration error.
- **Why Shadcn + Radix:** Production-ready accessibility and fewer dependency issues than experimental `@base-ui`.

## Current Project Constraints
- **Agent Model:** All agents MUST use `hermes-coder` (no switching to alternative models).
- **Budget Hard Cap:** $100 total (via Omniroute gateway).
- **Autonomy Level:** Agents are expected to fix blockers autonomously and verify locally before pushing.
