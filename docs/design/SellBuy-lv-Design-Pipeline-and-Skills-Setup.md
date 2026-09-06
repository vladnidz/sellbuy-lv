# SellBuy.lv — Design Pipeline & Agent Skill Setup
*Every tool below was actually checked (README fetched), not assumed from the name.*

## What each referenced tool actually is

| Tool | What it actually is | Role in this pipeline |
|---|---|---|
| **impeccable** (pbakaus) | Design guidance for AI coding agents: 1 skill, 23 commands (`craft`, `polish`, `audit`, `critique`, `distill`, `animate`, `bolder`, `quieter`, etc.), 61 deterministic detector rules, browser-extension live iteration. Explicitly built as an extension of Anthropic's own `frontend-design` skill. `/impeccable init` records durable product truth (audience, purpose, constraints, voice) into `PRODUCT.md`, separate from visual-direction choices in `DESIGN.md`. | **Primary design driver**, per your instruction |
| **ui-ux-pro-max-skill** (nextlevelbuilder) | 192 "reasoning rules" + 79 searchable UI styles, distributed as an npm CLI (`ui-ux-pro-max-cli`) | Supporting reference — pull specific UI style patterns from it when impeccable has no opinion on a given surface |
| **taste-skill** (leonxlnx) | Branded "Anti-Slop Frontend Framework for AI Agents" — same problem space as impeccable/kill-ai-slop, independently built | Supporting reference only — see the guardrail below on not letting it compete with impeccable |
| **kill-ai-slop** (yetone) | A catalogue of 33 named "AI slop" tells (indigo gradients, glowing cards, emoji everywhere, mascots, ALL-CAPS stat cards) plus an Agent Skill that scans a web project for the code-level signals of each tell and proposes or applies fixes. Install: `npx skills add yetone/kill-ai-slop` | **Separate, final QA pass** — run after design work is "done," not during |
| **three.js** (mrdoob) | The standard WebGL 3D library for JavaScript | Use only where 3D genuinely earns its place (see guidance below) — not general UI chrome |

## Verified install commands

```bash
# Primary design skill — run once per project
npx impeccable install
# then inside the AI coding tool:
/impeccable init      # writes PRODUCT.md — do this first, before any visual work
/impeccable craft <target>   # then drive actual page/component design through this

# Supporting: ui-ux-pro-max-skill ships as an npm CLI (ui-ux-pro-max-cli) —
# confirm the exact invocation in its README before wiring it in; I saw the
# package name confirmed but not the literal CLI flags in the excerpt I pulled.

# Supporting: taste-skill — I could not confirm its exact install command from
# the README excerpt (it opened with sponsor/banner content, not the install
# step). Check tasteskill.dev or the repo's Quick Start section directly
# before scripting this into CI. If it follows the same universal-installer
# pattern as kill-ai-slop, it would be: npx skills add leonxlnx/taste-skill
# — treat this as a guess to verify, not a confirmed command.

# Final QA pass — separate step, after FE/UX work is done
npx skills add yetone/kill-ai-slop
# then run its scanner against the built frontend before merge
```

## Sequencing (this order matters)

1. **`/impeccable init` once, early.** This writes `PRODUCT.md` — durable facts about SellBuy.lv (trilingual C2C+B2B marketplace, trust-first positioning, target audience skewing younger than SS.lv's base) that every later design decision should be consistent with. Do this before any page gets built, not after.
2. **Drive actual design work through impeccable's commands** (`craft`, `polish`, `audit`, `critique`, `animate`, etc.) as the primary loop for each surface — listing cards, category browse, chat UI, checkout.
3. **Consult ui-ux-pro-max-skill and taste-skill as reference libraries, not competing authorities.** Pull a specific pattern from either only when impeccable's system has no opinion on that specific surface (e.g., a specific empty-state illustration style). Never let two of these three systems both "own" the same component — that produces visible inconsistency, not extra polish.
4. **Use three.js sparingly, and only where it earns its place** — e.g., an interactive category-explorer visualization, a subtle hero-section flourish. Do not use it for general chrome on a classifieds marketplace: unnecessary WebGL hurts load time, SEO crawlability, accessibility, and battery life on the mobile-first audience this product is targeting. Default to no 3D; justify each instance where it's added.
5. **Run kill-ai-slop as a separate, final gate — not a continuous background process.** Design work should reach a stable state first; running an anti-slop scanner mid-iteration just produces noise against work-in-progress. Treat a clean kill-ai-slop pass as part of the Definition of Done for any new UI surface, alongside the build/test requirements already in `BUILD_GARDRAILS.md`.

## Guardrail: three anti-slop systems, one source of truth

Impeccable, ui-ux-pro-max-skill, and taste-skill are three **independently built** opinion systems about what good design looks like — they will not always agree on specifics (spacing scale, font pairing, which "tells" matter most). Since impeccable is the designated primary, its `PRODUCT.md`/`DESIGN.md` is the tie-breaker whenever the three disagree. Write this rule down somewhere an agent will actually read it (see the routing fix in the documentation audit) — otherwise different tool sessions will ping-pong between conflicting rule sets and you'll get exactly the inconsistency this pipeline is meant to prevent.

## shadcn MCP setup

Your command is correct and current:
```bash
npx shadcn@latest mcp init --client claude
```
This creates `.mcp.json` with the shadcn MCP server configured for Claude Code, giving it live access to browse/search/install real shadcn/ui components instead of generating props and patterns from (possibly outdated) training data — the actual failure mode this fixes is agents confidently inventing shadcn props that don't exist or match year-old versions. One known current rough edge: some setups have hit a bug where the generated config is missing an explicit `"type": "stdio"` field and Claude Code's MCP loader rejects it — if `/mcp` doesn't show the server as connected after running init, check `.mcp.json` for that field before troubleshooting further.

**On "earlier MCPs":** the repo already references a Prisma MCP server (`.agents/skills/prisma-cli/references/mcp.md`) — confirm that's actually connected and being used rather than wiring up a second, redundant way to talk to Prisma. Consolidate rather than duplicate.
