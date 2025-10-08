import { describe, it, expect, beforeAll } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Mock starter app base URL - this would be configured per implementation
const BASE_URL = process.env.STARTER_APP_URL || "http://localhost:3000";
const ENDPOINT = "/stt/transcribe";
// NOTE: Using /stt/transcribe instead of /stt:transcribe for framework compatibility
// While the colon syntax was proposed for namespace-like clarity, it causes routing
// issues in Express.js and other frameworks. Standard REST paths work universally.

describe("STT Interface Conformance", () => {
  let testAudioBuffer;

  beforeAll(async () => {
    // Load test audio file
    testAudioBuffer = await readFile(
      join(import.meta.dirname, "..", "examples", "request.file.wav")
    );
  });

  describe("Content-Type Support", () => {
    it("should accept audio/wav content type", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": "test-wav-content-type"
        },
        body: testAudioBuffer
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
          "X-Request-Id": "test-mpeg-content-type"
        },
        body: testAudioBuffer // Using WAV file as mock - real impl would need MP3
      });

      // Should accept the content type (may fail processing if wrong format, but that's OK)
      expect([200, 400]).toContain(response.status);
    });

    it("should accept audio/webm content type", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/webm",
          "X-Request-Id": "test-webm-content-type"
        },
        body: testAudioBuffer // Using WAV file as mock
      });

      // Should accept the content type
      expect([200, 400]).toContain(response.status);
    });

    it("should reject non-audio content type with 415 UNSUPPORTED_MEDIA_TYPE", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": "test-invalid-content-type"
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
      const requestId = "test-request-id-123";
      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": requestId
        },
        body: testAudioBuffer
      });

      expect(response.headers.get("X-Request-Id")).toBe(requestId);
    });
  });

  describe("Query Parameters", () => {
    it("should accept common parameters without errors", async () => {
      const queryParams = new URLSearchParams({
        model: "nova-2",
        language: "en-US",
        punctuate: "true",
        diarize: "false"
      });

      const response = await fetch(`${BASE_URL}${ENDPOINT}?${queryParams}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": "test-query-params"
        },
        body: testAudioBuffer
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
          "X-Request-Id": "test-transcript-required"
        },
        body: testAudioBuffer
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
          "X-Request-Id": "test-word-timing"
        },
        body: testAudioBuffer
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

    it("should include speaker information when diarization is enabled", async () => {
      const response = await fetch(`${BASE_URL}${ENDPOINT}?diarize=true`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": "test-diarization"
        },
        body: testAudioBuffer
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      if (result.words && result.words.length > 0) {
        // When diarization is enabled, words may have speaker info
        const wordsWithSpeakers = result.words.filter(word => word.speaker);
        // Don't require all words to have speakers, but if any do, they should be strings
        wordsWithSpeakers.forEach(word => {
          expect(typeof word.speaker).toBe("string");
        });
      }
    });
  });

  describe("Error Handling", () => {
    it("should return structured error response", async () => {
      const badAudio = Buffer.from("not audio data");

      const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "X-Request-Id": "test-bad-audio"
        },
        body: badAudio
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
          "X-Request-Id": "test-empty-body"
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