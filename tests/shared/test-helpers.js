import fs from 'fs';
import path from 'path';

/**
 * Simple TOML parser for deepgram.toml [meta] section
 * @param {string} filePath - Path to TOML file
 * @returns {Object} Parsed TOML with meta section
 */
export function parseToml(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`TOML file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse [meta] section
  const metaMatch = content.match(/\[meta\]([\s\S]*?)(?=\n\[|$)/);
  const meta = {};

  if (metaMatch) {
    metaMatch[1].split('\n').forEach(line => {
      // Match key = "value" or key = value
      const match = line.match(/^\s*(\w+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match && match[1] && match[2]) {
        meta[match[1]] = match[2];
      }
    });
  }

  return { meta };
}

/**
 * Normalize text for comparison (lowercase, collapse whitespace)
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Environment variables with defaults
 */
export const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
export const REPO_PATH = process.env.REPO_PATH || process.cwd();
