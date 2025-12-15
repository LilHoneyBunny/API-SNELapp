USE minao_users;

-- ==== USUARIOS (6 TOTAL) ====
INSERT INTO User (userId, userName, paternalSurname, maternalSurname, email, userPassword, userType, isVerified)
VALUES
(1, 'Miriam', 'Lopez', 'Hernandez', 'miriam@example.com', '$2b$10$S4iuheFH4918XxdX4QAtbedsszaItT04NDPetE2gfzRzo6pQJbmqS', 'Instructor', TRUE),
(2, 'Edsel', 'Ortiz', 'Moreno', 'edsel@example.com', '$2b$10$S4iuheFH4918XxdX4QAtbedsszaItT04NDPetE2gfzRzo6pQJbmqS', 'Instructor', TRUE),
(3, 'Nydia', 'Rojano', 'Vazquez', 'nydia@example.com', '$2b$10$S4iuheFH4918XxdX4QAtbedsszaItT04NDPetE2gfzRzo6pQJbmqS', 'Instructor', TRUE),

(4, 'Carlos', 'Ramirez', 'Lopez', 'carlos@example.com', '$2b$10$S4iuheFH4918XxdX4QAtbedsszaItT04NDPetE2gfzRzo6pQJbmqS', 'Student', TRUE),
(5, 'Andrea', 'Santos', 'Perez', 'andrea@example.com', '$2b$10$S4iuheFH4918XxdX4QAtbedsszaItT04NDPetE2gfzRzo6pQJbmqS', 'Student', TRUE),
(6, 'Luis', 'Martinez', 'Diaz', 'luis@example.com', '$2b$10$S4iuheFH4918XxdX4QAtbedsszaItT04NDPetE2gfzRzo6pQJbmqS', 'Student', TRUE);

-- ==== INSTRUCTORES ====
INSERT INTO Instructor (instructorId, titleId, biography)
VALUES
(1, 2, 'Experta en sistemas y gestión educativa.'),
(2, 2, 'Profesor especializado en arquitectura de software.'),
(3, 3, 'Instructora de tecnologías empresariales.');

-- ==== ESTUDIANTES ====
INSERT INTO Student (studentId, levelId, average)
VALUES
(4, 3, 8.5),
(5, 3, 9.0),
(6, 2, 8.8);
