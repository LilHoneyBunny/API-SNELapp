const connection = require ("../pool");

const getStudentById = async (studentId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT user.userName, user.paternalSurname, user.maternalSurname, student.average,
            level.levelName FROM User user INNER JOIN Student student ON user.userId = student.studentId
            INNER JOIN EducationLevel level ON student.levelId = level.levelId WHERE student.studentId = ?`,
            [studentId]
        );

        return rows;
    } catch (error) {
        console.error("Error retrieving student data", error);
        throw error;
    }finally{
        dbConnection.release();
    }
};

module.exports = {getStudentById}