# SellBuy.lv documentation index

Status values: **Draft** (not yet reviewed), **Review** (owner review pending), **Approved** (owner approved), **Superseded** (replaced; kept for history).

## Start here

| Document | Purpose | Status |
|---|---|---|
| `../AGENTS.md` | Coding agent brief: rules, work loop, conventions | Draft |
| `functional/00-overview-and-roles.md` | Product scope, actors, roles, verification levels, permissions | Draft |
| `functional/01-categories.md` | Category tree, attribute templates, brand and model catalogues, restriction rules | Draft |
| `functional/02-user-flows.md` | Step-by-step flows: registration, login, posting, search, messaging, purchase, auctions, business, moderation | Draft |
| `functional/03-business-rules.md` | Limits, lifecycles, fees, display rules, auction rules, retention summary | Draft |
| `technical/01-architecture.md` | Components, deployment, failure modes, decision defaults | Draft |
| `technical/02-data-model.md` | Entities, fields, constraints, indexes | Draft |
| `technical/03-api.md` | Endpoints, envelope, error codes, idempotency, rate limits | Draft |
| `technical/04-auctions-engine.md` | Bidding algorithm, proxy bids, anti-sniping, closing, tests | Draft |
| `technical/05-payments-escrow.md` | Money flows, ledger accounts, webhooks, reconciliation | Draft |
| `technical/06-search.md` | Index design, normalisation, ranking, facets, pipeline | Draft |
| `technical/07-security-privacy.md` | Authentication, authorisation, uploads, threats, retention | Draft |
| `technical/08-integrations.md` | Smart-ID, Omniva, DPD, PSP, messaging, checks, external registers | Draft |
| `technical/09-testing-release-ops.md` | Test strategy, environments, release, runbooks | Draft |
| `../backlog/stories.csv` | Every user story: acceptance criteria, technical tasks, tests, dependencies | Draft |
| `../backlog/README.md` | How to read and import the backlog | Draft |

## Existing files that predate this package

These remain in the repository until the reconciliation report (task T-00) is approved:
- `functional/categories.md`, `functional/chat.md`, `functional/profiles.md`
- `integrations/smart-id.md`, `integrations/logistics.md`
- `architecture/data-schema.md`
