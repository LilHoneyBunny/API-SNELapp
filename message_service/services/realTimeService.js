const events = require('../events/events');

function SendRealTimeMessage(io) {
    events.on(SEND_MESSAGE_EVENT, ({ idChat, message }) => {
        io.to(idChat).emit('nuevoMensaje', message);
    });
}

module.exports = { SendRealTimeMessage };