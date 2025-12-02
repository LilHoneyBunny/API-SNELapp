const {Router} = require ('express');
const router = Router();
const {getStudent} = require('../controllers/studentController');

/**
 * @swagger
 * tags:
 *   name: Estudiante
 *   description: Gestión de estudiante
 */

/**
 * @swagger
 * /students/{studentId}:
 *   get:
 *     summary: Get student details by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Student fetched successfully
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/:studentId', getStudent);

module.exports = router;