import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const URL = "https://api.deepgram.com/v1/listen";
const TOKEN = process.env.DEEPGRAM_API_KEY;

describe("stt file", () => {
  it("should send back payload", async () => {
    if (!TOKEN) {
      expect.fail("DEEPGRAM_API_KEY not set in environment.");
      return;
    }
    const binary = await readFile(join(import.meta.dirname, "..", "examples", "request.file.wav"));
    const req = await fetch(URL, {
      headers: {
        Authorization: `Token ${TOKEN}`,
        "Content-Type": "audio/wav",
      },
      method: "POST",
      body: binary
    });
    const res = await req.json();
    expect(res).toBeDefined();
    expect(res.metadata).toBeDefined();
    expect(res.results).toBeDefined();
    expect(res.results.channels).toBeDefined();
    expect(res.results.channels).toBeInstanceOf(Array);
  })
})
