const connection = require("../pool");

const getStudentById = async (studentId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT 
                user.userName, 
                user.paternalSurname, 
                user.maternalSurname, 
                student.average,
                level.levelName 
             FROM User user 
             INNER JOIN Student student 
                ON user.userId = student.studentId
             INNER JOIN EducationLevel level 
                ON student.levelId = level.levelId 
             WHERE student.studentId = ?`,
            [studentId]
        );

        return rows;
    } catch (error) {
        console.error("Error retrieving student data", error);
        throw error;
    } finally {
        dbConnection.release();   
    }
};

const updateStudentProfile = async (studentId, { levelId }) => {
    const dbConnection = await connection.getConnection();
    try {
        const [result] = await dbConnection.execute(
            `UPDATE Student
             SET levelId = ?
             WHERE studentId = ?`,
            [levelId, studentId]
        );

        return result;
    } catch (error) {
        console.error("Error updating student data", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const updateStudentAverage = async (studentId, average) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.execute(
            `UPDATE Student SET average = ? WHERE studentId = ?`,
            [average, studentId]
        );
    } catch (err) {
        console.error("Error updating student average:", err);
        throw err;
    } finally {
        dbConnection.release();
    }
};

async function getStudentReportInfoDAO(studentId) {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT 
                u.userId,
                CONCAT(u.userName, ' ', u.paternalSurname, ' ', u.maternalSurname) AS fullName,
                u.email,
                s.average
            FROM User u
            JOIN Student s ON u.userId = s.studentId
            WHERE u.userId = ?`,
            [studentId]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Error in getStudentReportInfoDAO:", error);
        throw new Error("DATABASE_ERROR");
    }finally {
        dbConnection.release();
    }
}

module.exports = { getStudentById, updateStudentProfile, updateStudentAverage, getStudentReportInfoDAO };
