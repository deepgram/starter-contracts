/**
 * Test Helper Utilities
 * Shared utilities for JavaScript tests
 */

const fs = require("fs");
const path = require("path");

/**
 * Parse a TOML file
 * @param {string} filePath - Path to the TOML file
 * @returns {object} Parsed TOML data
 */
function parseToml(filePath) {
    const tomlContent = fs.readFileSync(filePath, "utf-8");

    // Simple TOML parser for key-value pairs
    const result = {};
    const lines = tomlContent.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
            const match = trimmed.match(/^(\w+)\s*=\s*"(.+)"$/);
            if (match) {
                result[match[1]] = match[2];
            }
        }
    }

    return result;
}

/**
 * Normalize text for comparison
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

// Constants
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const REPO_PATH = path.resolve(__dirname, "../..");

module.exports = {
    parseToml,
    normalizeText,
    BASE_URL,
    REPO_PATH,
};
