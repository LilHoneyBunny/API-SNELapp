const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
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

        callback(
            null, 
            {
                success: true,                          
                fileId: fileId,                                      
                message: "Archivo subido y metadatos registrados."   
            }
        );


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

        if (!result.success) {
        return res.status(result.status).json(result);
        }

        const files = result.data.map(file => {
            const filename = path.basename(file.fileUrl);

            return {
                fileId: file.fileId,
                contentId: file.contentId,
                originalName: file.originalName,
                fileType: file.fileType,
                viewUrl: `/minao_systems/content/files/view/${encodeURIComponent(filename)}`
            };
        });


        return res.status(HttpStatusCodes.OK).json({
            success: true,
            status: HttpStatusCodes.OK,
            data: files
        });

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

const downloadFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads", filename);
  res.download(filePath);
};

const viewContentFileController = async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);

        const filePath = path.resolve(
            __dirname,
            "..",        
            "uploads",   
            filename
        );

        if (!fs.existsSync(filePath)) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                success: false,
                status: HttpStatusCodes.NOT_FOUND,
                message: "File not found"
            });
        }

        const contentType = mime.lookup(filePath) || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        /*res.setHeader(
            "Content-Disposition",
            `inline; filename="${filename}"`
        );*/
        return res.sendFile(filePath);

    } catch (error) {
        console.error("Error viewContentFileController:", error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error displaying file"
        });
    }
};

module.exports = {uploadContentFile, getFilesByContentController, deleteFileController, downloadFile, viewContentFileController};