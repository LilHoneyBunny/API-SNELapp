// quiz_service/tests/setup/jest.setup.js

// Variables mínimas para DAOs que construyen URLs con env
process.env.USERS_SERVICE_URL ||= "http://users-service";
process.env.COURSES_SERVICE_URL ||= "http://courses-service";

// Evita ruido en consola durante pruebas (puedes comentar si quieres ver logs)
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.warn.mockRestore();
  console.error.mockRestore();
});
