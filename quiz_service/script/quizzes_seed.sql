USE minao_quizzes;

-- ==== QUIZZES ====
INSERT INTO Quiz (quizId, title, description, numberQuestion, weighing, cursoId, status)
VALUES
(1, 'Quiz SOA Básico', 'Cuestionario introductorio sobre SOA.', 2, 10.0, 1, 'Activo'),
(2, 'Quiz de Programación', 'Preguntas básicas de programación.', 2, 10.0, 2, 'Activo'),
(3, 'Quiz SQL Inicial', 'Preguntas de introducción a SQL.', 2, 10.0, 3, 'Activo');

-- ==== PREGUNTAS ====
INSERT INTO Question (questionId, quizId, questionText, points)
VALUES
-- Quiz 1 (SOA)
(1, 1, '¿Qué significa SOA?', 1),
(2, 1, '¿Cuál es un principio de SOA?', 1),

-- Quiz 2 (Programación)
(3, 2, '¿Qué es una variable?', 1),
(4, 2, '¿Qué tipo de dato representa números enteros?', 1),

-- Quiz 3 (SQL)
(5, 3, '¿Para qué sirve SELECT?', 1),
(6, 3, '¿Qué comando inserta datos?', 1);

-- ==== OPCIONES ====
INSERT INTO OptionAnswer (optionId, questionId, optionText, isCorrect)
VALUES
-- Q1
(1, 1, 'Service Oriented Architecture', 1),
(2, 1, 'Secure Operational Access', 0),

-- Q2
(3, 2, 'Bajo acoplamiento', 1),
(4, 2, 'Duplicar servicios', 0),

-- Q3
(5, 3, 'Espacio en memoria para guardar datos', 1),
(6, 3, 'Un método', 0),

-- Q4
(7, 4, 'INT', 1),
(8, 4, 'STRING', 0),

-- Q5
(9, 5, 'Consultar datos', 1),
(10, 5, 'Eliminar datos', 0),

-- Q6
(11, 6, 'INSERT INTO', 1),
(12, 6, 'DROP TABLE', 0);

-- === RESPUESTAS QUIZ 1 (SOA) ===
INSERT INTO StudentResponse (quizId, studentUserId, questionId, optionId, isCorrect, attemptNumber)
VALUES
-- Estudiante 4
(1, 4, 1, 1, 1, 1),
(1, 4, 2, 3, 1, 1),

-- Estudiante 5
(1, 5, 1, 2, 0, 1),
(1, 5, 2, 3, 1, 1),

-- Estudiante 6
(1, 6, 1, 1, 1, 1),
(1, 6, 2, 4, 0, 1);

-- === RESPUESTAS QUIZ 2 (Programación) ===
INSERT INTO StudentResponse (quizId, studentUserId, questionId, optionId, isCorrect, attemptNumber)
VALUES
-- Estudiante 4
(2, 4, 3, 5, 1, 1),
(2, 4, 4, 7, 1, 1),

-- Estudiante 5
(2, 5, 3, 6, 0, 1),
(2, 5, 4, 7, 1, 1),

-- Estudiante 6
(2, 6, 3, 5, 1, 1),
(2, 6, 4, 8, 0, 1);


-- === RESPUESTAS QUIZ 3 (SQL) ===
INSERT INTO StudentResponse (quizId, studentUserId, questionId, optionId, isCorrect, attemptNumber)
VALUES
-- Estudiante 4
(3, 4, 5, 9, 1, 1),
(3, 4, 6, 11, 1, 1),

-- Estudiante 5
(3, 5, 5, 10, 0, 1),
(3, 5, 6, 11, 1, 1),

-- Estudiante 6
(3, 6, 5, 9, 1, 1),
(3, 6, 6, 12, 0, 1);

-- === SCORES PARA LOS 3 QUIZZES ===
INSERT INTO Score (quizId, cursoId, studentUserId, score, attemptNumber)
VALUES
-- QUIZ 1 (curso 1)
(1, 1, 4, 10.00, 1),
(1, 1, 5, 5.00, 1),
(1, 1, 6, 5.00, 1),

-- QUIZ 2 (curso 2)
(2, 2, 4, 10.00, 1),
(2, 2, 5, 5.00, 1),
(2, 2, 6, 5.00, 1),

-- QUIZ 3 (curso 3)
(3, 3, 4, 10.00, 1),
(3, 3, 5, 5.00, 1),
(3, 3, 6, 5.00, 1);
