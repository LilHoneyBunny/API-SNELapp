const { makeConn, mockExecuteRows } = require("../../mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
const scoreDAO = require("../../../database/dao/scoreDAO");

describe("quiz_service | dao | scoreDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getStudentScoresInCourse: si no existe estudiante/curso => throw (sin ensuciar consola)", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, []); // studentRows vacío => throw

    await expect(scoreDAO.getStudentScoresInCourse(10, 200))
      .rejects
      .toThrow(/not found/i);

    expect(conn.release).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test("getStudentScoresInCourse: éxito => {studentInfo, quizzes}", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{
      userName: "Ana",
      paternalSurname: "Lopez",
      maternalSurname: "Diaz",
      studentAverage: 8.5,
      courseName: "Matemáticas",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      instructorName: "Profe",
      instructorEmail: "profe@mail.com"
    }]);

    mockExecuteRows(conn, [
      { quizId: 1, quizTitle: "Quiz 1", score: 9, attemptNumber: 2 },
      { quizId: 2, quizTitle: "Quiz 2", score: 8, attemptNumber: 1 }
    ]);

    const res = await scoreDAO.getStudentScoresInCourse(10, 200);

    expect(res.studentInfo.userName).toBe("Ana");
    expect(res.quizzes).toHaveLength(2);
    expect(conn.release).toHaveBeenCalled();
  });
});
