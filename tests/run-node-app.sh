#!/usr/bin/env bash

# Run Node test harness
# Usage: ./tests/run-node-app.sh [test-type]
#   test-type: stt, tts, text-intelligence, live-stt, live-tts, flux, or agent (default: stt)

set -e

# Change to project root
cd "$(dirname "$0")/.."

# Default test type
TEST_TYPE="${1:-stt}"

# Validate test type
case "$TEST_TYPE" in
  stt|tts|text-intelligence|live-stt|live-tts|flux|agent)
    ;;
  *)
    echo "Error: Invalid test type '$TEST_TYPE'"
    echo "Valid types: stt, tts, text-intelligence, live-stt, live-tts, flux, agent"
    exit 1
    ;;
esac

echo "Running Node test harness for: $TEST_TYPE"
echo "=================================="

# Run the Node server in background
echo "Starting Node server..."
node tests/node/server.js &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
sleep 2

# Run the conformance tests
echo "Running conformance tests..."
npm run test:$TEST_TYPE

# Capture test exit code
TEST_EXIT_CODE=$?

# Cleanup
echo "Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

echo "=================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "Tests passed!"
else
  echo "Tests failed!"
fi

exit $TEST_EXIT_CODE
