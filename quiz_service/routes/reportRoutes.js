const express = require('express');
const router = express.Router();
const { getStudentCourseReport, getStudentQuizResults, viewReportStudent} = require('../controller/reportController');

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Endpoints for managing reports
 */

/**
 * @swagger
 * /report/student/{studentUserId}/course/{cursoId}/view:
 *   get:
 *     summary: Visualiza el reporte individual del estudiante en un curso
 *     description: >
 *       Genera y devuelve el reporte del estudiante en formato HTML para su
 *       visualización directa en el sistema.
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
 *         description: Reporte HTML generado exitosamente para visualización
 *       400:
 *         description: Parámetros faltantes o inválidos
 *       500:
 *         description: Error interno al generar el reporte
 */
router.get('/student/:studentUserId/course/:cursoId/view', viewReportStudent);

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

/**
 * @swagger
 * /report/{quizId}/students/{studentUserId}/results:
 *   get:
 *     summary: Obtiene los resultados detallados de un estudiante en un quiz
 *     tags: [Quiz Results]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: studentUserId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultados obtenidos correctamente
 *       400:
 *         description: Parámetros faltantes
 *       404:
 *         description: Resultados no encontrados
 *       500:
 *         description: Error interno
 */
router.get('/:quizId/students/:studentUserId/results', getStudentQuizResults);

module.exports = router;