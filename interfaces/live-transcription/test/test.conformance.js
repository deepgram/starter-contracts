import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL } from "../../../test/utils.js";

const ENDPOINT = "/live-stt/stream";

describe("Live Transcription Interface Conformance:", () => {
  it("should proxy audio URL and receive Results events", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const jsonMessages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        jsonMessages.push(message);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Test timeout - did not receive Results event'));
      }, 30000);

      ws.on('open', () => {
        // Send JSON body with URL to audio file
        const requestBody = {
          url: "https://dpgr.am/spacewalk.wav"
        };
        ws.send(JSON.stringify(requestBody));
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      ws.on('close', () => {
        clearTimeout(timeout);

        try {
          // Verify we received at least one Results event
          const resultsMessages = jsonMessages.filter(msg => msg.type === 'Results');
          expect(resultsMessages.length).toBeGreaterThan(0);

          // Verify Results structure
          const firstResult = resultsMessages[0];
          expect(firstResult.channel).toBeDefined();
          expect(firstResult.channel.alternatives).toBeDefined();
          expect(Array.isArray(firstResult.channel.alternatives)).toBe(true);

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Auto-close after receiving final transcript
      const checkInterval = setInterval(() => {
        const finalResult = jsonMessages.find(msg =>
          msg.type === 'Results' && msg.is_final === true
        );
        if (finalResult) {
          clearInterval(checkInterval);
          // Give it a moment to receive any remaining messages
          setTimeout(() => ws.close(), 500);
        }
      }, 100);
    });
  }, 35000);
});
