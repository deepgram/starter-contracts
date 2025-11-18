import { describe, it, expect } from "vitest";
import { BASE_URL, requestId } from "./util.js";

const ENDPOINT = "/text-intelligence/analyze";
const SAMPLE_TEXT = "This is a sample text for analysis. It contains multiple sentences. We can test the text intelligence features with this content. The system should be able to analyze and summarize this text effectively.";
const SAMPLE_TEXT_URL = "https://gist.githubusercontent.com/jpvajda/34a0f88244ef8ff7592568892189006c/raw/2e9e7ad79a32f7130e19f7172d856fbe0b6b5891/sample-text.txt";
// NOTE: You can use this URL once the text-intelligence starter is public
// const SAMPLE_TEXT_URL = "https://raw.githubusercontent.com/deepgram-starters/node-text-intelligence/refs/heads/main/sample-text.txt"

describe("Text Intelligence Interface Conformance:", () => {

  it("should analyze text with summarize=true via multipart/form-data", async () => {
    const formData = new FormData();
    formData.append("text", SAMPLE_TEXT);

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
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

  it("should analyze text from URL via multipart/form-data", async () => {
    const formData = new FormData();
    formData.append("url", SAMPLE_TEXT_URL);

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
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
    const formData = new FormData();
    formData.append("text", SAMPLE_TEXT);

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.results.summary).toBeDefined();
  });

  it("should return error for empty text", async () => {
    const formData = new FormData();
    formData.append("text", "");

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    const result = await response.json();
    expect(result.error).toBeDefined();
    expect(result.error.code).toBeDefined();
    expect(result.error.message).toBeDefined();
  });

  it("should return error for invalid URL format", async () => {
    const formData = new FormData();
    formData.append("url", "not-a-valid-url");

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    const result = await response.json();
    expect(result.error).toBeDefined();
    expect(result.error.code).toBeDefined();
    expect(result.error.message).toBeDefined();
  });

  it("should handle invalid query parameters gracefully", async () => {
    const formData = new FormData();
    formData.append("text", SAMPLE_TEXT);

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true&invalid_param=value`, {
      method: "POST",
      body: formData
    });

    // Should either ignore unknown param or return 400
    expect([200, 400]).toContain(response.status);
  });

  it("should handle very long text gracefully", async () => {
    const longText = "This is a test sentence. ".repeat(1000); // ~25KB of text
    const formData = new FormData();
    formData.append("text", longText);

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
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
    const formData = new FormData();
    formData.append("text", SAMPLE_TEXT);

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true&language=en`, {
      method: "POST",
      body: formData
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.results.summary).toBeDefined();
  });

  it("should return error when neither text nor url is provided", async () => {
    const formData = new FormData();

    const response = await fetch(`${BASE_URL}${ENDPOINT}?summarize=true`, {
      method: "POST",
      body: formData
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    const result = await response.json();
    expect(result.error).toBeDefined();
    expect(result.error.code).toBeDefined();
    expect(result.error.message).toBeDefined();
  });

});

