const { Router } = require('express');
const router = Router();
const {getInstructorData} = require('../controller/courseInstructorController');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: información del instructor en relación con el curso
 */


/**
 * @swagger
 * /instructor/{courseId}/instructor:
 *   get:
 *     summary: instructor de un curso
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
router.get('/:courseId/instructor', getInstructorData);

module.exports = router;