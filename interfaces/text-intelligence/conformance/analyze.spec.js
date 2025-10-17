import { describe, it, expect } from "vitest";
import { BASE_URL, requestId } from "./util.js";

const ENDPOINT = "/text-intelligence/analyze";
const SAMPLE_TEXT = "This is a sample text for analysis. It contains multiple sentences. We can test the text intelligence features with this content. The system should be able to analyze and summarize this text effectively.";

describe("Text Intelligence Interface Conformance:", () => {

  it("should analyze text with summarize=true", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ text: SAMPLE_TEXT })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/application\/json/);

    const result = await response.json();
    expect(result.results).toBeDefined();
    expect(result.results.summary).toBeDefined();
    expect(result.results.summary.text).toBeDefined();
    expect(typeof result.results.summary.text).toBe("string");
    expect(result.results.summary.text.length).toBeGreaterThan(0);
  });

  it("should accept summarize parameter", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ text: SAMPLE_TEXT })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.results.summary).toBeDefined();
  });

  it("should return error for empty text", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
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
    expect(result.error.code).toBeDefined();
    expect(result.error.message).toBeDefined();
  });

  it("should handle invalid query parameters gracefully", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true&invalid_param=value`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ text: SAMPLE_TEXT })
    });

    // Should either ignore unknown param or return 400
    expect([200, 400]).toContain(response.status);
  });

  it("should handle very long text gracefully", async () => {
    const longText = "This is a test sentence. ".repeat(1000); // ~25KB of text

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ text: longText })
    });

    // Should either process it or return error, but not crash
    expect([200, 400, 413]).toContain(response.status);

    if (response.status === 200) {
      const result = await response.json();
      expect(result.results.summary).toBeDefined();
    } else {
      const result = await response.json();
      expect(result.error).toBeDefined();
    }
  });

  it("should accept language parameter", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true&language=en`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId()
      },
      body: JSON.stringify({ text: SAMPLE_TEXT })
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.results.summary).toBeDefined();
  });

});

