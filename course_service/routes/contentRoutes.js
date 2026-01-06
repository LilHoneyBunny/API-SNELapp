const {Router} = require ('express');
const router = Router();
const {createNewContent, updateContent, deleteContent, getContentByCourse,
    getContentByTitleController, getContentByDateController} = require('../controller/contentController');
const {downloadFile, getFilesByContentController, viewContentFileController} = require ('../controller/contentFileController');

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Gestión de contenido de curso
 */

/**
 * @swagger
 * /content/createNewContent:
 *   post:
 *     summary: Crear un contenido para un curso
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - cursoId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titulo del contenido
 *               type:
 *                 type: string
 *                 description: Tipo de contenido (video, pdf, actividad, etc.)
 *               descripcion:
 *                 type: string
 *                 description: Descripción del contenido
 *               cursoId:
 *                 type: integer
 *                 description: ID del curso al que pertenece el contenido
 *     responses:
 *       201:
 *         description: Contenido creado correctamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/createNewContent', createNewContent);

/**
 * @swagger
 * /content/updateContent/{contentId}:
 *   patch:
 *     summary: Actualizar un contenido existente
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contenido a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               cursoId:
 *                 type: integer
 *                 description: Nuevo ID del curso, si aplica
 *     responses:
 *       200:
 *         description: Contenido actualizado correctamente
 *       404:
 *         description: Contenido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/updateContent/:contentId', updateContent);

/**
 * @swagger
 * /content/deleteContent/{contentId}:
 *   delete:
 *     summary: Eliminar un contenido
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del contenido a eliminar
 *     responses:
 *       200:
 *         description: Contenido eliminado correctamente
 *       404:
 *         description: Contenido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/deleteContent/:contentId', deleteContent);

/**
 * @swagger
 * /content/byCourse/{cursoId}:
 *   get:
 *     summary: Obtener todos los contenidos de un curso
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso del cual obtener los contenidos
 *     responses:
 *       200:
 *         description: Contenidos obtenidos correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/byCourse/:cursoId', getContentByCourse);

/**
 * @swagger
 * /content/search/by-title:
 *   get:
 *     summary: Search content by title
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial or full title of the content
 *     responses:
 *       200:
 *         description: Content found successfully
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
router.get('/search/by-title', getContentByTitleController);

/**
 * @swagger
 * /content/search/by-date:
 *   get:
 *     summary: Search content by publish date range
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Content found successfully
 *       400:
 *         description: Missing startDate or endDate query parameter
 *       500:
 *         description: Server error
 */
router.get('/search/by-date', getContentByDateController);

/**
 * @swagger
 * /content/files/download/{filename}:
 *   get:
 *     summary: Download a content file
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file to download
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get("/files/download/:filename", downloadFile);

/**
 * @swagger
 * /content/{contentId}/files:
 *   get:
 *     summary: Get files associated with a content
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the content
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       404:
 *         description: No files found for this content
 *       500:
 *         description: Server error
 */
router.get('/:contentId/files', getFilesByContentController);

/**
 * @swagger
 * /content/files/view/{filename}:
 *   get:
 *     summary: View a content file
 *     description: Displays a file (PDF) directly in the browser without downloading it.
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Stored filename of the uploaded file
 *     responses:
 *       200:
 *         description: File displayed successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Error displaying file
 */
router.get("/files/view/:filename", viewContentFileController);

module.exports = router;