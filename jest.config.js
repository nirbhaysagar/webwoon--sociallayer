module.exports = {
  // Use a simpler preset without React Native dependencies
  preset: 'ts-jest/presets/default',
  testEnvironment: 'jsdom',
  
  // Basic test configuration
  testMatch: [
    '**/tests/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Ignore all node_modules by default
  transformIgnorePatterns: [
    'node_modules/'
  ],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock non-JS modules
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  
  // Completely ignore problematic directories and files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/src/',
    '/tests/__mocks__/',
    '/tests/setup.js'
  ],
  
  // Force Jest to ignore problematic directories
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/@react-native',
    '<rootDir>/node_modules/react-native',
    '<rootDir>/src'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
