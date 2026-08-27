#!/bin/bash
# SellBuy.lv autonomous crew - 2-parallel mode (gateway can't handle 4 free-model calls at once)
# Each cycle: 2 core agents in parallel + 1 strategy = 3 specialists per 15-min cycle = 72 agent-hours/day
PROJECT=~/projects/sellbuy-v2
LOG=$PROJECT/CONTINUOUS_BUILD.log
STATE_FILE=$PROJECT/.crew_state
cd "$PROJECT" || exit 1

echo "=== $(date) Starting agency crew cycle ===" | tee -a "$LOG"

# ── 1. Sync & build ──────────────────────────────────────────────
git pull origin main >> "$LOG" 2>&1
if [ ! -d node_modules ]; then npm install >> "$LOG" 2>&1; fi
npm run build >> "$LOG" 2>&1
BUILD_OK=$?

if [ $BUILD_OK -ne 0 ]; then
  echo "=== BUILD FAILED — dispatching reality-checker ===" | tee -a "$LOG"
  timeout 600 hermes chat -q "Use agency-agents-router: agency_agents_load 'testing-reality-checker', then act as that specialist. TASK: Build failed. Read tail of CONTINUOUS_BUILD.log, diagnose root cause, apply minimal fix, commit. Project dir: $PROJECT" >> "$LOG" 2>&1
else
  echo "=== BUILD SUCCESS ===" | tee -a "$LOG"

  # ── 2. CORE CREW — 2 specialists in PARALLEL (gateway can handle 2) ──
  echo "--- Dispatching core crew (2 agents in parallel) ---" | tee -a "$LOG"

  timeout 700 hermes chat -q "Use agency-agents-router: agency_agents_load 'engineering-backend-architect', then act as that specialist. TASK: Extend the category taxonomy API in app/api/categories/: add attribute-schema endpoint returning per-category JSONB filter schema from SellBuy-lv-Category-Taxonomy.md (cars, real estate, phones, fashion, animals, jobs). Use Prisma skills. Commit when done. Project dir: $PROJECT" > /tmp/crew_backend.log 2>&1 &
  P1=$!

  timeout 700 hermes chat -q "Use agency-agents-router: agency_agents_load 'engineering-frontend-developer', then act as that specialist. TASK: Build the faceted filter sidebar for /listings using the attribute schema from /api/categories/schema. Use shadcn/ui components, Taste-skill glassmorphic Pro Max style, framer-motion transitions. Commit when done. Project dir: $PROJECT" > /tmp/crew_frontend.log 2>&1 &
  P2=$!

  # Wait for both (max ~12 min)
  wait $P1 $P2
  echo "--- Core crew finished ---" | tee -a "$LOG"

  # ── 3. STRATEGY CREW — 1 rotating specialist per cycle ──────────
  IDX=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
  STRATEGY=(
    "product-trend-researcher|Re-rank FEATURE_BACKLOG.md by user impact vs effort."
    "marketing-growth-hacker|Add hreflang tags + trilingual meta descriptions (LV/RU/EN) to categories and listings pages. Commit."
    "project-management-project-shepherd|Update ROADMAP.md: move completed items to Done, set next-cycle goal at top."
    "support-support-responder|Draft in-app help tooltips for listing form fields; store as constants file. Commit."
    "design-ui-finish-gate-reviewer|Final visual QA pass on /new-listing and /listings; fix small polish issues directly. Commit."
  )
  COUNT=${#STRATEGY[@]}
  IDX=$(( IDX % COUNT ))
  IFS='|' read -r S_SLUG S_TASK <<< "${STRATEGY[$IDX]}"
  echo $((IDX + 1)) > "$STATE_FILE"
  echo "--- Strategy slot: $S_SLUG ---" | tee -a "$LOG"
  timeout 500 hermes chat -q "Use agency-agents-router: agency_agents_load '$S_SLUG', then act as that specialist. TASK: $S_TASK Project dir: $PROJECT" >> "$LOG" 2>&1
fi

# ── 4. Reconcile & ship everything ───────────────────────────────
git add -A
git diff --cached --quiet || git commit -m "feat(agency): crew cycle $(date +%Y-%m-%d_%H:%M)" >> "$LOG" 2>&1
git pull --rebase origin main >> "$LOG" 2>&1 || true
git push origin main >> "$LOG" 2>&1 || true

echo "=== $(date) Crew cycle complete ===" | tee -a "$LOG"