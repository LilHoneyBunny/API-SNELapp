// quiz_service/tests/unit/controller/quizController.test.js
const { makeRes } = require("../utils/mockRes");

jest.mock("../../../utils/enums", () => ({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

jest.mock("../../../service/userService", () => ({
  getStudentNames: jest.fn()
}));

jest.mock("../../../database/dao/quizDAO", () => ({
  createQuiz: jest.fn(),
  getQuizForUpdate: jest.fn(),
  updateQuiz: jest.fn(),
  deleteQuiz: jest.fn(),
  getAllQuiz: jest.fn(),
  getQuizByTitle: jest.fn(),
  getQuizByDateCreation: jest.fn(),
  getQuizById: jest.fn(),
  submitQuizAnswers: jest.fn(),
  getQuizResult: jest.fn(),
  getQuizResponsesList: jest.fn(),
  getQuizForStudent: jest.fn(),
  getStudentsAttempts: jest.fn()
}));

const jwt = require("jsonwebtoken");
const { getStudentNames } = require("../../../service/userService");
const quizDAO = require("../../../database/dao/quizDAO");
const quizController = require("../../../controller/quizController");

describe("quiz_service | controller | quizController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("createQuestionnaire", () => {
    test("si faltan campos => 400", async () => {
      const req = { body: { description: "x", cursoId: 1, questions: [] } };
      const res = makeRes();

      await quizController.createQuestionnaire(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: true,
          statusCode: 400
        })
      );
      expect(quizDAO.createQuiz).not.toHaveBeenCalled();
    });

    test("success => 201 con quizId y totalWeighing", async () => {
      quizDAO.createQuiz.mockResolvedValueOnce({ success: true, quizId: 10, totalWeighing: 5 });

      const req = {
        body: {
          title: "Quiz 1",
          description: "Desc",
          cursoId: 2,
          status: "Activo",
          questions: [{ text: "Q1", points: 5, options: [{ text: "A", isCorrect: true }] }]
        }
      };
      const res = makeRes();

      await quizController.createQuestionnaire(req, res);

      expect(quizDAO.createQuiz).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          quizId: 10,
          totalWeighing: 5
        })
      );
    });
  });

  describe("getQuizForUpdateController", () => {
    test("sin quizId => 400", async () => {
      const req = { params: {} };
      const res = makeRes();

      await quizController.getQuizForUpdateController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: true, statusCode: 400 })
      );
    });

    test("quiz no encontrado => 404", async () => {
      quizDAO.getQuizForUpdate.mockResolvedValueOnce(null);

      const req = { params: { quizId: 99 } };
      const res = makeRes();

      await quizController.getQuizForUpdateController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: true, statusCode: 404 })
      );
    });

    test("success => 200", async () => {
      quizDAO.getQuizForUpdate.mockResolvedValueOnce({ quizId: 1, title: "Edit" });

      const req = { params: { quizId: 1 } };
      const res = makeRes();

      await quizController.getQuizForUpdateController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, result: { quizId: 1, title: "Edit" } })
      );
    });
  });

  describe("getQuizDetailForUser", () => {
    test("sin Authorization header => 401", async () => {
      const req = { params: { quizId: 1 }, headers: {} };
      const res = makeRes();

      await quizController.getQuizDetailForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("si role=student => elimina isCorrect de options", async () => {
      jwt.verify.mockReturnValueOnce({ role: "student" });

      quizDAO.getQuizById.mockResolvedValueOnce({
        quizId: 1,
        questions: [
          { options: [{ optionId: 1, optionText: "A", isCorrect: true }] }
        ]
      });

      const req = {
        params: { quizId: 1 },
        headers: { authorization: "Bearer token" }
      };
      const res = makeRes();

      await quizController.getQuizDetailForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.questions[0].options[0].isCorrect).toBeUndefined();
    });

    test("quiz no existe => 404", async () => {
      jwt.verify.mockReturnValueOnce({ role: "instructor" });
      quizDAO.getQuizById.mockResolvedValueOnce(null);

      const req = {
        params: { quizId: 999 },
        headers: { authorization: "Bearer token" }
      };
      const res = makeRes();

      await quizController.getQuizDetailForUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Quiz not found" })
      );
    });
  });

  describe("answerQuiz", () => {
    test("datos incompletos => 400", async () => {
      const req = { body: { studentUserId: 1, quizId: 2, answers: [] } };
      const res = makeRes();

      await quizController.answerQuiz(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
      expect(quizDAO.submitQuizAnswers).not.toHaveBeenCalled();
    });

    test("success => 200 con score y attemptNumber", async () => {
      quizDAO.submitQuizAnswers.mockResolvedValueOnce({ score: 80, attemptNumber: 2 });

      const req = {
        body: {
          studentUserId: 7,
          quizId: 3,
          answers: [{ questionId: 1, optionId: 2 }]
        }
      };
      const res = makeRes();

      await quizController.answerQuiz(req, res);

      expect(quizDAO.submitQuizAnswers).toHaveBeenCalledWith(
        req.body.answers,
        req.body.quizId,
        req.body.studentUserId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          score: 80,
          attemptNumber: 2
        })
      );
    });
  });

  describe("viewQuizResult", () => {
    test("faltan query params => 400", async () => {
      const req = { query: { quizId: 1 } };
      const res = makeRes();

      await quizController.viewQuizResult(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("success => 200 y parsea attemptNumber", async () => {
      quizDAO.getQuizResult.mockResolvedValueOnce({ quizId: 1, scoreObtained: 10 });

      const req = { query: { quizId: 1, studentUserId: 2, attemptNumber: "3" } };
      const res = makeRes();

      await quizController.viewQuizResult(req, res);

      expect(quizDAO.getQuizResult).toHaveBeenCalledWith(1, 2, 3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe("listQuizResponses", () => {
    test("sin quizId => 400", async () => {
      const req = { params: {} };
      const res = makeRes();

      await quizController.listQuizResponses(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("success => 200, combina responses + nombre", async () => {
      quizDAO.getQuizResponsesList.mockResolvedValueOnce([
        { studentUserId: 1, score: 90, attemptNumber: 2 },
        { studentUserId: 2, score: 70, attemptNumber: 1 }
      ]);

      getStudentNames.mockResolvedValueOnce([
        { studentId: 1, name: "Ana" },
        { studentId: 2, name: "Beto" }
      ]);

      const req = { params: { quizId: 5 } };
      const res = makeRes();

      await quizController.listQuizResponses(req, res);

      expect(quizDAO.getQuizResponsesList).toHaveBeenCalledWith(5);
      expect(getStudentNames).toHaveBeenCalledWith([1, 2]);

      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];

      expect(payload.success).toBe(true);
      expect(payload.quizId).toBe(5);
      expect(payload.responses).toEqual([
        expect.objectContaining({ studentUserId: 1, score: 90, attemptNumber: 2, name: "Ana" }),
        expect.objectContaining({ studentUserId: 2, score: 70, attemptNumber: 1, name: "Beto" })
      ]);
    });
  });

  describe("getQuizForStudentController", () => {
    test("sin quizId => 400", async () => {
      const req = { params: {} };
      const res = makeRes();

      await quizController.getQuizForStudentController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("no encontrado => 404", async () => {
      quizDAO.getQuizForStudent.mockResolvedValueOnce(null);

      const req = { params: { quizId: 1 } };
      const res = makeRes();

      await quizController.getQuizForStudentController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("success => 200", async () => {
      quizDAO.getQuizForStudent.mockResolvedValueOnce({ quizId: 1, questions: [] });

      const req = { params: { quizId: 1 } };
      const res = makeRes();

      await quizController.getQuizForStudentController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe("getStudentsAttemptsController", () => {
    test("faltan params => 400", async () => {
      const req = { params: { quizId: 1 } };
      const res = makeRes();

      await quizController.getStudentsAttemptsController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("success => 200 con attempts", async () => {
      quizDAO.getStudentsAttempts.mockResolvedValueOnce([{ attemptNumber: 1 }]);

      const req = { params: { quizId: 1, studentUserId: 9 } };
      const res = makeRes();

      await quizController.getStudentsAttemptsController(req, res);

      expect(quizDAO.getStudentsAttempts).toHaveBeenCalledWith(1, 9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          quizId: 1,
          studentUserId: 9,
          attempts: [{ attemptNumber: 1 }]
        })
      );
    });
  });
});
