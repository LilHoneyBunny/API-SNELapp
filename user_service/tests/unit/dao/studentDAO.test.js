// user_service/tests/unit/dao/studentDAO.test.js

const { mockDbConnection, resetDbMocks } = require("../../mocks/db");

jest.mock("../../../database/pool", () => require("../../mocks/db").mockPool);

const studentDAO = require("../../../database/dao/studentDAO");

describe("studentDAO", () => {
  beforeEach(() => {
    resetDbMocks();
    jest.clearAllMocks();
  });

  test("getStudentById regresa row o null", async () => {
    mockDbConnection.execute.mockResolvedValueOnce([[{ userId: 1, email: "a@test.com" }]]);
    const out = await studentDAO.getStudentById(1);
    expect(out).toEqual({ userId: 1, email: "a@test.com" });
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("updateStudentProfile si no hay fields => affectedRows 0", async () => {
    const out = await studentDAO.updateStudentProfile(1, {});
    expect(out).toEqual({ affectedRows: 0 });
    expect(mockDbConnection.execute).not.toHaveBeenCalled();
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("updateStudentProfile con levelId ejecuta UPDATE", async () => {
    mockDbConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const out = await studentDAO.updateStudentProfile(1, { levelId: 3 });
    expect(out).toEqual({ affectedRows: 1 });
    expect(mockDbConnection.execute).toHaveBeenCalledTimes(1);
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("updateStudentAverage ejecuta UPDATE", async () => {
    mockDbConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const out = await studentDAO.updateStudentAverage(1, 9.2);
    expect(out).toEqual({ affectedRows: 1 });
    expect(mockDbConnection.execute).toHaveBeenCalledTimes(1);
    expect(mockDbConnection.release).toHaveBeenCalled();
  });

  test("getStudentReportInfoDAO lanza DATABASE_ERROR si falla", async () => {
    mockDbConnection.execute.mockRejectedValueOnce(new Error("DB"));
    await expect(studentDAO.getStudentReportInfoDAO(1)).rejects.toThrow("DATABASE_ERROR");
    expect(mockDbConnection.release).toHaveBeenCalled();
  });
});
