# Shared Interface Contracts

Common API specifications used across all Deepgram starter applications.

## Metadata API

**File:** `metadata.openapi.yml`

**Endpoint:** `GET /metadata`

All starter apps must implement this endpoint to return metadata from their `deepgram.toml` file.

### Response Structure

Returns the `[meta]` block from `deepgram.toml`:

```json
{
  "title": "Node Live Transcription Starter",
  "description": "Get started using Deepgram's Live Transcription with this Node demo app",
  "author": "Deepgram DX Team <devrel@deepgram.com> (https://developers.deepgram.com)",
  "useCase": "Live STT",
  "language": "JavaScript",
  "framework": "Node",
  "sdk": "4.11.2"
}
```

### Implementation

The endpoint should:
1. Read the `deepgram.toml` file from the project root
2. Parse the `[meta]` section
3. Return the fields as JSON

This allows tooling and UIs to discover starter app details at runtime.

## Conformance Testing

Run conformance tests to validate your metadata endpoint:

```bash
# Start your starter app
cd my-starter-app
pnpm start  # Runs on http://localhost:8080

# Run conformance tests
cd starter-contracts
BASE_URL=http://localhost:8080 pnpm run test:metadata
```
