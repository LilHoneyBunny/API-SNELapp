const {Router} = require ('express');
const router = Router();
const {createQuestionnaire, updateQuestionnaire, deleteQuestionnaire} = require('../controller/quizController');

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

/**
 * @swagger
 * /quizzes/updateQuiz/{quizId}:
 *   put:
 *     summary: Update a quiz including title, description, questions, and options
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the quiz to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     text:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           optionId:
 *                             type: integer
 *                           text:
 *                             type: string
 *                           isCorrect:
 *                             type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put("/updateQuiz/:quizId", updateQuestionnaire);

/**
 * @swagger
 * /quizzes/deleteQuiz/{quizId}:
 *   delete:
 *     summary: Delete a quiz including its questions and options
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the quiz to delete
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       400:
 *         description: Bad request (quizId missing)
 *       404:
 *         description: Quiz not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deleteQuiz/:quizId", deleteQuestionnaire);


module.exports = router;
