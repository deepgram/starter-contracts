import { describe, it, expect } from "vitest";
import { BASE_URL } from "../../../test/utils.js";

const ENDPOINT = "/metadata";

describe("Metadata Interface Conformance:", () => {
  it("should return metadata from deepgram.toml", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/application\/json/);

    const result = await response.json();

    // All required fields must be present
    expect(result.title).toBeDefined();
    expect(typeof result.title).toBe("string");
    expect(result.title.length).toBeGreaterThan(0);

    expect(result.description).toBeDefined();
    expect(typeof result.description).toBe("string");
    expect(result.description.length).toBeGreaterThan(0);

    expect(result.author).toBeDefined();
    expect(typeof result.author).toBe("string");
    expect(result.author.length).toBeGreaterThan(0);

    expect(result.useCase).toBeDefined();
    expect(typeof result.useCase).toBe("string");
    expect(result.useCase.length).toBeGreaterThan(0);

    expect(result.language).toBeDefined();
    expect(typeof result.language).toBe("string");
    expect(result.language.length).toBeGreaterThan(0);

    expect(result.framework).toBeDefined();
    expect(typeof result.framework).toBe("string");
    expect(result.framework.length).toBeGreaterThan(0);

    expect(result.sdk).toBeDefined();
    expect(typeof result.sdk).toBe("string");
    expect(result.sdk.length).toBeGreaterThan(0);
  });

  it("should return valid useCase enum value", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    const validUseCases = [
      "Live STT",
      "Prerecorded STT",
      "Live TTS",
      "Prerecorded TTS",
      "Text Intelligence",
      "Voice Agent"
    ];

    expect(validUseCases).toContain(result.useCase);
  });

  it("should have author field in expected format", async () => {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const result = await response.json();

    // Author should contain email and/or URL
    expect(result.author).toMatch(/.+/);
  });
});
