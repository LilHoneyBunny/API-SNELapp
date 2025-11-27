const {Router} = require ('express');
const router = Router();
const{createCurso} = require('../controller/courseController');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Gestión de cursos
 */

/**
 * @swagger
 * /courses/createCourse:
 *   post:
 *     summary: Crear un curso
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/NewCourse'
 *     responses:
 *       201:
 *         description: Creación de curso exitoso
 *       400:
 *         description: Información ya registrada o no válida
 *       500:
 *         description: Error del servidor
 */
router.post('/createCourse', createCurso);

module.exports = router;