const connection = require ("../pool");

const addFileToContent = async (fileData) => {
    const dbConnection = await connection.getConnection();
    try {
        const { contentId, fileUrl, fileType } = fileData;

        const [result] = await dbConnection.execute(
            `INSERT INTO ContentFile (contentId, fileUrl, fileType) VALUES (?, ?, ?)`,
            [contentId, fileUrl, fileType]
        );

        return result.insertId;
    } catch (error) {
        console.error("Error inserting file:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getFilesByContent = async (contentId) => {
    const dbConnection = await connection.getConnection();
    const [rows] = await dbConnection.execute(
        "SELECT * FROM ContentFile WHERE contentId = ?",
        [contentId]
    );
    dbConnection.release();
    return rows;
};

const deleteFile = async (fileId) => {
    const dbConnection = await connection.getConnection();
    const [result] = await dbConnection.execute(
        "DELETE FROM ContentFile WHERE fileId = ?",
        [fileId]
    );
    dbConnection.release();
    return result;
};

module.exports = {addFileToContent, getFilesByContent, deleteFile};