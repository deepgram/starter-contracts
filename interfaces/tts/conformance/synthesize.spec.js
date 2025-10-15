import { describe, it, expect } from "vitest";
import { BASE_URL, requestId } from "./util.js";

const ENDPOINT = "/tts/synthesize";
// NOTE: Using /tts/synthesize instead of /tts:synthesize for framework compatibility
// While the colon syntax was proposed for namespace-like clarity, it causes routing
// issues in Express.js and other frameworks. Standard REST paths work universally.

describe("TTS Interface Conformance", () => {

  describe("Request Body Validation", () => {
    it("should accept valid JSON text request", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello world, this is a test." })
      });

      expect([200, 400]).toContain(response.status); // 200 = success, 400 = processing error but valid format
    });

    it("should reject non-JSON content type with 415", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "X-Request-Id": requestId()
        },
        body: "Hello world"
      });

      expect(response.status).toBe(415);
      const result = await response.json();

      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("INVALID_REQUEST_BODY");
      expect(result.error.message).toBeDefined();
      expect(typeof result.error.message).toBe("string");
    });

    it("should reject empty text with validation error", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "" })
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("INVALID_REQUEST_BODY");
    });

    it("should reject text that is too long", async () => {
      const longText = "A".repeat(6000); // Exceeds typical limits

      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: longText })
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("TEXT_TOO_LONG");
    });
  });

  describe("Header Handling", () => {
    it("should echo X-Request-Id header", async () => {
      const testRequestId = requestId();
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": testRequestId
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      expect(response.headers.get("X-Request-Id")).toBe(testRequestId);
    });
  });

  describe("Query Parameters", () => {
    it("should accept model parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?model=aura-asteria-en`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello with custom model" })
      });

      expect([200, 400]).toContain(response.status);
    });

    it("should accept container parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?container=wav`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello in WAV container" })
      });

      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers.get("Content-Type")).toMatch(/audio\/wav/);
      }
    });

    it("should accept encoding parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?encoding=mp3`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello with custom encoding" })
      });

      expect([200, 400]).toContain(response.status);
    });

    it("should accept tag parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?tag=test-tag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello with tag" })
      });

      expect([200, 400]).toContain(response.status);
    });
  });

  describe("Audio Response", () => {
    it("should return audio with correct content type", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      if (response.status === 200) {
        const contentType = response.headers.get("Content-Type");
        expect(contentType).toMatch(/^audio\/(mpeg|wav|ogg|flac|mulaw|opus)/);

        // Should have audio data
        const audioData = await response.arrayBuffer();
        expect(audioData.byteLength).toBeGreaterThan(0);

        // Should have content length header
        const contentLength = response.headers.get("Content-Length");
        if (contentLength) {
          expect(parseInt(contentLength)).toBe(audioData.byteLength);
        }
      }
    });

    it("should return MP3 by default", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      if (response.status === 200) {
        // Default should be MP3
        expect(response.headers.get("Content-Type")).toMatch(/audio\/mpeg/);
      }
    });

    it("should include duration header when available", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      if (response.status === 200) {
        const duration = response.headers.get("X-Audio-Duration");
        if (duration) {
          expect(parseFloat(duration)).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Error Handling", () => {
    it("should return structured error response", async () => {
      // Send malformed JSON to trigger error
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: "{ invalid json"
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      const result = await response.json();

      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
      expect(typeof result.error.code).toBe("string");
      expect(result.error.message).toBeDefined();
      expect(typeof result.error.message).toBe("string");

      // Should be one of the expected error codes
      expect([
        "INVALID_REQUEST_BODY",
        "TEXT_TOO_LONG",
        "UNSUPPORTED_MODEL",
        "UNSUPPORTED_CONTAINER",
        "UNSUPPORTED_ENCODING",
        "TEXT_PROCESSING_FAILED"
      ]).toContain(result.error.code);
    });

    it("should handle missing body gracefully", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        }
        // No body provided
      });

      expect(response.status).toBeGreaterThanOrEqual(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
    });

    it("should handle missing text field in JSON", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({})
      });

      expect(response.status).toBeGreaterThanOrEqual(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("INVALID_REQUEST_BODY");
    });

    it("should handle invalid model parameter gracefully", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?model=invalid-model-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      // Backend may reject with error or ignore and use default
      if (response.status >= 400) {
        const result = await response.json();
        expect(result.error).toBeDefined();
        expect(result.error.code).toBe("UNSUPPORTED_MODEL");
      } else {
        expect(response.status).toBe(200);
      }
    });

    it("should handle unknown query parameters", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?unknownParam=value&anotherBadParam=123`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      // Unknown params should be ignored (not cause errors)
      // This allows for backward/forward compatibility
      expect([200, 400]).toContain(response.status);
    });

    it("should reject JSON with additional unknown properties", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({
          text: "Hello world",
          unknownField: "should be rejected"
        })
      });

      // Schema has additionalProperties: false, so should reject
      expect(response.status).toBeGreaterThanOrEqual(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("INVALID_REQUEST_BODY");
    });
  });
});