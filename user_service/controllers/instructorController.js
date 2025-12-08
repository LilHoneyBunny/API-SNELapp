const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const {getInstructorById, getInstructorId} = require("../database/dao/instructorDAO");

const getInstructor = async (req, res = response) => {
    const { instructorId } = req.params;
    try {
        const result = await getInstructorById(instructorId);

        if (result.length === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                message: "Instructor not found",
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            message: "Instructor fetched successfully",
            result
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Server error. Could not fetch instructor"
        });
    }
};

const fetchInstructor = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ success: false, message: "Missing ids parameter" });

        const InstructorId = ids.split(',').map(id => parseInt(id));
        const instructor = await getInstructorId(InstructorId);

        res.status(200).json({ success: true, instructor });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error obtaining instructor" });
    }
};

module.exports = {getInstructor, fetchInstructor};