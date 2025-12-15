const handlers = new Map();

const ipcMain = {
  handle: jest.fn((channel, fn) => {
    handlers.set(channel, fn);
  }),
  // helper para tests: invocar handlers registrados
  __invoke: async (channel, ...args) => {
    const fn = handlers.get(channel);
    if (!fn) throw new Error(`No handler registered for ${channel}`);
    return fn({}, ...args);
  }
};

const ipcRenderer = {
  invoke: jest.fn(),
  send: jest.fn()
};

const contextBridge = {
  exposeInMainWorld: jest.fn()
};

const BrowserWindow = jest.fn().mockImplementation(() => ({
  loadFile: jest.fn(),
  webContents: { send: jest.fn() }
}));

const app = {
  on: jest.fn(),
  quit: jest.fn()
};

module.exports = { ipcMain, ipcRenderer, contextBridge, BrowserWindow, app };
