const { Router } = require('express');
const router = Router();
const {getCourseStudentCount, getStudentsWithAverageInCourse} = require('../controller/courseStudentController');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: información del estudiante en relación con el curso
 */

/**
 * @swagger
 * /student/{courseId}/students/count:
 *   get:
 *     summary: Obtiene la cantidad de estudiantes de un curso
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Número de estudiantes en el curso
 *       400:
 *         description: courseId no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/:courseId/students/count', getCourseStudentCount);

/**
 * @swagger
 * /student/{courseId}/students/average:
 *   get:
 *     summary: Lista los estudiantes de un curso con su promedio
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de estudiantes con nombre y promedio
 *       400:
 *         description: courseId no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/:courseId/students/average', getStudentsWithAverageInCourse);

module.exports = router;