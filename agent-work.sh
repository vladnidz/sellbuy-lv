#!/bin/bash
export HERMES_HOME=/root/.hermes
cd /home/shadow3/projects/sellbuy-v2

echo "$(date): 24/7 Resilient Autonomous Agent Started" >> /home/shadow3/agent.log

while true; do
    echo "$(date): Starting Agency autonomous work cycle..." >> /home/shadow3/agent.log
    
    /usr/local/bin/hermes chat \
        --in /home/shadow3/projects/sellbuy-v2 \
        --oneshot \
        --max-turns 25 \
        -q "You are a Lead Autonomous Engineer working on sellbuy-v2 with the Agency roster.
AGENCY SPECIALIST INSTRUCTIONS:
To load an Agency specialist immediately, use tool_describe(names=['agency_agents_search', 'agency_agents_load']) then invoke tool_call with agency_agents_load(slug='frontend-developer') or fullstack-developer.

WORK CYCLE RULES:
1. FOCUS ON ONE SINGLE BACKLOG ITEM per turn. Do NOT build multiple features in one huge cycle. Small, atomic commits only!
2. Check FEATURE_BACKLOG.md for the next uncompleted feature.
3. MUST run 'npm run lint' locally and fix ALL lint errors and warnings before committing. Never use 'any' types or state updates in useEffect.
4. MUST run 'npm test' and 'npm run build' locally before committing. If build fails, fix or revert before ending.
5. Commit immediately with conventional commit message (e.g. feat(...): ...), push to origin main, and run 'docker compose up -d --build sellbuy' to update production live!" \
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
