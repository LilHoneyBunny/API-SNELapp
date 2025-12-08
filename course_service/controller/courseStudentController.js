const {getStudentCountInCourse, getStudentIdsInCourse} = require ("../database/dao/courseStudentDAO");
const { getStudentsInfoFromUserService } = require('../service/userService');
const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');

const getCourseStudentCount = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "courseId is required"
            });
        }

        const count = await getStudentCountInCourse(courseId);

        res.status(HttpStatusCodes.OK).json({
            success: true,
            courseId,
            studentCount: count
        });
    } catch (err) {
        console.error("getCourseStudentCount Controller Error:", err);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error obtaining student count"
        });
    }
};

const getStudentsWithAverageInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "courseId is required"
            });
        }
        const studentIds = await getStudentIdsInCourse(courseId);

        const students = await getStudentsInfoFromUserService(studentIds);

        res.status(HttpStatusCodes.OK).json({
            success: true,
            courseId,
            students
        });

    } catch (err) {
        console.error("getStudentsWithAverageInCourse Controller Error:", err);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error obtaining students' averages"
        });
    }
};
module.exports = {getCourseStudentCount, getStudentsWithAverageInCourse};