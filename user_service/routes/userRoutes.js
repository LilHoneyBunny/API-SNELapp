const { Router } = require('express');
const router = Router();

const { registerUser, userLogin, verifyUser, fetchStudents, findUserByEmailJSONController, updateUserBasicProfileController } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');


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


/**
 * @swagger
 * /users/findUserByEmailJSON/{email}:
 *   get:
 *     summary: Obtiene toda la información de un usuario mediante su email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: "Correo electrónico del usuario a consultar"
 *     responses:
 *       200:
 *         description: Información del usuario obtenida correctamente
 *       400:
 *         description: Email faltante o inválido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/findUserByEmailJSON/:email', findUserByEmailJSONController);


/**
 * @swagger
 * /users/updateBasicProfile/{userId}:
 *   put:
 *     summary: Actualiza el perfil básico del usuario (nombre, apellidos, foto)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "ID del usuario a actualizar"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               paternalSurname:
 *                 type: string
 *               maternalSurname:
 *                 type: string
 *               profileImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: Datos inválidos o faltantes
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/updateBasicProfile/:userId', updateUserBasicProfileController);



module.exports = router;

