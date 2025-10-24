import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL, requestId } from "./util.js";

const ENDPOINT = "/flux/stream";
const SAMPLE_STREAM_URL = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";
const INVALID_STREAM_URL_FORMAT = "not-a-valid-url";
const UNREACHABLE_STREAM_URL = "http://nonexistent-domain-12345.com/audio.mp3";

describe("Flux Interface Conformance:", () => {

  it("should connect to WebSocket endpoint with valid stream URL and model", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}&model=flux-general-en`);

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

  it("should receive Connected event after connection", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}&model=flux-general-en`);
    let connectedEvent = null;

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.type === "Connected") {
          connectedEvent = result;
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket opened, waiting for Connected event");
        setTimeout(() => {
          ws.close();
          resolve();
        }, 3000);
      });
      ws.on('error', (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });

    expect(connectedEvent).not.toBeNull();
    expect(connectedEvent.type).toBe("Connected");
    expect(connectedEvent.request_id).toBeDefined();
    expect(connectedEvent.sequence_id).toBe(0);
  }, 10000);

  it("should receive TurnInfo events during streaming", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}&model=flux-general-en`);
    const turnInfoEvents = [];

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.type === "TurnInfo") {
          turnInfoEvents.push(result);
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket opened, waiting for TurnInfo events");
        // Wait longer to receive turn info events
        setTimeout(() => {
          ws.close();
          resolve();
        }, 15000);
      });
      ws.on('error', (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 20000);
    });

    expect(turnInfoEvents.length).toBeGreaterThan(0);
    const firstEvent = turnInfoEvents[0];
    expect(firstEvent.type).toBe("TurnInfo");
    expect(firstEvent.event).toBeDefined();
    expect(['Update', 'StartOfTurn', 'EndOfTurn']).toContain(firstEvent.event);
    expect(firstEvent.transcript).toBeDefined();
    expect(firstEvent.words).toBeDefined();
    expect(Array.isArray(firstEvent.words)).toBe(true);
    expect(firstEvent.end_of_turn_confidence).toBeDefined();
  }, 25000);

  it("should return error for missing stream_url parameter", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?model=flux-general-en`);
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

  it("should return error for missing model parameter", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}`);
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
        console.warn("WebSocket client error (expected for missing model):", err.message);
        ws.close();
        resolve();
      });
      ws.on('close', () => resolve());
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].error.code).toBe("MODEL_NOT_FOUND");
  }, 10000);

  it("should return error for invalid stream_url format", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${INVALID_STREAM_URL_FORMAT}&model=flux-general-en`);
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
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${UNREACHABLE_STREAM_URL}&model=flux-general-en`);
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
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${encodeURIComponent(SAMPLE_STREAM_URL)}&model=flux-general-en`);
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

