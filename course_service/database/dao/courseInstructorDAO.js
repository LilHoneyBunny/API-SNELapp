const connection = require("../pool");

const getInstructorIdsInCourse = async (courseId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT instructorUserId FROM Curso WHERE cursoId = ?`,
            [courseId]
        );
        return rows.map(r => r.instructorUserId);
    } catch (err) {
        console.error("Error in getInstructorIdsInCourse DAO:", err);
        return [];
    } finally {
        dbConnection.release();
    }
};

module.exports = {getInstructorIdsInCourse};