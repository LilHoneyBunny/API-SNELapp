const {Router} = require ('express');
const router = Router();
const {updateCourseAverageForStudent} = require('../controller/scoreController');

/**
 * @swagger
 * tags:
 *   name: Score
 *   description: Endpoints for managing scores
 */

/**
 * @swagger
 * /scores/update-average:
 *   post:
 *     summary: Calcula y actualiza el promedio de un estudiante en un curso
 *     tags: [Score]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentUserId:
 *                 type: integer
 *                 description: ID del estudiante
 *               courseId:
 *                 type: integer
 *                 description: ID del curso
 *     responses:
 *       200:
 *         description: Promedio calculado y actualizado correctamente
 *       400:
 *         description: Faltan parámetros obligatorios
 *       500:
 *         description: Error al actualizar el promedio
 */
router.post('/update-average', updateCourseAverageForStudent);

module.exports = router;
