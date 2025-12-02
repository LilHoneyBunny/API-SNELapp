const { request, response } = require("express");
const e = require ("express");
const path = require('path');
const HttpStatusCodes = require('../utils/enums');
const { count } = require("console");
const {createCourse, updateCourseState, updateCourseDetails, 
    getAllCoursesByInstructor, getCourseById, joinCourse, 
    getCoursesByStudent, getCoursesByName, getCoursesByCategory, 
    getCoursesByMonth, getCoursesByState} = require("../database/dao/courseDAO");

const createCurso = async(req, res = response) => {
    const {name, description, category, startDate, endDate, state, instructorUserId}= req.body;

      if (!name || !category || !startDate || !endDate || !state || !instructorUserId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Missing required fields. Please check your input."
        });
    }

    try{
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
            message: "The course has registered successfully",
            cursoId: result.cursoId,
            joinCode: result.joinCode
        });

    }catch (error){
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new course. Try again later"
        });
    }
}

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
            statusCode:HttpStatusCodes.OK,
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

const getCourseDetailById = async (req, res = response) =>{
    const {courseId} = req.params;

    try{
        const result = await getCourseById (courseId);

        return res.status(HttpStatusCodes.OK).json({
            count: result.length,
            message:"Query executed successfully",
            result
        });
    }catch(error){
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true, 
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not fetch courses"
        });
    }
};

const getCoursesByInstructor = async (req, res = response) => {
    const {instructorId} = req.params;

    try{
        const result = await getAllCoursesByInstructor (instructorId);

        return res.status(HttpStatusCodes.OK).json({
            count: result.length,
            message: "Query executed successfully",
            result
        });
    }catch(error){
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

module.exports = {createCurso, updateCourse, setCourseState, getCourseDetailById, 
    getCoursesByInstructor, joinCurso, getCoursesByStudentController,
    getCoursesByNameController, getCoursesByCategoryController, getCoursesByMonthController, 
    getCoursesByStateController};