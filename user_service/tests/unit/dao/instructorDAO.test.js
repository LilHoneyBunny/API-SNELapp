// user_service/tests/unit/dao/instructorDAO.test.js

const { mockDbConnection, resetDbMocks } = require("../../mocks/db");

jest.mock("../../../database/pool", () => require("../../mocks/db").mockPool);

const instructorDAO = require("../../../database/dao/instructorDAO");

describe("instructorDAO", () => {
  beforeEach(() => {
    resetDbMocks();
    jest.clearAllMocks();
  });

  test("getInstructorById regresa row o null", async () => {
    mockDbConnection.execute.mockResolvedValueOnce([[{ userId: 1, email: "i@test.com" }]]);
    const out = await instructorDAO.getInstructorById(1);
    expect(out).toEqual({ userId: 1, email: "i@test.com" });
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("updateInstructorProfile sin fields => affectedRows 0", async () => {
    const out = await instructorDAO.updateInstructorProfile(1, {});
    expect(out).toEqual({ affectedRows: 0 });
    expect(mockDbConnection.execute).not.toHaveBeenCalled();
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("updateInstructorProfile con titleId/biography ejecuta UPDATE", async () => {
    mockDbConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const out = await instructorDAO.updateInstructorProfile(1, { titleId: 2, biography: "Hola" });
    expect(out).toEqual({ affectedRows: 1 });
    expect(mockDbConnection.execute).toHaveBeenCalledTimes(1);
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("getInstructorId ids vacío => []", async () => {
    const out = await instructorDAO.getInstructorId([]);
    expect(out).toEqual([]);
  });

  test("getInstructorId si falla => fallback Desconocido", async () => {
    mockDbConnection.execute.mockRejectedValueOnce(new Error("DBFAIL"));
    const out = await instructorDAO.getInstructorId([7, 8]);
    expect(out).toEqual([
      { instructorId: 7, name: "Desconocido" },
      { instructorId: 8, name: "Desconocido" },
    ]);
    expect(mockDbConnection.release).toHaveBeenCalled();
  });
});
