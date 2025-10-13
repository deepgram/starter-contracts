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
STARTER_APP_URL=http://localhost:3000 pnpm test:stt
```

#### Against Your Deployed Starter App

```bash
# Test your production deployment
STARTER_APP_URL=https://my-stt-app.vercel.app pnpm test:stt

# Or test a staging environment
STARTER_APP_URL=https://staging.my-app.com pnpm test:stt
```

### Understanding Test Results

#### ✅ **All Tests Pass** - Your app is compliant!
```
✓ STT Interface Conformance > Content-Type Support > should accept audio/wav content type
✓ STT Interface Conformance > Header Handling > should echo X-Request-Id header
✓ STT Interface Conformance > Response Structure > should return required transcript field
```

Your starter app correctly implements the STT interface and will work with any frontend expecting this contract.

#### ❌ **Tests Fail** - Implementation needs fixes

**Common failure patterns:**

**Wrong Content-Type Response:**
```
expected 'text/html; charset=utf-8' to match /application/json/
```
**Fix:** Your `/stt:transcribe` endpoint should return `Content-Type: application/json`

**Missing X-Request-Id Echo:**
```
expected null to be 'test-request-id-123'
```
**Fix:** Echo the `X-Request-Id` header from request to response

**Wrong Error Handling:**
```
expected 200 to be 415
```
**Fix:** Return `415` status for unsupported content types like `application/json`

**HTML Instead of JSON:**
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```
**Fix:** Your endpoint is returning HTML (maybe a 404 page) instead of JSON

### What the Tests Validate

1. **Content-Type Handling**
   - Accept `audio/wav`, `audio/mpeg`, `audio/webm`
   - Reject non-audio types with `415 UNSUPPORTED_MEDIA_TYPE`

2. **Required Response Structure**
   - Return JSON with required `transcript` field
   - Include word-level timing when available
   - Proper error response format

3. **Header Behavior**
   - Echo `X-Request-Id` header for request tracing
   - Return appropriate `Content-Type` headers

4. **Query Parameter Support**
   - Accept common parameters (`model`, `language`, `punctuate`, `diarize`)
   - Handle unknown parameters gracefully

### Integration with CI/CD

Add conformance testing to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Deploy Starter App
  run: npm run deploy

- name: Run Conformance Tests
  run: |
    cd ../starter-contracts
    STARTER_APP_URL=${{ env.DEPLOYED_URL }} pnpm test:stt
```

### Debugging Failed Tests

1. **Check your endpoint exists:** `curl https://your-app.com/stt:transcribe`
2. **Test content-type handling:** Try sending different `Content-Type` headers
3. **Verify JSON responses:** Ensure you're returning valid JSON, not HTML
4. **Test with real audio:** Use the test audio file from `/examples/request.file.wav`

### Need Help?

- **OpenAPI Spec:** See complete interface definition in `openapi.yml`
- **Example Responses:** Check `examples/response.ok.json` and `examples/response.error.json`
- **Schema Validation:** Use JSON schemas in `schema/` directory to validate your responses

## Architecture Notes

This interface defines the **standardized contract** that all Deepgram starter applications should expose to frontends. It abstracts away Deepgram's complex API and provides a clean, consistent interface that enables frontend portability across different starter implementations.
