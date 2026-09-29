#!/bin/bash
export HERMES_HOME=/root/.hermes
cd /home/shadow3/projects/sellbuy-v2

while true; do
    echo "$(date): Starting Agency autonomous work cycle" >> /home/shadow3/agent.log
    
    /usr/local/bin/hermes chat \
        --in /home/shadow3/projects/sellbuy-v2 \
        --oneshot \
        --max-turns 30 \
        -q "You are an autonomous developer working on sellbuy-v2 using Agency specialists.
1. Use the agency-agents-router plugin (agency_agents_search, agency_agents_inspect, agency_agents_load) to search and load relevant specialists for the task (e.g. frontend-developer, qa-engineer, security-auditor, ui-designer).
2. Check git status, npm test, and npm run build to verify code health.
3. Identify the next high-value improvement, feature enhancement, test coverage expansion, or bug fix.
4. Implement the changes with clean code.
5. Verify npm test and npm run build both PASS.
6. Commit changes with a clear conventional commit message and push to origin main." \
        2>&1 | tee -a /home/shadow3/agent.log
    
    echo "$(date): Agency work cycle complete" >> /home/shadow3/agent.log
    sleep 180  # 3-minute pause between cycles
done
