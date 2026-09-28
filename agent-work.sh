#!/bin/bash
cd /home/shadow3/projects/sellbuy-v2

while true; do
    echo "$(date): Starting work cycle" >> /home/shadow3/agent.log
    
    hermes chat --oneshot \
        -q "You are an autonomous developer. CRITICAL: Work FAST and EFFICIENTLY.
            
            1. Check git status - if there are uncommitted changes, commit them NOW with clear message
            2. Review what needs to be done - check open PRs, issues, TODOs in code
            3. Pick ONE high-impact task and COMPLETE it
            4. Write/run tests if possible
            5. Commit with descriptive message
            
            Focus on: Features, bug fixes, performance, or critical improvements.
            Work in /home/shadow3/projects/sellbuy-v2.
            Use: git, npm, node, etc.
            
            Report: What you worked on and what you accomplished." \
        --max-turns 25 \
        2>&1 | tee -a /home/shadow3/agent.log
    
    echo "$(date): Work cycle complete" >> /home/shadow3/agent.log
    sleep 90  # Faster cycle
done
