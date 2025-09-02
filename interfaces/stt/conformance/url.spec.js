import { describe, it, expect } from "vitest";

const URL = "https://api.deepgram.com/v1/listen";
const TOKEN = process.env.DEEPGRAM_API_KEY;

describe("stt url", () => {
  it("should send back correct payload", async () => {
    if (!TOKEN) {
      expect.fail("DEEPGRAM_API_KEY not set in environment.");
      return;
    }

    const req = await fetch(URL, {
      headers: {
        "Authorization": `Token ${TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ url: "https://dpgr.am/spacewalk.wav" })
    });
    const res = await req.json();
    expect(res).toBeDefined();
    expect(res.metadata).toBeDefined();
    expect(res.results).toBeDefined();
    expect(res.results.channels).toBeDefined();
    expect(res.results.channels).toBeInstanceOf(Array);
  })
})
