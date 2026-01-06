// quiz_service/tests/mocks/db.js

const makeConn = () => ({
  execute: jest.fn(),
  beginTransaction: jest.fn().mockResolvedValue(undefined),
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
  release: jest.fn()
});

/**
 * Mock para consultas tipo SELECT (mysql2/promise devuelve [rows, fields])
 */
const mockExecuteRows = (conn, rows) => {
  conn.execute.mockResolvedValueOnce([rows, []]);
};

/**
 * Mock para INSERT/UPDATE/DELETE (mysql2/promise devuelve [result, fields])
 */
const mockExecuteResult = (conn, result) => {
  conn.execute.mockResolvedValueOnce([result, []]);
};

module.exports = { makeConn, mockExecuteRows, mockExecuteResult };
