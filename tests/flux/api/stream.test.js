import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { getWsProtocols } from "../../shared/test-helpers.js";

const WS_URL = process.env.WS_URL || "ws://localhost:8081";
const HTTP_BASE_URL = process.env.BASE_URL || WS_URL.replace(/^ws/, "http");
const ENDPOINT = process.env.FLUX_ENDPOINT || "/api/flux";

describe("Flux WebSocket Proxy Conformance:", () => {

  it("should connect to WebSocket endpoint", async () => {
    const protocols = await getWsProtocols(HTTP_BASE_URL);
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`, protocols);

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

  it("should accept encoding parameter", async () => {
    const protocols = await getWsProtocols(HTTP_BASE_URL);
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?encoding=linear16&sample_rate=16000`, protocols);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("WebSocket connected with encoding parameter");
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

  it.skip("should accept binary audio data", async () => {
    const protocols = await getWsProtocols(HTTP_BASE_URL);
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?encoding=linear16&sample_rate=16000`, protocols);
    let receivedResponse = false;
    const responses = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log("Received message:", message.type);
        responses.push(message.type);
        receivedResponse = true;
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log("Connected, sending audio data");

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
        console.error("WebSocket error:", error);
        reject(error);
      });
      ws.on('close', () => resolve());
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);
    });

    // We should receive at least some response (Connected, TurnInfo, etc.)
    expect(receivedResponse).toBe(true);
    expect(responses.length).toBeGreaterThan(0);
  }, 15000);

  it("should handle connection close gracefully", async () => {
    const protocols = await getWsProtocols(HTTP_BASE_URL);
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`, protocols);
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
