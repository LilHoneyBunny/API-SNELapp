const { request, response } = require("express");
const { createCourse, updateCourseState, updateCourseDetails, getAllCoursesByInstructor, getCourseById, removeStudentFromCourse,
    joinCourse, getCoursesByStudent, getCoursesByName, getCoursesByCategory, getCoursesByMonth, getCoursesByState,
    getCourseCategory, updateCourseCategory } = require("../database/dao/courseDAO");
const HttpStatusCodes = require('../utils/enums');


const createCurso = async(req, res = response) => {
    const { name, description, category, startDate, endDate, state, instructorUserId } = req.body;

      if (!name || !category || !startDate || !endDate || !state || !instructorUserId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Missing required fields. Please check your input."
            });
        }

    try {
        const result = await createCourse({
            name,
            description,
            category,
            startDate,
            endDate,
            state,
            instructorUserId
        });
        return res.status(HttpStatusCodes.CREATED).json({
            message: "The course has been registered successfully",
            cursoId: result.cursoId,
            joinCode: result.joinCode
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new course. Try again later"
        });
    }
};

const updateCourse = async (req, res = response) => {
    const { cursoId, name, description, category, endDate } = req.body;

    if (!cursoId) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Course ID is required"
        });
    }

    try {
        const result = await updateCourseDetails(cursoId, { name, description, category, endDate });

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Course not found"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            statusCode: HttpStatusCodes.OK,
            message: "Course updated successfully"
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not update course"
        });
    }
};

const setCourseState = async (req, res = response) => {
    const { cursoId, state } = req.body;
    if (!cursoId || !state) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Course ID and state are required"
        });
    }
    try {
        const result = await updateCourseState(cursoId, state);

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Course not found"
            });
        }
        return res.status(HttpStatusCodes.OK).json({
            message: `Course state updated to ${state}`
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not update course state"
        });
    }
};

const getCourseDetailById = async (req, res = response) => {
    const { courseId } = req.params;

    try {
        const result = await getCourseById(courseId);

        return res.status(HttpStatusCodes.OK).json({
            count: result.length,
            message: "Query executed successfully",
            result
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true, 
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not fetch course"
        });
    }
};

const getCoursesByInstructor = async (req, res = response) => {
    const { instructorId } = req.params;

    try {
        const result = await getAllCoursesByInstructor(instructorId);

        return res.status(HttpStatusCodes.OK).json({
            count: result.length,
            message: "Query executed successfully",
            result
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR, 
            details: "Server error. Could not fetch courses"
        });
    }
};

const joinCurso = async (req, res = response) => {
    const { studentUserId, joinCode } = req.body;

    if (!studentUserId || !joinCode) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            details: "Missing studentUserId or joinCode"
        });
    }

    try {
        const result = await joinCourse(studentUserId, joinCode);

        if (!result.success) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                details: result.message
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            message: result.message
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            details: "Error joining the course. Try again later"
        });
    }
};

// Unenroll student from course
const unenrollStudentFromCourse = async (req, res = response) => {
    const { courseId, studentId } = req.params;

    if (!courseId || !studentId) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Course and student are required"
        });
    }

    try {
        const result = await removeStudentFromCourse(courseId, studentId);

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Enrollment not found for this course and student"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            statusCode: HttpStatusCodes.OK,
            message: "Student removed from course successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not remove student from course"
        });
    }
};


const getCoursesByNameController = async (req, res = response) => {
    const { name } = req.query;

    if (!name) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            details: "Missing 'name' query parameter"
        });
    }

    try {
        const courses = await getCoursesByName(name);

        return res.status(HttpStatusCodes.OK).json({ courses });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            details: "Error fetching courses by name"
        });
    }
};


const getCoursesByCategoryController = async (req, res = response) => {
    const { category } = req.query;

    if (!category) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            details: "Missing 'category' query parameter"
        });
    }

    try {
        const courses = await getCoursesByCategory(category);

        return res.status(HttpStatusCodes.OK).json({ courses });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            details: "Error fetching courses by category"
        });
    }
};


const deactivateCourse = async (req, res = response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Course ID is required"
        });
    }

    try {
        const result = await updateCourseState(id, "Inactivo");

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Course not found"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            statusCode: HttpStatusCodes.OK,
            message: "Course deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not deactivate course"
        });
    }
};


const getCoursesByStudentController = async (req, res = response) => {
    const { studentId } = req.params;

    if (!studentId) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            details: "Missing studentId"
        });
    }

    try {
        const courses = await getCoursesByStudent(studentId);

        if (courses.length === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                details: "No courses found for this student"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            courses
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            details: "Error fetching courses. Try again later"
        });
    }
};

const getCoursesByMonthController = async (req, res = response) => {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            details: "Missing 'year' or 'month' query parameter"
        });
    }

    try {
        const courses = await getCoursesByMonth(parseInt(year), parseInt(month));

        return res.status(HttpStatusCodes.OK).json({ courses });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            details: "Error fetching courses by month"
        });
    }
};

const getCoursesByStateController = async (req, res = response) => {
    const { state } = req.query;

    if (!state || !["Activo","Inactivo"].includes(state)) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            details: "Missing or invalid 'state' query parameter"
        });
    }

    try {
        const courses = await getCoursesByState(state);

        return res.status(HttpStatusCodes.OK).json({ courses });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            details: "Error fetching courses by state"
        });
    }
};

const deleteStudentFromCourse = async (req, res) => {
    const { studentId, courseId } = req.params;  // Obtener el ID del estudiante y del curso de los parámetros de la URL

    const dbConnection = await connection.getConnection();

    try {
        // Comprobar si el estudiante está inscrito en el curso
        const [enrollmentCheck] = await dbConnection.execute(
            `SELECT * FROM Enrollments WHERE studentId = ? AND courseId = ?`,
            [studentId, courseId]
        );

        if (enrollmentCheck.length === 0) {
            return res.status(404).json({ message: "Student is not enrolled in this course." });
        }

        // Eliminar al estudiante del curso
        await dbConnection.execute(
            `DELETE FROM Enrollments WHERE studentId = ? AND courseId = ?`,
            [studentId, courseId]
        );

        return res.status(200).json({ message: "Student successfully removed from the course." });
    } catch (error) {
        console.error("Error removing student from course:", error);
        return res.status(500).json({ message: "Error removing student from the course." });
    } finally {
        dbConnection.release();
    }
};

const getCategory = async (req, res) => {
    const { cursoId } = req.params;
    try {
        const category = await getCourseCategory(cursoId);
        if (!category) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json({ cursoId, category: category.category });
    } catch (error) {
        console.error("Error obtaining category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const modifyCategory = async (req, res) => {
    const { cursoId } = req.params;
    const { category } = req.body;
    try {
        const updated = await updateCourseCategory(cursoId, category);
        if (!updated) {
            return res.status(404).json({ message: "Course not found or same category" });
        }
        res.json({ message: "Category updated successfully", cursoId, category });
    } catch (error) {
        console.error("Error modifying category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createCurso, updateCourse, setCourseState, getCourseDetailById, getCoursesByInstructor, joinCurso, getCoursesByStudentController, getCoursesByNameController, 
    getCoursesByCategoryController, getCoursesByMonthController, getCoursesByStateController, deleteStudentFromCourse, deactivateCourse, unenrollStudentFromCourse,
    getCategory,modifyCategory};
