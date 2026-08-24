#!/bin/bash
set -e

cd ~/projects/sellbuy-v2

echo "=== $(date) Starting build cycle ==="

# Pull latest
git pull origin main 2>&1 | tee -a CONTINUOUS_BUILD.log

# Install deps if needed
if [ ! -d node_modules ]; then
  npm install 2>&1 | tee -a CONTINUOUS_BUILD.log
fi

# Build
npm run build 2>&1 | tee -a CONTINUOUS_BUILD.log

# Check if build succeeded
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo "=== BUILD SUCCESS ===" | tee -a CONTINUOUS_BUILD.log
  # Could add test here: npm test 2>&1 | tee -a CONTINUOUS_BUILD.log
else
  echo "=== BUILD FAILED ===" | tee -a CONTINUOUS_BUILD.log
  exit 1
fi

echo "=== $(date) Build cycle complete ===" | tee -a CONTINUOUS_BUILD.log
