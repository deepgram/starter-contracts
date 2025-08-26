# Speech-to-Text REST Contract

Send audio, get a transcript JSON.

## Transport

HTTP

## Endpoint

```txt
POST /stt:transcribe
Content-Type: application/octet-stream
Accept: application/json
```

### Query Parameters

`model`, `language`, `punctuate` (bool), `diarize` (bool)

## Auth

Authorization: Bearer <token>

## Content Types

request and response (and any alternates).

## Input 

JSON Schema for JSON inputs; for binary, state the allowed MIME types.

## Output

### 200 OK:

```json
{
  "transcript": "string",
  "words": [
    { "text": "hello", "start": 0.12, "end": 0.45, "speaker": "A" }
  ],
  "duration": 3.21,
  "metadata": { "any": "object" }
}
```

## Errors

`UNSUPPORTED_MEDIA_TYPE`, `AUDIO_TOO_LONG`, `BAD_AUDIO`, `MODEL_NOT_FOUND`

## Examples

2 happy path, 2 failure cases (copy-pasteable).

## Conformance Tests

- Reject non-audio `Content-Type` with `415` and `UNSUPPORTED_MEDIA_TYPE`.
- Echo `X-Request-Id`.
- Produce `transcript` non-empty for valid audio.
 
## Breaking Change Rules
 
what you may change without bumping the major.
