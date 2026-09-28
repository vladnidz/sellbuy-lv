#!/bin/bash
cd /home/shadow3/projects/sellbuy-v2

while true; do
    echo "$(date): Starting work cycle" >> /home/shadow3/agent.log
    
    # Run hermes with oneshot query mode
    hermes chat --oneshot \
        -q "You are an autonomous developer working on sellbuy-v2 project. 
             1. Check git status for any uncommitted changes
             2. Review recent commits to understand current state  
             3. Look at open TODOs, issues, or PR comments
             4. Pick the highest priority task (feature, bug fix, or docs)
             5. Complete meaningful work and commit with descriptive message
             
             Focus on: features, bug fixes, tests, or documentation improvements.
             Work in /home/shadow3/projects/sellbuy-v2.
             Use standard tools: git, npm, node, etc.
             When done, commit your changes and report what you accomplished." \
        --max-turns 30 \
        2>&1 | tee -a /home/shadow3/agent.log
    
    echo "$(date): Work cycle complete, sleeping..." >> /home/shadow3/agent.log
    sleep 120
done
