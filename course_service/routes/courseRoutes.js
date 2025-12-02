const {Router} = require ('express');
const router = Router();
const{createCurso, setCourseState, updateCourse, getCourseDetailById, getCoursesByInstructor} = require('../controller/courseController');

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

/**
 * @swagger
 * /courses/updateCourse:
 *   patch:
 *     summary: Update course details (name, description, category, endDate)
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cursoId
 *             properties:
 *               cursoId:
 *                 type: integer
 *                 description: ID of the course
 *               name:
 *                 type: string
 *                 description: New course name
 *               description:
 *                 type: string
 *                 description: New course description
 *               category:
 *                 type: string
 *                 description: New course category
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: New end date
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.patch('/updateCourse', updateCourse);

/**
 * @swagger
 * /courses/setCourseState:
 *   patch:
 *     summary: Update the state of a course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cursoId
 *               - state
 *             properties:
 *               cursoId:
 *                 type: integer
 *                 description: ID of the course
 *               state:
 *                 type: string
 *                 description: New state of the course ("Activo" or "Inactivo")
 *     responses:
 *       200:
 *         description: Course state updated successfully
 *       400:
 *         description: Missing courseId or state
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.patch('/setCourseState', setCourseState);

/**
 * @swagger
 * /courses/{courseId}:
 *   get:
 *     summary: Get a course by its ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the course to retrieve
 *     responses:
 *       200:
 *         description: Course fetched successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/:courseId', getCourseDetailById);

/**
 * @swagger
 * /courses/instructor/{instructorId}:
 *   get:
 *     summary: Get all courses created by an instructor
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: instructorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the instructor whose courses will be fetched
 *     responses:
 *       200:
 *         description: Courses fetched successfully
 *       404:
 *         description: No courses found for this instructor
 *       500:
 *         description: Server error
 */
router.get('/instructor/:instructorId', getCoursesByInstructor);


module.exports = router;