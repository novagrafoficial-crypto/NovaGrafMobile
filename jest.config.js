module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/features/**/{services,utils,viewmodels,views,components,providers}/**/*.{ts,tsx}',
    'src/shared/**/*.{ts,tsx}',
    'src/data/**/*.{ts,tsx}',
  ],
  coverageReporters: ['lcov', 'text-summary'],
};
