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
        if (result.error) {
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
    expect(errors[0]).toHaveProperty('error');
    expect(errors[0]).not.toHaveProperty('type');
    expect(errors[0].error.code).toBe("INVALID_STREAM_URL");
  }, 10000);

  it("should return error for invalid stream_url format", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${INVALID_STREAM_URL_FORMAT}`);
    const errors = [];

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.error) {
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
    expect(errors[0]).toHaveProperty('error');
    expect(errors[0]).not.toHaveProperty('type');
    expect(errors[0].error.code).toBe("INVALID_STREAM_URL");
  }, 10000);

  it("should return error for unreachable stream_url", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?stream_url=${UNREACHABLE_STREAM_URL}`);
    const errors = [];

    ws.on('message', (data) => {
      try {
        const result = JSON.parse(data);
        if (result.error) {
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
    expect(errors[0]).toHaveProperty('error');
    expect(errors[0]).not.toHaveProperty('type');
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

  // ============================================================================
  // BINARY MODE TESTS
  // ============================================================================

  it("should accept binary mode without stream_url", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?mode=binary&model=nova-3&language=en`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected in binary mode");
        ws.close();
        resolve();
      });
      ws.on('error', (error) => {
        console.error("WebSocket connection failed in binary mode:", error);
        reject(error);
      });
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  }, 10000);

  it("should accept binary audio data in binary mode", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?mode=binary&model=nova-3`);
    let receivedResponse = false;
    const responses = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log("Received message in binary mode:", message.type);
        responses.push(message.type);
        receivedResponse = true;
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("Binary mode connected, sending audio data");

        // Send a small chunk of silent PCM16 audio (1024 samples = 2048 bytes)
        const audioChunk = new Int16Array(1024).fill(0);
        ws.send(audioChunk.buffer);

        // Wait a bit to see if we get any response
        setTimeout(() => {
          console.log("Received responses:", responses);
          ws.close();
          resolve();
        }, 3000);
      });
      ws.on('error', (error) => {
        console.error("Binary mode WebSocket error:", error);
        reject(error);
      });
      ws.on('close', () => resolve());
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });

    // We should receive at least some response (Ready, Metadata, or Results)
    expect(receivedResponse).toBe(true);
    expect(responses.length).toBeGreaterThan(0);
  }, 15000);

  it("should accept model parameter in binary mode", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?mode=binary&model=nova-2`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected in binary mode with model parameter");
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

  it("should accept language parameter in binary mode", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?mode=binary&language=es`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected in binary mode with language parameter");
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

  it("should handle multiple binary audio chunks in binary mode", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?mode=binary&model=nova-3`);
    let messageCount = 0;
    const messageTypes = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log("Received message:", message.type);
        messageTypes.push(message.type);
        messageCount++;
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("Binary mode connected, sending multiple audio chunks");

        // Send multiple chunks of silent audio
        for (let i = 0; i < 3; i++) {
          const audioChunk = new Int16Array(1024).fill(0);
          ws.send(audioChunk.buffer);
        }

        // Wait to collect responses
        setTimeout(() => {
          console.log("Received message types:", messageTypes);
          console.log("Total messages:", messageCount);
          ws.close();
          resolve();
        }, 3000);
      });
      ws.on('error', (error) => {
        console.error("Binary mode WebSocket error:", error);
        reject(error);
      });
      ws.on('close', () => resolve());
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });

    // Should receive at least one message (Ready, Metadata, or Results)
    expect(messageCount).toBeGreaterThan(0);
  }, 15000);

});