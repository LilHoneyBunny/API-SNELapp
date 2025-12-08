const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const {getStudentById, updateStudentAverage, getStudentsWithAverageInCourse} = require("../database/dao/studentDAO");

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

const updateAverage = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { average } = req.body;
        if (average === undefined) return res.status(400).json({ success: false, message: "average required" });

        await updateStudentAverage(studentId, average);
        res.status(200).json({ success: true, message: "Average updated" });
    } catch (err) {
        console.error("updateAverage controller error:", err);
        res.status(500).json({ success: false, message: "Error updating average" });
    }
};

module.exports = {getStudent, updateAverage};