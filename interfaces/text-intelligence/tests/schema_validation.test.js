import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize AJV with formats
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

// Load schemas
const requestSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/request.json'), 'utf-8')
);
const querySchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/query.json'), 'utf-8')
);
const responseSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/response.json'), 'utf-8')
);
const errorSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/error.json'), 'utf-8')
);

// Load examples
const requestUrlExample = JSON.parse(
  readFileSync(join(__dirname, '../examples/request.url.json'), 'utf-8')
);
const requestTextExample = JSON.parse(
  readFileSync(join(__dirname, '../examples/request.text.json'), 'utf-8')
);
const responseOkExample = JSON.parse(
  readFileSync(join(__dirname, '../examples/response.ok.json'), 'utf-8')
);
const responseErrorExample = JSON.parse(
  readFileSync(join(__dirname, '../examples/response.error.json'), 'utf-8')
);

// Compile validators
const validateRequest = ajv.compile(requestSchema);
const validateQuery = ajv.compile(querySchema);
const validateResponse = ajv.compile(responseSchema);
const validateError = ajv.compile(errorSchema);

describe('Text Intelligence Schema Validation', () => {
  describe('Request Schema', () => {
    it('should validate URL-based request from examples', () => {
      const valid = validateRequest(requestUrlExample);
      expect(valid).toBe(true);
      expect(validateRequest.errors).toBeNull();
    });

    it('should validate text-based request from examples', () => {
      const valid = validateRequest(requestTextExample);
      expect(valid).toBe(true);
      expect(validateRequest.errors).toBeNull();
    });

    it('should reject requests with both url and text', () => {
      const invalidRequest = {
        url: 'https://example.com/article.txt',
        text: 'Some text content'
      };
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
      expect(validateRequest.errors).not.toBeNull();
    });

    it('should reject requests with neither url nor text', () => {
      const invalidRequest = {};
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
      expect(validateRequest.errors).not.toBeNull();
    });

    it('should validate url format (must be valid URI)', () => {
      const validRequest = {
        url: 'https://example.com/document.txt'
      };
      const valid = validateRequest(validRequest);
      expect(valid).toBe(true);
    });

    it('should reject invalid url formats', () => {
      const invalidRequest = {
        url: 'not-a-valid-url'
      };
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
    });

    it('should validate text as string', () => {
      const validRequest = {
        text: 'This is valid text content for analysis'
      };
      const valid = validateRequest(validRequest);
      expect(valid).toBe(true);
    });

    it('should reject empty text string', () => {
      const invalidRequest = {
        text: ''
      };
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
    });

    it('should reject text as non-string type', () => {
      const invalidRequest = {
        text: 12345
      };
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
    });

    it('should reject additional unknown properties in URL request', () => {
      const invalidRequest = {
        url: 'https://example.com/article.txt',
        unknown_field: 'value'
      };
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
    });

    it('should reject additional unknown properties in text request', () => {
      const invalidRequest = {
        text: 'Some text',
        unknown_field: 'value'
      };
      const valid = validateRequest(invalidRequest);
      expect(valid).toBe(false);
    });
  });

  describe('Query Schema', () => {
    it('should validate boolean sentiment parameter', () => {
      const validQuery = { sentiment: true };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate boolean summarize parameter', () => {
      const validQuery = { summarize: true };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate boolean topics parameter', () => {
      const validQuery = { topics: true };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate boolean intents parameter', () => {
      const validQuery = { intents: true };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate custom_topic as string', () => {
      const validQuery = { custom_topic: 'Technology' };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate custom_topic as array', () => {
      const validQuery = {
        custom_topic: ['Technology', 'Business', 'AI']
      };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate custom_intent as string', () => {
      const validQuery = { custom_intent: 'Purchase Intent' };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate custom_intent as array', () => {
      const validQuery = {
        custom_intent: ['Inform', 'Request', 'Advise']
      };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should enforce custom_topic array maxItems (100)', () => {
      const topics = Array(101).fill('Topic');
      const invalidQuery = { custom_topic: topics };
      const valid = validateQuery(invalidQuery);
      expect(valid).toBe(false);
    });

    it('should enforce custom_intent array maxItems (100)', () => {
      const intents = Array(101).fill('Intent');
      const invalidQuery = { custom_intent: intents };
      const valid = validateQuery(invalidQuery);
      expect(valid).toBe(false);
    });

    it('should validate callback as URI', () => {
      const validQuery = { callback: 'https://example.com/callback' };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should reject invalid callback URI', () => {
      const invalidQuery = { callback: 'not-a-valid-uri' };
      const valid = validateQuery(invalidQuery);
      expect(valid).toBe(false);
    });

    it('should validate callback_method enum (POST)', () => {
      const validQuery = { callback_method: 'POST' };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should validate callback_method enum (PUT)', () => {
      const validQuery = { callback_method: 'PUT' };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should reject invalid callback_method', () => {
      const invalidQuery = { callback_method: 'GET' };
      const valid = validateQuery(invalidQuery);
      expect(valid).toBe(false);
    });

    it('should validate query with all parameters', () => {
      const validQuery = {
        sentiment: true,
        summarize: true,
        topics: true,
        intents: true,
        custom_topic: ['AI', 'Business'],
        custom_intent: ['Inform', 'Advise'],
        callback: 'https://example.com/callback',
        callback_method: 'POST'
      };
      const valid = validateQuery(validQuery);
      expect(valid).toBe(true);
    });

    it('should reject unknown query parameters', () => {
      const invalidQuery = {
        sentiment: true,
        unknown_param: 'value'
      };
      const valid = validateQuery(invalidQuery);
      expect(valid).toBe(false);
    });
  });

  describe('Response Schema', () => {
    it('should validate complete response from examples', () => {
      const valid = validateResponse(responseOkExample);
      expect(valid).toBe(true);
      expect(validateResponse.errors).toBeNull();
    });

    it('should validate required metadata fields', () => {
      const minimalResponse = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(minimalResponse);
      expect(valid).toBe(true);
    });

    it('should validate metadata.request_id format (uuid)', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should reject invalid metadata.request_id format', () => {
      const response = {
        metadata: {
          request_id: 'not-a-uuid',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should validate metadata.created format (date-time)', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should reject invalid metadata.created format', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: 'not-a-date',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should validate metadata with summary_info', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en',
          summary_info: {
            model_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            input_tokens: 150,
            output_tokens: 45
          }
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should validate metadata with all *_info objects', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en',
          summary_info: {
            model_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            input_tokens: 150,
            output_tokens: 45
          },
          sentiment_info: {
            model_uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            input_tokens: 150,
            output_tokens: 12
          },
          topics_info: {
            model_uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            input_tokens: 150,
            output_tokens: 20
          },
          intents_info: {
            model_uuid: 'd4e5f6a7-b8c9-0123-def1-234567890123',
            input_tokens: 150,
            output_tokens: 18
          }
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should validate results.summary structure', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          summary: {
            text: 'This is a summary of the text.'
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should validate results.sentiments array structure', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          sentiments: {
            segments: [
              {
                text: 'This is positive.',
                start_word: 0,
                end_word: 3,
                sentiment: 'positive'
              }
            ]
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should validate sentiment segment properties', () => {
      const segment = {
        text: 'Sample text',
        start_word: 0,
        end_word: 2,
        sentiment: 'neutral'
      };
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          sentiments: {
            segments: [segment]
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should reject invalid sentiment value', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          sentiments: {
            segments: [
              {
                text: 'Sample text',
                start_word: 0,
                end_word: 2,
                sentiment: 'invalid-sentiment'
              }
            ]
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should validate results.topics structure and segments', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          topics: {
            segments: [
              {
                text: 'AI is transforming business.',
                topics: [
                  {
                    topic: 'Artificial Intelligence',
                    confidence_score: 0.95
                  }
                ]
              }
            ]
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should validate results.intents structure and segments', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          intents: {
            segments: [
              {
                text: 'Companies should invest in AI.',
                intents: [
                  {
                    intent: 'Advise',
                    confidence_score: 0.88
                  }
                ]
              }
            ]
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should allow omitted optional results fields', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(true);
    });

    it('should reject missing required metadata.request_id', () => {
      const response = {
        metadata: {
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should reject missing required metadata.created', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          language: 'en'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should reject missing required metadata.language', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should reject missing required results field', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should reject invalid data types in metadata', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 123 // should be string
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should enforce additionalProperties: false on metadata', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en',
          unknown_field: 'value'
        },
        results: {}
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });

    it('should enforce additionalProperties: false on sentiment segments', () => {
      const response = {
        metadata: {
          request_id: 'd04af392-db11-4c1d-83e1-20e34f0b8999',
          created: '2024-11-18T23:47:44.674Z',
          language: 'en'
        },
        results: {
          sentiments: {
            segments: [
              {
                text: 'Sample text',
                start_word: 0,
                end_word: 2,
                sentiment: 'positive',
                unknown_field: 'value'
              }
            ]
          }
        }
      };
      const valid = validateResponse(response);
      expect(valid).toBe(false);
    });
  });

  describe('Error Schema', () => {
    it('should validate error response from examples', () => {
      const valid = validateError(responseErrorExample);
      expect(valid).toBe(true);
      expect(validateError.errors).toBeNull();
    });

    it('should validate required error fields', () => {
      const validError = {
        error: {
          type: 'VALIDATION_ERROR',
          code: 'MISSING_TEXT_OR_URL',
          message: 'Request must include either text or url'
        }
      };
      const valid = validateError(validError);
      expect(valid).toBe(true);
    });

    it('should validate all error.code enum values', () => {
      const codes = [
        'INVALID_REQUEST',
        'MISSING_TEXT_OR_URL',
        'TEXT_PROCESSING_FAILED',
        'UNSUPPORTED_LANGUAGE',
        'INVALID_URL',
        'URL_FETCH_FAILED'
      ];
      codes.forEach(code => {
        const validError = {
          error: {
            type: 'ERROR',
            code: code,
            message: 'Error message'
          }
        };
        const valid = validateError(validError);
        expect(valid).toBe(true);
      });
    });

    it('should reject invalid error.code', () => {
      const invalidError = {
        error: {
          type: 'ERROR',
          code: 'INVALID_CODE',
          message: 'Error message'
        }
      };
      const valid = validateError(invalidError);
      expect(valid).toBe(false);
    });

    it('should validate optional details object', () => {
      const validError = {
        error: {
          type: 'VALIDATION_ERROR',
          code: 'INVALID_REQUEST',
          message: 'Invalid request',
          details: {
            field: 'text',
            reason: 'Must be a string'
          }
        }
      };
      const valid = validateError(validError);
      expect(valid).toBe(true);
    });

    it('should allow additionalProperties in details', () => {
      const validError = {
        error: {
          type: 'ERROR',
          code: 'TEXT_PROCESSING_FAILED',
          message: 'Processing failed',
          details: {
            custom_field_1: 'value1',
            custom_field_2: 'value2',
            nested: {
              field: 'value'
            }
          }
        }
      };
      const valid = validateError(validError);
      expect(valid).toBe(true);
    });

    it('should reject missing required error.type', () => {
      const invalidError = {
        error: {
          code: 'INVALID_REQUEST',
          message: 'Error message'
        }
      };
      const valid = validateError(invalidError);
      expect(valid).toBe(false);
    });

    it('should reject missing required error.code', () => {
      const invalidError = {
        error: {
          type: 'ERROR',
          message: 'Error message'
        }
      };
      const valid = validateError(invalidError);
      expect(valid).toBe(false);
    });

    it('should reject missing required error.message', () => {
      const invalidError = {
        error: {
          type: 'ERROR',
          code: 'INVALID_REQUEST'
        }
      };
      const valid = validateError(invalidError);
      expect(valid).toBe(false);
    });

    it('should reject invalid types for error fields', () => {
      const invalidError = {
        error: {
          type: 123, // should be string
          code: 'INVALID_REQUEST',
          message: 'Error message'
        }
      };
      const valid = validateError(invalidError);
      expect(valid).toBe(false);
    });

    it('should enforce additionalProperties: false on error object', () => {
      const invalidError = {
        error: {
          type: 'ERROR',
          code: 'INVALID_REQUEST',
          message: 'Error message',
          unknown_field: 'value'
        }
      };
      const valid = validateError(invalidError);
      expect(valid).toBe(false);
    });
  });
});

