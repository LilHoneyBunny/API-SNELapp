const connection = require ("../pool");

const getInstructorById = async (instructorId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT user.userName, user.paternalSurname, user.maternalSurname, instructor.biography, 
            title.titleName FROM User user INNER JOIN Instructor instructor ON user.userId = instructor.instructorId
            INNER JOIN Title title ON instructor.titleId = title.titleId WHERE instructor.instructorId = ?`,
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