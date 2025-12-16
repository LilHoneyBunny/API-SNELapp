const { makeConn, mockExecuteRows, mockExecuteResult } = require("../../../../tests/mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
const courseDAO = require("../../../database/dao/courseDAO");

describe("course_service | dao | courseDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("createCourse: inserta y regresa {success:true, cursoId}", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteResult(conn, { insertId: 77 });

    const res = await courseDAO.createCourse({
      name: "Nuevo",
      description: "Desc",
      category: "Cat",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      instructorUserId: 1,
      state: "Activo"
    });

    expect(res.success).toBe(true);
    expect(res.cursoId).toBe(77);

    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.rollback).not.toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  test("updateCourseDetails: éxito => {found:true, updated:true, previous, current}", async () => {
    // updateCourseDetails abre 1 conn (update) + getCourseById 2 veces (2 conns)
    const connUpdate = makeConn();
    const connGet1 = makeConn();
    const connGet2 = makeConn();

    pool.getConnection
      .mockResolvedValueOnce(connUpdate) // updateCourseDetails
      .mockResolvedValueOnce(connGet1)   // getCourseById (before)
      .mockResolvedValueOnce(connGet2);  // getCourseById (after)

    mockExecuteRows(connGet1, [{
      cursoId: 2,
      name: "Antes",
      description: "A",
      category: "B",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      state: "Activo",
      instructorUserId: 1
    }]);

    mockExecuteResult(connUpdate, { affectedRows: 1 });

    mockExecuteRows(connGet2, [{
      cursoId: 2,
      name: "Después",
      description: "X",
      category: "Y",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      state: "Activo",
      instructorUserId: 1
    }]);

    const res = await courseDAO.updateCourseDetails(2, {
      name: "Después",
      description: "X",
      category: "Y"
    });

    expect(res.found).toBe(true);
    expect(res.updated).toBe(true);
    expect(res.previous).toMatchObject({ cursoId: 2, name: "Antes" });
    expect(res.current).toMatchObject({ cursoId: 2, name: "Después", description: "X", category: "Y" });
    expect(res.affectedRows).toBe(1);

    expect(connUpdate.release).toHaveBeenCalled();
    expect(connGet1.release).toHaveBeenCalled();
    expect(connGet2.release).toHaveBeenCalled();
  });

  test("updateCourseDetails: si no hay cambios => {found:true, updated:false, reason:'no_changes', previous}", async () => {
    // Solo abre: connUpdate + connGet1 (NO abre connGet2 porque retorna antes)
    const connUpdate = makeConn();
    const connGet1 = makeConn();

    pool.getConnection
      .mockResolvedValueOnce(connUpdate)
      .mockResolvedValueOnce(connGet1);

    mockExecuteRows(connGet1, [{
      cursoId: 2,
      name: "Antes",
      description: "A",
      category: "B",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      state: "Activo",
      instructorUserId: 1
    }]);

    const res = await courseDAO.updateCourseDetails(2, {}); // sin cambios

    expect(res).toMatchObject({
      found: true,
      updated: false,
      reason: "no_changes",
      previous: { cursoId: 2, name: "Antes", description: "A", category: "B" }
    });

    expect(connUpdate.execute).not.toHaveBeenCalled(); // no UPDATE
    expect(connUpdate.release).toHaveBeenCalled();
    expect(connGet1.release).toHaveBeenCalled();
  });

  test("joinCourse: si ya está inscrito => {success:false, message:'Student already enrolled'}", async () => {
    // joinCourse abre: connTx + getCourseById abre otra conn
    const connTx = makeConn();
    const connGet = makeConn();

    pool.getConnection
      .mockResolvedValueOnce(connTx) // joinCourse
      .mockResolvedValueOnce(connGet); // getCourseById

    // getCourseById: curso activo
    mockExecuteRows(connGet, [{ cursoId: 2, state: "Activo" }]);

    // joinCourse: existe inscripción
    mockExecuteRows(connTx, [{ exists: 1 }]);

    const res = await courseDAO.joinCourse(7, 2); // ✅ firma real (studentUserId, cursoId)

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/already enrolled/i);

    expect(connTx.beginTransaction).toHaveBeenCalled();
    // ⚠ En tu DAO actual retorna antes sin rollback/commit
    expect(connTx.commit).not.toHaveBeenCalled();
    expect(connTx.rollback).not.toHaveBeenCalled();

    expect(connTx.release).toHaveBeenCalled();
    expect(connGet.release).toHaveBeenCalled();
  });

  test("deleteStudentFromCourse: si NO existe => {found:false, deleted:false, affectedRows:0}", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, []); // no existe relación

    const res = await courseDAO.deleteStudentFromCourse(7, 2); // ✅ firma real (studentUserId, cursoId)

    expect(res).toEqual({ found: false, deleted: false, affectedRows: 0 });
    expect(conn.release).toHaveBeenCalled();
  });

  test("deleteStudentFromCourse: existe pero affectedRows=0 => {found:true, deleted:false, affectedRows:0}", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{ ok: 1 }]);           // existe
    mockExecuteResult(conn, { affectedRows: 0 }); // no borró

    const res = await courseDAO.deleteStudentFromCourse(7, 2);

    expect(res).toEqual({ found: true, deleted: false, affectedRows: 0 });
    expect(conn.release).toHaveBeenCalled();
  });

  test("deleteStudentFromCourse: éxito => {found:true, deleted:true, affectedRows:1}", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{ ok: 1 }]);           // existe
    mockExecuteResult(conn, { affectedRows: 1 }); // borró

    const res = await courseDAO.deleteStudentFromCourse(7, 2);

    expect(res).toEqual({ found: true, deleted: true, affectedRows: 1 });
    expect(conn.release).toHaveBeenCalled();
  });
});
