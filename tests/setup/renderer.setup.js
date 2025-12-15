// JSDOM ya te da window/document.
// Asegura cosas típicas del navegador:
global.TextEncoder = global.TextEncoder || require("util").TextEncoder;
global.TextDecoder = global.TextDecoder || require("util").TextDecoder;

// Mock fetch para services del front
global.fetch = jest.fn();

// Helper: limpiar localStorage por test
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});
