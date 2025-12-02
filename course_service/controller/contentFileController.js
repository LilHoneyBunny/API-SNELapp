const path = require("path");
const fs = require("fs");
const { request, response } = require("express");
const { addFileToContent, getFilesByContent, deleteFile } = require("../database/dao/contentFileDAO");
const HttpStatusCodes = require('../utils/enums');

const uploadContentFile = async (req = request, res = response) => {
    try {
        const { contentId } = req.params;

        if (!req.file) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                message: "No file uploaded"
            });
        }

        const fileUrl = "/uploads/" + req.file.filename;
        const fileType = req.file.mimetype;

        const fileId = await addFileToContent({
            contentId,
            fileUrl,
            fileType
        });

        return res.status(HttpStatusCodes.CREATED).json({
            message: "File uploaded successfully",
            fileId,
            fileUrl
        });

    } catch (error) {
        console.error("Upload error:", error);

        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Error uploading file"
        });
    }
};

const getFilesByContentController = async (req, res) => {
    try {
        const { contentId } = req.params;

        const result = await getFilesByContent(contentId);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Error en getFilesByContentController:", error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal server error from the controller",
        });
    }
};

const deleteFileController = async (req, res) => {
    try {
        const { fileId } = req.params;

        const result = await deleteFile(fileId);

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Error en deleteFileController:", error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal server error from the controller",
        });
    }
};

module.exports = {uploadContentFile, getFilesByContentController, deleteFileController};