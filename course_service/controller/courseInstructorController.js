const {getInstructorIdsInCourse} = require ("../database/dao/courseInstructorDAO");
const { getCourseById } = require('../database/dao/courseDAO');
const { getInstructorInfoFromUserService } = require('../service/userService');
const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');

const getInstructorData = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "courseId is required"
            });
        }
        const course = await getCourseById(courseId)
        const instructorId = await getInstructorIdsInCourse(courseId);
        const instructor = await getInstructorInfoFromUserService(instructorId);
        res.status(HttpStatusCodes.OK).json({
            success: true,
            courseId,
            course,
            instructor
        });
    } catch (error) {
        console.error("getInstructorData Controller Error:", err);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error obtaining instructor"
        });
    }
};

module.exports = {getInstructorData };