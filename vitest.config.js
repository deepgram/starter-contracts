import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.conformance.js', '**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    env: {
      // Allow environment variables to be passed through
      BASE_URL: process.env.BASE_URL,
      WS_BASE_URL: process.env.WS_BASE_URL,
      AUTH_TOKEN: process.env.AUTH_TOKEN,
    },
  },
});

