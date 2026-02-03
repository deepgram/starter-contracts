#!/usr/bin/env bash

# Run Node test harness
# This script is designed to be run from a starter app directory (e.g., node-transcription)
# with the contracts repo added as a submodule in the contracts/ directory.
#
# Prerequisites:
# - Starter app must be a Node-based project
# - contracts repo must be present as a git submodule in ./contracts/
# - Current working directory must be the starter app root
#
# Usage: ./contracts/tests/run-node-app.sh

set -e

# Store the repo root (starter app directory)
REPO_ROOT="$(pwd)"
export REPO_PATH="$REPO_ROOT"

# Check that we're in a Node starter app directory
if [[ ! -f "package.json" ]]; then
  echo "❌ Error: Must run from Node starter app root directory"
  echo "   Expected file: package.json"
  exit 1
fi

# Check that contracts directory exists
if [[ ! -d "contracts" ]]; then
  echo "❌ Error: contracts/ directory not found"
  echo "   Add starter-contracts as a submodule:"
  echo "   git submodule add git@github.com:deepgram/starter-contracts.git contracts"
  exit 1
fi

echo "Running Node test harness"
echo "====================================================="

# Track overall test status
TESTS_FAILED=0

# 1. Run .npmrc validation
echo ""
echo "🔒 Running .npmrc security validation..."
echo "---------------------------------------------------"

if ./contracts/tests/node/validate-npmrc.sh "$REPO_ROOT"; then
  echo "✅ .npmrc validation passed"
else
  echo "❌ .npmrc validation failed"
  TESTS_FAILED=1
fi

# 2. Run Node project structure validation
echo ""
echo "📁 Running project structure validation..."
echo "---------------------------------------------------"

if ./contracts/tests/node/validate-structure.sh "$REPO_ROOT"; then
  echo "✅ Structure validation passed"
else
  echo "❌ Structure validation failed"
  TESTS_FAILED=1
fi

echo ""
echo "====================================================="
if [ $TESTS_FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed"
  exit 1
fi
