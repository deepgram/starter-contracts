import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import crypto from "node:crypto";

// Environment variables
export const BASE_URL = process.env.BASE_URL || "http://localhost:8787";
export const WS_BASE_URL = process.env.WS_BASE_URL || "ws://localhost:8787";
export const AUTH = process.env.AUTH_TOKEN || "testtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fixture loading helpers
export const fixture = (name) =>
  fs.readFileSync(path.join(__dirname, "fixtures", name));

export const fixtureJSON = (name) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8"));

// Test data generators
export const audioBytes = () => fixture("audio.wav");

export const badAudio = () => fixture("bad-audio.bin");

export const sampleText = () => fixture("sample-text.txt").toString("utf8");

export const requestId = () => crypto.randomUUID();

// Timing utilities
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Schema validation
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export const validate = (schema, data) => {
  const v = ajv.compile(schema);
  const ok = v(data);
  if (!ok) {
    const err = new Error("Schema validation failed");
    err.details = v.errors;
    throw err;
  }
};

