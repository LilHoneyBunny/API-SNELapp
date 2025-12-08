const { Router } = require('express');
const router = Router();

const { registerUser, userLogin, verifyUser, fetchStudents } = require('../controllers/userController');
const uploadProfileImage = require("../middleware/uploadProfileImage");
const { verifyToken } = require('../middleware/authMiddleware');

// ✔ Importación corregida (el controlador correcto)
const { updateUserProfileController } = require("../controllers/profileController");


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /users/registerUser:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     operationId: registerUser
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       201:
 *         description: Registro de usuario exitoso
 *       400:
 *         description: Información ya registrada o no válida
 *       500:
 *         description: Error del servidor
 */
router.post('/registerUser', registerUser);


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               userPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente
 *       400:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', userLogin);


/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verificar cuenta de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta verificada correctamente
 *       400:
 *         description: Datos inválidos o código incorrecto
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verify', verifyUser);


/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar perfil básico de usuario (nombre, apellidos, foto)
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: formData
 *         name: userName
 *         type: string
 *       - in: formData
 *         name: paternalSurname
 *         type: string
 *       - in: formData
 *         name: maternalSurname
 *         type: string
 *       - in: formData
 *         name: profileImage
 *         type: file
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.put('/:id',
    verifyToken,
    uploadProfileImage,
    (req, res, next) => {
        const { id } = req.params;

        // Validar que un usuario solo pueda modificar su propio perfil
        if (parseInt(id, 10) !== req.user.userId) {
            return res.status(403).json({
                error: true,
                statusCode: 403,
                details: "You can only edit your own profile"
            });
        }

        next();
    },
    // ✔ Controlador correcto para actualizar perfil
    updateUserProfileController
);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene la información de estudiantes por sus IDs
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         required: true
 *         description: "IDs de los estudiantes separados por coma (ej: 4,5,6)"
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 *       400:
 *         description: Parámetros faltantes
 *       500:
 *         description: Error del servidor
 */
router.get('/', fetchStudents);


module.exports = router;
