CREATE DATABASE IF NOT EXISTS minao_courses;
USE minao_courses;

CREATE TABLE IF NOT EXISTS Curso (
    cursoId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(70) NOT NULL,
    description VARCHAR(300),
    category VARCHAR(70),
    startDate DATE,
    endDate DATE,
    state ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
    instructorUserId INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Content (
    contentId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30),
    descripcion TEXT,
    cursoId INT NOT NULL,
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ContentFile (
    fileId INT AUTO_INCREMENT PRIMARY KEY,
    contentId INT NOT NULL,
    fileUrl VARCHAR(500) NOT NULL,
    fileType VARCHAR(50),
    FOREIGN KEY (contentId) REFERENCES Content(contentId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Curso_Student (
    cursoId INT NOT NULL,
    studentUserId INT NOT NULL,
    PRIMARY KEY(cursoId, studentUserId),
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

CREATE TABLE IF NOT EXISTS Report (
    reportId INT AUTO_INCREMENT PRIMARY KEY,
    cursoId INT NOT NULL,
    studentUserId INT,
    type ENUM('General','Por estudiante') NOT NULL,
    data JSON,
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Score (
    scoreId INT AUTO_INCREMENT PRIMARY KEY,
    cursoId INT NOT NULL,
    studentUserId INT NOT NULL,
    score DECIMAL(5,2),
    UNIQUE KEY unique_curso_student (cursoId, studentUserId),
    FOREIGN KEY (cursoId) REFERENCES Curso(cursoId) ON DELETE CASCADE
);