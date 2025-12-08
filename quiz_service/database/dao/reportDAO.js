const axios = require("axios");
require('dotenv').config();
const connection = require("../pool"); 

const axiosInstance = axios.create({
  timeout: 7000,
  headers: { Accept: "application/json" }
});

async function fetchStudentInfo(studentId) {
  try {
    const url = `${process.env.USERS_SERVICE_URL}/students/report-info/${studentId}`;
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching student info:", err.message);
    const status = err.response?.status;
    throw new Error(`STUDENT_SERVICE_ERROR:${status || err.code || "NO_RESPONSE"}`);
  }
}

async function fetchCourseInfo(courseId) {
  try {
    const url = `${process.env.COURSES_SERVICE_URL}/instructor/${courseId}/instructor`;
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (err) {
    console.error("Error fetching course info:", err.message);
    const status = err.response?.status;
    throw new Error(`COURSE_SERVICE_ERROR:${status || err.code || "NO_RESPONSE"}`);
  }
}

async function fetchQuizzesByCourse(courseId) {
  const dbConnection = await connection.getConnection();
  try {
    const [rows] = await dbConnection.execute(
      `SELECT quizId, title, weighing, status FROM Quiz WHERE cursoId = ?`,
      [courseId]
    );
    return rows;
  } finally {
    dbConnection.release();
  }
}

async function fetchStudentQuizResults(courseId, studentUserId) { 
  const dbConnection = await connection.getConnection();
  try {
    const [quizRows] = await dbConnection.execute(
      `SELECT quizId, title, weighing, creationDate
       FROM Quiz
       WHERE cursoId = ?`,
      [courseId]
    );

    if (!quizRows.length) return [];

    const results = [];

    for (const quiz of quizRows) {
      const [[scoreRow]] = await dbConnection.execute(
        `SELECT score, attemptNumber, createdAt
         FROM Score
         WHERE quizId = ? AND studentUserId = ?
         ORDER BY attemptNumber DESC
         LIMIT 1`,
        [quiz.quizId, studentUserId]
      );

      let questions = [];
      let maxAttempt = null;
      let scoreObtained = 0;
      let creationDate = quiz.creationDate;

      if (scoreRow) {
        maxAttempt = scoreRow.attemptNumber;
        scoreObtained = scoreRow.score;
        creationDate = scoreRow.createdAt || creationDate;

        const [questionsRows] = await dbConnection.execute(
          `SELECT 
              q.questionId, q.questionText, q.points,
              oa.optionId, oa.optionText, oa.isCorrect,
              sr.optionId AS selectedOptionId,
              CASE WHEN sr.isCorrect = 1 THEN q.points ELSE 0 END AS earnedPoints
           FROM Question q
           JOIN OptionAnswer oa ON oa.questionId = q.questionId
           LEFT JOIN StudentResponse sr 
             ON sr.questionId = q.questionId
            AND sr.quizId = ?
            AND sr.studentUserId = ?
            AND sr.attemptNumber = ?
           WHERE q.quizId = ?
           ORDER BY q.questionId, oa.optionId`,
          [quiz.quizId, studentUserId, maxAttempt, quiz.quizId]
        );

        const questionsMap = {};
        for (const row of questionsRows) {
          if (!questionsMap[row.questionId]) {
            questionsMap[row.questionId] = {
              questionId: row.questionId,
              questionText: row.questionText,
              points: row.points,
              options: [],
              selectedOptionId: row.selectedOptionId,
              earnedPoints: row.earnedPoints || 0
            };
          }
          questionsMap[row.questionId].options.push({
            optionId: row.optionId,
            optionText: row.optionText,
            isCorrect: row.isCorrect
          });
        }

        questions = Object.values(questionsMap);
      }

      results.push({
        quizId: quiz.quizId,
        title: quiz.title,
        totalWeighing: quiz.weighing,
        creationDate,
        scoreObtained,
        attemptNumber: maxAttempt || 0,
        questions
      });
    }

    return results;

  } finally {
    dbConnection.release();
  }
}

module.exports = {fetchStudentInfo, fetchCourseInfo,fetchQuizzesByCourse, fetchStudentQuizResults};