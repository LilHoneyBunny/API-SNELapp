USE MINAO;

CREATE TABLE IF NOT EXISTS User (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(75) NOT NULL,
    paternalSurname VARCHAR(70) NOT NULL,
    maternalSurname VARCHAR(70) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    userPassword VARCHAR(200) NOT NULL,
    userType ENUM('Instructor', 'Student') NOT NULL
);

CREATE TABLE IF NOT EXISTS Title (
    titleId INT AUTO_INCREMENT PRIMARY KEY,
    titleName VARCHAR(50) UNIQUE NOT NULL   
);

CREATE TABLE IF NOT EXISTS EducationLevel (
    levelId INT AUTO_INCREMENT PRIMARY KEY,
    levelName VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Instructor (
    instructorId INT PRIMARY KEY,
    title INT, 
    biography VARCHAR(500),
    FOREIGN KEY (instructorId) REFERENCES User(userId) ON DELETE CASCADE,
    FOREIGN KEY (titleId) REFERENCES Title(titleId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Student(
    studentId INT PRIMARY KEY,
    levelId INT NOT NULL,
    average DECIMAL(5,2),
    FOREIGN KEY (studentId) REFERENCES User(userId) ON DELETE CASCADE,
    FOREIGN KEY (levelId) REFERENCES EducationLevel(levelId) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Curso(
    cursoId INT PRIMARY KEY,
    name VARCHAR(70), 
    description VARCHAR(300),
    category VARCHAR(70),
    startDate DATE,
    endDate DATE,
    state ENUM('Activo', 'Inactivo') NOT NULL,
    instructorId INT NOT NULL,
    FOREIGN KEY (instructorId) REFERENCES User(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Content (
    contentId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30),
    descripcion TEXT,
    cursoId INT NOT NULL,
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Quiz (
    quizId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(300),
    creationDate DATE,
    numberQuestion INT,
    weighing DECIMAL(5,2),
    cursoId INT NOT NULL,
    contentId INT NOT NULL,
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE,
    FOREIGN KEY (contentId) REFERENCES Content(contentId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Curso_Student (
    cursoId INT NOT NULL,
    studentId INT NOT NULL,
    PRIMARY KEY (cursoId, studentId),
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES Student(studentId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Chat (
    chatId INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100),
    cursoId INT,
    createdBy INT NOT NULL,
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES User(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Message (
    messageId INT AUTO_INCREMENT PRIMARY KEY,
    chatId INT NOT NULL,
    userId INT NOT NULL,
    content TEXT,
    dateSent DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(70),
    FOREIGN KEY (chatId) REFERENCES Chat(chatId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Report (
    reportId INT AUTO_INCREMENT PRIMARY KEY,
    cursoId INT NOT NULL,
    studentId INT,
    type ENUM('General','Por estudiante') NOT NULL,
    data JSON,
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES Student(studentId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Score (
    scoreId INT AUTO_INCREMENT PRIMARY KEY,
    cursoId INT NOT NULL,
    studentId INT NOT NULL,
    score DECIMAL(5,2),
    CONSTRAINT fk_score_curso FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE,
    CONSTRAINT fk_score_student FOREIGN KEY (studentId) REFERENCES Student(studentId) ON DELETE CASCADE,
    UNIQUE KEY unique_curso_student (cursoId, studentId)
);

INSERT INTO Title (titleName) VALUES ('Dr.');
INSERT INTO Title (titleName) VALUES ('Mtro.');
INSERT INTO Title (titleName) VALUES ('Lic.');
INSERT INTO Title (titleName) VALUES ('Ing.');
INSERT INTO Title (titleName) VALUES ('Prof.');


INSERT INTO EducationLevel (levelName) VALUES ('Secundaria');
INSERT INTO EducationLevel (levelName) VALUES ('Preparatoria');
INSERT INTO EducationLevel (levelName) VALUES ('Universidad');
