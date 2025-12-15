const { makeConn, mockExecuteRows, mockExecuteResult } = require("../../../../tests/mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
const contentDAO = require("../../../database/dao/contentDAO");

describe("course_service | dao | contentDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getContentsByCourse: si no hay => []", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, []);

    const rows = await contentDAO.getContentsByCourse(2);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toEqual([]);
    expect(conn.release).toHaveBeenCalled();
  });

  test("deleteContentById: affectedRows=0", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteResult(conn, { affectedRows: 0 });

    const result = await contentDAO.deleteContentById(999);

    expect(result.affectedRows).toBe(0);
    expect(conn.release).toHaveBeenCalled();
  });

  test("createContent: devuelve {success:true, contentId}", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteResult(conn, { insertId: 123 });

    const res = await contentDAO.createContent({
      title: "T",
      type: "video",
      descripcion: "D",
      cursoId: 2
    });

    expect(res.success).toBe(true);
    expect(res.contentId).toBe(123);

    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.rollback).not.toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  test("updateContentDetails: sin fields => throw (sin ensuciar consola)", async () => {
    // ✅ Silenciar solo este test
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    await expect(contentDAO.updateContentDetails(10, {}))
      .rejects
      .toThrow(/no fields to update/i);

    expect(conn.release).toHaveBeenCalled();

    // opcional: validar que sí logueó el error
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
