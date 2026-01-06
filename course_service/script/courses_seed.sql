USE minao_courses;

-- ==== CURSOS ====
INSERT INTO Curso (cursoId, name, description, category, startDate, endDate, state, instructorUserId)
VALUES
(1, 'Introducción a SOA', 'Arquitectura orientada a servicios y sus principios.', 'Tecnología', '2025-01-10', '2025-02-28', 'Activo', 2),
(2, 'Fundamentos de Programación', 'Curso básico de lógica y programación.', 'Programación', '2025-01-15', '2025-03-10', 'Activo', 1),
(3, 'Bases de Datos MySQL', 'Modelado, SQL y administración.', 'Bases de Datos', '2025-01-20', '2025-03-20', 'Activo', 3);

-- ==== ASIGNAR ESTUDIANTES A CURSOS ====
INSERT INTO Curso_Student (cursoId, studentUserId) VALUES
(1, 4), (1, 5), (1, 6),
(2, 4), (2, 6),
(3, 5);

-- ==== CONTENIDOS ====
INSERT INTO Content (contentId, title, type, descripcion, cursoId)
VALUES
(1, 'Introducción a SOA', 'Lectura', 'Conceptos básicos de SOA.', 1),
(2, 'Variables y Tipos', 'Video', 'Explicación de variables y tipos en programación.', 2),
(3, 'Consultas SQL', 'Lectura', 'SELECT, INSERT, UPDATE, DELETE.', 3);

-- ==== ARCHIVOS DE CONTENIDO ====
INSERT INTO ContentFile (fileId, contentId, fileUrl, fileType)
VALUES
(1, 1, 'https://example.com/soa.pdf', 'pdf'),
(2, 2, 'https://example.com/variables.mp4', 'mp4'),
(3, 3, 'https://example.com/sql.pdf', 'pdf');
