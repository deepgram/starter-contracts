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

> Additional parameters are available in the Deepgram API. See the [API documentation](https://developers.deepgram.com/reference/text-intelligence/analyze) for additional features.

All parameters are optional. This interface focuses on getting started functionality:

- `language`: BCP-47 language code for the text (e.g., `en`, `es`, `fr`)
- `sentiment`: Enable sentiment analysis throughout the text
- `summarize`: Enable text summarization
- `topics`: Enable topic detection throughout the text
- `intents`: Enable intent recognition throughout the text
- `tag`: Tag for categorizing requests

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

## Conformance Requirements

Starter applications implementing this interface MUST:

1. **Accept JSON requests** with either `text` or `url` (but not both)
2. **Support at least one intelligence feature** (summarize, sentiment, topics, or intents)
3. **Return structured JSON** with `metadata` and `results` sections
4. **Follow error schema** exactly as defined in `error.json`
5. **Handle invalid requests** with appropriate error codes

## Testing Your Starter App Implementation

### Prerequisites

1. **Your starter app must be running** and accessible via HTTP/HTTPS
2. **Implement the `/text-intelligence/analyze` endpoint** according to this specification
3. **Install test dependencies** in this contracts repo:
   ```bash
   cd starter-contracts
   npm install
   ```

### Running Tests

#### Schema Validation (No backend required)
```bash
npm run test:text-intelligence:schema
```

#### Conformance Tests (Requires backend)
```bash
# Start your starter app
cd my-text-intelligence-app
npm run dev

# In another terminal, run conformance tests
cd starter-contracts
BASE_URL=http://localhost:3000 npm run test:text-intelligence
```