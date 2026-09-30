#!/bin/bash
export HERMES_HOME=/root/.hermes
cd /home/shadow3/projects/sellbuy-v2

echo "$(date): 24/7 Resilient Autonomous Agent Started" >> /home/shadow3/agent.log

while true; do
    echo "$(date): Starting Agency autonomous work cycle..." >> /home/shadow3/agent.log
    
    /usr/local/bin/hermes chat \
        --in /home/shadow3/projects/sellbuy-v2 \
        --oneshot \
        --max-turns 20 \
        -q "You are a Lead Autonomous Engineer working on sellbuy-v2 with the Agency roster.
RULES & QUALITY ENFORCEMENT:
1. FOCUS ON ONE SINGLE BACKLOG ITEM per turn. Do NOT build multiple features in one huge cycle. Small, atomic commits only!
2. Use agency_agents_search and agency_agents_load to load the appropriate specialist (e.g. fullstack-developer, qa-engineer).
3. Check FEATURE_BACKLOG.md for the next uncompleted feature (e.g. Postgres FTS full-text search, Smart-ID trust badges, Omniva/DPD locker picker).
4. MUST run 'npm run lint' locally and fix ALL lint errors and warnings before committing. Never use 'any' types or state updates in useEffect.
5. MUST run 'npm test' and 'npm run build' locally before committing. If build fails, fix or revert before ending.
6. Commit immediately with conventional commit message (e.g. feat(fts): ...), push to origin main, and run 'docker compose up -d --build sellbuy' to update production live!" \
        2>&1 | tee -a /home/shadow3/agent.log

    EXIT_STATUS=${PIPESTATUS[0]}

    if [ $EXIT_STATUS -ne 0 ]; then
        echo "$(date): Work cycle hit 503/error (exit code $EXIT_STATUS). Auto-retrying in 30 seconds..." >> /home/shadow3/agent.log
        sleep 30
    else
        echo "$(date): Agency work cycle completed successfully." >> /home/shadow3/agent.log
        sleep 180  # 3-minute pause between successful cycles
    fi
done
