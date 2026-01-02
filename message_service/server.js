const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configuration/swaggerConfig');
const { SendRealTimeMessage } = require('./services/realTimeService');
const ErrorsHandler = require('./middlewares/errorsHandler');

const app = express();
app.use(express.json());

app.use('/chats', require('./routes/chatRoutes'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(ErrorsHandler);

//===SOCKET===
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }, // CHECAR
});
// Socket.IO: conexión y join a salas - CHECAR
io.on('connection', (socket) => {
  console.log('Cliente conectado', socket.id);

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} se unió al chat ${chatId}`);
  });
});

//===EVENTS===
SendRealTimeMessage(io);

//===MONGODB===
mongoose.connect(process.env.MONGODB_URI_DEVELOPMENT) // Cambia a MONGODB_URI_DEVELOPMENT si estás en desarrollo
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

//==ARRANCAR SERVER===
server.listen(process.env.PORT_DEVELOPMENT, () => { //Cambiar a PORT_DEVELOPMENT para desarrollo
  console.log('Servidor en puerto 5002');
});