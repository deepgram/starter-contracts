# Text Intelligence API Interface

## Overview

The Text Intelligence API analyzes text content to extract intelligence including summarization, sentiment analysis, topic detection, and intent recognition.

## Endpoint

```
POST /text-intelligence/analyze
```

## Features

The API supports multiple optional intelligence features that can be enabled via query parameters:

- **Summarization** (`summarize=true`): Generate a concise summary of the text
- **Sentiment Analysis** (`sentiment=true`): Detect positive, negative, or neutral sentiment in text segments
- **Topic Detection** (`topics=true`): Identify and extract topics from the text
- **Intent Recognition** (`intents=true`): Recognize speaker intents throughout the text

## Request Format

The API accepts two types of requests:

### Text-based Request
```json
{
  "text": "Your text content here..."
}
```

### URL-based Request
```json
{
  "url": "https://example.com/article.txt"
}
```

**Note:** Requests must contain either `text` or `url`, but not both.

## Query Parameters

| Parameter         | Type            | Default | Description                                |
|-------------------|-----------------|---------|--------------------------------------------|
| `sentiment`       | boolean         | `false` | Enable sentiment analysis                  |
| `summarize`       | boolean         | `false` | Enable text summarization                  |
| `topics`          | boolean         | `false` | Enable topic detection                     |
| `intents`         | boolean         | `false` | Enable intent recognition                  |
| `custom_topic`    | string or array | -       | Custom topics to detect (up to 100)        |
| `custom_intent`   | string or array | -       | Custom intents to detect (up to 100)       |
| `callback`        | string (uri)    | -       | Webhook callback URL                       |
| `callback_method` | string          | `POST`  | HTTP method for callback (`POST` or `PUT`) |

## Response Format

### Success Response (200)

```json
{
  "metadata": {
    "request_id": "uuid",
    "created": "2024-11-18T23:47:44.674Z",
    "language": "en",
    "summary_info": {
      "model_uuid": "uuid",
      "input_tokens": 150,
      "output_tokens": 45
    },
    "sentiment_info": { ... },
    "topics_info": { ... },
    "intents_info": { ... }
  },
  "results": {
    "summary": {
      "text": "Summary of the analyzed text..."
    },
    "sentiments": {
      "segments": [
        {
          "text": "Text segment",
          "start_word": 0,
          "end_word": 10,
          "sentiment": "positive"
        }
      ]
    },
    "topics": {
      "segments": [
        {
          "text": "Text segment",
          "topics": [
            {
              "topic": "Technology",
              "confidence_score": 0.95
            }
          ]
        }
      ]
    },
    "intents": {
      "segments": [
        {
          "text": "Text segment",
          "intents": [
            {
              "intent": "Inform",
              "confidence_score": 0.88
            }
          ]
        }
      ]
    }
  }
}
```

### Error Response (400)

```json
{
  "error": {
    "type": "VALIDATION_ERROR",
    "code": "MISSING_TEXT_OR_URL",
    "message": "Request must include either 'text' or 'url' field",
    "details": {
      "additional": "context"
    }
  }
}
```

## Error Codes

| Code                     | Description                      |
|--------------------------|----------------------------------|
| `INVALID_REQUEST`        | Request is malformed or invalid  |
| `MISSING_TEXT_OR_URL`    | Neither text nor url provided    |
| `TEXT_PROCESSING_FAILED` | Failed to process the text       |
| `UNSUPPORTED_LANGUAGE`   | Language not supported           |
| `INVALID_URL`            | URL format is invalid            |
| `URL_FETCH_FAILED`       | Failed to fetch content from URL |

## Testing

### Schema Validation Tests

Run schema validation tests to verify all schemas are correct:

```bash
npm run test:text-intelligence:schema
```


### Conformance Tests

Run conformance tests against a backend implementation:

```bash
BASE_URL=http://localhost:3000 npm run test:text-intelligence
```

## Integration with Starter Apps

To validate a starter app against this contract:

1. Implement the `/text-intelligence/analyze` endpoint following the OpenAPI specification
2. Add runtime schema validation using Ajv (see STT/TTS examples)
3. Run conformance tests against your implementation
4. Create a CONFORMANCE.md documenting any findings