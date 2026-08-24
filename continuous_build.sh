#!/bin/bash
set -e

cd ~/projects/sellbuy-v2

echo "=== $(date) Starting build cycle ===" | tee -a CONTINUOUS_BUILD.log

# Pull latest
git pull origin main 2>&1 | tee -a CONTINUOUS_BUILD.log

# Install deps if needed
if [ ! -d node_modules ]; then
  npm install 2>&1 | tee -a CONTINUOUS_BUILD.log
fi

# Build with Prisma generation
npm run build 2>&1 | tee -a CONTINUOUS_BUILD.log

# Check if build succeeded
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo "=== BUILD SUCCESS ===" | tee -a CONTINUOUS_BUILD.log
else
  echo "=== BUILD FAILED ===" | tee -a CONTINUOUS_BUILD.log
  exit 1
fi

echo "=== $(date) Build cycle complete ===" | tee -a CONTINUOUS_BUILD.log
