import crypto from "node:crypto";

// Base URL for Text Intelligence conformance tests
export const BASE_URL = process.env.BASE_URL || "http://localhost:8787";

// Generate unique request ID for tracing
export const requestId = () => crypto.randomUUID();

