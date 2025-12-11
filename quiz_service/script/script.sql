CREATE DATABASE IF NOT EXISTS minao_quizzes;
USE minao_quizzes;

CREATE TABLE IF NOT EXISTS Quiz (
    quizId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(300),
    creationDate DATE DEFAULT CURDATE(),
    numberQuestion INT,
    weighing DECIMAL(5,2),
    cursoId INT NOT NULL,
    status ENUM('Borrador','Activo','Inactivo') NOT NULL DEFAULT 'Borrador'
);


CREATE TABLE IF NOT EXISTS Question (
    questionId INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    questionText VARCHAR(500) NOT NULL,
    points INT NOT NULL DEFAULT 1,
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS OptionAnswer (
    optionId INT AUTO_INCREMENT PRIMARY KEY,
    questionId INT NOT NULL,
    optionText VARCHAR(300) NOT NULL,
    isCorrect TINYINT(1) DEFAULT 0,
    FOREIGN KEY (questionId) REFERENCES Question(questionId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS StudentResponse (
    responseId INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    studentUserId INT NOT NULL,
    questionId INT NOT NULL,
    optionId INT,
    isCorrect TINYINT(1),
    attemptNumber INT NOT NULL DEFAULT 1,
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId),
    FOREIGN KEY (questionId) REFERENCES Question(questionId),
    FOREIGN KEY (optionId) REFERENCES OptionAnswer(optionId)
);

CREATE TABLE IF NOT EXISTS Score (
    scoreId INT AUTO_INCREMENT PRIMARY KEY,
    quizId INT NOT NULL,
    cursoId INT NOT NULL,
    studentUserId INT NOT NULL,
    score DECIMAL(5,2),
    attemptNumber INT NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_quiz_student_attempt (quizId, studentUserId, attemptNumber)
);

CREATE TABLE IF NOT EXISTS Report (
    reportId INT AUTO_INCREMENT PRIMARY KEY,
    cursoId INT NOT NULL,       
    studentUserId INT,          
    type ENUM('General','Por estudiante') NOT NULL,
    data JSON
);
