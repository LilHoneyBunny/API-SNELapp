const connection = require("../pool");

const createCourse = async (course) => {
    const dbConnection = await connection.getConnection();
    const joinCode = generateJoinCode();
    try {
        await dbConnection.beginTransaction();
        const [courseResult] = await dbConnection.execute(
            `INSERT INTO Curso (name, description, category, startDate, endDate, state, instructorUserId, joinCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [course.name, course.description, course.category, course.startDate, course.endDate, course.state, course.instructorUserId, joinCode]
        );

        const cursoId = courseResult.insertId;
        await dbConnection.commit();

        return { success: true, cursoId, joinCode };

    } catch (error) {
        await dbConnection.rollback();
        console.error("Course creating error:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const generateJoinCode = (length = 7) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const getCourseCategory = async (courseId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT category FROM Curso WHERE cursoId = ?`,
            [courseId]
        );
        return rows[0] || null;
    } finally {
        dbConnection.release();
    }
};

const updateCourseDetails = async (cursoId, details) => {
    const dbConnection = await connection.getConnection();
    try {
        const { name, description, category, endDate } = details;
        const fields = [];
        const values = [];

        if (name) {
            fields.push("name = ?");
            values.push(name);
        }
        if (description) {
            fields.push("description = ?");
            values.push(description);
        }
        if (category) {
            fields.push("category = ?");
            values.push(category);
        }
        if (endDate) {
            fields.push("endDate = ?");
            values.push(endDate);
        }

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        values.push(cursoId);

        const query = `UPDATE Curso SET ${fields.join(", ")} WHERE cursoId = ?`;
        const [result] = await dbConnection.execute(query, values);

        return result;
    } catch (error) {
        console.error("Error updating course details:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const updateCourseState = async (cursoId, newState) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();

        const validStates = ["Activo", "Inactivo"];
        const state = validStates.includes(newState) ? newState : "Activo";

        const [result] = await dbConnection.execute(
            `UPDATE Curso SET state = ? WHERE cursoId = ?`,
            [state, cursoId]
        );

        await dbConnection.commit();
        return result;
    } catch (error) {
        await dbConnection.rollback();
        console.error("Error updating course state:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getCourseById = async (cursoId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT name, description, category, startDate, endDate, state FROM Curso WHERE cursoId = ?`,
            [cursoId]
        );

        return rows;
    } catch (error) {
        console.error("Error fetching course by ID:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getAllCoursesByInstructor = async (instructorUserId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT cursoId, name, description, category, startDate, endDate, state FROM Curso WHERE instructorUserId = ? AND state = 'Activo' `,
            [instructorUserId]
        );

        return rows;
    } catch (error) {
        console.error("Error fetching instructor courses:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const joinCourse = async (studentUserId, joinCode) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();

        const [result] = await dbConnection.execute(
            `INSERT INTO Curso_Student (cursoId, studentUserId)
             SELECT cursoId, ? FROM Curso WHERE joinCode = ? AND state = 'Activo'
               AND cursoId NOT IN (
                   SELECT cursoId FROM Curso_Student WHERE studentUserId = ?
               )`,
            [studentUserId, joinCode, studentUserId]
        );

        await dbConnection.commit();

        if (result.affectedRows === 0) {
            return { success: false, message: "Invalid code, inactive course, or student already joined" };
        }

        return { success: true, message: "Student successfully joined the course" };

    } catch (error) {
        await dbConnection.rollback();
        console.error("Error joining course:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getCoursesByStudent = async (studentId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT curso.name, curso.description, curso.category, curso.startDate, curso.endDate, curso.state FROM Curso curso 
            INNER JOIN Curso_Student student_course ON curso.cursoId = student_course.cursoId WHERE student_course.studentUserId = ? AND state = 'Activo' `,
            [studentId]
        );
        return rows;
    } finally {
        dbConnection.release();
    }
};

const getCoursesByName = async (name) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT * FROM Curso WHERE name LIKE ?`,
            [`%${name}%`]
        );
        return rows;
    } finally {
        dbConnection.release();
    }
};

const getCoursesByCategory = async (category) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT * FROM Curso WHERE category = ?`,
            [category]
        );
        return rows;
    } finally {
        dbConnection.release();
    }
};

const getCoursesByMonth = async (year, month) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT * FROM Curso WHERE YEAR(startDate) = ? AND MONTH(startDate) = ?`,
            [year, month]
        );
        return rows;
    } finally {
        dbConnection.release();
    }
};

const getCoursesByState = async (state) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT * FROM Curso WHERE state = ?`,
            [state]
        );
        return rows;
    } finally {
        dbConnection.release();
    }
};

const removeStudentFromCourse = async (cursoId, studentUserId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [courses] = await dbConnection.execute(
            `SELECT curso.cursoId, curso.name, curso.description, curso.category, curso.startDate, curso.endDate, curso.state, curso.instructorUserId
             FROM Curso curso INNER JOIN Curso_Student curso_student ON curso.cursoId = curso_student.cursoId
             WHERE curso_student.studentUserId = ? AND state = 'Activo'`,
            [studentUserId]
        );

        return result;
    } catch (error) {
        console.error("Error removing student from course:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const updateCourseCategory = async (courseId, newCategory) => {
    const dbConnection = await connection.getConnection();
    try {
        const [result] = await dbConnection.execute(
            `UPDATE Curso SET category = ? WHERE cursoId = ?`,
            [newCategory, courseId]
        );
        return result.affectedRows > 0; // true si se actualizó, false si no
    } finally {
        dbConnection.release();
    }
};

module.exports = {createCourse, updateCourseDetails, updateCourseState, getCourseById, getAllCoursesByInstructor, joinCourse,
    getCoursesByStudent, getCoursesByName, getCoursesByCategory, getCoursesByMonth, getCoursesByState, removeStudentFromCourse,
    getCourseCategory, updateCourseCategory
};
