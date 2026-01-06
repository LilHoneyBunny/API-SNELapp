// user_service/tests/setup/jest.setup.js

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";

// Evita ruido en consola por logs de imports (p.ej. pool.js suele loguear env)
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
