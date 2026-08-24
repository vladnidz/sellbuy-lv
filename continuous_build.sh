#!/bin/bash
# SellBuy.lv autonomous crew cycle - rotates through 8 specialists, one per cycle
# Each cycle: build -> delegate ONE agent (small request avoids 503) -> commit

PROJECT=~/projects/sellbuy-v2
LOG=$PROJECT/CONTINUOUS_BUILD.log
STATE_FILE=$PROJECT/.crew_state
cd "$PROJECT" || exit 1

echo "=== $(date) Starting agency crew cycle ===" | tee -a "$LOG"

# 1. Sync & build
git pull origin main >> "$LOG" 2>&1
if [ ! -d node_modules ]; then npm install >> "$LOG" 2>&1; fi
npm run build >> "$LOG" 2>&1
BUILD_OK=$?

if [ $BUILD_OK -ne 0 ]; then
  echo "=== BUILD FAILED ===" | tee -a "$LOG"
  # On failure, always delegate to reality-checker to diagnose
  AGENT_SLUG="testing-reality-checker"
  TASK="Build failed this cycle. Read CONTINUOUS_BUILD.log tail, diagnose root cause, propose minimal fix."
else
  echo "=== BUILD SUCCESS ===" | tee -a "$LOG"
  # 2. Rotate crew: read state, pick next agent
  IDX=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
  AGENTS=(
    "engineering-backend-architect|Implement category taxonomy API from app/: /api/categories tree endpoint with ltree queries and JSONB attribute schema. Use Prisma skills. Commit changes."
    "engineering-frontend-developer|Implement listing creation form improvements at app/new-listing with AI auto-fill fields. Use shadcn/ui components, glassmorphic Pro Max style, framer-motion transitions. Commit changes."
    "engineering-devops-automator|Review Dockerfile and Vercel config in repo root. Verify env vars documented in README. Run lint. Fix any issues found. Commit changes."
    "testing-reality-checker|Write tests for CategoryCard component and /api/listings endpoint. Add to project as __tests__/. Commit changes."
    "product-trend-researcher|Read docs/ or README, analyze SellBuy MVP gaps vs SS.lv, write FEATURE_BACKLOG.md top 10 priorities ranked by impact. Commit."
    "design-brand-guardian|Audit components/ and app/ UI consistency: verify all pages use shadcn tokens, consistent spacing/typography. Write DESIGN_AUDIT.md with fixes needed. Commit."
    "marketing-growth-hacker|Write SEO strategy: add metadata+OpenGraph to all pages, JSON-LD structured data for listings. Implement directly. Commit changes."
    "project-management-project-shepherd|Update ROADMAP.md: mark done items, reorder remaining by dependency. Review git log last 20 commits for progress summary. Commit."
  )
  COUNT=${#AGENTS[@]}
  IDX=$(( (IDX % COUNT) ))
  IFS='|' read -r AGENT_SLUG TASK <<< "${AGENTS[$IDX]}"
  echo $((IDX + 1)) > "$STATE_FILE"
  echo "--- Crew rotation: agent $((IDX+1))/$COUNT = $AGENT_SLUG ---" | tee -a "$LOG"
fi

# 3. Delegate ONE specialist via hermes CLI (uses hermes-coder route through gateway)
echo "--- Delegating to $AGENT_SLUG ---" | tee -a "$LOG"
timeout 900 hermes chat -q "Use the agency-agents-router plugin. First call agency_agents_load for '$AGENT_SLUG', then execute its instructions as that specialist. TASK: $TASK Project dir: $PROJECT" >> "$LOG" 2>&1
DELEGATE_OK=$?

if [ $DELEGATE_OK -eq 0 ]; then
  echo "--- Delegation OK ---" | tee -a "$LOG"
else
  echo "--- Delegation failed (exit $DELEGATE_OK), will retry next cycle with same slot ---" | tee -a "$LOG"
  # rewind state so next cycle retries this agent
  PREV=$((IDX))
  echo $PREV > "$STATE_FILE"
fi

# 4. Commit any produced work
git add -A
git diff --cached --quiet || git commit -m "feat(agency): $AGENT_SLUG cycle $(date +%Y-%m-%d_%H:%M)" >> "$LOG" 2>&1
git push origin main >> "$LOG" 2>&1 || true

echo "=== $(date) Crew cycle complete ===" | tee -a "$LOG"
