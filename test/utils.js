import crypto from "node:crypto";

// Base URL for conformance tests
// Can be set via BASE_URL env var (e.g., "http://localhost:8080" or "https://example.com")
// Standard port for all Deepgram starter contracts: 8080
const baseUrl = process.env.BASE_URL || "http://localhost:8080";

// REST API base URL
export const BASE_URL = baseUrl;

// WebSocket base URL (automatically derives from BASE_URL)
export const WS_URL = baseUrl.replace(/^http/, "ws");

// Generate unique request ID for tracing
export const requestId = () => crypto.randomUUID();
