#!/bin/bash
cd /home/shadow3/projects/sellbuy-v2

while true; do
    echo "$(date): Starting work cycle" >> /home/shadow3/agent.log

    # Search and delegate a specialist for current work
    hermes agency_agents_search --query "fix critical build/lint failures" --limit 1 | tee -a /home/shadow3/agent.log |
        jq -r '.[0].slug' | xargs -I {} hermes agency_agents_delegate \
            --agent {} \
            --task "Fix critical issues, starting with eslint/@typescript-eslint. Ensure all commits pass CI."

    echo "$(date): Work cycle complete" >> /home/shadow3/agent.log
    sleep 180  # 3-minute cycle

done
