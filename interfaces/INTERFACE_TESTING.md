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
"test:stt:schema": "vitest run interfaces/stt/tests/schema_validation.test.js"
```
### TTS
```bash
# Runs TTS schema validation
"test:tts:schema": "vitest run interfaces/tts/tests/schema_validation.test.js"x
```

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



## 🧱 5. Mock Backend Validation (FUTURE)

Each interface should have a **mock backend** that implements the contract exactly.

**Goals**

* Validate that the frontend or SDK can interact with the mock.
* Detect mismatches between frontend expectations and the spec before integrating a real backend.

**Test**

* Start mock server (`npm run mock:stt` etc.).
* Run the conformance test suite against the mock.
* Confirm all responses are valid per schema.


## 🌐 6. Real Backend Integration (Optional) (FUTURE)

Run the same tests against the real backend.


> Use this step to **verify that the interface contracts match the actual backend behavior**. Run conformance tests against staging or live APIs to catch mismatches, sequence issues, or runtime differences that a spec alone might not cover. It’s optional if the spec is fully accurate, but recommended for runtime validation and starter app confidence.


**Test**

* Point the tests at the live or staging backend:

  ```bash
  BACKEND_BASE_URL=https://api.staging.deepgram.com npm run test:conformance -- --interface=stt
  ```
* Compare outputs from the mock and real backend.
* Confirm consistency in:

  * Field naming
  * Error responses
  * Latency and sequence behavior

## 🚀 7. Frontend Integration Testing (FUTURE)

Test that frontend applications work correctly with validated backends.

**Test**

* The frontend can make a full round-trip (input → backend → output).
* App state transitions correctly.
* No console or network errors.

## ⚙️ 8. Continuous Integration (CI) Conformance Runs (FUTURE)

Add to CI:

```bash
npm run test:conformance
```

**CI checks:**

* Run tests against mock and staging environments.
* Fail on schema mismatches.
* Upload summary results (GitHub Actions summary, or similar).


## 👩‍💻 9. Developer Experience Validation (FUTURE)

Conduct developer empathy tests:

* Ask a new engineer to integrate one interface using only its README + schema.
* Time their setup to “first working demo.”
* Record confusion points, unclear names, or missing docs.

Iterate schema and examples based on feedback.

## 🔁 10. Regression and Versioning (FUTURE)

* Maintain backward-compatible schema versions.
* Use semantic versioning (`v1.0.0`, `v1.1.0`, etc.).
* Run old test suites against new versions to detect breaking changes.


## 📦 Outputs of Successful Testing

* All conformance tests pass.
* Starter apps run end-to-end against mock and real backends.
* Schemas are validated and versioned.
* Developer feedback loop confirms interfaces are intuitive.

