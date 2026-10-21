#!/bin/bash
export HERMES_HOME=/root/.hermes
cd /home/shadow3/projects/sellbuy-v2

echo "$(date): 24/7 Resilient Autonomous Agent Started" >> /home/shadow3/agent.log

while true; do
    echo "$(date): Starting Agency autonomous work cycle..." >> /home/shadow3/agent.log
    
    # Ensure local tree is cleanly synchronized with origin/main
    git pull --rebase origin main >> /home/shadow3/agent.log 2>&1
    
    /usr/local/bin/hermes chat \
        --in /home/shadow3/projects/sellbuy-v2 \
        --oneshot \
        --max-turns 25 \
        -q "You are a Lead Autonomous Engineer working on sellbuy-v2 with our complete 640+ skill arsenal (Superpowers, Interfaces, Wondelai, and Agency roster).

MULTI-SKILL EXECUTION DIRECTIVES:
- FRONTEND & UI: For every screen or UI component, load and apply 'interfaces:better-ui' (exact radius nesting & surfaces), 'interfaces:better-typography' (tabular-nums & font metrics), 'wondelai:refactoring-ui', and 'kill-ai-slop' (no AI gradient blobs/slop).
- BACKEND & DATA: For APIs and database models, load and apply 'wondelai:clean-architecture', 'wondelai:system-design' (idempotency & locking), and 'superpowers:test-driven-development' (write unit tests in __tests__/ alongside code).
- DEBUGGING: If build/lint/test fails, load 'superpowers:systematic-debugging' to diagnose root causes before applying fixes.
- VERIFICATION: Always load 'superpowers:verification-before-completion' to verify real execution output before committing.
- SPECIALISTS: Use tool_describe(names=['agency_agents_search', 'agency_agents_load']) then agency_agents_load(slug='frontend-developer' or 'fullstack-developer') as needed.

WORK CYCLE RULES:
1. FOCUS ON ONE SINGLE BACKLOG ITEM per turn from FEATURE_BACKLOG.md. Small, atomic commits only!
2. Check FEATURE_BACKLOG.md for the next item marked ⏳. When finished, mark it DONE and advance the next item.
3. MUST run 'npm run lint' locally and fix ALL lint errors and warnings before committing. Never use 'any' types or state updates in useEffect.
4. MUST run 'npm test' locally before committing. All test suites must pass (100% green).
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
