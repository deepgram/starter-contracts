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
const requestSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/request.json'), 'utf-8')
);
const errorSchema = JSON.parse(
  readFileSync(join(__dirname, '../schema/error.json'), 'utf-8')
);

// Load example error response
const errorResponse = JSON.parse(
  readFileSync(join(__dirname, '../examples/response.error.json'), 'utf-8')
);

describe('TTS Schema Validation', () => {

  describe('Request Schema', () => {

    it('should validate a valid request with text', () => {
      const validate = ajv.compile(requestSchema);
      const validRequest = {
        text: "Hello world, this is a test."
      };

      const isValid = validate(validRequest);

      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }

      expect(isValid).toBe(true);
    });

    it('should require text field', () => {
      const validate = ajv.compile(requestSchema);
      const invalidData = {};

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'required',
            params: expect.objectContaining({
              missingProperty: 'text'
            })
          })
        ])
      );
    });

    it('should validate text is a string', () => {
      const validate = ajv.compile(requestSchema);
      const invalidData = {
        text: 123 // Should be string
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

    it('should reject empty text string', () => {
      const validate = ajv.compile(requestSchema);
      const invalidData = {
        text: ""
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'minLength'
          })
        ])
      );
    });

    it('should reject text exceeding maxLength', () => {
      const validate = ajv.compile(requestSchema);
      const invalidData = {
        text: "A".repeat(2001) // Exceeds maxLength of 2000
      };

      const isValid = validate(invalidData);

      expect(isValid).toBe(false);
      expect(validate.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            keyword: 'maxLength'
          })
        ])
      );
    });

    it('should allow text at maximum length', () => {
      const validate = ajv.compile(requestSchema);
      const validData = {
        text: "A".repeat(2000) // Exactly at maxLength
      };

      const isValid = validate(validData);

      expect(isValid).toBe(true);
    });

    it('should reject additional unknown properties', () => {
      const validate = ajv.compile(requestSchema);
      const dataWithExtra = {
        text: "test",
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

    it('should handle special characters in text', () => {
      const validate = ajv.compile(requestSchema);
      const validData = {
        text: "Hello! How are you? I'm doing great. 你好 🎉"
      };

      const isValid = validate(validData);

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
        'INVALID_REQUEST_BODY',
        'TEXT_TOO_LONG',
        'UNSUPPORTED_MODEL',
        'UNSUPPORTED_CONTAINER',
        'UNSUPPORTED_ENCODING',
        'TEXT_PROCESSING_FAILED'
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
          code: "TEXT_TOO_LONG",
          message: "Text exceeds maximum length"
        }
      };

      const isValid = validate(minimalError);

      expect(isValid).toBe(true);
    });

    it('should allow arbitrary properties in details object', () => {
      const validate = ajv.compile(errorSchema);
      const dataWithDetails = {
        error: {
          type: "validation_error",
          code: "UNSUPPORTED_MODEL",
          message: "Model not available",
          details: {
            requested_model: "invalid-model",
            available_models: ["model1", "model2"],
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
          code: "TEXT_TOO_LONG",
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
          code: "TEXT_TOO_LONG",
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

    it('should reject additional unknown properties in error', () => {
      const validate = ajv.compile(errorSchema);
      const dataWithExtra = {
        error: {
          type: "error",
          code: "TEXT_TOO_LONG",
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

  });

});

