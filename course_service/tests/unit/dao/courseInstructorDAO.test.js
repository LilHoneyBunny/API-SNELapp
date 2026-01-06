const { makeConn, mockExecuteRows } = require("../../../../tests/mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
const courseInstructorDAO = require("../../../database/dao/courseInstructorDAO");

describe("course_service | dao | courseInstructorDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getInstructorIdsInCourse: devuelve array de ids", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{ instructorUserId: 99 }]);

    const res = await courseInstructorDAO.getInstructorIdsInCourse(2);

    expect(res).toEqual([99]);
    expect(conn.release).toHaveBeenCalled();
  });

  test("getInstructorIdsInCourse: si falla => devuelve [] (sin ensuciar consola)", async () => {
    // ✅ Silenciar solo este test
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    conn.execute.mockRejectedValueOnce(new Error("DB error"));

    const res = await courseInstructorDAO.getInstructorIdsInCourse(2);

    expect(res).toEqual([]);
    expect(conn.release).toHaveBeenCalled();

    // opcional: validar que sí intentó loguear
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
