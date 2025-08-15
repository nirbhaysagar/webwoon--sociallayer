// Simple test setup without React Native dependencies
console.log('Test setup loaded successfully');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock Alert
global.Alert = {
  alert: jest.fn(),
};

// Mock Share
global.Share = {
  share: jest.fn(),
};

// Basic mocks for common modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    set: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

console.log('Test setup completed with basic mocks');

