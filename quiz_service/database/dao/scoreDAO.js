const connection = require("../pool");

const getStudentScoresInCourse = async (studentUserId, cursoId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
             `SELECT s.quizId, s.score
             FROM Score s
             INNER JOIN (
                 SELECT quizId, MAX(attemptNumber) AS lastAttempt
                 FROM Score
                 WHERE studentUserId = ? AND cursoId = ?
                 GROUP BY quizId
             ) latest
             ON s.quizId = latest.quizId AND s.attemptNumber = latest.lastAttempt
             WHERE s.studentUserId = ? AND s.cursoId = ?`,
             [studentUserId, cursoId, studentUserId, cursoId]
        );
        return rows.map(r => r.score);
    } catch (err) {
        console.error("Error in getStudentScoresInCourse DAO:", err);
        throw err;
    } finally {
        dbConnection.release();
    }
};

module.exports = {getStudentScoresInCourse};