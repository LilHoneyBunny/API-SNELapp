const connection = require("../pool");

const updateInstructorProfile = async (instructorId, fields) => {
  console.log("DB: pidiendo conexión...");
  const dbConnection = await connection.getConnection();
  console.log("DB: conexión obtenida ✅");

  try {
    const updates = [];
    const values = [];

    if (fields.titleId !== undefined) {
      updates.push("titleId = ?");
      values.push(fields.titleId);
    }
    if (fields.biography !== undefined) {
      updates.push("biography = ?");
      values.push(fields.biography);
    }

    if (updates.length === 0) return { affectedRows: 0 };

    const sql = `
      UPDATE Instructor
      SET ${updates.join(", ")}
      WHERE instructorId = ?
    `;

    values.push(instructorId);

    const [result] = await dbConnection.execute(sql, values); // ✅ antes decía pool.execute
    return result;

  } catch (error) {
    console.error("Error updating instructor:", error);
    throw error;
  } finally {
    dbConnection.release();
    console.log("DB: conexión liberada ✅");
  }
};

const getInstructorById = async (instructorId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT 
                u.userId,
                u.userName, 
                u.paternalSurname, 
                u.maternalSurname, 
                u.email,
                i.biography, 
                t.titleName 
             FROM User u 
             INNER JOIN Instructor i 
                ON u.userId = i.instructorId
             LEFT JOIN Title t 
                ON i.titleId = t.titleId 
             WHERE i.instructorId = ?`,
            [instructorId]
        );

        return rows[0] || null;
    } catch (error) {
        console.error("Error retrieving instructor data:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};



const getInstructorId = async (instructorIds) => {
    const dbConnection = await connection.getConnection();
    try {
        if (!Array.isArray(instructorIds) || instructorIds.length === 0) return [];

        const placeholders = instructorIds.map(() => "?").join(",");
        const [rows] = await dbConnection.execute(
            `SELECT 
                i.instructorId,
                CONCAT(u.userName, ' ', u.paternalSurname, ' ', u.maternalSurname) AS name, 
                u.email, 
                u.userType
             FROM Instructor i
             JOIN User u ON i.instructorId = u.userId
             WHERE i.instructorId IN (${placeholders})`,
            instructorIds
        );

        return rows;
    } catch (err) {
        console.error("Error in getInstructorId:", err);
        return instructorIds.map(id => ({ instructorId: id, name: "Desconocido" }));
    } finally {
        dbConnection.release();
    }
};

module.exports = {
    getInstructorById,
    updateInstructorProfile,
    getInstructorId
};
