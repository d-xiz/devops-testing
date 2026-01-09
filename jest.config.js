module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'utils/DanishUtil.js',
    'index.js',
  ],
  coverageDirectory: 'coverage/backend',
  coverageReporters: ['text', 'html'],
   coverageThreshold: {
    global: {
      branches: 90,    // minimum 90% of conditional branches covered
      functions: 90,   // minimum 90% of functions covered
      lines: 90,       // minimum 90% of lines covered
      statements: 90,  // minimum 90% of statements covered
    },
  },
};


