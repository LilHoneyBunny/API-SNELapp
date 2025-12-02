const { request, response } = require("express");
const e = require ("express");
const path = require('path');
const {createCourse, updateCourseState, updateCourseDetails, getAllCoursesByInstructor, getCourseById} = require("../database/dao/courseDAO");
const HttpStatusCodes = require('../utils/enums');
const { count } = require("console");

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
            cursoId: result.cursoId
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

module.exports = {createCurso, updateCourse, setCourseState, getCourseDetailById, getCoursesByInstructor};