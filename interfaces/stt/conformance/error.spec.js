import { describe, it, expect } from "vitest";

const URL = "https://api.deepgram.com/v1/listen";

describe("stt url", () => {
  it("should send back correct payload", async () => {
    const req = await fetch(URL, {
      headers: {
        "Authorization": `Token NAOMI`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ url: "https://dpgr.am/spacewalk.wav" })
    });
    const res = await req.json();
    expect(res).toBeDefined();
    expect(res.metadata).not.toBeDefined();
    expect(res.results).not.toBeDefined();
    expect(res.err_code).toBeDefined();
    expect(res.err_msg).toBeDefined();
    expect(res.request_id).toBeDefined();
  })
})
