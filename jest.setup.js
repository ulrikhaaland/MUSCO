// Add any global Jest setup code here, for example:
// import '@testing-library/jest-dom';

// Mock the server-only module (to prevent errors in tests)
jest.mock('server-only', () => ({}));

// Mock window.location if needed for tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    pathname: '/',
    search: '',
    href: 'http://localhost/',
  },
  writable: true,
});

// Suppress console.log/error during tests
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
}; 