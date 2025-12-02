const {Router} = require ('express');
const router = Router();
const{createCurso, setCourseState, updateCourse, getCourseDetailById, 
    getCoursesByInstructor, joinCurso, getCoursesByStudentController,
    getCoursesByNameController, getCoursesByCategoryController, getCoursesByMonthController,
    getCoursesByStateController} = require('../controller/courseController');

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

/**
 * @swagger
 * /courses/join:
 *   post:
 *     summary: Join a course using a join code
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentUserId:
 *                 type: integer
 *                 description: ID of the student who wants to join
 *                 example: 5
 *               joinCode:
 *                 type: string
 *                 description: Unique code of the course
 *                 example: AB12CD3
 *     responses:
 *       200:
 *         description: Student successfully joined the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student successfully joined the course
 *       400:
 *         description: Invalid code, inactive course, or student already joined / Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: string
 *                   example: Invalid code, inactive course, or student already joined
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 details:
 *                   type: string
 *                   example: Error joining the course. Try again later
 */
router.post('/join', joinCurso);

/**
 * @swagger
 * /courses/student/{studentId}:
 *   get:
 *     summary: Get all courses a student is enrolled in
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Courses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cursoId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       state:
 *                         type: string
 *                       instructorUserId:
 *                         type: integer
 *                       joinCode:
 *                         type: string
 *       404:
 *         description: No courses found for this student
 *       500:
 *         description: Server error
 */
router.get('/student/:studentId', getCoursesByStudentController);

/**
 * @swagger
 * /courses/search/by-name:
 *   get:
 *     summary: Search courses by name
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial or full name of the course
 *     responses:
 *       200:
 *         description: Courses found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Curso'
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
router.get('/search/by-name', getCoursesByNameController);

/**
 * @swagger
 * /courses/search/by-category:
 *   get:
 *     summary: Search courses by category
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category of the course
 *     responses:
 *       200:
 *         description: Courses found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Curso'
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
router.get('/search/by-category', getCoursesByCategoryController);

/**
 * @swagger
 * /courses/search/by-month:
 *   get:
 *     summary: Search courses by month and year
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year of the course start date
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month of the course start date
 *     responses:
 *       200:
 *         description: Courses found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Curso'
 *       400:
 *         description: Missing or invalid query parameters
 *       500:
 *         description: Server error
 */
router.get('/search/by-month', getCoursesByMonthController);

module.exports = router;