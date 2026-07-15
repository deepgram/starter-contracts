// Flux (v2 Speak) streaming TTS contract test.
//
// Drives the backend /api/tts WebSocket exactly as the frontend does: fetch a
// session token, open the socket with the access_token.<jwt> subprotocol, send
// { type: "Speak" } + { type: "Flush" }, and assert the server streams back
// binary linear16 audio plus a Flushed control message.
import { describe, it, expect } from 'vitest';
import WebSocket from 'ws';
import { BASE_URL } from './util.js';

const WS_URL = process.env.WS_URL || BASE_URL.replace(/^http/, 'ws');

async function getSessionToken() {
  const res = await fetch(`${BASE_URL}/api/session`);
  if (!res.ok) throw new Error(`Session failed: ${res.status}`);
  const { token } = await res.json();
  return token;
}

describe('Flux TTS stream contract (/api/tts)', () => {
  it('streams binary audio and a Flushed control message for a Speak turn', async () => {
    const token = await getSessionToken();
    const url = `${WS_URL}/api/tts?model=flux-alexis-en&encoding=linear16&sample_rate=24000`;
    const ws = new WebSocket(url, [`access_token.${token}`]);

    let audioFrames = 0;
    let audioBytes = 0;
    const controlTypes = [];

    const result = await new Promise((resolve, reject) => {
      const hardTimeout = setTimeout(() => finish(), 15000);
      let idleTimer = null;

      function finish() {
        clearTimeout(hardTimeout);
        clearTimeout(idleTimer);
        try { ws.close(); } catch { /* already closed */ }
        resolve({ audioFrames, audioBytes, controlTypes });
      }

      // Finish once the stream has been quiet for a moment — this drains all
      // audio frames (which stream around/after the Flushed control message)
      // instead of cutting off the socket the instant Flushed arrives.
      function bumpIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(finish, 1500);
      }

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'Speak', text: 'Contract test for Flux streaming text to speech.' }));
        ws.send(JSON.stringify({ type: 'Flush' }));
        bumpIdle();
      });

      ws.on('message', (data, isBinary) => {
        if (isBinary) {
          audioFrames++;
          audioBytes += data.length;
        } else {
          try {
            controlTypes.push(JSON.parse(data.toString()).type);
          } catch {
            /* ignore non-JSON */
          }
        }
        bumpIdle();
      });

      ws.on('error', (err) => {
        clearTimeout(hardTimeout);
        clearTimeout(idleTimer);
        reject(err);
      });
    });

    // The backend must forward real Flux audio as binary frames...
    expect(result.audioFrames).toBeGreaterThan(0);
    expect(result.audioBytes).toBeGreaterThan(0);
    // ...and surface the Flushed control message that ends the turn.
    expect(result.controlTypes).toContain('Flushed');
  }, 20000);

  it('rejects the WebSocket without a valid session token', async () => {
    const url = `${WS_URL}/api/tts?model=flux-alexis-en`;
    const ws = new WebSocket(url, ['access_token.invalid-token']);

    const closed = await new Promise((resolve) => {
      ws.on('close', (code) => resolve(code));
      ws.on('error', () => resolve('error'));
      setTimeout(() => resolve('timeout'), 5000);
    });

    // 4401 = unauthorized (or a connection error / non-1000 close).
    expect(closed).not.toBe(1000);
    try { ws.close(); } catch { /* already closed */ }
  }, 10000);
});
