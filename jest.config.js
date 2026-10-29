module.exports = {
  preset: 'jest-expo',
  collectCoverageFrom: [
    'src/features/**/{services,utils,viewmodels}/**/*.{ts,tsx}',
    'src/shared/utils/**/*.{ts,tsx}',
  ],
  coverageReporters: ['lcov', 'text-summary'],
};