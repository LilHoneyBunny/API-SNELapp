const { Router } = require('express');
const router = Router();
const { getStudent, updateAverage, getStudentReportInfoController} = require('../controllers/studentController');
const { updateStudentProfileController } = require("../controllers/profileController");

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Gestión de estudiantes
 */

/**
 * @swagger
 * /students/{studentId}:
 *   get:
 *     summary: Obtener información de un estudiante por ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Información del estudiante obtenida correctamente
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:studentId', getStudent);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Actualizar perfil del estudiante (nivel educativo, nombre, etc.)
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               educationalLevel:
 *                 type: string
 *                 example: "Licenciatura"
 *               fullName:
 *                 type: string
 *                 example: "Juan Pérez"
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', updateStudentProfileController);

/**
 * @swagger
 * /students/{studentId}/average:
 *   put:
 *     summary: Actualiza el promedio de un estudiante
 *     description: Actualiza el valor del promedio de un estudiante dado su ID.
 *     tags: [Students]
 *     parameters: 
 *       - in: path 
 *         name: studentId
 *         description: ID del estudiante a actualizar
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Objeto con el nuevo promedio del estudiante
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               average:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Promedio actualizado correctamente
 *       400:
 *         description: Solicitud incorrecta
 *       500:
 *         description: Error interno del servidor
 */

router.put('/:studentId/average', updateAverage);

/**
 * @swagger
 * /students/report-info/{studentId}:
 *   get:
 *     summary: Obtiene información detallada de un estudiante
 *     description: Recupera la información de un estudiante incluyendo su nombre completo, correo y promedio, dado su ID.
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante a consultar
 *     responses:
 *       200:
 *         description: Información del estudiante obtenida correctamente
 *       400:
 *         description: Parámetro studentId no proporcionado o inválido
 *       404:
 *         description: Estudiante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/report-info/:studentId", getStudentReportInfoController);
module.exports = router;
