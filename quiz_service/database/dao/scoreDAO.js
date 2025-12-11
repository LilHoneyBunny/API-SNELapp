const connection = require("../pool");

const getStudentScoresInCourse = async (studentUserId, cursoId) => {
     const dbConnection = await connection.getConnection();
    try {
        const [studentRows] = await dbConnection.execute(
            `SELECT u.userName, u.paternalSurname, u.maternalSurname, s.average AS studentAverage,
                    c.name AS courseName, c.startDate, c.endDate,
                    i.userName AS instructorName, i.email AS instructorEmail
             FROM minao_users.User u
             JOIN minao_users.Student s ON u.userId = s.studentId
             JOIN minao_courses.Curso c ON c.cursoId = ?
             JOIN minao_users.User i ON c.instructorUserId = i.userId
             WHERE u.userId = ?`,
            [cursoId, studentUserId]
        );

        if (studentRows.length === 0) {
            throw new Error('Estudent or course not found');
        }

        const studentInfo = studentRows[0];

        const [quizRows] = await dbConnection.execute(
            `SELECT sc.quizId, q.title AS quizTitle, sc.score, sc.attemptNumber
             FROM minao_quizzes.Quiz q
             INNER JOIN minao_quizzes.Score sc 
                 ON q.quizId = sc.quizId
             INNER JOIN (
                 SELECT quizId, MAX(attemptNumber) AS lastAttempt
                 FROM minao_quizzes.Score
                 WHERE studentUserId = ? AND cursoId = ?
                 GROUP BY quizId
             ) latest
             ON sc.quizId = latest.quizId AND sc.attemptNumber = latest.lastAttempt
             WHERE sc.studentUserId = ? AND sc.cursoId = ?`,
            [studentUserId, cursoId, studentUserId, cursoId]
        );

        return {
            studentInfo,
            quizzes: quizRows
        };

    } catch (err) {
        console.error("Error in getStudentCourseData DAO:", err);
        throw err;
    } finally {
        dbConnection.release();
    }
};

module.exports = {getStudentScoresInCourse};