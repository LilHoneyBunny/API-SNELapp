process.env.NODE_ENV = "test";

// Si algún módulo usa .env al cargar, mejor definir aquí defaults mínimos:
process.env.USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || "http://mock-users";
process.env.COURSES_SERVICE_URL = process.env.COURSES_SERVICE_URL || "http://mock-courses";

// Evitar ruido de consola en tests (puedes afinarlo luego)
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
