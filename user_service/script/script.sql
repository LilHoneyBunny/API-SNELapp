CREATE DATABASE IF NOT EXISTS minao_users;
USE minao_users;

CREATE TABLE IF NOT EXISTS User (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(75) NOT NULL,
    paternalSurname VARCHAR(70) NOT NULL,
    maternalSurname VARCHAR(70) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    userPassword VARCHAR(200) NOT NULL,
    userType ENUM('Instructor', 'Student') NOT NULL,
    verificationCode VARCHAR(10),
    isVerified BOOLEAN DEFAULT FALSE,
    profileImageUrl VARCHAR(255) NULL 
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
    titleId INT NULL, 
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

INSERT IGNORE INTO Title (titleName) VALUES ('Dr.'), ('Mtro.'), ('Lic.'), ('Ing.'), ('Prof.');
INSERT IGNORE INTO EducationLevel (levelName) VALUES ('Secundaria'), ('Preparatoria'), ('Universidad');

