#!/bin/bash
# TOML parser utilities for deepgram.toml

# Extract [meta] section as key=value pairs
parse_toml_meta() {
  local toml_file="$1"

  if [[ ! -f "$toml_file" ]]; then
    echo "Error: TOML file not found: $toml_file" >&2
    return 1
  fi

  # Extract [meta] section until next section or EOF
  sed -n '/^\[meta\]/,/^\[/p' "$toml_file" | \
    grep -v '^\[' | \
    grep -v '^#' | \
    grep -v '^$' | \
    sed 's/^[[:space:]]*//' | \
    sed 's/[[:space:]]*$//'
}

# Extract specific lifecycle command
# Usage: parse_toml_lifecycle <toml_file> <lifecycle_name>
# Example: parse_toml_lifecycle deepgram.toml "install"
parse_toml_lifecycle() {
  local toml_file="$1"
  local lifecycle_name="$2"

  if [[ -z "$lifecycle_name" ]]; then
    echo "Error: lifecycle_name parameter required" >&2
    return 1
  fi

  if [[ ! -f "$toml_file" ]]; then
    echo "Error: TOML file not found: $toml_file" >&2
    return 1
  fi

  # Extract specific lifecycle section and get command value
  sed -n "/^\[lifecycle\.${lifecycle_name}\]/,/^\[/p" "$toml_file" | \
    grep '^command' | \
    sed 's/command[[:space:]]*=[[:space:]]*//' | \
    sed 's/^"\(.*\)"$/\1/'
}

# Check if TOML file has at least one section
check_toml_has_sections() {
  local toml_file="$1"

  if [[ ! -f "$toml_file" ]]; then
    echo "Error: TOML file not found: $toml_file" >&2
    return 1
  fi

  # Basic validation: check for balanced brackets
  local open_brackets=$(grep -c '^\[' "$toml_file")

  if [[ $open_brackets -eq 0 ]]; then
    echo "Error: No sections found in TOML file" >&2
    return 1
  fi

  return 0
}

# List all lifecycle sections
list_toml_lifecycles() {
  local toml_file="$1"

  if [[ ! -f "$toml_file" ]]; then
    echo "Error: TOML file not found: $toml_file" >&2
    return 1
  fi

  grep '^\[lifecycle\.' "$toml_file" | \
    sed 's/^\[lifecycle\.//' | \
    sed 's/\]$//'
}
