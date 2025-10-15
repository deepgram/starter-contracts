# 🧪 Testing Guide

This document describes how to test and validate each interface in the **Deepgram Starter Contracts** repository.

The goal is to ensure every interface behaves as specified, provides a consistent developer experience, and can be relied on by any starter app or SDK integration.

Those items marked as `FUTURE` aren't implemented yet, and will be considered future testing enhancements.

## ✅ Overview

Each interface in `/interfaces` must pass **contract**, **conformance**, and **integration** tests.

Testing happens at three levels:

1. **Schema validation** — verify requests and responses match JSON or WebSocket message schemas.
2. **Conformance testing** — verify a backend implementation behaves as defined.
3. **Integration testing** — verify starter apps can use the interface as expected.


## Testing Commands

### STT
```bash
# Runs STT schema validation
pnpm test:stt:schema
```
### TTS
```bash
# Runs TTS schema validation
pnpm test:tts:schema
```

### Text Intelligence
```bash
# Runs Text Intelligence schema validation
 pnpm test:text-intelligence:schema

## 🧩 1. Schema Validation (Contract Tests)

Validate that your inputs and outputs match the schema exactly: ✅ "Is the contract itself well-defined and consistent?"

Refer to the `Tests` in each Interface directory for chema tests.

**Test types**

* Valid input and output examples pass JSON Schema.
* Invalid inputs fail with clear error messages.
* Checks for OpenAPI validation OR Async API syntax and formatting.`(FUTURE)`

**Tools**

* [Ajv](https://ajv.js.org/) for JSON schema validation.
* [openapi-schema-validator](https://www.npmjs.com/package/openapi-schema-validator) for REST endpoints. `(FUTURE)`
* [asyncapi-validator](https://www.npmjs.com/package/asyncapi-validator) for WebSocket message definitions. `(FUTURE)`


## 🔄 2. Sequence & State Validation (WebSocket Interfaces)

For **Live STT**, **Live TTS**, and **Agent** interfaces:

**Test sequence:**

1. `connect`
2. `config`
3. `data`
4. `result` (or intermediate states)
5. `close`

**Validate**

* Messages arrive in correct order.
* States on the frontend can be derived entirely from backend messages.
* Connection recovery, partial data, and duplicate message handling.

## ⚠️ 3. Error and Edge Case Testing

Verify error handling and edge case test coverage.

> Errors and Edge Case tests should be added to the specific interface conformance test file.

**Examples**

| Case                           | Expectation                    |
|--------------------------------|--------------------------------|
| Missing `Authorization` header | Returns 401 error schema       |
| Invalid content-type           | Returns 415 error schema       |
| Invalid message order          | Emits protocol error (WS only) |
| Empty or corrupted audio       | Returns validation error       |
| Large payloads                 | Graceful handling or 413 error |
| Timeout / disconnect           | Client recovers and reconnects |
| File size limits               | Payload to large error         |


## ♻️ 4. Cross-Interface Consistency

Check for shared conventions across all interfaces:

* `request_id`, `timestamp`, `utterance_id` fields consistent.
* Error schemas use the same shape.
* Field naming and casing are identical (snake_case or camelCase)


## 🚀 5. Frontend Integration Testing (FUTURE)

Test that frontend applications work correctly with validated backends.

**Test**

* The frontend can make a full round-trip (input → backend → output).
* App state transitions correctly.
* No console or network errors.

## 👩‍💻 6. Developer Experience Validation (FUTURE)

Conduct developer empathy tests:

* Ask a new engineer to integrate one interface using only its README + schema.
* Time their setup to “first working demo.”
* Record confusion points, unclear names, or missing docs.

Iterate schema and examples based on feedback.

## 📦 Outputs of Successful Testing

* All conformance tests pass.
* Starter apps run end-to-end against mock and real backends.
* Schemas are validated and versioned.
* Developer feedback loop confirms interfaces are intuitive.

