#!/bin/bash
export HERMES_HOME=/root/.hermes
cd /home/shadow3/projects/sellbuy-v2

while true; do
    echo "$(date): Starting Agency autonomous work cycle" >> /home/shadow3/agent.log
    
    /usr/local/bin/hermes chat \
        --in /home/shadow3/projects/sellbuy-v2 \
        --oneshot \
        --max-turns 15 \
        -q "You are an autonomous developer working on sellbuy-v2 using Agency specialists.
1. Use agency-agents-router plugin (agency_agents_search, agency_agents_load) to load a specialist (e.g. frontend-developer, qa-engineer).
2. Check git status, npm test, and npm run build.
3. Implement ONE high-priority feature, test, or fix with clean code.
4. Verify tests and build pass, then commit with a conventional commit message and push to origin main." \
        2>&1 | tee -a /home/shadow3/agent.log
    
    echo "$(date): Agency work cycle complete" >> /home/shadow3/agent.log
    sleep 600  # 10-minute pause between cycles to prevent API provider capacity saturation
done
