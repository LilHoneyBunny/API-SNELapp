const { makeConn, mockExecuteRows } = require("../../mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));
const pool = require("../../../database/pool");

const mockAxiosGet = jest.fn();
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: mockAxiosGet
  }))
}));

const reportDAO = require("../../../database/dao/reportDAO");

describe("quiz_service | dao | reportDAO", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.USERS_SERVICE_URL = "http://users-service";
    process.env.COURSES_SERVICE_URL = "http://courses-service";
  });

  test("fetchStudentInfo: éxito => regresa res.data", async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { studentId: 7, name: "Lilly" } });

    const res = await reportDAO.fetchStudentInfo(7);

    expect(res).toEqual({ studentId: 7, name: "Lilly" });
    expect(mockAxiosGet).toHaveBeenCalledWith("http://users-service/students/report-info/7");
  });

  test("fetchCourseInfo: error => lanza COURSE_SERVICE_ERROR:<status> (sin ensuciar consola)", async () => {
    const spyErr = jest.spyOn(console, "error").mockImplementation(() => {});
    const spyLog = jest.spyOn(console, "log").mockImplementation(() => {});

    mockAxiosGet.mockRejectedValueOnce({ response: { status: 502 } });

    await expect(reportDAO.fetchCourseInfo(10))
      .rejects
      .toThrow(/COURSE_SERVICE_ERROR:502/);

    expect(mockAxiosGet).toHaveBeenCalledWith("http://courses-service/instructor/10/instructor");

    spyErr.mockRestore();
    spyLog.mockRestore();
  });

  test("fetchQuizzesByCourse: regresa rows", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{ quizId: 1, title: "Quiz", weighing: 10, status: "Activo" }]);

    const rows = await reportDAO.fetchQuizzesByCourse(99);

    expect(rows).toEqual([{ quizId: 1, title: "Quiz", weighing: 10, status: "Activo" }]);
    expect(conn.release).toHaveBeenCalled();
  });

  test("fetchStudentQuizResults: si no hay quizzes => []", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, []);

    const res = await reportDAO.fetchStudentQuizResults(10, 7);

    expect(res).toEqual([]);
    expect(conn.release).toHaveBeenCalled();
  });

  test("fetchStudentQuizResults: con scoreRow + questions => estructura completa", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    mockExecuteRows(conn, [{
      quizId: 5,
      title: "Quiz 5",
      weighing: 10,
      creationDate: "2025-01-01"
    }]);

    mockExecuteRows(conn, [{ score: 8, attemptNumber: 2, createdAt: "2025-01-02" }]);

    mockExecuteRows(conn, [
      {
        questionId: 1,
        questionText: "Q1",
        points: 5,
        optionId: 10,
        optionText: "A",
        isCorrect: 1,
        selectedOptionId: 10,
        earnedPoints: 5
      },
      {
        questionId: 1,
        questionText: "Q1",
        points: 5,
        optionId: 11,
        optionText: "B",
        isCorrect: 0,
        selectedOptionId: 10,
        earnedPoints: 5
      }
    ]);

    const res = await reportDAO.fetchStudentQuizResults(10, 7);

    expect(res).toHaveLength(1);
    expect(res[0].quizId).toBe(5);
    expect(res[0].scoreObtained).toBe(8);
    expect(res[0].attemptNumber).toBe(2);
    expect(res[0].questions).toHaveLength(1);
    expect(res[0].questions[0].options).toHaveLength(2);

    expect(conn.release).toHaveBeenCalled();
  });
});
