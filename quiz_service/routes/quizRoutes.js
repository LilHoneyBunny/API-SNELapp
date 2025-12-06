const {Router} = require ('express');
const router = Router();
const {createQuestionnaire, updateQuestionnaire, deleteQuestionnaire,
    getQuizzesByCourse, searchQuizByTitle, searchQuizByDate, getQuizDetailForUser} = require('../controller/quizController');

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

/**
 * @swagger
 * /quizzes/course/{cursoId}:
 *   get:
 *     summary: Get all quizzes related to a course
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quizId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       creationDate:
 *                         type: string
 *                       numberQuestion:
 *                         type: integer
 *       400:
 *         description: Bad request (cursoId missing)
 *       500:
 *         description: Internal server error
 */
router.get("/course/:cursoId", getQuizzesByCourse);

/**
 * @swagger
 * /quizzes/searchByTitle:
 *   get:
 *     summary: Search quizzes by title
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Title or part of the title to search for
 *     responses:
 *       200:
 *         description: List of quizzes matching the title
 *       400:
 *         description: Bad request (title missing)
 *       500:
 *         description: Internal server error
 */
router.get("/searchByTitle", searchQuizByTitle);

/**
 * @swagger
 * /quizzes/searchByDate:
 *   get:
 *     summary: Search quizzes by creation date
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Creation date to search for (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of quizzes matching the date
 *       400:
 *         description: Bad request (date missing)
 *       500:
 *         description: Internal server error
 */
router.get("/searchByDate", searchQuizByDate);

/**
 * @swagger
 * /quizzes/{quizId}/view:
 *   get:
 *     summary: Get full quiz by ID for user
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the quiz
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token with user role
 *     responses:
 *       200:
 *         description: Quiz details
 *       404:
 *         description: Quiz not found
 */
router.get("/:quizId/view", getQuizDetailForUser);
module.exports = router;
