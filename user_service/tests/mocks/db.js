// user_service/tests/mocks/db.js
// Mock reutilizable para mysql2/promise pool + conexiones

const mockDbConnection = {
  execute: jest.fn(),
  query: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  release: jest.fn(),
};

const mockPool = {
  getConnection: jest.fn().mockResolvedValue(mockDbConnection),

  // Algunos DAOs usan connection.execute directamente (sin getConnection)
  execute: jest.fn(),
  query: jest.fn(),
};

function resetDbMocks() {
  mockDbConnection.execute.mockReset();
  mockDbConnection.query.mockReset();
  mockDbConnection.beginTransaction.mockReset();
  mockDbConnection.commit.mockReset();
  mockDbConnection.rollback.mockReset();
  mockDbConnection.release.mockReset();

  mockPool.getConnection.mockClear();
  mockPool.execute.mockReset();
  mockPool.query.mockReset();
}

module.exports = {
  mockPool,
  mockDbConnection,
  resetDbMocks,
};
