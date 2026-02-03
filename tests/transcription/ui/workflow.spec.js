import { test, expect } from "@playwright/test";
import { compareTwoStrings } from "string-similarity";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SAMPLE_AUDIO_URL = "https://dpgr.am/spacewalk.wav";
const EXPECTED_TRANSCRIPT =
  "Yeah, as much as it's worth celebrating the first spacewalk, with Ed White and Gemini four, it's worth remembering that it was about an emergency.";

/**
 * Fuzzy match transcript with expected text
 * @param {string} actual - Actual transcript
 * @param {string} expected - Expected transcript
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {boolean} True if similarity is above threshold
 */
function fuzzyMatch(actual, expected, threshold = 0.8) {
  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const similarity = compareTwoStrings(
    normalize(actual),
    normalize(expected)
  );
  return similarity >= threshold;
}

test.describe("Transcription UI Workflow", () => {
  test("should complete full transcription workflow", async ({ page }) => {
    // Navigate to the transcription app
    await page.goto(BASE_URL);

    // Wait for the page to load
    await expect(page).toHaveTitle(/Transcription/i);

    // Find and fill the audio URL input
    const urlInput = page.locator('input[type="url"], input[name="url"]').first();
    await urlInput.fill(SAMPLE_AUDIO_URL);

    // Find and click the transcribe button
    const transcribeButton = page.locator('button:has-text("Transcribe")').first();
    await transcribeButton.click();

    // Wait for transcription to complete
    // Look for the transcript container
    const transcriptContainer = page.locator('[data-testid="transcript"], .transcript, #transcript').first();

    // Wait for the transcript to appear (with generous timeout for API call)
    await expect(transcriptContainer).toBeVisible({ timeout: 30000 });

    // Get the transcript text
    const transcriptText = await transcriptContainer.textContent();

    // Validate the transcript using fuzzy matching
    expect(transcriptText).toBeTruthy();
    expect(transcriptText.length).toBeGreaterThan(0);

    const isMatch = fuzzyMatch(transcriptText, EXPECTED_TRANSCRIPT);
    expect(isMatch).toBe(true);
  });
});
