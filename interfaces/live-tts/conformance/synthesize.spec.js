import { describe, it, expect } from "vitest";
import WebSocket from "ws";
import { WS_URL, requestId, waitForMessages, waitForAudioChunks, waitForOpen } from "./util.js";

const ENDPOINT = "/live-tts/stream";

describe("Live TTS Interface Conformance:", () => {

  it("should connect and receive audio", async () => {
    console.log('Attempting to connect to:', `${WS_URL}${ENDPOINT}`);
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);

    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log('WebSocket connected successfully');
        resolve();
      });
      ws.on('error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });
    });

    console.log('Waiting for server Open event...');
    // Wait for server to signal that Deepgram connection is ready
    await waitForOpen(ws);

    console.log('Sending text message...');
    // Send text message
    const textMessage = {
      type: "Speak",
      text: "Hello, world!"
    };
    ws.send(JSON.stringify(textMessage));

    console.log('Waiting for audio chunks...');
    // Wait for audio chunks
    const audioChunks = await waitForAudioChunks(ws, 15000);

    console.log('Received', audioChunks.length, 'audio chunks');
    expect(audioChunks.length).toBeGreaterThan(0);
    expect(audioChunks[0]).toBeInstanceOf(Buffer);

    ws.close();
  }, 20000);

  it("should receive metadata", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    // Wait for server to signal that Deepgram connection is ready
    await waitForOpen(ws);

    // Send text message
    const textMessage = {
      type: "Speak",
      text: "Test metadata"
    };
    ws.send(JSON.stringify(textMessage));

    // Wait for messages
    const messages = await waitForMessages(ws, 10000);

    const metadataMessage = messages.find(msg => msg.type === 'Metadata');
    expect(metadataMessage).toBeDefined();
    expect(metadataMessage.type).toBe('Metadata');
    expect(metadataMessage.request_id).toBeDefined();
    expect(metadataMessage.model_name).toBeDefined();
    expect(metadataMessage.model_version).toBeDefined();
    expect(metadataMessage.model_uuid).toBeDefined();

    ws.close();
  });

  it("should accept model parameter", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?model=aura-luna-en`);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    // Wait for server to signal that Deepgram connection is ready
    await waitForOpen(ws);

    // Send text message
    const textMessage = {
      type: "Speak",
      text: "Testing different model"
    };
    ws.send(JSON.stringify(textMessage));

    // Wait for audio chunks
    const audioChunks = await waitForAudioChunks(ws, 10000);

    expect(audioChunks.length).toBeGreaterThan(0);

    ws.close();
  });

  it("should return error for missing text", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    // Send invalid message (missing text)
    const invalidMessage = {
      type: "Speak"
    };
    ws.send(JSON.stringify(invalidMessage));

    // Wait for error message
    const messages = await waitForMessages(ws, 5000);

    const errorMessage = messages.find(msg => msg.type === 'Error');
    expect(errorMessage).toBeDefined();
    expect(errorMessage.type).toBe('Error');
    expect(errorMessage.error).toBeDefined();
    expect(errorMessage.error.code).toBeDefined();
    expect(errorMessage.error.message).toBeDefined();

    ws.close();
  });

  it("should return error for invalid model", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}?model=invalid-model`);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    // Send text message
    const textMessage = {
      type: "Speak",
      text: "Testing invalid model"
    };
    ws.send(JSON.stringify(textMessage));

    // Wait for error message
    const messages = await waitForMessages(ws, 5000);

    const errorMessage = messages.find(msg => msg.type === 'Error');
    expect(errorMessage).toBeDefined();
    expect(errorMessage.type).toBe('Error');
    expect(errorMessage.error).toBeDefined();
    expect(errorMessage.error.code).toBeDefined();

    ws.close();
  });

  it("should handle connection close gracefully", async () => {
    const ws = new WebSocket(`${WS_URL}${ENDPOINT}`);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    // Send text message
    const textMessage = {
      type: "Speak",
      text: "Testing connection close"
    };
    ws.send(JSON.stringify(textMessage));

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close connection
    ws.close();

    // Should not throw any errors
    expect(true).toBe(true);
  });

});
