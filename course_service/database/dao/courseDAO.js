const connection = require("../pool");

const createCourse = async (course) => {
    const dbConnection = await connection.getConnection();
    try{
        await dbConnection.beginTransaction();
        const [courseResult] = await dbConnection.execute(
            `INSERT INTO Curso (name, description, category, startDate, endDate, state, instructorUserId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [course.name, course.description, course.category, course.startDate, course.endDate, course.state, course.instructorUserId]
        );

        const cursoId = courseResult.insertId;

        await dbConnection.commit();

        return { success: true, cursoId };

    }catch(error){
        await dbConnection.rollback();
        console.error("Course creating error:", error);
        throw error;
    }finally{
        dbConnection.release();
    }
}

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
    try{
        const [rows] = await dbConnection.execute(
            `SELECT name, description, category, startDate, endDate, state FROM Curso WHERE cursoId = ?`,
            [cursoId]
        );

        return rows;
    }catch(error){
        console.error("Error fetching course by ID:", error);
        throw error;
    }finally{
        dbConnection.release();
    }
};

const getAllCoursesByInstructor = async (instructorUserId) => {
    const dbConnection = await connection.getConnection();  
    try{
        const [rows] = await dbConnection.execute(
            `SELECT name, description, category, startDate, endDate, state FROM Curso WHERE instructorUserId = ? AND state = 'Inactivo' `,
            [instructorUserId]
        );

        return rows;
    }catch(error){
        console.error("Error fetching instructor courses:", error);
        throw error;
    }finally{
        dbConnection.release();
    }
};

module.exports = {createCourse, updateCourseDetails, updateCourseState, getCourseById, getAllCoursesByInstructor}