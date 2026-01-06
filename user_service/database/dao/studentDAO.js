const connection = require("../pool");

const getStudentById = async (studentId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT 
                u.userId,
                u.userName,
                u.paternalSurname,
                u.maternalSurname,
                u.email,
                s.average,
                l.levelName 
             FROM User u
             INNER JOIN Student s 
                ON u.userId = s.studentId
             INNER JOIN EducationLevel l 
                ON s.levelId = l.levelId 
             WHERE s.studentId = ?`,
            [studentId]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Error retrieving student:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};


const updateStudentProfile = async (studentId, fields) => {
    const dbConnection = await connection.getConnection();

    try {
        const updates = [];
        const values = [];

        if (fields.levelId !== undefined) {
            updates.push("levelId = ?");
            values.push(fields.levelId);
        }

        if (updates.length === 0) return { affectedRows: 0 };

        const sql = `
            UPDATE Student
            SET ${updates.join(", ")}
            WHERE studentId = ?
        `;

        values.push(studentId);

        const [result] = await dbConnection.execute(sql, values);
        return result;

    } catch (error) {
        console.error("Error updating student data:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};


const updateStudentAverage = async (studentId, average) => {
    const dbConnection = await connection.getConnection();
    try {
        const [result] = await dbConnection.execute(
            `UPDATE Student SET average = ? WHERE studentId = ?`,
            [average, studentId]
        );
        return result;
    } catch (err) {
        console.error("Error updating student average:", err);
        throw err;
    } finally {
        dbConnection.release();
    }
};


const getStudentReportInfoDAO = async (studentId) => {
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
    } finally {
        dbConnection.release();
    }
};

module.exports = {
    getStudentById,
    updateStudentProfile,
    updateStudentAverage,
    getStudentReportInfoDAO
};
