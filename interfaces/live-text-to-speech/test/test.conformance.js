import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL } from "../../../test/utils.js";

const ENDPOINT = "/live-tts/stream";

describe("Live Text-to-Speech Interface Conformance:", () => {
  it("should proxy Speak + Flush messages and receive binary audio", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    let receivedBinaryAudio = false;
    let binaryChunkCount = 0;

    ws.on('message', (data) => {
      if (Buffer.isBuffer(data)) {
        // Binary audio data
        receivedBinaryAudio = true;
        binaryChunkCount++;
      }
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Test timeout - did not receive binary audio'));
      }, 30000);

      ws.on('open', () => {
        // Send Speak message
        const speakMessage = {
          type: "Speak",
          text: "hello world"
        };
        ws.send(JSON.stringify(speakMessage));

        // Send Flush message to trigger audio generation
        const flushMessage = {
          type: "Flush"
        };
        ws.send(JSON.stringify(flushMessage));
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      ws.on('close', () => {
        clearTimeout(timeout);

        try {
          // Verify we received binary audio
          expect(receivedBinaryAudio).toBe(true);
          expect(binaryChunkCount).toBeGreaterThan(0);

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Auto-close after receiving audio chunks
      const checkInterval = setInterval(() => {
        if (binaryChunkCount > 0) {
          clearInterval(checkInterval);
          // Give it a moment to receive any remaining audio chunks
          setTimeout(() => ws.close(), 1000);
        }
      }, 100);
    });
  }, 35000);
});
