# Live Text-to-Speech Interface Contract

WebSocket proxy to Deepgram's Live Text-to-Speech API. The starter app simply passes through all messages (text and binary) between the client and Deepgram.

## WebSocket Endpoint

```
wss://{host}:{port}/live-tts/stream
```

## Message Handling

The proxy accepts and forwards:
- **JSON messages** - Any JSON payload (text input, control messages)
- **Binary messages** - Audio data streams

All messages are passed directly to/from Deepgram's Live Text-to-Speech API. See the [Deepgram Live TTS documentation](https://developers.deepgram.com/docs/tts-websocket) for message format details.

## Conformance Testing

Run conformance tests to validate your proxy implementation:

```bash
# Start your starter app (on port 8080)
cd my-live-text-to-speech-starter
pnpm start  # Runs on http://localhost:8080

# Run conformance tests
cd starter-contracts
BASE_URL=http://localhost:8080 pnpm run test:live-text-to-speech
```
