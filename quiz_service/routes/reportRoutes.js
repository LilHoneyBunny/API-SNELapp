const express = require('express');
const router = express.Router();
const { getStudentCourseReport} = require('../controller/reportController');

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Endpoints for managing reports
 */

/**
 * @swagger
 * /report/student/{studentUserId}/course/{cursoId}:
 *   get:
 *     summary: Genera y devuelve el reporte individual del estudiante en un curso
 *     description: Obtiene información del estudiante, del curso, sus resultados en quizzes y genera un reporte HTML detallado.
 *     tags: [Report]
 *     parameters:
 *       - in: path
 *         name: studentUserId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante en el microservicio de usuarios
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Reporte HTML generado exitosamente
 *       400:
 *         description: Parámetros faltantes o inválidos
 *       500:
 *         description: Error al generar el reporte
 */
router.get('/student/:studentUserId/course/:cursoId', getStudentCourseReport);

module.exports = router;