module.exports = {
  displayName: "course_service",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/../tests/setup/backend.setup.js"],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true
};
