import { describe, it, expect } from "vitest";
import { requestId } from "./util.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

describe("Transcription API Metadata Tests", () => {
  it("should return metadata from API", async () => {
    const response = await fetch(`${BASE_URL}/api/metadata`, {
      headers: {
        "X-Request-ID": requestId(),
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/application\/json/);

    const metadata = await response.json();

    // Validate metadata structure
    expect(metadata).toBeDefined();
    expect(metadata).toHaveProperty("version");
    expect(metadata).toHaveProperty("environment");

    // Validate metadata types
    expect(typeof metadata.version).toBe("string");
    expect(typeof metadata.environment).toBe("string");

    // Validate metadata values are non-empty
    expect(metadata.version.length).toBeGreaterThan(0);
    expect(metadata.environment.length).toBeGreaterThan(0);

    // Validate environment is a known value
    expect(["development", "staging", "production"]).toContain(
      metadata.environment
    );
  });
});
