const {Router} = require ('express');
const router = Router();
const {getInstructor} = require('../controllers/instructorController');

/**
 * @swagger
 * tags:
 *   name: Instructor
 *   description: Gestión de instructor
 */

/**
 * @swagger
 * /instructors/{instructorId}:
 *   get:
 *     summary: Get instructor details by ID
 *     tags: [Instructors]
 *     parameters:
 *       - in: path
 *         name: instructorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the instructor
 *     responses:
 *       200:
 *         description: Instructor fetched successfully
 *       404:
 *         description: Instructor not found
 *       500:
 *         description: Server error
 */
router.get('/:instructorId', getInstructor);

module.exports = router;