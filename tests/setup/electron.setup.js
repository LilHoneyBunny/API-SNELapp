process.env.NODE_ENV = "test";

// Mock del módulo electron (ver abajo)
jest.mock("electron", () => require("../mocks/electron"));
