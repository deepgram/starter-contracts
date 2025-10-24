import crypto from "node:crypto";

// Base WebSocket URL for Flux conformance tests
export const WS_URL = process.env.WS_URL || "ws://localhost:3000";

// Generate unique request ID for tracing
export const requestId = () => crypto.randomUUID();

// Helper to wait for a specific number of turn info events
export const waitForTurnInfoEvents = (events, count, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkEvents = () => {
      if (events.length >= count) {
        resolve(events);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for ${count} turn info events. Got ${events.length} events.`));
        return;
      }

      setTimeout(checkEvents, 100);
    };

    checkEvents();
  });
};

// Helper to wait for end-of-turn events
export const waitForEndOfTurnEvents = (events, count, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkEndOfTurnEvents = () => {
      const endOfTurnEvents = events.filter(e => e.event === "EndOfTurn");

      if (endOfTurnEvents.length >= count) {
        resolve(endOfTurnEvents);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for ${count} EndOfTurn events. Got ${endOfTurnEvents.length} events.`));
        return;
      }

      setTimeout(checkEndOfTurnEvents, 100);
    };

    checkEndOfTurnEvents();
  });
};

