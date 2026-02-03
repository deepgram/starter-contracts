import { test, expect } from '@playwright/test';
import { compareTwoStrings } from 'string-similarity';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const SIMILARITY_THRESHOLD = 0.85; // 85% match required

// Stanford debate audio transcript (from card-spacewalk)
const EXPECTED_TRANSCRIPT = `so the logic behind this article he said please pirate my cut my songs because if everybody knows my songs and everybody comes to my concerts i'll make much more money than if everybody buys my records and it makes sense you know so another problem the big five record labels distributed eighty five percent of music that is distributed worldwide`;

test.describe('Transcription UI Workflow', () => {
  test('should complete full transcription workflow via UI', async ({ page }) => {
    // 1. Navigate to app
    await page.goto(BASE_URL);

    // 2. Wait for page to load and card to be enabled
    await page.waitForSelector('#card-spacewalk', { state: 'visible' });
    await page.waitForSelector('#card-spacewalk:not([class*="disabled"])', {
      timeout: 5000
    });

    // 3. Select spacewalk audio (Stanford debate)
    await page.locator('#card-spacewalk').click();

    // 4. Wait for transcribe button to be enabled and click
    await page.waitForSelector('#transcribeBtn:not([disabled])', {
      timeout: 5000
    });
    await page.locator('#transcribeBtn').click();

    // 5. Wait for results to appear (look for distinctive phrase)
    await page.waitForSelector('text=/pirate|concert|record/i', {
      timeout: 30000
    });

    // 6. Extract transcript text from page
    const transcriptText = await page.textContent('body');

    // 7. Normalize both texts (lowercase, collapse whitespace)
    const normalizedTranscript = transcriptText
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    const normalizedExpected = EXPECTED_TRANSCRIPT
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    // 8. Fuzzy match with similarity threshold
    const similarity = compareTwoStrings(normalizedTranscript, normalizedExpected);

    console.log(`Transcript similarity: ${(similarity * 100).toFixed(2)}%`);
    expect(similarity).toBeGreaterThanOrEqual(SIMILARITY_THRESHOLD);
  });

  test('should have required UI elements', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for required elements
    await expect(page.locator('#card-spacewalk')).toBeVisible();
    await expect(page.locator('#transcribeBtn')).toBeVisible();
  });
});
