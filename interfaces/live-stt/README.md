# Live STT Interface Contract

Minimal live speech-to-text scaffolding for Deepgram starter applications. Stream live audio, get real-time transcripts.

**Purpose:** This contract provides the bare minimum structure for internal developers to quickly build live STT starter apps. It's scaffolding, not a production-ready demo.

## Transport

WebSocket

## Endpoint

```
ws://localhost:PORT?stream_url=STREAM_URL&model=MODEL&language=LANGUAGE
```

### Example

```
ws://localhost:3000?stream_url=http://stream.live.vc.bbcmedia.co.uk/bbc_world_service&model=nova-3&language=en
```

## Query Parameters

See [query.json](./schema/query.json).

**Minimal parameters:**
- `stream_url` - URL of live audio stream (required)
- `model` - STT model (defaults to 'nova-3')
- `language` - Language code (defaults to 'en')

## Request

Binary audio data (containerized formats like WebM, MP3, AAC).

The starter app fetches audio from the `stream_url` and streams it to Deepgram. Clients receive transcription results over the WebSocket connection.

See [request.json](./schema/request.json).

## Responses

### Transcript Results

Real-time transcription events (both interim and final results).

See [response.json](./schema/response.json)

### Errors

WebSocket error messages.

See [error.json](./schema/error.json)

## Conformance Requirements & Testing

Starter applications implementing this interface at a minimum should pass the [conformance tests](./conformance/stream.spec.js). These conformance tests validate that your minimal starter app correctly implements the live STT scaffolding contract.

### Prerequisites

1. **Your starter app must be running** and accessible via WebSocket
2. **Implement the WebSocket endpoint** according to this specification in your Starter App.
3. **Install dependencies** in this contracts repo:

   ```bash
   cd starter-contracts
   npm install
   ```

### Running Conformance Tests

#### Against Your Local Development Server

```bash
# Start your starter app (example - your commands will vary)
cd my-live-stt-starter
npm start  # Runs on ws://localhost:3000

# In another terminal, run conformance tests
cd starter-contracts
WS_URL=ws://localhost:3000 npm run test:live-stt
```

#### Against Your Deployed Starter App

```bash
# Test your deployed app
WS_URL=wss://my-live-stt-app.vercel.app npm run test:live-stt
```