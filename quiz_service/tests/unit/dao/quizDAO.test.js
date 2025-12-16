// quiz_service/tests/unit/dao/quizDAO.test.js

const { makeConn, mockExecuteRows, mockExecuteResult } = require("../../mocks/db");

jest.mock("../../../database/pool", () => ({
  getConnection: jest.fn()
}));

const pool = require("../../../database/pool");
const quizDAO = require("../../../database/dao/quizDAO");

describe("quiz_service | dao | quizDAO", () => {
  beforeEach(() => jest.clearAllMocks());

  test("createQuiz: success => commit y regresa quizId", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    // INSERT Quiz -> insertId
    mockExecuteResult(conn, { insertId: 10 });
    // INSERT Question -> insertId
    mockExecuteResult(conn, { insertId: 100 });
    // INSERT OptionAnswer (2 opciones)
    mockExecuteResult(conn, { affectedRows: 1 });
    mockExecuteResult(conn, { affectedRows: 1 });

    const res = await quizDAO.createQuiz({
      title: "Quiz nuevo",
      description: "Desc",
      creationDate: "2025-01-01",
      numberQuestion: 1,
      weighing: 10,
      status: "Activo",
      cursoId: 3,
      questions: [
        {
          questionText: "¿2+2?",
          points: 10,
          options: [
            { optionText: "4", isCorrect: 1 },
            { optionText: "5", isCorrect: 0 }
          ]
        }
      ]
    });

    expect(res.success).toBe(true);
    expect(res.quizId).toBe(10);

    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.rollback).not.toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  // ... todo igual arriba

test("createQuiz: si falla en medio => rollback y throw (sin ensuciar consola)", async () => {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});

  const conn = makeConn();
  pool.getConnection.mockResolvedValueOnce(conn);

  mockExecuteResult(conn, { insertId: 10 });
  conn.execute.mockRejectedValueOnce(new Error("DB fail"));

  await expect(
    quizDAO.createQuiz({
      title: "Quiz",
      description: "Desc",
      creationDate: "2025-01-01",
      numberQuestion: 1,
      weighing: 10,
      status: "Activo",
      cursoId: 3,
      questions: [{ questionText: "Q", points: 1, options: [] }]
    })
  ).rejects.toThrow(/DB fail/i);

  expect(conn.rollback).toHaveBeenCalled();
  expect(conn.release).toHaveBeenCalled();

  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

  test("getQuizForUpdate: arma quiz con questions + options (incluye isCorrect)", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    // quiz
    mockExecuteRows(conn, [{
      quizId: 9, title: "Q", description: "D", creationDate: "2025-01-01", numberQuestion: 2, weighing: 10, status: "Activo"
    }]);

    // questions
    mockExecuteRows(conn, [
      { questionId: 1, questionText: "Q1", points: 5 },
      { questionId: 2, questionText: "Q2", points: 5 }
    ]);

    // options para q1
    mockExecuteRows(conn, [
      { optionId: 10, optionText: "A", isCorrect: 1 },
      { optionId: 11, optionText: "B", isCorrect: 0 }
    ]);

    // options para q2
    mockExecuteRows(conn, [
      { optionId: 20, optionText: "C", isCorrect: 0 }
    ]);

    const quiz = await quizDAO.getQuizForUpdate(9);

    expect(quiz.quizId).toBe(9);
    expect(quiz.questions).toHaveLength(2);
    expect(quiz.questions[0].options).toHaveLength(2);
    expect(quiz.questions[0].options[0]).toHaveProperty("isCorrect");

    expect(conn.release).toHaveBeenCalled();
  });

  test("updateQuiz: éxito => commit", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    // UPDATE Quiz
    mockExecuteResult(conn, { affectedRows: 1 });
    // UPDATE Question
    mockExecuteResult(conn, { affectedRows: 1 });
    // UPDATE OptionAnswer
    mockExecuteResult(conn, { affectedRows: 1 });

    const res = await quizDAO.updateQuiz(5, {
      title: "Nuevo título",
      questions: [
        {
          questionId: 99,
          questionText: "Texto nuevo",
          points: 3,
          options: [
            { optionId: 100, optionText: "Opt", isCorrect: 1 }
          ]
        }
      ]
    });

    expect(res.success).toBe(true);
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.rollback).not.toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  test("submitQuizAnswers: calcula score y regresa attemptNumber", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    // 1) preguntas del quiz (para pointsMap)
    mockExecuteRows(conn, [
      { questionId: 10, points: 2 },
      { questionId: 11, points: 1 }
    ]);

    // 2) quizData (cursoId)
    mockExecuteRows(conn, [{ cursoId: 77 }]);

    // 3) attempts count
    mockExecuteRows(conn, [{ count: 0 }]); // attemptNumber = 1

    // 4) isCorrect for answer1
    mockExecuteRows(conn, [{ isCorrect: 1 }]);
    // 5) insert StudentResponse answer1
    mockExecuteResult(conn, { affectedRows: 1 });

    // 6) isCorrect for answer2
    mockExecuteRows(conn, [{ isCorrect: 0 }]);
    // 7) insert StudentResponse answer2
    mockExecuteResult(conn, { affectedRows: 1 });

    // 8) select responses attempt
    mockExecuteRows(conn, [
      { questionId: 10, isCorrect: 1 },
      { questionId: 11, isCorrect: 0 }
    ]);

    // 9) insert Score
    mockExecuteResult(conn, { insertId: 555 });

    // 10) update quiz status
    mockExecuteResult(conn, { affectedRows: 1 });

    const res = await quizDAO.submitQuizAnswers(
      [
        { questionId: 10, optionId: 1000 },
        { questionId: 11, optionId: 1001 }
      ],
      5,
      7
    );

    expect(res.attemptNumber).toBe(1);
    expect(res.score).toBe(2);
    expect(conn.release).toHaveBeenCalled();
  });

  test("getQuizResult: arma resultado con questions + options + scoreObtained", async () => {
    const conn = makeConn();
    pool.getConnection.mockResolvedValueOnce(conn);

    // quiz
    mockExecuteRows(conn, [{ quizId: 5, title: "Quiz", weighing: 10 }]);

    // join questions/options/responses (2 filas para misma pregunta, 2 opciones)
    mockExecuteRows(conn, [
      {
        questionId: 1,
        questionText: "Q1",
        points: 2,
        optionId: 10,
        optionText: "A",
        isCorrect: 1,
        selectedOptionId: 10,
        earnedPoints: 2
      },
      {
        questionId: 1,
        questionText: "Q1",
        points: 2,
        optionId: 11,
        optionText: "B",
        isCorrect: 0,
        selectedOptionId: 10,
        earnedPoints: 2
      }
    ]);

    const result = await quizDAO.getQuizResult(5, 7, 2);

    expect(result.quizId).toBe(5);
    expect(result.scoreObtained).toBe(2);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options).toHaveLength(2);

    expect(conn.release).toHaveBeenCalled();
  });
});
