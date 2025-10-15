import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { validate, BASE_URL, AUTH, requestId } from "../../conformance/util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaDir = path.resolve(__dirname, "..", "schema");
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

export const REQUEST_SCHEMA = readJSON(path.join(schemaDir, "request.json"));
export const ERROR_SCHEMA = readJSON(path.join(schemaDir, "error.json"));
export const RESPONSE_SCHEMA = readJSON(path.join(schemaDir, "response.json"));

export { validate, BASE_URL, AUTH, requestId };

