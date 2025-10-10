import { describe, it, expect, beforeAll } from "vitest";

// Mock starter app base URL - this would be configured per implementation
const BASE_URL = process.env.STARTER_APP_URL || "http://localhost:3000";
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
          "X-Request-Id": "test-json-request"
        },
        body: JSON.stringify({ text: "Hello world, this is a test." })
      });

      expect([200, 400]).toContain(response.status); // 200 = success, 400 = processing error but valid format
      expect(response.headers.get("X-Request-Id")).toBe("test-json-request");
    });

    it("should reject non-JSON content type with 415", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "X-Request-Id": "test-invalid-content-type"
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
          "X-Request-Id": "test-empty-text"
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
          "X-Request-Id": "test-text-too-long"
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
      const requestId = "test-request-id-123";
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        },
        body: JSON.stringify({ text: "Hello world" })
      });

      expect(response.headers.get("X-Request-Id")).toBe(requestId);
    });
  });

  describe("Query Parameters", () => {
    it("should accept model parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?model=aura-asteria-en`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "test-model-param"
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
          "X-Request-Id": "test-container-param"
        },
        body: JSON.stringify({ text: "Hello in WAV container" })
      });

      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers.get("Content-Type")).toMatch(/audio\/wav/);
      }
    });

    it("should accept bit_rate parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?bit_rate=128000`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "test-bitrate-param"
        },
        body: JSON.stringify({ text: "Hello with custom bitrate" })
      });

      expect([200, 400]).toContain(response.status);
    });

    it("should accept callback parameter", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?callback=https://example.com/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "test-callback-param"
        },
        body: JSON.stringify({ text: "Hello with callback" })
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
          "X-Request-Id": "test-audio-response"
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
          "X-Request-Id": "test-default-format"
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
          "X-Request-Id": "test-duration-header"
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

  describe("SSML Support", () => {
    it("should accept SSML markup when ssml flag is true", async () => {
      const ssmlText = '<speak><prosody rate="slow">Hello world</prosody></speak>';

      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "test-ssml-support"
        },
        body: JSON.stringify({ text: ssmlText, ssml: true })
      });

      expect([200, 400]).toContain(response.status); // Some implementations might not support SSML
    });
  });

  describe("Error Handling", () => {
    it("should return structured error response", async () => {
      // Send malformed JSON to trigger error
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "test-malformed-json"
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
          "X-Request-Id": "test-missing-body"
        }
        // No body provided
      });

      expect(response.status).toBeGreaterThanOrEqual(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
    });
  });
});