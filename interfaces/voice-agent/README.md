# Agent Interface Contract

WebSocket proxy to Deepgram's Voice Agent API. The starter app simply passes through all messages (text and binary) between the client and Deepgram.

## WebSocket Endpoint

```
wss://{host}:{port}/agent/converse
```

## Message Handling

The proxy accepts and forwards:
- **JSON messages** - Any JSON payload (settings, commands, events)
- **Binary messages** - Audio data streams

All messages are passed directly to/from Deepgram's Agent API. See the [Deepgram Voice Agent documentation](https://developers.deepgram.com/docs/agent) for message format details.

## Conformance Testing

Run conformance tests to validate your proxy implementation:

```bash
# Start your starter app (on port 8080)
cd my-agent-starter
pnpm start  # Runs on http://localhost:8080

# Run conformance tests
cd starter-contracts
BASE_URL=http://localhost:8080 pnpm run test:voice-agent
```
