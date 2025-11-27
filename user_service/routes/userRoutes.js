const {Router} = require ('express');
const router = Router();
const{registerUser, userLogin, verifyUser}=require('../controllers/userController');

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
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/NewUser'
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
 *                 description: Correo electrónico del usurio
 *               userPassword:
 *                 type: string
 *                 description: Contraseña del usuario
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
 *                 description: Correo electrónico del usurio
 *               verificationCode:
 *                 type: string
 *                 description: Código de verificación enviado al correo electrónico
 *     responses:
 *       200:
 *         description: Cuenta verificada correctamente
 *       400:
 *         description: Datos invalidos o código incorrecto
 *       500:
 *         description: Error interno del servidor
 */

router.post('/verify', verifyUser);

module.exports = router;