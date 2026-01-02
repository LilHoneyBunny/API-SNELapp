const {response} = require('express');
const Chat = require('../models/Chat');
const {CreateChatAsync, LoadChatAsync, LoadMessagesAsync, SendMessageAsync} = require('../services/chatService');
const {ValidateId, ValidateUserType} = require('../validations/generalValidations');
import { ALUMNO, INSTRUCTOR_ESP, USUARIO, CHAT } from '../utils/constants';

async function CreateChatControllerAsync(req, res = response, next) {
    try {
        const {idStudent, idInstructor} = req.params;
        ValidateId(idStudent, ALUMNO);
        ValidateId(idInstructor, INSTRUCTOR_ESP);

        const idChat = await CreateChatAsync(idStudent, idInstructor, Chat);
        
        return res.status(201).json(idChat);
    } catch(err) {
        next(err);
    }
}

async function LoadChatsControllerAsync(req, res = response, next) {
    try {
        const {idUser} = req.params;
        ValidateId (idUser, USUARIO);
        const {userType} = req.body;
        ValidateUserType(userType);

        const chats = await LoadChatAsync(idUser, userType, Chat);

        res.status(200).json(chats);
    } catch(err) {
        next(err);
    }
}

async function LoadMessagesControllerAsync(req, res = response, next) {
    try{
        const {idChat} = req.params;
        ValidateId(idChat, CHAT);
        
        const messages = await LoadMessagesAsync(idChat, Chat);

        res.status(200).json(messages);
    } catch(err) {
        next(err);
    }
}

async function SendMessageControllerAsync(req, res = response, next) {
    try {
        const {idChat} = req.params;
        ValidateId(idChat, CHAT);
        const {text, userType} = req.body;
        ValidateUserType(userType);

        const message = await SendMessageAsync(idChat, text, userType, Chat);

        res.status(201).json(message);
    } catch(err) {
        next(err);
    }
}

module.exports = {CreateChatControllerAsync, LoadChatsControllerAsync, LoadMessagesControllerAsync, SendMessageControllerAsync};