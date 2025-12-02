const {Router} = require ('express');
const router = Router();
const{registerUser, userLogin, verifyUser}=require('../controllers/userController');
const uploadProfileImage = require("../middleware/uploadProfileImage");
const { verifyToken } = require('../middleware/authMiddleware');
const { updateUserBasicProfileController } = require("../controllers/profileController");


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
router.put('/:id', uploadProfileImage, updateUserBasicProfile);

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
 */
router.put(
  '/:id',
  verifyToken,          
  uploadProfileImage,     
  (req, res, next) => {
      // Revisa que el usuario  sea el dueño del perfil
      const { id } = req.params;
      if (parseInt(id, 10) !== req.user.userId) {
          return res.status(403).json({
              error: true,
              statusCode: 403,
              details: "You can only edit your own profile"
          });
      }
      next();
  },
  updateUserProfileController
);


module.exports = router;