# SellBuy.lv backlog — how to use

Files:
- `stories.csv` is the source of truth. One row per user story, 168 stories across 17 epics (EP-00 to EP-16). Import into Jira, Linear, GitHub Projects, or a spreadsheet.
- `BACKLOG.md` is generated from `stories.csv` for reading. Do not edit it by hand.
- `build_csv.py` builds both files from `_part1.py` and `_part2.py`. Edit the data files, then run `python3 build_csv.py`. Edit `stories.csv` directly only if you stop using the data files, and then delete them.
- `_part1.py` and `_part2.py` hold the story data (EP-00 to EP-08, and EP-09 to EP-16).

Columns in `stories.csv`:

| Column | Meaning |
|---|---|
| id | Story ID, for example US-03.01. Never reused. |
| epic | EP-00 to EP-16 |
| release | R1 (MVP), R2 (trust and payments), R3 (auctions), R4 (business), R5 (intelligence and scale) |
| priority | Must, Should, Could, Won't (MoSCoW within release) |
| size | XS, S, M, L, XL. XL must be split before work starts. |
| title | Short story title |
| acceptance_criteria | Testable statements separated by semicolons. Every criterion needs a passing test. |
| technical_tasks | Implementation tasks separated by semicolons |
| tests | Required test types and focus |
| depends_on | Story IDs that must be done first (comma-separated) |
| events | Domain events published or consumed (see `technical/09-testing-release-ops.md` for names) |

Rules:
- A story is Ready only when the definition in `functional/00-overview-and-roles.md` section 8 is met.
- Acceptance criteria are copied into the pull request description and ticked during review.
- Changing a story's acceptance criteria requires a note in the pull request and a review by the product owner.
- Splitting an XL story: create child stories with IDs such as US-16.04a, US-16.04b and add the parent to a depends_on list.
- Scope change: move the story to a later release by changing the release column, never by deleting it.

Known simplifications in this version:
- Acceptance criteria are summarised. The detailed behaviour is in the functional documents (`functional/02-user-flows.md` and `functional/03-business-rules.md`). Where they differ, the functional document wins until this backlog is corrected.
- Size estimates assume one experienced full-stack developer. Re-estimate after the spikes in Phase 0.
- Dependencies cover the main ordering. Some technical prerequisites (for example, a worker host) are in `technical/01-architecture.md`, not as separate stories.
