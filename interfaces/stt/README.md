# Speech-to-Text REST Contract

Send audio, get a transcript JSON.

## Transport

HTTP

## Endpoint

```txt
POST /v1/listen
Content-Type: application/octet-stream
Accept: application/json
```

## Auth

`Authorization: Bearer <token>`

## Content Types

request and response (and any alternates).

## Input 

### Body

`$/schema/request.json`

### Query Parameters

`$/schema/query.json`

## Output

### 200 OK:

`$/schema/transcript.json`

## Errors

`$/schema/error.json`

`err_code` is one of:

- `UNSUPPORTED_MEDIA_TYPE`
- `AUDIO_TOO_LONG`
- `BAD_AUDIO`
- `MODEL_NOT_FOUND`

## Examples

2 happy path, 2 failure cases (copy-pasteable).

## Conformance Tests

- Reject non-audio `Content-Type` with `415` and `UNSUPPORTED_MEDIA_TYPE`.
- Echo `X-Request-Id`.
- Produce `transcript` non-empty for valid audio.
 
## Breaking Change Rules
 
what you may change without bumping the major.
