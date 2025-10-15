# STT Interface Contract

Standardized Speech-to-Text interface for Deepgram starter applications. Send audio, get a clean transcript JSON with word-level timing and speaker information.

## Transport

HTTP REST API

## Endpoint

```http
POST /stt/transcribe
Content-Type: audio/wav | audio/mpeg | audio/webm
Accept: application/json
X-Request-Id: optional-request-id
```

## Query Parameters

All parameters are optional. Starter applications can implement any subset based on their use case:

**Core Parameters:**
- `model`: STT model to use for transcription
- `language`: BCP-47 language tag (e.g., `en-US`, `es-ES`)
- `punctuate`: Enable punctuation in transcript
- `diarize`: Enable speaker diarization

**Audio Processing:**
- `encoding`: Audio encoding format (linear16, flac, opus, etc.)
- `multichannel`: Enable multichannel processing
- `sample_rate`: Audio sample rate

**Advanced Features:**
- `sentiment`: Enable sentiment analysis
- `topics`: Enable topic detection
- `intents`: Enable intent recognition
- `summarize`: Enable AI summarization (v1/v2)
- `smart_format`: Enable intelligent formatting

**Content Filtering:**
- `profanity_filter`: Filter profanity from transcript
- `redact`: Redact sensitive information (PII, etc.)
- `replace`: Replace specific terms

**Real-time & Callbacks:**
- `callback`: Webhook URL for results
- `callback_method`: HTTP method for webhook (POST/PUT)

**And many more...** - See complete list in `$/schema/query.json`

## Request Body

Binary audio data in supported formats:
- `audio/wav`
- `audio/mpeg`
- `audio/webm`

See: `$/schema/request.json`

## Responses

### 200 OK

```json
{
  "transcript": "Hello world, this is a test.",
  "words": [
    {
      "text": "Hello",
      "start": 0.12,
      "end": 0.45,
      "speaker": "A"
    }
  ],
  "duration": 3.21,
  "metadata": {
    "model": "nova-2",
    "language": "en-US",
    "channels": 1
  }
}
```

Schema: `$/schema/transcript.json`

### 4XX Errors

```json
{
  "error": {
    "type": "validation_error",
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "Content-Type 'text/plain' is not supported",
    "details": {}
  }
}
```

Schema: `$/schema/error.json`

**Error Codes:**
- `UNSUPPORTED_MEDIA_TYPE` - Invalid Content-Type header
- `AUDIO_TOO_LONG` - Audio file exceeds size limits
- `BAD_AUDIO` - Corrupted or invalid audio data
- `MODEL_NOT_FOUND` - Specified model not available

## Examples

- **Success Response**: `$/examples/response.ok.json`
- **Error Response**: `$/examples/response.error.json`
- **Usage Examples**: `$/examples/request.example.js`

## Conformance Requirements

Starter applications implementing this interface MUST:

1. **Accept supported content types**: `audio/wav`, `audio/mpeg`, `audio/webm`
2. **Reject unsupported content types** with `415` status and `UNSUPPORTED_MEDIA_TYPE` error code
3. **Echo `X-Request-Id` header** in response when provided in request
4. **Return non-empty `transcript`** for valid audio input
5. **Follow response schema** exactly as defined in `transcript.json`
6. **Use standardized error format** as defined in `error.json`

## Testing Your Starter App Implementation

### Purpose

These conformance tests validate that your starter application correctly implements the STT interface contract. They ensure your app will work consistently with frontends and other starter apps in the Deepgram ecosystem.

✅ "Does the backend implementation follow the contract?"

### Prerequisites

1. **Your starter app must be running** and accessible via HTTP/HTTPS
2. **Implement the `/stt:transcribe` endpoint** according to this specification
3. **Install test dependencies** in this contracts repo:
   ```bash
   cd starter-contracts
   pnpm install
   ```

### Running Conformance Tests

#### Against Your Local Development Server

```bash
# Start your starter app (example - your commands will vary)
cd my-stt-starter-app
npm run dev  # Runs on http://localhost:3000

# In another terminal, run conformance tests
cd starter-contracts
BASE_URL=http://localhost:3000 npm run test:stt
```

#### Against Your Deployed Starter App

```bash
# Test your production deployment
BASE_URL=https://my-stt-app.vercel.app npm run test:stt

# Or test a staging environment
BASE_URL=https://staging.my-app.com npm run test:stt
```