#!/bin/bash
# Validate .npmrc security settings

set -e

REPO_PATH="${1:-$PWD}"
NPMRC_FILE="$REPO_PATH/.npmrc"
RULES_FILE="$(dirname "$0")/shared/npmrc-rules.txt"

echo "🔍 Validating .npmrc at: $NPMRC_FILE"

# Check .npmrc exists
if [[ ! -f "$NPMRC_FILE" ]]; then
  echo "❌ Error: .npmrc not found at $NPMRC_FILE"
  exit 1
fi

# Read required rules
if [[ ! -f "$RULES_FILE" ]]; then
  echo "❌ Error: Rules file not found at $RULES_FILE"
  exit 1
fi

# Validate each required setting
missing_settings=()
incorrect_settings=()

while IFS='=' read -r key value; do
  # Skip empty lines and comments
  [[ -z "$key" || "$key" =~ ^# ]] && continue

  # Check if setting exists in .npmrc
  if ! grep -q "^${key}=" "$NPMRC_FILE"; then
    missing_settings+=("$key=$value")
  else
    # Check if value matches
    actual_value=$(grep "^${key}=" "$NPMRC_FILE" | sed 's/^[^=]*=//')
    if [[ "$actual_value" != "$value" ]]; then
      incorrect_settings+=("$key: expected '$value', got '$actual_value'")
    fi
  fi
done < "$RULES_FILE"

# Report results
errors=0

if [[ ${#missing_settings[@]} -gt 0 ]]; then
  echo "❌ Missing required .npmrc settings:"
  printf '   - %s\n' "${missing_settings[@]}"
  errors=1
fi

if [[ ${#incorrect_settings[@]} -gt 0 ]]; then
  echo "❌ Incorrect .npmrc settings:"
  printf '   - %s\n' "${incorrect_settings[@]}"
  errors=1
fi

if [[ $errors -eq 0 ]]; then
  echo "✅ .npmrc validation passed"
  exit 0
else
  echo "❌ .npmrc validation failed"
  exit 1
fi
