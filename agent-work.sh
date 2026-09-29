#!/bin/bash
export HERMES_HOME=/root/.hermes
cd /home/shadow3/projects/sellbuy-v2

while true; do
    echo "$(date): Starting Agency autonomous work cycle" >> /home/shadow3/agent.log
    
    /usr/local/bin/hermes chat \
        --in /home/shadow3/projects/sellbuy-v2 \
        --oneshot \
        --max-turns 35 \
        -q "You are a Lead Autonomous Engineer working on sellbuy-v2 with the Agency roster.
1. Use agency-agents-router plugin (agency_agents_search, agency_agents_load) to load relevant specialists (e.g. fullstack-developer, frontend-developer, qa-engineer, backend-architect).
2. Check FEATURE_BACKLOG.md and recent commits to identify the next MAJOR incomplete feature (e.g. Postgres Full-Text Search, Listing Image upload pipeline, Message chat initiation from listings, or User Profile reviews).
3. Build the COMPLETE feature end-to-end (API routes, UI components, types, database queries, unit tests).
4. Verify npm test (100% pass) and npm run build (0 errors).
5. Commit with a descriptive conventional commit message and push to origin main." \
        2>&1 | tee -a /home/shadow3/agent.log
    
    echo "$(date): Agency work cycle complete" >> /home/shadow3/agent.log
    sleep 300  # 5-minute pause between cycles
done
