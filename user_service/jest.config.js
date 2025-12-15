// user_service/jest.config.js
module.exports = {
  displayName: "user_service",
  testEnvironment: "node",
  clearMocks: true,
  restoreMocks: true,

  // Corre SOLO los tests dentro de user_service/tests
  testMatch: ["<rootDir>/tests/**/*.test.js"],

  // Tu setup global (logs, env, etc.)
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.js"],

  // Opcional pero útil: ignora node_modules, coverage, etc.
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // Si usas coverage por proyecto
  collectCoverageFrom: [
    "<rootDir>/database/**/*.js",
    "<rootDir>/controllers/**/*.js",
    "<rootDir>/routes/**/*.js",
    "<rootDir>/utils/**/*.js",
    "!<rootDir>/tests/**",
  ],
};
