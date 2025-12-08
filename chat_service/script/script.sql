CREATE DATABASE IF NOT EXISTS minao_chat;
USE minao_chat;

/* ================================
   TABLE: Chat
   -------------------------------
   Representa un canal de conversación
   entre un estudiante y un instructor,
   o entre usuarios según el contexto.
   No hay FK para mantener independencia.
   ================================ */
CREATE TABLE IF NOT EXISTS Chat (
    chatId INT AUTO_INCREMENT PRIMARY KEY,
    
    /* ID del usuario 1 (alumno o instructor) */
    userAId INT NOT NULL,

    /* ID del usuario 2 (alumno o instructor) */
    userBId INT NOT NULL,

    /* Opcional: curso al que pertenece el chat */
    courseId INT NULL,

    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


/* ================================
   TABLE: Message
   -------------------------------
   Mensajes enviados dentro de un chat.
   No usa FK hacia User ni Curso.
   ================================ */
CREATE TABLE IF NOT EXISTS Message (
    messageId INT AUTO_INCREMENT PRIMARY KEY,

    chatId INT NOT NULL,     -- Chat al que pertenece
    senderUserId INT NOT NULL,  -- ID del remitente
    content TEXT NOT NULL,      -- Mensaje textual

    sentAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Relación interna únicamente
    FOREIGN KEY (chatId) REFERENCES Chat(chatId) ON DELETE CASCADE
);


/* ================================
   INDEXES
   -------------------------------
   Optimizan consultas más comunes:
   - obtener mensajes por chat
   - cargar chats por usuario
   ================================ */

CREATE INDEX idx_chat_users ON Chat (userAId, userBId);
CREATE INDEX idx_chat_course ON Chat (courseId);

CREATE INDEX idx_message_chat ON Message (chatId);
CREATE INDEX idx_message_sender ON Message (senderUserId);
