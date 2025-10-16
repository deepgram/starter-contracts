import { describe, it, expect } from "vitest";
import { BASE_URL, requestId } from "./util.js";

const ENDPOINT = "/stt/transcribe";
const SAMPLE_AUDIO_URL = "https://dpgr.am/spacewalk.wav";

describe("STT Interface Conformance:", () => {

  it("should transcribe audio from URL", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ url: SAMPLE_AUDIO_URL })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/application\/json/);

    const result = await response.json();
    expect(result.transcript).toBeDefined();
    expect(typeof result.transcript).toBe("string");
    expect(result.transcript.length).toBeGreaterThan(0);
  });

  it("should accept model parameter", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?model=nova-2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ url: SAMPLE_AUDIO_URL })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.transcript).toBeDefined();
  });

  it("should return error for invalid URL format", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ url: "not-a-valid-url" })
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    const result = await response.json();
    expect(result.error).toBeDefined();
    expect(result.error.code).toBeDefined();
    expect(result.error.message).toBeDefined();
  });

  it("should handle unreachable URL gracefully", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ url: "https://nonexistent-domain-12345.com/audio.wav" })
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    const result = await response.json();
    expect(result.error).toBeDefined();
    expect(result.error.code).toBeDefined();
  });

  it("should handle invalid query parameters gracefully", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?invalid_param=value`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ url: SAMPLE_AUDIO_URL })
    });

    // Should either ignore unknown param or return 400
    expect([200, 400]).toContain(response.status);
  });

});
