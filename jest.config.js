/** @type {import('jest').Config} */
module.exports = {
  displayName: "backend",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup/backend.setup.js"],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/tests/**",
    "!**/dist/**",
    "!**/build/**"
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov"]
};
