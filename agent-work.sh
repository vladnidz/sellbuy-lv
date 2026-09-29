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
1. Use agency-agents-router plugin (agency_agents_search, agency_agents_load) to load relevant specialists (e.g. fullstack-developer, frontend-developer, qa-engineer, backend-architect).
2. Check FEATURE_BACKLOG.md and recent commits to identify the next incomplete feature (e.g. Postgres FTS full-text search, Smart-ID trust badges, Omniva/DPD locker picker).
3. Implement the feature cleanly across components, API routes, and unit tests.
4. Verify npm test and npm run build both pass cleanly.
5. Commit with a clear conventional commit message and push to origin main." \
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
