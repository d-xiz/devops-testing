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
};
