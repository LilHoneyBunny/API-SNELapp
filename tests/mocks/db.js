// tests/mocks/db.js
function makeConn() {
  return {
    execute: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    release: jest.fn()
  };
}

function mockExecuteRows(conn, rows) {
  // mysql2 => execute() devuelve [rows, fields]
  conn.execute.mockResolvedValueOnce([rows, []]);
}

function mockExecuteResult(conn, result) {
  // mysql2 => execute() devuelve [result, fields]
  conn.execute.mockResolvedValueOnce([result, []]);
}

module.exports = { makeConn, mockExecuteRows, mockExecuteResult };
