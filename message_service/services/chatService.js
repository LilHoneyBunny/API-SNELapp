const events = require('../events/events');
const {ValidateChat} = require('../validations/generalValidations');
import {STUDENT, SEND_MESSAGE_EVENT} from '../utils/constants';

async function CreateChatAsync(IdStudent, IdInstructor, chat) {
    
    const newChat = new chat({
        IdChat: IdStudent,
        IdInstructor: IdInstructor
    });

    await newChat.save();
    const createdChat = await chat
        .findOne({ IdStudent: IdStudent, IdInstructor: IdInstructor },)
        .select('IdChat -_id')
        .lean();

    return {
        IdChat: createdChat?.IdChat ?? 0
    };
}

async function LoadChatAsync(idUser, userType, chat) {
    const filter =
        userType === STUDENT 
        ? { idUser: idUser } 
        : { idUser: idUser };
    
    const chats = await chat.find(
        filter,
        {
            _id: 0,
            IdChat: 1,
            IdStudent: 1,
            IdInstructor: 1,
            message: { $slice: -1 },
        }
    ).lean();

    return chats.map((chat) => ({
        IdChat: chat.IdChat,
        IdStudent: chat.IdStudent,
        IdInstructor: chat.IdInstructor,
        lastMessage: chat.Message?.[0] ?? null,
    }));
}

async function LoadMessagesAsync(IdChat, chat) {
    const foundChat = await chat
        .findOne({ IdChat: IdChat, },)
        .select('Messages -_id')
        .lean();
        
    return foundChat?.Messages ?? [];
}

async function SendMessageAsync(IdChat, text, userType, chat) {
    const res = await chat.findOneAndUpdate(
        { IdChat: IdChat },
        {
            $push: {
                Messages: {
                    Text: text,
                    UserType: userType,
                    Date: new Date(),
                },
            },
        },
        { new: true }
    );

    ValidateChat(res, IdChat);

    events.emit(SEND_MESSAGE_EVENT, {
        IdChat,
        Message: text,
    });

    const Message = res.Messages;
    return Message[Message.length - 1];
}

module.exports = {CreateChatAsync, LoadChatAsync, LoadMessagesAsync, SendMessageAsync};