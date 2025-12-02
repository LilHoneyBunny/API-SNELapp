const connection = require ("../pool");

const createContent = async (content) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();
        const [contentResult] = await dbConnection.execute(
            `INSERT INTO Content (title, type, descripcion, cursoId) VALUES (?, ?, ?, ?)`,
            [content.title, content.type, content.descripcion, content.cursoId]
        );

        const contentId = contentResult.insertId;

        await dbConnection.commit();
        return { success: true, contentId };
    } catch (error) {
        await dbConnection.rollback();
        console.error("Content creating error:", error);
        throw error;
    }finally{
        dbConnection.release();
    }
};

const updateContentDetails = async (contentId, details) => {
    const dbConnection = await connection.getConnection();
    try {
        const { title, type, descripcion } = details;
        const fields = [];
        const values = [];

        if(title){
            fields.push("title = ?");
            values.push(title);
        }
        if(type){
            fields.push("type = ?");
            values.push(type);
        }
        if(descripcion){
            fields.push("descripcion = ?");
            values.push(descripcion);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(contentId); 

        const query = `UPDATE Content SET ${fields.join(", ")} WHERE contentId = ?`;
        const [result] = await dbConnection.execute(query, values);

        return result;
    } catch (error) {
        console.error("Error updating content details:", error);
        throw error;
    }finally{
      dbConnection.release();  
    }
};

const deleteContentById = async (contentId) => {
    const dbConnection = await connection.getConnection();
    const [result] = await dbConnection.execute(
        "DELETE FROM Content WHERE contentId = ?",
        [contentId]
    );
    dbConnection.release();
    return result;
};

const getContentsByCourse = async (cursoId) => {
    const dbConnection = await connection.getConnection();
    const [rows] = await dbConnection.execute(
        "SELECT * FROM Content WHERE cursoId = ?",
        [cursoId]
    );
    dbConnection.release();
    return rows;
};

module.exports = {createContent, updateContentDetails, deleteContentById, getContentsByCourse};