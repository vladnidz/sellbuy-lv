# Build & Deployment Guardrails

1. **LOCAL BUILD IS MANDATORY:** No agent is permitted to commit code that has not been built and passed `npm run build` locally.
2. **VERIFICATION:** If `npm run build` fails, the agent MUST log the failure in `.hermes/agent-state.json` and cease feature development.
3. **PUSH LOCK:** The Git push command is gated. Only the Orchestrator agent may push to the repository, and ONLY after verifying the local build is successful.
4. **TURBOPACK/WEBPACK:** We are currently locked to Webpack (`--webpack`) for stability. Do NOT attempt to switch back to Turbopack without a manual audit of the CSS and dependency files.
