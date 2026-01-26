import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL } from "../../../test/utils.js";

const ENDPOINT = "/agent/converse";

describe("Voice Agent Interface Conformance:", () => {
  it("should proxy InjectUserMessage and receive binary audio + AgentAudioDone", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const jsonMessages = [];
    let receivedBinaryAudio = false;
    let receivedWelcome = false;
    let receivedSettingsApplied = false;

    ws.on('message', (data) => {
      // Try to parse as JSON first (could be Buffer or string)
      try {
        const text = Buffer.isBuffer(data) ? data.toString('utf8') : data;
        const message = JSON.parse(text);
        jsonMessages.push(message);

        // 1. When we receive Welcome, send Settings
        if (message.type === 'Welcome' && !receivedWelcome) {
          receivedWelcome = true;
          const settingsMessage = {
            type: "Settings",
            audio: {
              input: {
                encoding: "linear16",
                sample_rate: 16000
              },
              output: {
                encoding: "linear16",
                sample_rate: 16000
              }
            },
            agent: {
              listen: {
                provider: {
                  type: "deepgram",
                  version: "v1",
                  model: "nova-2"
                }
              },
              speak: {
                provider: {
                  type: "deepgram",
                  model: "aura-asteria-en"
                }
              },
              think: {
                provider: {
                  type: "open_ai",
                  model: "gpt-4o-mini"
                },
                prompt: "You are a helpful assistant."
              }
            }
          };
          ws.send(JSON.stringify(settingsMessage));
        }

        // 2. When we receive SettingsApplied, send InjectUserMessage
        if (message.type === 'SettingsApplied' && !receivedSettingsApplied) {
          receivedSettingsApplied = true;
          const injectMessage = {
            type: "InjectUserMessage",
            content: "Say hello"
          };
          ws.send(JSON.stringify(injectMessage));
        }
      } catch (e) {
        // Not JSON, must be binary audio
        receivedBinaryAudio = true;
      }
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Test timeout - did not receive expected messages'));
      }, 30000);

      ws.on('open', () => {
        // Wait for Welcome message, don't send anything immediately
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

          // Verify we received AgentAudioDone event
          const audioDone = jsonMessages.find(msg => msg.type === 'AgentAudioDone');
          expect(audioDone).toBeDefined();
          expect(audioDone.type).toBe('AgentAudioDone');

          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Auto-close after receiving AgentAudioDone and binary audio
      const checkInterval = setInterval(() => {
        const audioDone = jsonMessages.find(msg => msg.type === 'AgentAudioDone');
        if (audioDone && receivedBinaryAudio) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          ws.close();
        }
      }, 100);
    });
  }, 35000);
});
