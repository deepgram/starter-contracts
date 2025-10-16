import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { validate, audioBytes, badAudio, BASE_URL, AUTH, requestId } from "../../conformance/util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaDir = path.resolve(__dirname, "..", "schema");
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

export const TRANSCRIPT_SCHEMA = readJSON(path.join(schemaDir, "transcript.json"));
export const ERROR_SCHEMA = readJSON(path.join(schemaDir, "error.json"));

export { validate, audioBytes, badAudio, BASE_URL, AUTH, requestId };

