const { request, response } = require("express");
const e = require ("express");
const path = require('path');
const {createCourse} = require("../database/dao/courseDAO");
const HttpStatusCodes = require('../utils/enums');

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

module.exports = {createCurso};