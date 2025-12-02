const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const {uploadContentFile, getFilesByContentController, deleteFileController} = require("../controller/contentFileController");

/**
 * @swagger
 * tags:
 *   name: ContentFiles
 *   description: Gestión de archivos asociados al contenido de un curso
 */

/**
 * @swagger
 * /content-file/{contentId}/upload:
 *   post:
 *     summary: Subir un archivo asociado a un contenido
 *     description: Permite subir un archivo (documento, imagen, video, PDF, etc.) y asociarlo a un contenido existente.
 *     tags: [ContentFiles]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contenido al cual se le asociará el archivo.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir.
 *     responses:
 *       201:
 *         description: Archivo subido y registrado correctamente
 *         content:
 *           application/json:
 *             example:
 *               message: "File uploaded successfully"
 *               fileId: 15
 *               fileUrl: "/uploads/abc123.pdf"
 *
 *       400:
 *         description: No se subió ningún archivo
 *         content:
 *           application/json:
 *             example:
 *               error: true
 *               message: "No file uploaded"
 *
 *       404:
 *         description: Contenido no encontrado
 *
 *       500:
 *         description: Error en el servidor al subir archivo
 */
router.post("/:contentId/upload", upload.single("file"),uploadContentFile);

/**
 * @swagger
 * /content-file/{contentId}/files:
 *   get:
 *     summary: Obtener todos los archivos asociados a un contenido
 *     tags: [ContentFiles]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contenido
 *     responses:
 *       200:
 *         description: Archivos obtenidos exitosamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               status: 200
 *               data:
 *                 - fileId: 1
 *                   fileName: "video.mp4"
 *                   fileUrl: "/uploads/curso1/video.mp4"
 *                   contentId: 3
 *       400:
 *         description: Error en la petición
 *       404:
 *         description: No se encontraron archivos
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:contentId/files", getFilesByContentController);

/**
 * @swagger
 * /content-file/{fileId}:
 *   delete:
 *     summary: Eliminar un archivo por su ID
 *     tags: [ContentFiles]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del archivo a eliminar
 *     responses:
 *       200:
 *         description: Archivo eliminado correctamente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               status: 200
 *               message: "Archivo eliminado exitosamente"
 *       404:
 *         description: Archivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:fileId",deleteFileController);

module.exports = router;