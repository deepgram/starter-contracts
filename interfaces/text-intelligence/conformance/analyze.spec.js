import { describe, it, expect } from 'vitest';
import { BASE_URL, sampleText } from './util.js';

const ENDPOINT = `${BASE_URL}/text-intelligence/analyze`;

describe('Text Intelligence Conformance Tests', () => {
  describe('Basic Functionality', () => {
    it('should analyze text with summarize=true', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('summary');
      expect(data.results.summary).toHaveProperty('text');
      expect(typeof data.results.summary.text).toBe('string');
    });

    it('should analyze text with sentiment=true', async () => {
      const response = await fetch(`${ENDPOINT}?sentiment=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('sentiments');
      expect(data.results.sentiments).toHaveProperty('segments');
      expect(Array.isArray(data.results.sentiments.segments)).toBe(true);
    });

    it('should analyze text with topics=true', async () => {
      const response = await fetch(`${ENDPOINT}?topics=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('topics');
      expect(data.results.topics).toHaveProperty('segments');
      expect(Array.isArray(data.results.topics.segments)).toBe(true);
    });

    it('should analyze text with intents=true', async () => {
      const response = await fetch(`${ENDPOINT}?intents=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('intents');
      expect(data.results.intents).toHaveProperty('segments');
      expect(Array.isArray(data.results.intents.segments)).toBe(true);
    });

    it('should analyze text with all features enabled', async () => {
      const response = await fetch(
        `${ENDPOINT}?summarize=true&sentiment=true&topics=true&intents=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sampleText() })
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('summary');
      expect(data.results).toHaveProperty('sentiments');
      expect(data.results).toHaveProperty('topics');
      expect(data.results).toHaveProperty('intents');
    });

    it('should return correct metadata structure', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.metadata).toHaveProperty('request_id');
      expect(data.metadata).toHaveProperty('created');
      expect(data.metadata).toHaveProperty('language');
      expect(typeof data.metadata.request_id).toBe('string');
      expect(typeof data.metadata.created).toBe('string');
      expect(typeof data.metadata.language).toBe('string');
    });

    it('should include request_id in metadata', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.metadata.request_id).toBeTruthy();
      // UUID format check (basic)
      expect(data.metadata.request_id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should include feature-specific *_info in metadata', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true&sentiment=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.metadata).toHaveProperty('summary_info');
      expect(data.metadata).toHaveProperty('sentiment_info');
    });

    it('should handle custom_topic parameter', async () => {
      const response = await fetch(
        `${ENDPOINT}?topics=true&custom_topic=Technology&custom_topic=Business`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sampleText() })
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('topics');
    });

    it('should handle custom_intent parameter', async () => {
      const response = await fetch(
        `${ENDPOINT}?intents=true&custom_intent=Inform&custom_intent=Advise`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sampleText() })
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(data.results).toHaveProperty('intents');
    });

    it('should validate sentiment segment structure', async () => {
      const response = await fetch(`${ENDPOINT}?sentiment=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.results.sentiments.segments.length > 0) {
        const segment = data.results.sentiments.segments[0];
        expect(segment).toHaveProperty('text');
        expect(segment).toHaveProperty('start_word');
        expect(segment).toHaveProperty('end_word');
        expect(segment).toHaveProperty('sentiment');
        expect(['positive', 'negative', 'neutral']).toContain(segment.sentiment);
      }
    });

    it('should validate topics segment structure', async () => {
      const response = await fetch(`${ENDPOINT}?topics=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.results.topics.segments.length > 0) {
        const segment = data.results.topics.segments[0];
        expect(segment).toHaveProperty('text');
        expect(segment).toHaveProperty('topics');
        expect(Array.isArray(segment.topics)).toBe(true);

        if (segment.topics.length > 0) {
          expect(segment.topics[0]).toHaveProperty('topic');
          expect(segment.topics[0]).toHaveProperty('confidence_score');
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text gracefully', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' })
      });

      // Could either accept empty text or reject with 400
      expect([200, 400]).toContain(response.status);
      const data = await response.json();

      if (response.status === 400) {
        expect(data).toHaveProperty('error');
      }
    });

    it('should handle text with special characters and Unicode', async () => {
      const specialText = 'Hello! 你好 🌍 Привет © ® ™ <tag> & "quotes"';
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: specialText })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
    });

    it('should reject requests with both url and text', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com/article.txt',
          text: sampleText()
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });

    it('should reject requests with neither url nor text', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error.code).toBe('MISSING_TEXT_OR_URL');
    });

    it('should handle invalid URL format', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'not-a-valid-url' })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
    });

    it('should handle unreachable URL', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://nonexistent-domain-12345.com/article.txt' })
      });

      // Could be 400 or 404 depending on implementation
      expect([400, 404, 500]).toContain(response.status);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should handle unknown query parameters gracefully', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true&unknown_param=value`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      // Unknown params should be ignored, not cause failure
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('metadata');
      expect(data).toHaveProperty('results');
    });

    it('should reject invalid boolean values for feature flags', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=invalid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing request body', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
        // No body
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for malformed JSON', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {'
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return structured JSON error (not HTML)', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing text/url
      });

      expect(response.status).toBe(400);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('object');
    });

    it('should include error code in response', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing text/url
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toHaveProperty('code');
      expect(typeof data.error.code).toBe('string');
    });

    it('should include descriptive error message', async () => {
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing text/url
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toHaveProperty('message');
      expect(typeof data.error.message).toBe('string');
      expect(data.error.message.length).toBeGreaterThan(0);
    });

    it('should handle authentication errors (401)', async () => {
      // This test assumes the backend checks authentication
      // If no auth is required, this test can be skipped
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token invalid-key'
        },
        body: JSON.stringify({ text: sampleText() })
      });

      // Could be 401 or 200 depending on if auth is enforced
      if (response.status === 401) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });

    it('should echo X-Request-Id header if provided', async () => {
      const customRequestId = 'test-request-id-12345';
      const response = await fetch(`${ENDPOINT}?summarize=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': customRequestId
        },
        body: JSON.stringify({ text: sampleText() })
      });

      expect(response.status).toBe(200);
      // The backend should echo the X-Request-Id header
      const echoedId = response.headers.get('X-Request-Id');
      if (echoedId) {
        expect(echoedId).toBe(customRequestId);
      }
    });
  });
});

