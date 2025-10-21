import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL, requestId } from "./util.js";

const ENDPOINT = "/live-stt/stream";
const SAMPLE_STREAM_URL = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";
const INVALID_STREAM_URL_FORMAT = "not-a-valid-url";
const UNREACHABLE_STREAM_URL = "http://nonexistent-domain-12345.com/audio.mp3";

describe("Live STT Interface Conformance:", () => {

  it("should connect to WebSocket endpoint with valid stream URL", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected successfully");
        ws.close();
        resolve();
      });
      ws.on('error', (error) => {
        console.error("WebSocket connection failed:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  }, 10000);

  it("should accept model parameter", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}&model=nova-2`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected with model parameter");
        ws.close();
        resolve();
      });
      ws.on('error', (error) => {
        console.error("WebSocket connection failed:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  }, 10000);

  it("should accept language parameter", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}&language=en`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected with language parameter");
        ws.close();
        resolve();
      });
      ws.on('error', (error) => {
        console.error("WebSocket connection failed:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  }, 10000);

  it("should return error for missing stream_url parameter", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const errors = [];

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.type === "Error") {
          errors.push(result);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve) => {
      ws.on('open', () => {
        // Wait a bit for error to be sent
        setTimeout(() => {
          ws.close();
          resolve();
        }, 2000);
      });
      ws.on('error', (err) => {
        console.warn("WebSocket client error (expected for missing URL):", err.message);
        ws.close();
        resolve();
      });
      ws.on('close', () => resolve());
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].error.code).toBe("INVALID_STREAM_URL");
  }, 10000);

  it("should return error for invalid stream_url format", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${INVALID_STREAM_URL_FORMAT}`);
    const errors = [];

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.type === "Error") {
          errors.push(result);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve) => {
      ws.on('open', () => {
        setTimeout(() => {
          ws.close();
          resolve();
        }, 2000);
      });
      ws.on('error', (err) => {
        console.warn("WebSocket client error (expected for invalid URL format):", err.message);
        ws.close();
        resolve();
      });
      ws.on('close', () => resolve());
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].error.code).toBe("INVALID_STREAM_URL");
  }, 10000);

  it("should return error for unreachable stream_url", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${UNREACHABLE_STREAM_URL}`);
    const errors = [];

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.type === "Error") {
          errors.push(result);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve) => {
      ws.on('open', () => {
        setTimeout(() => {
          ws.close();
          resolve();
        }, 5000); // Give it more time to try connecting to unreachable URL
      });
      ws.on('error', (err) => {
        console.warn("WebSocket client error (expected for unreachable stream):", err.message);
        ws.close();
        resolve();
      });
      ws.on('close', () => resolve());
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].error.code).toBe("STREAM_UNREACHABLE");
  }, 10000);

  it("should handle connection close gracefully", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}`);
    let connectionClosed = false;

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket opened, closing connection");
        ws.close();
      });
      ws.on('close', () => {
        console.log("WebSocket closed gracefully");
        connectionClosed = true;
        resolve();
      });
      ws.on('error', (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });

    expect(connectionClosed).toBe(true);
  }, 10000);

});