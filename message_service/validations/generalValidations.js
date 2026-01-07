const { STUDENT, INSTRUCTOR } = require("../utils/constants");

function ValidateId(id, object) {
    if (!id) {
        throw { statusCode: 400, message: `La id del ${object} es nula.` };
    }
    if (id <= 0) {
        throw { statusCode: 400, message: `La id '${id}' del ${object} es inválida.` };
    }
}

function ValidateUserType(userType) {
    if (!userType) {
        throw { statusCode: 400, message: `El tipo de usuario es nulo.` };
    }
    if (userType != STUDENT && userType != INSTRUCTOR) {
        throw { statusCode: 400, message: `El tipo de usuario '${userType}' es inválido.` };
    }
}

function ValidateChat(chat, chatId) {
    if (!chat) {
        throw { statusCode: 404, message: `No existe ningún chat con la id '${chatId}'.` };
    }
}

module.exports = {ValidateId, ValidateUserType, ValidateChat}