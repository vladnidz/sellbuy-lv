#!/bin/bash
# continuous_build.sh: Autonomous Agency Build Cycle (FAIL-FAST)
PROJECT="/home/shadow3/projects/sellbuy-v2"
LOG="$PROJECT/CONTINUOUS_BUILD.log"
CREW_STATE="$PROJECT/.crew_state"

cd "$PROJECT"
echo "=== $(date) Starting agency crew cycle (FAIL-FAST) ===" | tee -a "$LOG"

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
    AGENT_SLUG="engineering-frontend-developer" # Always default to frontend-developer for build issues
    timeout 600 hermes --route hermes-coder -p "Fix the build error in $PROJECT based on the log. TASK: Fix build error. Project dir: $PROJECT" >> "$LOG" 2>&1
    exit 1
fi

# 3. Parallel Crew Deployment (Slot rotation)
AGENT_SLUGS=("engineering-backend-architect" "engineering-frontend-developer" "engineering-devops-automator" "testing-reality-checker")
INDEX=$(cat "$CREW_STATE" 2>/dev/null || echo 0)
AGENT_SLUG=${AGENT_SLUGS[$INDEX]}
NEW_INDEX=$(((INDEX + 1) % ${#AGENT_SLUGS[@]}))
echo "$NEW_INDEX" > "$CREW_STATE"

echo "--- Crew rotation: agent $((INDEX+1))/${#AGENT_SLUGS[@]} = $AGENT_SLUG ---" | tee -a "$LOG"

timeout 600 hermes --route hermes-coder -p "Use the agency-agents-router plugin. Load '$AGENT_SLUG', execute assigned task. Task: Continue development based on latest PR. Project dir: $PROJECT" >> "$LOG" 2>&1

# 4. Commit & Push only on success
git add -A >> "$LOG" 2>&1
git commit -m "feat(agency): $AGENT_SLUG cycle $(date +%Y-%m-%d_%H:%M)" >> "$LOG" 2>&1
git push origin main >> "$LOG" 2>&1

echo "=== $(date) Crew cycle complete ===" | tee -a "$LOG"
