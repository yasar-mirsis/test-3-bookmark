import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Clean up after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Stop server after all tests
afterAll(() => server.close());

// Extend expect with jest-dom matchers
expect.extend({
  toBeInTheDocument: (element) => ({
    pass: !!element,
    message: () => `Expected element ${element ? 'not' : ''} to be in the document`,
  }),
});
