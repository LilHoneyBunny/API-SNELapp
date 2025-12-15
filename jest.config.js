/** @type {import('jest').Config} */
module.exports = {
  // Opcional pero recomendado
  clearMocks: true,
  testEnvironment: "node",

  // Si tienes algún setup global compartido, déjalo aquí.
  // En tu repo existe tests/setup/backend.setup.js
  setupFilesAfterEnv: ["<rootDir>/tests/setup/backend.setup.js"],

  // Ignorar node_modules siempre
  testPathIgnorePatterns: ["/node_modules/"],

  projects: [
    {
      displayName: "course_service",
      testMatch: ["<rootDir>/course_service/tests/**/*.test.js"],
    },
    {
      displayName: "quiz_service",
      testMatch: ["<rootDir>/quiz_service/tests/**/*.test.js"],
    },
    {
      displayName: "user_service",
      testMatch: ["<rootDir>/user_service/tests/**/*.test.js"],
    },
  ],
};
