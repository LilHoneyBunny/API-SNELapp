const { makeConn, mockExecuteRows, mockExecuteResult } = require("../../../../tests/mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
// ✅ FIX: el DAO real está en database/dao
const contentFileDAO = require("../../../database/dao/contentFileDAO");

describe("course_service | dao | contentFileDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getFilesByContent: si no hay files => NOT_FOUND", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, []);

    const res = await contentFileDAO.getFilesByContent(5);

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/no files found/i);
    expect(conn.release).toHaveBeenCalled();
  });

  test("deleteFile: affectedRows=1 => OK", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteResult(conn, { affectedRows: 1 });

    const res = await contentFileDAO.deleteFile(1);

    expect(res.success).toBe(true);
    expect(conn.release).toHaveBeenCalled();
  });
});
