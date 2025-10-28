import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL, createMinimalSettings, waitForMessageType, waitForMessageTypes } from "./util.js";

const ENDPOINT = "/agent/converse";

describe("Agent Interface Conformance:", () => {

  it("should connect to WebSocket endpoint", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);

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

  it("should receive Welcome message after connection", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const messages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messages.push(message);
      } catch (e) {
        // Ignore non-JSON messages (binary audio data)
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', async () => {
        try {
          // Wait for Welcome from Deepgram (forwarded through starter app)
          const welcomeMsg = await waitForMessageType(messages, 'Welcome');
          expect(welcomeMsg.type).toBe('Welcome');
          expect(welcomeMsg.request_id).toBeDefined();
          ws.close();
          resolve();
        } catch (error) {
          ws.close();
          reject(error);
        }
      });
      ws.on('error', (error) => {
        reject(error);
      });
    });
  }, 20000);

  it("should accept minimal Settings message and respond with SettingsApplied", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const messages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messages.push(message);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', async () => {
        try {
          // Wait for Welcome message from Deepgram
          await waitForMessageType(messages, 'Welcome');

          // Send Settings to Deepgram via starter app
          const settings = createMinimalSettings();
          ws.send(JSON.stringify(settings));

          // Wait for SettingsApplied from Deepgram
          const settingsAppliedMsg = await waitForMessageType(messages, 'SettingsApplied');
          expect(settingsAppliedMsg.type).toBe('SettingsApplied');

          ws.close();
          resolve();
        } catch (error) {
          ws.close();
          reject(error);
        }
      });
      ws.on('error', (error) => {
        reject(error);
      });
    });
  }, 25000);

  it("should reject invalid Settings message (missing audio)", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const messages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messages.push(message);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', async () => {
        try {
          // Wait for Welcome message from Deepgram
          await waitForMessageType(messages, 'Welcome');

          // Send invalid Settings (missing audio) - Deepgram will validate
          const invalidSettings = {
            type: "Settings",
            agent: {
              listen: {
                provider: {
                  type: "deepgram",
                  model: "nova-3"
                }
              },
              think: {
                provider: {
                  type: "open_ai",
                  model: "gpt-4o-mini"
                }
              },
              speak: {
                provider: {
                  type: "deepgram",
                  model: "aura-2-thalia-en"
                }
              }
            }
          };
          ws.send(JSON.stringify(invalidSettings));

          // Wait for Error message from Deepgram
          const errorMsg = await waitForMessageType(messages, 'Error');
          expect(errorMsg.type).toBe('Error');
          expect(errorMsg.code).toBeDefined();

          ws.close();
          resolve();
        } catch (error) {
          ws.close();
          reject(error);
        }
      });
      ws.on('error', (error) => {
        reject(error);
      });
    });
  }, 25000);

  it("should reject invalid Settings message (missing agent.listen)", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const messages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messages.push(message);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', async () => {
        try {
          // Wait for Welcome message from Deepgram
          await waitForMessageType(messages, 'Welcome');

          // Send invalid Settings (missing agent.listen) - Deepgram will validate
          const invalidSettings = {
            type: "Settings",
            audio: {
              input: {
                encoding: "linear16",
                sample_rate: 24000
              },
              output: {
                encoding: "linear16",
                sample_rate: 24000,
                container: "none"
              }
            },
            agent: {
              think: {
                provider: {
                  type: "open_ai",
                  model: "gpt-4o-mini"
                }
              },
              speak: {
                provider: {
                  type: "deepgram",
                  model: "aura-2-thalia-en"
                }
              }
            }
          };
          ws.send(JSON.stringify(invalidSettings));

          // Wait for Error message from Deepgram
          const errorMsg = await waitForMessageType(messages, 'Error');
          expect(errorMsg.type).toBe('Error');
          expect(errorMsg.code).toBeDefined();

          ws.close();
          resolve();
        } catch (error) {
          ws.close();
          reject(error);
        }
      });
      ws.on('error', (error) => {
        reject(error);
      });
    });
  }, 25000);

  it("should reject invalid Settings message (missing agent.think)", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const messages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messages.push(message);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', async () => {
        try {
          // Wait for Welcome message from Deepgram
          await waitForMessageType(messages, 'Welcome');

          // Send invalid Settings (missing agent.think) - Deepgram will validate
          const invalidSettings = {
            type: "Settings",
            audio: {
              input: {
                encoding: "linear16",
                sample_rate: 24000
              },
              output: {
                encoding: "linear16",
                sample_rate: 24000,
                container: "none"
              }
            },
            agent: {
              listen: {
                provider: {
                  type: "deepgram",
                  model: "nova-3"
                }
              },
              speak: {
                provider: {
                  type: "deepgram",
                  model: "aura-2-thalia-en"
                }
              }
            }
          };
          ws.send(JSON.stringify(invalidSettings));

          // Wait for Error message from Deepgram
          const errorMsg = await waitForMessageType(messages, 'Error');
          expect(errorMsg.type).toBe('Error');
          expect(errorMsg.code).toBeDefined();

          ws.close();
          resolve();
        } catch (error) {
          ws.close();
          reject(error);
        }
      });
      ws.on('error', (error) => {
        reject(error);
      });
    });
  }, 25000);

  it("should reject invalid Settings message (missing agent.speak)", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
    const messages = [];

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        messages.push(message);
      } catch (e) {
        // Ignore non-JSON messages
      }
    });

    await new Promise((resolve, reject) => {
      ws.on('open', async () => {
        try {
          // Wait for Welcome message from Deepgram
          await waitForMessageType(messages, 'Welcome');

          // Send invalid Settings (missing agent.speak) - Deepgram will validate
          const invalidSettings = {
            type: "Settings",
            audio: {
              input: {
                encoding: "linear16",
                sample_rate: 24000
              },
              output: {
                encoding: "linear16",
                sample_rate: 24000,
                container: "none"
              }
            },
            agent: {
              listen: {
                provider: {
                  type: "deepgram",
                  model: "nova-3"
                }
              },
              think: {
                provider: {
                  type: "open_ai",
                  model: "gpt-4o-mini"
                }
              }
            }
          };
          ws.send(JSON.stringify(invalidSettings));

          // Wait for Error message from Deepgram
          const errorMsg = await waitForMessageType(messages, 'Error');
          expect(errorMsg.type).toBe('Error');
          expect(errorMsg.code).toBeDefined();

          ws.close();
          resolve();
        } catch (error) {
          ws.close();
          reject(error);
        }
      });
      ws.on('error', (error) => {
        reject(error);
      });
    });
  }, 25000);

  it("should handle connection close gracefully", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);
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

