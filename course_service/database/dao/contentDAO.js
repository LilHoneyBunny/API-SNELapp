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

const getContentByTitle = async (title) => {
    const dbConnection = await connection.getConnection();

    try {
        const [contents] = await dbConnection.execute(
            `SELECT content.contentId, content.title, content.type, content.descripcion, content.publishDate,
                    content_file.fileId, content_file.fileUrl AS url, content_file.fileType
            FROM Content content
            LEFT JOIN ContentFile content_file ON content.contentId = content_file.contentId
            WHERE content.title LIKE ?`,
            [`%${title}%`]
        );

        return contents;

    } catch (error) {
        console.error("Error fetching content by title:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getContentByDate = async (startDate, endDate) => {
    const dbConnection = await connection.getConnection();

    try {
        const [contents] = await dbConnection.execute(
           `SELECT content.contentId, content.title, content.type, content.descripcion, content.cursoId, content.publishDate,
            content_file.fileId, content_file.fileUrl AS url, content_file.fileType
            FROM Content content
            LEFT JOIN ContentFile content_file ON content.contentId = content_file.contentId
            WHERE DATE(content.publishDate) BETWEEN ? AND ?
            ORDER BY content.publishDate DESC`,
            [startDate, endDate]
        );

        const results = contents.map(content => ({
            title: content.title,
            type: content.type,
            descripcion: content.descripcion,
            cursoId: content.cursoId,
            publishDate: content.publishDate,
            file: content.fileId ? {url: content.url, fileType: content.fileType } : null
        }));

        return results;

    } catch (error) {
        console.error("Error fetching content by date:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};


module.exports = {createContent, updateContentDetails, deleteContentById, getContentsByCourse, 
    getContentByTitle, getContentByDate};