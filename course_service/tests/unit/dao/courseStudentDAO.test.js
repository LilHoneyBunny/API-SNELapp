const { makeConn, mockExecuteRows, mockExecuteResult } = require("../../../../tests/mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
const courseStudentDAO = require("../../../database/dao/courseStudentDAO");

describe("course_service | dao | courseStudentDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("removeStudentFromCourse: devuelve result del DELETE", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteResult(conn, { affectedRows: 1 });

    const result = await courseStudentDAO.removeStudentFromCourse(2, 7);

    expect(result.affectedRows).toBe(1);
    expect(conn.release).toHaveBeenCalled();
  });

  test("getStudentCountInCourse: devuelve studentCount", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{ studentCount: 3 }]);

    const count = await courseStudentDAO.getStudentCountInCourse(2);

    expect(count).toBe(3);
    expect(conn.release).toHaveBeenCalled();
  });

  test("getStudentIdsInCourse: mapea studentUserId[]", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{ studentUserId: 7 }, { studentUserId: 8 }]);

    const ids = await courseStudentDAO.getStudentIdsInCourse(2);

    expect(ids).toEqual([7, 8]);
    expect(conn.release).toHaveBeenCalled();
  });
});
