import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Ajv with strict mode and format validation
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  verbose: true
});
addFormats(ajv);

// Load schemas
const transcriptSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/transcript.json'), 'utf-8')
);
const errorSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/error.json'), 'utf-8')
);

// Load example responses
const validResponse = JSON.parse(
  readFileSync(join(__dirname, '../examples/response.ok.json'), 'utf-8')
);
const errorResponse = JSON.parse(
  readFileSync(join(__dirname, '../examples/response.error.json'), 'utf-8')
);

describe('STT Schema Validation', () => {

  describe('Transcript Schema', () => {

    it('should validate the valid response example', () => {
      const validate = ajv.compile(transcriptSchema);
      const isValid = validate(validResponse);

      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }

      expect(isValid).toBe(true);
    });

    it('should require transcript field', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        words: [],
        duration: 10
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'required',
            params: expect.objectContaining({
              missingProperty: 'transcript'
            })
          })
        ])
      );
    });

    it('should validate transcript is a string', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: 123 // Should be string
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'type',
            params: expect.objectContaining({
              type: 'string'
            })
          })
        ])
      );
    });

    it('should validate words array structure', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: "test",
        words: [
          {
            text: "test"
            // Missing required 'start' and 'end'
          }
        ]
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors?.length).toBeGreaterThan(0);
    });

    it('should validate word timing fields are numbers', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: "test",
        words: [
          {
            text: "test",
            start: "0.5", // Should be number
            end: 1.0
          }
        ]
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'type',
            params: expect.objectContaining({
              type: 'number'
            })
          })
        ])
      );
    });

    it('should validate duration is a number', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: "test",
        duration: "25.93" // Should be number
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
    });

    it('should allow optional fields (words, duration, metadata)', () => {
      const validate = ajv.compile(transcriptSchema);
      const minimalValid = {
        transcript: "Just the transcript text"
      };

      const isValid = validate(minimalValid);

      expect(isValid).toBe(true);
    });

    it('should reject additional unknown properties', () => {
      const validate = ajv.compile(transcriptSchema);
      const dataWithExtra = {
        transcript: "test",
        unknownField: "should fail"
      };

      const isValid = validate(dataWithExtra);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'additionalProperties'
          })
        ])
      );
    });

    it('should accept optional speaker field in words', () => {
      const validate = ajv.compile(transcriptSchema);
      const dataWithSpeaker = {
        transcript: "test",
        words: [
          {
            text: "test",
            start: 0.0,
            end: 1.0,
            speaker: "A"
          }
        ]
      };

      const isValid = validate(dataWithSpeaker);

      expect(isValid).toBe(true);
    });

    it('should validate speaker is a string when provided', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: "test",
        words: [
          {
            text: "test",
            start: 0.0,
            end: 1.0,
            speaker: 123 // Should be string
          }
        ]
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'type',
            params: expect.objectContaining({
              type: 'string'
            })
          })
        ])
      );
    });

    it('should reject additional properties in word objects', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: "test",
        words: [
          {
            text: "test",
            start: 0.0,
            end: 1.0,
            extraField: "should fail"
          }
        ]
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'additionalProperties'
          })
        ])
      );
    });

    it('should allow arbitrary properties in metadata object', () => {
      const validate = ajv.compile(transcriptSchema);
      const dataWithMetadata = {
        transcript: "test",
        metadata: {
          model: "nova-2",
          language: "en-US",
          custom_field: "allowed",
          another_field: 123,
          nested: {
            also: "allowed"
          }
        }
      };

      const isValid = validate(dataWithMetadata);

      expect(isValid).toBe(true);
    });

    it('should validate metadata is an object when provided', () => {
      const validate = ajv.compile(transcriptSchema);
      const invalidData = {
        transcript: "test",
        metadata: "should be object" // Should be object
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'type',
            params: expect.objectContaining({
              type: 'object'
            })
          })
        ])
      );
    });

    it('should handle empty words array', () => {
      const validate = ajv.compile(transcriptSchema);
      const dataWithEmptyWords = {
        transcript: "test",
        words: []
      };

      const isValid = validate(dataWithEmptyWords);

      expect(isValid).toBe(true);
    });

    it('should handle empty transcript string', () => {
      const validate = ajv.compile(transcriptSchema);
      const dataWithEmptyTranscript = {
        transcript: ""
      };

      const isValid = validate(dataWithEmptyTranscript);

      expect(isValid).toBe(true);
    });

  });

  describe('Error Schema', () => {

    it('should validate the error response example', () => {
      const validate = ajv.compile(errorSchema);
      const isValid = validate(errorResponse);

      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }

      expect(isValid).toBe(true);
    });

    it('should require error field', () => {
      const validate = ajv.compile(errorSchema);
      const invalidData = {};

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'required',
            params: expect.objectContaining({
              missingProperty: 'error'
            })
          })
        ])
      );
    });

    it('should require type, code, and message in error object', () => {
      const validate = ajv.compile(errorSchema);
      const invalidData = {
        error: {
          type: "validation_error"
          // Missing 'code' and 'message'
        }
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors?.length).toBeGreaterThan(0);
    });

    it('should validate error code is from allowed enum values', () => {
      const validate = ajv.compile(errorSchema);
      const invalidData = {
        error: {
          type: "validation_error",
          code: "INVALID_CODE", // Not in enum
          message: "Test error"
        }
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'enum'
          })
        ])
      );
    });

    it('should accept all valid error codes', () => {
      const validate = ajv.compile(errorSchema);
      const validCodes = [
        'UNSUPPORTED_MEDIA_TYPE',
        'AUDIO_TOO_LONG',
        'BAD_AUDIO',
        'MODEL_NOT_FOUND'
      ];

      validCodes.forEach(code => {
        const data = {
          error: {
            type: "error",
            code: code,
            message: "Test message"
          }
        };

        const isValid = validate(data);
        expect(isValid).toBe(true);
      });
    });

    it('should allow optional details field', () => {
      const validate = ajv.compile(errorSchema);
      const minimalError = {
        error: {
          type: "validation_error",
          code: "BAD_AUDIO",
          message: "Invalid audio format"
        }
      };

      const isValid = validate(minimalError);

      expect(isValid).toBe(true);
    });

    it('should reject additional unknown properties in error', () => {
      const validate = ajv.compile(errorSchema);
      const dataWithExtra = {
        error: {
          type: "error",
          code: "BAD_AUDIO",
          message: "Test",
          extraField: "should fail"
        }
      };

      const isValid = validate(dataWithExtra);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'additionalProperties'
          })
        ])
      );
    });

    it('should allow arbitrary properties in details object', () => {
      const validate = ajv.compile(errorSchema);
      const dataWithDetails = {
        error: {
          type: "validation_error",
          code: "UNSUPPORTED_MEDIA_TYPE",
          message: "Invalid format",
          details: {
            received_content_type: "application/json",
            supported_content_types: ["audio/wav", "audio/mpeg"],
            request_id: "req_123",
            custom_field: "allowed",
            another_field: 456,
            nested: {
              also: "allowed"
            }
          }
        }
      };

      const isValid = validate(dataWithDetails);

      expect(isValid).toBe(true);
    });

    it('should validate details is an object when provided', () => {
      const validate = ajv.compile(errorSchema);
      const invalidData = {
        error: {
          type: "error",
          code: "BAD_AUDIO",
          message: "Test",
          details: "should be object" // Should be object
        }
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'type',
            params: expect.objectContaining({
              type: 'object'
            })
          })
        ])
      );
    });

    it('should validate all required error fields are strings', () => {
      const validate = ajv.compile(errorSchema);
      const invalidData = {
        error: {
          type: 123, // Should be string
          code: "BAD_AUDIO",
          message: "Test"
        }
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'type'
          })
        ])
      );
    });

  });

});

