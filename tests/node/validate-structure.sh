#!/bin/bash
# Validate Node.js project structure

set -e

REPO_PATH="${1:-$PWD}"

echo "🔍 Validating Node.js project structure at: $REPO_PATH"

errors=0

# Check package.json exists and is valid JSON
if [[ ! -f "$REPO_PATH/package.json" ]]; then
  echo "❌ Error: package.json not found"
  errors=1
elif ! jq empty "$REPO_PATH/package.json" 2>/dev/null; then
  echo "❌ Error: package.json is not valid JSON"
  errors=1
else
  echo "✅ package.json exists and is valid JSON"

  # Check required fields
  for field in name version scripts; do
    if ! jq -e ".$field" "$REPO_PATH/package.json" >/dev/null 2>&1; then
      echo "❌ Error: package.json missing required field: $field"
      errors=1
    fi
  done
fi

# Check pnpm-lock.yaml exists (enforces pnpm usage)
if [[ ! -f "$REPO_PATH/pnpm-lock.yaml" ]]; then
  echo "❌ Error: pnpm-lock.yaml not found (project must use pnpm)"
  errors=1
else
  echo "✅ pnpm-lock.yaml exists"
fi

# Check node_modules exists (dependencies installed)
if [[ ! -d "$REPO_PATH/node_modules" ]]; then
  echo "⚠️  Warning: node_modules not found (dependencies may not be installed)"
  # Not a hard error - might be intentional
else
  echo "✅ node_modules exists"
fi

# Final result
if [[ $errors -eq 0 ]]; then
  echo "✅ Node.js structure validation passed"
  exit 0
else
  echo "❌ Node.js structure validation failed"
  exit 1
fi
