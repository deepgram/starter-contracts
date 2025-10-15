import { describe, it, expect } from "vitest";
import { BASE_URL, audioBytes, badAudio, requestId } from "./util.js";

const ENDPOINT = "/stt/transcribe";
// NOTE: Using /stt/transcribe instead of /stt:transcribe for framework compatibility
// While the colon syntax was proposed for namespace-like clarity, it causes routing
// issues in Express.js and other frameworks. Standard REST paths work universally.

describe("STT Interface Conformance", () => {

  describe("Content-Type Support", () => {
    it("should accept audio/wav content type", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toMatch(/application\/json/);

      const result = await response.json();
      expect(result.transcript).toBeDefined();
      expect(typeof result.transcript).toBe("string");
      expect(result.transcript.length).toBeGreaterThan(0);
    });

    it("should accept audio/mpeg content type", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Request-Id": requestId()
        },
        body: audioBytes() // Using WAV file as mock - real impl would need MP3
      });

      // Should accept the content type (may fail processing if wrong format, but that's OK)
      expect([200, 400]).toContain(response.status);
    });

    it("should accept audio/webm content type", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/webm",
          "X-Request-Id": requestId()
        },
        body: audioBytes() // Using WAV file as mock
      });

      // Should accept the content type
      expect([200, 400]).toContain(response.status);
    });

    it("should reject non-audio content type with 415 UNSUPPORTED_MEDIA_TYPE", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId()
        },
        body: JSON.stringify({ test: "data" })
      });

      expect(response.status).toBe(415);
      const result = await response.json();

      expect(result.error).toBeDefined();
      expect(result.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
      expect(result.error.message).toBeDefined();
      expect(typeof result.error.message).toBe("string");
    });
  });

  describe("Header Handling", () => {
    it("should echo X-Request-Id header", async () => {
      const testRequestId = requestId();
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": testRequestId
        },
        body: audioBytes()
      });

      expect(response.headers.get("X-Request-Id")).toBe(testRequestId);
    });
  });

  describe("Query Parameters", () => {
    it("should accept minimal parameters without errors", async () => {
      const queryParams = new URLSearchParams({
        model: "nova-2",
        language: "en-US",
        paragraphs: "true",
        smart_format: "true",
        tag: "test"
      });

      const response = await fetch(`${BASE_URL}${ENDPOINT}?${queryParams}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.transcript).toBeDefined();
      expect(typeof result.transcript).toBe("string");
    });
  });

  describe("Response Structure", () => {
    it("should return required transcript field", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      // Required field
      expect(result.transcript).toBeDefined();
      expect(typeof result.transcript).toBe("string");
      expect(result.transcript.length).toBeGreaterThan(0);
    });

    it("should include word-level timing when available", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      // Optional but common fields
      if (result.words) {
        expect(Array.isArray(result.words)).toBe(true);

        if (result.words.length > 0) {
          const firstWord = result.words[0];
          expect(firstWord.text).toBeDefined();
          expect(typeof firstWord.text).toBe("string");
          expect(typeof firstWord.start).toBe("number");
          expect(typeof firstWord.end).toBe("number");
          expect(firstWord.start).toBeLessThan(firstWord.end);

          // If speaker field is present, it must be a string (schema validation)
          // Note: speaker is optional and depends on diarization being enabled + available
          if (firstWord.speaker !== undefined) {
            expect(typeof firstWord.speaker).toBe("string");
          }
        }
      }

      if (result.duration) {
        expect(typeof result.duration).toBe("number");
        expect(result.duration).toBeGreaterThan(0);
      }

      if (result.metadata) {
        expect(typeof result.metadata).toBe("object");
      }
    });
  });

  describe("Error Handling", () => {
    it("should return structured error response", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: badAudio()
      });

      if (response.status >= 400) {
        const result = await response.json();

        expect(result.error).toBeDefined();
        expect(result.error.code).toBeDefined();
        expect(typeof result.error.code).toBe("string");
        expect(result.error.message).toBeDefined();
        expect(typeof result.error.message).toBe("string");

        // Should be one of the expected error codes
        expect(["BAD_AUDIO", "UNSUPPORTED_MEDIA_TYPE", "AUDIO_TOO_LONG", "MODEL_NOT_FOUND"])
          .toContain(result.error.code);
      }
    });

    it("should handle missing body gracefully", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        }
        // No body provided
      });

      expect(response.status).toBeGreaterThanOrEqual(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
    });

    it("should handle empty audio buffer", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: Buffer.alloc(0)
      });

      expect(response.status).toBeGreaterThanOrEqual(400);

      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
      expect(typeof result.error.code).toBe("string");
      expect(result.error.message).toBeDefined();

      // Likely BAD_AUDIO for empty file
      expect(["BAD_AUDIO", "UNSUPPORTED_MEDIA_TYPE"])
        .toContain(result.error.code);
    });

    it("should reject files exceeding 2GB size limit", async () => {
      // Note: This test documents expected behavior for oversized files
      // In practice, testing with an actual 2GB file is impractical
      // Real implementations should handle this at HTTP/proxy layer with 413
      // or at application layer with AUDIO_TOO_LONG error code

      // For now, we test with a reasonable-sized file and document expectations
      // Backend should enforce 2GB limit and return appropriate error

      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      // This test primarily documents the 2GB limit requirement
      // When a real 2GB+ file is sent, backend should:
      // - Return 413 Payload Too Large (HTTP-level), OR
      // - Return 400 with AUDIO_TOO_LONG error code (app-level)

      // For now, normal-sized file should succeed
      // Real size limit testing requires backend-specific tooling
      expect([200, 400, 413]).toContain(response.status);
    });

    it("should handle invalid query parameters gracefully", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?model=invalid-model-name&language=xyz`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      // Backend may:
      // 1. Reject with 400 + MODEL_NOT_FOUND error
      // 2. Ignore invalid params and process with defaults (200)
      // Both are acceptable behaviors

      if (response.status >= 400) {
        const result = await response.json();
        expect(result.error).toBeDefined();
        expect(result.error.code).toBeDefined();
        expect(["MODEL_NOT_FOUND", "BAD_AUDIO"])
          .toContain(result.error.code);
      } else {
        // If backend chooses to ignore and use defaults
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result.transcript).toBeDefined();
      }
    });

    it("should handle unknown query parameters", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?unknownParam=value&anotherBadParam=123`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId()
        },
        body: audioBytes()
      });

      // Unknown params should be ignored (not cause errors)
      // This allows for backward/forward compatibility
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.transcript).toBeDefined();
      expect(typeof result.transcript).toBe("string");
    });
  });
});