const events = require('../events/events');
const {ValidateChat} = require('../validations/generalValidations');
const {STUDENT, SEND_MESSAGE_EVENT} = require('../utils/constants');

async function CreateChatAsync(IdStudent, IdInstructor, chat) {
    
    const newChat = new chat({
        IdStudent: IdStudent,
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

async function LoadChatAsync(idUser, chat) {
    var chats = await chat.find(
        { IdStudent: idUser },
        {
            _id: 0,
            IdChat: 1,
            IdStudent: 1,
            IdInstructor: 1,
            message: { $slice: -1 },
        }
    ).lean();

    if (chats.length == 0) {
        chats = await chat.find(
            { IdInstructor: idUser },
            {
                _id: 0,
                IdChat: 1,
                IdStudent: 1,
                IdInstructor: 1,
                message: { $slice: -1 },
            }
        ).lean();
    } 

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

async function SendMessageAsync(idChat, text, userType, chat) {
    const res = await chat.findOneAndUpdate(
        { IdChat: idChat },
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

    ValidateChat(res, idChat);

    events.emit(SEND_MESSAGE_EVENT, {
        IdChat: idChat,
        Message: text,
    });

    const Message = res.Messages;
    return Message[Message.length - 1];
}

module.exports = {CreateChatAsync, LoadChatAsync, LoadMessagesAsync, SendMessageAsync};