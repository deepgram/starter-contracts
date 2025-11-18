# Deepgram Starter Contracts

A comprehensive collection of API contract specifications for Deepgram's services, providing standardized OpenAPI and AsyncAPI specifications, JSON schemas and conformance tests to help build standardized Deepgram Starter Apps.

## Why Use This Library?

This repository serves as the definitive source for:
- **API Contract Specifications**: OpenAPI and AsyncAPI specs for all Deepgram APIs
- **Schema Definitions**: JSON schemas for request/response validation
- **Conformance Testing**: Automated tests to ensure API compliance
- **Developer Documentation**: Clear guides for each API interface

## Getting Started

### Prerequisites

Before getting started, ensure you have the following installed:

- pnpm for dependency management.
- Node Version 18 or higher

```bash
# Node.js (version 18 or higher recommended)
node --version

# pnpm package manager
pnpm --version

# If pnpm is not installed:
npm install -g pnpm
```

### Quick Start

1. Clone the Repo:

```bash
git@github.com:deepgram/starter-contracts.git

cd starter-apps/starter-contracts
```

2. Install dependencies:

```bash
 pnpm i
 ```

## Repository Structure

```
interfaces/
├── agent/              # Agent service specifications
├── live-stt/           # Live Speech-to-Text (WebSocket)
├── live-tts/           # Live Text-to-Speech (WebSocket)
├── stt/                # Speech-to-Text (REST API)
├── text-intelligence/  # Text Intelligence services
└── tts/                # Text-to-Speech services
```

Each interface directory contains:
- `asyncapi.yml` or `openapi.yml` - API specification
- `schema/` - JSON schema definitions
- `conformance/` - Conformance tests and documentation
- `README.md` - Interface-specific documentation

## Testing Starter Apps

### Overview

This repository includes comprehensive conformance tests for validating that your starter applications correctly implement Deepgram API interfaces. Tests ensure your apps work consistently across the ecosystem.

### Available Test Suites

These are integration tests that require a running starter application implementing the interface you want to test.

Refer to individual READMEs for detailed setup instructions:

**REST**
- [STT](./interfaces/stt/README.md)
- [Text-intelligence](./interfaces/text-intelligence/README.md)
- [TTS](./interfaces/tts/README.md)

**Websockets**
- [STT Live](./interfaces/live-stt/README.md)
- [TTS Live](./interfaces/live-tts/README.md)
- [Flux](./interfaces/flux/README.md)
- [Agent](./interfaces/agent/README.md)


### Adding New Interface Specifications

1. Create a new directory under `interfaces/`
2. Follow the established structure:
3. Add conformance tests
4. Update this main README

### Modifying Existing Specifications

1. Update the relevant specification files
2. Update corresponding schemas and examples
3. Run conformance tests to ensure compatibility
4. Update documentation as needed

## Getting Help

* Report an [issue or bug](https://github.com/deepgram/starter-contracts/issues)

## 📄 License

This project is licensed under the [LICENSE](./LICENSE) file in the repository root.