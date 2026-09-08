#!/bin/bash
# continuous_build.sh: Autonomous Agency Build Cycle (FEATURE-DRIVEN)
# This script assigns REAL feature tasks to agents, not vague "continue development"
PROJECT="/home/shadow3/projects/sellbuy-v2"
LOG="$PROJECT/CONTINUOUS_BUILD.log"
CREW_STATE="$PROJECT/.crew_state"

cd "$PROJECT"
echo "=== $(date) Starting agency crew cycle (FEATURE-DRIVEN) ===" | tee -a "$LOG"

# 1. Pre-flight Network Check
if ! ping -c 1 github.com > /dev/null 2>&1; then
    echo "=== NETWORK DOWN: Aborting build to save agent capacity ===" | tee -a "$LOG"
    exit 1
fi

# 2. Build
git pull origin main >> "$LOG" 2>&1
npm run build 2>&1 | tee -a "$LOG"
BUILD_OK=${PIPESTATUS[1]}

if [ $BUILD_OK -ne 0 ]; then
    echo "=== BUILD FAILED: Delegating fix to agent ===" | tee -a "$LOG"
    timeout 600 hermes --route hermes-coder -p "Fix the build error in $PROJECT. Read the build log at $LOG for the exact error. Fix the specific file and line causing the issue. Do not rewrite entire files — make targeted fixes only. After fixing, run 'npm run build' to verify." >> "$LOG" 2>&1
    exit 1
fi

# 3. Feature-driven crew rotation
# Each agent gets a SPECIFIC feature task from the specification
AGENT_SLUGS=("engineering-backend-architect" "engineering-frontend-developer" "engineering-devops-automator" "testing-reality-checker")
FEATURE_TASKS=(
    "Backend: Implement the Ratings API endpoint (POST /api/listings/[id]/ratings). Create the Prisma model if needed, implement the route handler with validation, and add proper error handling. Follow the existing patterns in app/api/listings/route.ts."
    "Frontend: Build the RatingStars component (components/ui/rating-stars.tsx). Create a reusable star rating component with interactive selection, display mode, and proper accessibility. Use shadcn/ui patterns and Tailwind."
    "DevOps: Set up the Vercel deployment environment variables. Create a .env.example file documenting all required environment variables (DATABASE_URL, SHADOW_DATABASE_URL, etc.) and add a deployment checklist to the README."
    "Testing: Write integration tests for the Categories API (app/api/categories/route.ts). Test GET /api/categories, GET /api/categories/[id], and error cases. Use the existing test patterns in __tests__/."
)

INDEX=$(cat "$CREW_STATE" 2>/dev/null || echo 0)
AGENT_SLUG=${AGENT_SLUGS[$INDEX]}
FEATURE_TASK=${FEATURE_TASKS[$INDEX]}
NEW_INDEX=$(((INDEX + 1) % ${#AGENT_SLUGS[@]}))
echo "$NEW_INDEX" > "$CREW_STATE"

echo "--- Crew rotation: agent $((INDEX+1))/${#AGENT_SLUGS[@]} = $AGENT_SLUG ---" | tee -a "$LOG"
echo "--- Feature task: $FEATURE_TASK ---" | tee -a "$LOG"

# Run the agent with a SPECIFIC feature task
timeout 600 hermes --route hermes-coder -p "You are building SellBuy.lv marketplace. Your assigned task: $FEATURE_TASK. Project dir: $PROJECT. Work on ONLY this task. Do not touch other files. After completing the task, run 'npm run build' to verify it compiles." >> "$LOG" 2>&1

# 4. Commit & Push only if there are actual code changes (not just logs)
git add -A >> "$LOG" 2>&1
# Check if there are changes beyond just the log file
if git diff --cached --name-only | grep -v "CONTINUOUS_BUILD.log" | grep -v ".crew_state" > /dev/null 2>&1; then
    git commit -m "feat(agency): $AGENT_SLUG - $FEATURE_TASK" >> "$LOG" 2>&1
    git push origin main >> "$LOG" 2>&1
    echo "=== $(date) Feature committed and pushed ===" | tee -a "$LOG"
else
    echo "=== $(date) No feature changes to commit (only log updates) ===" | tee -a "$LOG"
fi