#!/bin/bash
# continuous_build.sh: Autonomous Agency Build Cycle
PROJECT="/home/shadow3/projects/sellbuy-v2"
LOG="$PROJECT/CONTINUOUS_BUILD.log"
CREW_STATE="$PROJECT/.crew_state"

cd "$PROJECT"
echo "=== $(date) Starting agency crew cycle ===" | tee -a "$LOG"

# 1. Build & Test
git pull origin main >> "$LOG" 2>&1
npm run build 2>&1 | tee -a "$LOG"
BUILD_OK=${PIPESTATUS[1]}

# 2. Parallel Crew Deployment (Atomic, verifiable delegation)
# Cycle through specialists to avoid 503 capacity errors
AGENT_SLUGS=("engineering-backend-architect" "engineering-frontend-developer" "engineering-devops-automator" "testing-reality-checker")
INDEX=$(cat "$CREW_STATE" 2>/dev/null || echo 0)
AGENT_SLUG=${AGENT_SLUGS[$INDEX]}
NEW_INDEX=$(((INDEX + 1) % ${#AGENT_SLUGS[@]}))
echo "$NEW_INDEX" > "$CREW_STATE"

echo "--- Crew rotation: agent $((INDEX+1))/${#AGENT_SLUGS[@]} = $AGENT_SLUG ---" | tee -a "$LOG"

# CORRECTED DELEGATION: Pass slug explicitly
timeout 600 hermes chat -q "Use the agency-agents-router plugin. First call agency_agents_load --agent '$AGENT_SLUG', then execute the assigned task. TASK: Implement/verify priority feature in $PROJECT. Project dir: $PROJECT" >> "$LOG" 2>&1

# 3. Commit & Push
git add -A >> "$LOG" 2>&1
git commit -m "feat(agency): $AGENT_SLUG cycle $(date +%Y-%m-%d_%H:%M)" >> "$LOG" 2>&1
git push origin main >> "$LOG" 2>&1

echo "=== $(date) Crew cycle complete ===" | tee -a "$LOG"
