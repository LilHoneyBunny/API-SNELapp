const { request, response } = require("express");
const e = require ("express");
const path = require('path');
const HttpStatusCodes = require('../utils/enums');
const { count } = require("console");
const {getStudentById} = require("../database/dao/studentDAO");

const getStudent = async (req, res = response) => {
    const { studentId } = req.params;
    try {
        const result = await getStudentById(studentId);

        if (result.length === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                message: "Student not found",
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            message: "Student fetched successfully",
            result
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not fetch student"
        });
    }
};

module.exports = {getStudent};