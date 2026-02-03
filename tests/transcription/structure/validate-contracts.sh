#!/bin/bash
# Validate deepgram.toml and Makefile contracts

set -e

REPO_PATH="${1:-$PWD}"
SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

# Source parsers
source "$SCRIPT_DIR/shared/toml-parser.sh"
source "$SCRIPT_DIR/shared/makefile-parser.sh"

echo "🔍 Validating repository contracts at: $REPO_PATH"

TOML_FILE="$REPO_PATH/deepgram.toml"
MAKEFILE="$REPO_PATH/Makefile"

errors=0

# 1. Check deepgram.toml exists and is valid
echo "Checking deepgram.toml..."
if [[ ! -f "$TOML_FILE" ]]; then
  echo "❌ Error: deepgram.toml not found"
  exit 1
fi

if ! check_toml_has_sections "$TOML_FILE"; then
  echo "❌ Error: deepgram.toml is not valid"
  exit 1
fi
echo "✅ deepgram.toml exists and is valid"

# 2. Validate [meta] section exists
echo "Checking [meta] section..."
meta_content=$(parse_toml_meta "$TOML_FILE")
if [[ -z "$meta_content" ]]; then
  echo "❌ Error: [meta] section not found in deepgram.toml"
  errors=1
else
  echo "✅ [meta] section exists"
fi

# 3. Validate lifecycle sections
echo "Checking lifecycle sections..."
required_lifecycles=("check" "install" "start" "update" "clean" "test")

for lifecycle in "${required_lifecycles[@]}"; do
  if ! grep -q "^\[lifecycle\.${lifecycle}\]" "$TOML_FILE"; then
    echo "❌ Error: [lifecycle.${lifecycle}] section not found"
    errors=1
  else
    # Check if command property exists
    command=$(parse_toml_lifecycle "$TOML_FILE" "$lifecycle")
    if [[ -z "$command" ]]; then
      echo "❌ Error: [lifecycle.${lifecycle}] missing 'command' property"
      errors=1
    else
      echo "✅ [lifecycle.${lifecycle}] exists with command: $command"
    fi
  fi
done

# 4. Check Makefile exists
echo "Checking Makefile..."
if [[ ! -f "$MAKEFILE" ]]; then
  echo "❌ Error: Makefile not found"
  exit 1
fi
echo "✅ Makefile exists"

# 5. Validate Makefile targets
echo "Checking Makefile targets..."
if ! validate_makefile_targets "$MAKEFILE" "${required_lifecycles[@]}"; then
  errors=1
else
  echo "✅ All required Makefile targets exist"
fi

# 6. STRICT: Validate Makefile commands match TOML
echo "Validating Makefile/TOML alignment..."
for lifecycle in "${required_lifecycles[@]}"; do
  toml_command=$(parse_toml_lifecycle "$TOML_FILE" "$lifecycle" | xargs)
  make_command=$(get_makefile_command "$MAKEFILE" "$lifecycle" | xargs)

  if [[ -n "$toml_command" && -n "$make_command" ]]; then
    # Compare commands (normalize whitespace)
    if [[ "$toml_command" != "$make_command" ]]; then
      echo "❌ Mismatch for '$lifecycle':"
      echo "   TOML: $toml_command"
      echo "   Make: $make_command"
      errors=1
    fi
  fi
done

if [[ $errors -eq 0 ]]; then
  echo "✅ Contract validation passed"
  exit 0
else
  echo "❌ Contract validation failed"
  exit 1
fi
