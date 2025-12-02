const connection = require ("../pool");

const getInstructorById = async (instructorId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT user.userName, user.paternalSurname, user.maternalSurname, instructor.titleId, instructor.biography  
            FROM User user INNER JOIN Instructor instructor ON user.userId = instructor.instructorId
            WHERE instructor.instructorId = ?`,
            [instructorId]
        );

        return rows;
    } catch (error) {
        console.error("Error retrieving instructor data", error);
        throw error;
    }finally{
        dbConnection.release();
    }
};

module.exports = {getInstructorById}