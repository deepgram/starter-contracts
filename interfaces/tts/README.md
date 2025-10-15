# TTS Interface Contract

Standardized Text-to-Speech interface for Deepgram starter applications. Send JSON text, get synthesized audio with model customization.

## Transport

HTTP REST API

## Endpoint

```http
POST /tts/synthesize
Content-Type: application/json
Accept: audio/mpeg | audio/wav | audio/ogg | audio/flac | audio/mulaw | audio/opus
X-Request-Id: optional-request-id
```

## Query Parameters

All parameters are optional. Starter applications can implement any subset based on their capabilities.

**Based on actual Deepgram TTS API parameters:**

**Core Parameters:**
- `model`: AI model used for synthesis (defaults to `aura-asteria-en`, 63+ models available)
- `container`: File format wrapper for output audio
- `encoding`: Expected encoding of audio output
- `sample_rate`: Sample rate for output audio (depends on encoding)

**Audio Quality:**
- `bit_rate`: Audio bitrate in bits per second (integer or string)

**Callback Support:**
- `callback`: URL to which callback request will be made
- `callback_method`: HTTP method for callback request (POST/PUT)

**Privacy:**
- `mip_opt_out`: Opt out of Deepgram Model Improvement Program (boolean)

See complete list in `$/schema/query.json`

## Request Body

JSON object with text to synthesize:

```json
{
  "text": "Hello world, this is a test.",
  "ssml": false
}
```

Schema: `$/schema/request.json`

## Responses

### 200 OK

Binary audio data with appropriate headers:

```http
HTTP/1.1 200 OK
Content-Type: audio/mpeg
Content-Length: 12345
X-Request-Id: test-123
X-Audio-Duration: 3.21

[Binary MP3 audio data]
```

**Response Headers:**
- `Content-Type`: MIME type (`audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/flac`, `audio/mulaw`, `audio/opus`)
- `Content-Length`: Audio file size in bytes
- `X-Request-Id`: Request identifier (echoed from request)
- `X-Audio-Duration`: Audio duration in seconds (optional)

Schema: `$/schema/response.json`

### 4XX Errors

```json
{
  "error": {
    "type": "validation_error",
    "code": "TEXT_TOO_LONG",
    "message": "Text exceeds maximum length",
    "details": {
      "text_length": 6000,
      "max_length": 5000
    }
  }
}
```

Schema: `$/schema/error.json`

**Error Codes:**
- `INVALID_REQUEST_BODY` - Malformed JSON or missing required fields
- `TEXT_TOO_LONG` - Text exceeds character limit
- `UNSUPPORTED_MODEL` - Requested model not available
- `UNSUPPORTED_CONTAINER` - Requested container format not supported
- `UNSUPPORTED_ENCODING` - Requested encoding not supported
- `TEXT_PROCESSING_FAILED` - General synthesis processing error

## Examples

- **Success Response**: `$/examples/response.ok.txt`
- **Error Response**: `$/examples/response.error.json`
- **Usage Examples**: `$/examples/request.example.js`

## Conformance Requirements

Starter applications implementing this interface MUST:

1. **Accept JSON requests** with `Content-Type: application/json`
2. **Reject non-JSON content types** with `415` status and `INVALID_REQUEST_BODY` error
3. **Echo `X-Request-Id` header** in response when provided in request
4. **Return binary audio data** for valid text input with appropriate `Content-Type`
5. **Follow error schema** exactly as defined in `error.json`
6. **Support at least one audio format** (preferably MP3 as default)
7. **Validate text length limits** if applicable

## Testing Your Starter App Implementation

### Purpose

These conformance tests validate that your starter application correctly implements the TTS interface contract. They ensure your app will work consistently with frontends and other starter apps in the Deepgram ecosystem.

### Prerequisites

1. **Your starter app must be running** and accessible via HTTP/HTTPS
2. **Implement the `/tts/synthesize` endpoint** according to this specification
3. **Install test dependencies** in this contracts repo:
   ```bash
   cd starter-contracts
   pnpm install
   ```

### Running Conformance Tests

#### Against Your Local Development Server

```bash
# Start your starter app (example - your commands will vary)
cd my-tts-starter-app
npm run dev  # Runs on http://localhost:3000

# In another terminal, run conformance tests
cd starter-contracts
BASE_URL=http://localhost:3000 npm run test:tts
```

#### Against Your Deployed Starter App

```bash
# Test your production deployment
BASE_URL=https://my-tts-app.vercel.app npm run test:tts

# Or test a staging environment
BASE_URL=https://staging.my-app.com npm run test:tts
```