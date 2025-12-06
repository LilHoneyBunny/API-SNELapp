const {Router} = require ('express');
const router = Router();
const {createQuestionnaire} = require('../controller/quizController');

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Endpoints for managing questionnaires
 */

/**
 * @swagger
 * /quizzes/createQuiz:
 *   post:
 *     summary: Crear un cuestionario con preguntas y opciones
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizCreate'
 *     responses:
 *       201:
 *         description: Quiz creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       500:
 *         description: Error del servidor
 */
router.post('/createQuiz', createQuestionnaire);

module.exports = router;
