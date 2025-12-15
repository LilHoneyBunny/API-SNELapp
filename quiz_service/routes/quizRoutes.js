const {Router} = require ('express');
const router = Router();
const {createQuestionnaire, getQuizForUpdateController, updateQuestionnaire, deleteQuestionnaire, getQuizzesByCourse, 
    searchQuizByTitle, searchQuizByDate, getQuizDetailForUser, answerQuiz, viewQuizResult,
    listQuizResponses, getQuizForStudentController, getStudentsAttemptsController} = require('../controller/quizController');

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
 * /quizzes/getQuizForUpdate/{quizId}:
 *   get:
 *     summary: Get full quiz info for update, including course, questions, options and correct answers
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the quiz to retrieve
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
 *       404:
 *         description: Quiz not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/getQuizForUpdate/:quizId", getQuizForUpdateController);

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

/**
 * @swagger
 * /quizzes/answerQuiz:
 *   post:
 *     summary: Permite que un estudiante conteste un cuestionario
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentUserId:
 *                 type: integer
 *               quizId:
 *                 type: integer
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     optionId:
 *                       type: integer
 *           example:
 *             studentUserId: 4
 *             quizId: 2
 *             answers:
 *               - questionId: 10
 *                 optionId: 40
 *               - questionId: 11
 *                 optionId: 44
 *     responses:
 *       200:
 *         description: Quiz respondido correctamente
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
router.post('/answerQuiz', answerQuiz);

/**
 * @swagger
 * /quizzes/{quizId}/responses:
 *   get:
 *     summary: Lista los estudiantes que contestaron un quiz con su último intento y puntaje
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del quiz
 *     responses:
 *       200:
 *         description: Lista de estudiantes con su puntaje
 *       400:
 *         description: quizId no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/:quizId/responses', listQuizResponses);

/**
 * @swagger
 * /quizzes/quizResult:
 *   get:
 *     summary: Obtiene el resultado de un quiz contestado
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: studentUserId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado del quiz
 *       400:
 *         description: Parámetros faltantes
 *       500:
 *         description: Error del servidor
 */
router.get('/quizResult', viewQuizResult);

/**
 * @swagger
 * /quizzes/studentQuiz/{quizId}:
 *   get:
 *     summary: Get quiz for student (without showing correct answers)
 *     tags:
 *       - Quiz
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the quiz to retrieve for student
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *       404:
 *         description: Quiz not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/studentQuiz/:quizId", getQuizForStudentController);


router.get('/:quizId/students/:studentUserId/attempts', getStudentsAttemptsController);


module.exports = router;
