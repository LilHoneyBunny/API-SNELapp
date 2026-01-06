const express = require('express');
const router = express.Router();

const {
    CreateChatControllerAsync,
    FindChatControllerAsync,
    LoadChatsControllerAsync,
    LoadMessagesControllerAsync,
    SendMessageControllerAsync
} = require('../controllers/messagesController');

/**
 * @swagger
 * /chats/{idStudent}/{idInstructor}:
 *   post:
 *     summary: Iniciar un nuevo chat con un Instructor
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: idStudent
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Alumno
 *       - in: path
 *         name: idInstructor
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Instructor
 *     responses:
 *       201:
 *         description: Chat creado
 *       400:
 *         description: Parámetros inválidos
 */
router.post('/:idStudent/:idInstructor', CreateChatControllerAsync);

/**
 * @swagger
 * /chats/find/{idStudent}/{idInstructor}:
 *   post:
 *     summary: Obtener la id de un chat
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: idStudent
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Alumno
 *       - in: path
 *         name: idInstructor
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Instructor
 *     responses:
 *       200:
 *         description: Chat encontrado
 *       404:
 *         description: Parámetros inválidos
 */
router.get('/find/:idStudent/:idInstructor', FindChatControllerAsync);

/**
 * @swagger
 * /chats/{idUser}:
 *   get:
 *     summary: Obtener todos los Chats de un usuario
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Usuario
 *     responses:
 *       200:
 *         description: Chats encontrados
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: No se encontraron Chats
 */
router.get('/:idUser', LoadChatsControllerAsync);

/**
 * @swagger
 * /chats/{idChat}/messages:
 *   get:
 *     summary: Obtener los Mensajes de un Chat
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: idChat
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Chat
 *     responses:
 *       200:
 *         description: Mensajes encontrados
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: No se encontraron Mensajes
 */
router.get('/:idChat/messages', LoadMessagesControllerAsync);

/**
 * @swagger
 * /chats/{idChat}:
 *   put:
 *     summary: Enviar un mensaje en un Chat.
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: path
 *         name: idChat
 *         required: true
 *         schema:
 *           type: int
 *         description: ID del Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               userType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensaje enviado
 *       400:
 *         description: Parámetros inválidos
 */
router.put('/:idChat', SendMessageControllerAsync);

module.exports = router;