# Shared Test Utilities

Common utilities used across all interface conformance tests.

## Usage

```javascript
import { BASE_URL, WS_URL, requestId } from "../../../test/utils.js";
```

## Exports

### `BASE_URL`

Base URL for REST API endpoints. Configured via the `BASE_URL` environment variable.

**Default:** `http://localhost:8080` (standard port for all starter contracts)

**Example:**
```bash
BASE_URL=http://localhost:8080 pnpm run test:transcription
BASE_URL=https://my-app.example.com pnpm run test:metadata
```

### `WS_URL`

Base URL for WebSocket endpoints. Automatically derived from `BASE_URL` by replacing `http` with `ws`.

**Default:** `ws://localhost:8080` (derived from BASE_URL)

**Example:**
```bash
BASE_URL=http://localhost:8080 pnpm run test:voice-agent
# WS_URL will be ws://localhost:8080

BASE_URL=https://my-app.example.com pnpm run test:live-transcription
# WS_URL will be wss://my-app.example.com
```

### `requestId()`

Generates a unique UUID for request tracing.

**Returns:** `string` - A UUID v4

**Example:**
```javascript
const id = requestId(); // "550e8400-e29b-41d4-a716-446655440000"
```

## Configuration

All tests use a single `BASE_URL` environment variable:

```bash
# Local development (default port 8080)
BASE_URL=http://localhost:8080 pnpm run test:transcription

# Custom port
BASE_URL=http://localhost:3000 pnpm run test:voice-agent

# Production/deployed
BASE_URL=https://my-app.vercel.app pnpm run test:metadata
```

The WebSocket URL is automatically derived from `BASE_URL`:
- `http://localhost:8080` → `ws://localhost:8080`
- `https://example.com` → `wss://example.com`
