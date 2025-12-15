const {Router} = require ('express');
const router = Router();
const {getInstructor, fetchInstructor} = require('../controllers/instructorController');
//const uploadProfileImage = require("../middleware/uploadProfileImage");
const { updateInstructorProfileController } = require("../controllers/profileController");


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

/*
 * @swagger
 * /instructors/{id}:
 *   put:
 *     summary: Actualizar perfil de instructor (título, biografía, foto)
 *     tags: [Instructors]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: titleName
 *         type: string
 *       - in: formData
 *         name: biography
 *         type: string
 *       - in: formData
 *         name: profileImage
 *         type: file
 *     responses:
 *       200:
 *         description: Perfil de instructor actualizado correctamente
 */

//router.put('/:id', uploadProfileImage, updateInstructorProfileController);

/**
 * @swagger
 * /instructors/{id}:
 *   put:
 *     summary: Actualizar perfil del instructor (título profesional y biografía)
 *     tags: [Instructors]
 *     consumes:
 *       - application/json
 */
router.put('/:id', updateInstructorProfileController);

/**
 * @swagger
 * /instructors:
 *   get:
 *     summary: Obtiene la información de instructor 
 *     tags: [Instructor]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 *       400:
 *         description: Parámetros faltantes
 *       500:
 *         description: Error del servidor
 */
router.get('/', fetchInstructor);


module.exports = router;