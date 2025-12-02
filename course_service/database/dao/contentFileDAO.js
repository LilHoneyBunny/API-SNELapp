const connection = require ("../pool");
const HttpStatusCodes = require("../../utils/enums");

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

    if (rows.length === 0) {
        return {
            success: false,
            status: HttpStatusCodes.NOT_FOUND,
            message: "No files found for this content"
        };
    }

    return {
        success: true,
        status: HttpStatusCodes.OK,
        data: rows
    };
};

const deleteFile = async (fileId) => {
    try {
        const dbConnection = await connection.getConnection();

        const [result] = await dbConnection.execute(
            "DELETE FROM ContentFile WHERE fileId = ?",
            [fileId]
        );

        dbConnection.release();

        if (result.affectedRows === 0) {
            return {
                success: false,
                status: HttpStatusCodes.NOT_FOUND,
                message: "El archivo no existe"
            };
        }

        return {
            success: true,
            status: HttpStatusCodes.OK,
            message: "Archivo eliminado correctamente"
        };

    } catch (error) {
        console.error("Error en deleteFile DAO:", error);
        return {
            success: false,
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error interno en DAO deleteFile"
        };
    }
};


module.exports = {addFileToContent, getFilesByContent, deleteFile};