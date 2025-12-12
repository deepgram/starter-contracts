# STT Interface Contract

Minimal Speech-to-Text scaffolding for Deepgram starter applications. Upload audio file or send URL via multipart form data, get transcript JSON.

**Purpose:** This contract provides the bare minimum structure for internal developers to quickly build STT starter apps. It's scaffolding, not a production-ready demo.

## Transport

HTTP REST API

## Endpoint

```http
POST /stt/transcribe
```

## Request Body (multipart/form-data)

See [request.json](./schema/request.json).

Required (one of):
- `file` - Audio/video file (binary)
- `url` - URL to audio file (string)

Optional:
- `model` - STT model to use (string, e.g., 'nova-3', 'nova-2', 'base')

## Responses

### 200 OK

See [transcript.json](./schema/transcript.json)

### 4XX Errors

See [error.json](./schema/error.json)

## Conformance Requirements & Testing

Starter applications implementing this interface at a minimum should pass the [conformance tests](./conformance/transcribe.spec.js). These conformance tests validate that your minimal starter app correctly implements the STT scaffolding contract.

### Prerequisites

1. **Your starter app must be running** and accessible via HTTP
2. **Implement the `/stt/transcribe` endpoint** according to this specification in your Starter App.
3. **Install dependencies** in this contracts repo:

   ```bash
   cd starter-contracts
   pnpm install
   ```

### Running Conformance Tests

#### Against Your Local Development Server

```bash
# Start your starter app (example - your commands will vary)
cd my-stt-starter
pnpm start  # Runs on http://localhost:3000

# In another terminal, run conformance tests
cd starter-contracts
BASE_URL=http://localhost:3000 pnpm run test:stt
```

#### Against Your Deployed Starter App

```bash
# Test your deployed app
BASE_URL=https://my-stt-app.vercel.app pnpm run test:stt
```


