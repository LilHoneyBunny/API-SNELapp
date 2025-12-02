const {Router} = require ('express');
const router = Router();
const {createNewContent, updateContent, deleteContent, getContentByCourse} = require('../controller/contentController');

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

module.exports = router;