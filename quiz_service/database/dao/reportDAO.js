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
    console.log(studentId)
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
    console.log("COURSES_SERVICE_URL:", process.env.COURSES_SERVICE_URL);
    const res = await axiosInstance.get(url);
    console.log(courseId);
    return res.data;
  } catch (err) {
    console.error("Error fetching course info:", err.message);
    const status = err.response?.status;
    throw new Error(`COURSE_SERVICE_ERROR:${status || err.code || "NO_RESPONSE"}`);
  }
}

async function fetchStudentQuizResults(quizId, studentUserId) { //?? <- aún me falta ver lo de las graficas con estos datos
  const dbConnection = await connection.getConnection();
  try {
    const [quizRows] = await dbConnection.execute(
      `SELECT quizId, title, weighing 
       FROM Quiz 
       WHERE quizId = ?`,
      [quizId]
    );
    if (!quizRows.length) return null;

    const quiz = quizRows[0];

    const [[attemptRow]] = await dbConnection.execute(
      `SELECT MAX(attemptNumber) AS maxAttempt 
       FROM StudentResponse 
       WHERE quizId = ? AND studentUserId = ?`,
      [quizId, studentUserId]
    );

    const maxAttempt = attemptRow?.maxAttempt;

    if (!maxAttempt) {
      return {
        quizId: quiz.quizId,
        title: quiz.title,
        totalWeighing: quiz.weighing,
        scoreObtained: 0,
        attemptNumber: null,
        questions: []
      };
    }

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
      [quizId, studentUserId, maxAttempt, quizId]
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

    const totalScore = Object.values(questionsMap)
      .reduce((sum, q) => sum + (q.earnedPoints || 0), 0);

    return {
      quizId: quiz.quizId,
      title: quiz.title,
      totalWeighing: quiz.weighing,
      scoreObtained: totalScore,
      attemptNumber: maxAttempt,
      questions: Object.values(questionsMap)
    };

  } finally {
    dbConnection.release();
  }
}

module.exports = {fetchStudentInfo, fetchCourseInfo,fetchStudentQuizResults};