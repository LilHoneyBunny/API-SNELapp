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

const updateInstructorProfile = async (instructorId, { titleId, biography }) => {
    const dbConnection = await connection.getConnection();
    try {
        const [result] = await dbConnection.execute(
            `UPDATE Instructor
             SET titleId = ?, biography = ?
             WHERE instructorId = ?`,
            [titleId, biography, instructorId]
        );

        return result;
    } catch (error) {
        console.error("Error updating instructor data", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getInstructorId = async (instructorId) => {
    const dbConnection = await connection.getConnection();
    try {
        if (!instructorId || instructorId.length === 0) return [];

        const placeholders = instructorId.map(() => '?').join(',');
        console.log("Fetching instructors with IDs:", instructorId);
        const [rows] = await dbConnection.execute(
            `SELECT i.instructorId , CONCAT(u.userName, ' ', u.paternalSurname, ' ', u.maternalSurname) AS name, u.email, u.userType
             FROM Instructor i
             JOIN User u ON i.instructorId  = u.userId
             WHERE i.instructorId IN (${placeholders})`,
            instructorId
        );

        return rows; 
    } catch (err) {
        console.error("Error in getInstructorId  DAO:", err);
        return instructorId.map(id => ({ instructorId: id, name: "Desconocido" }));
    } finally {
        dbConnection.release();
    }
};


module.exports = { getInstructorById, updateInstructorProfile, getInstructorId  };
