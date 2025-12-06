const { getStudentScoresInCourse } = require('../database/dao/scoreDAO');
const { updateStudentAverageInUserService } = require('../service/userService');
const HttpStatusCodes = require('../utils/enums');

const calculateAverage = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const sum = scores.reduce((acc, val) => acc + Number(val), 0);
    return sum / scores.length;
};

const updateCourseAverageForStudent = async (req, res) => {
    try {
        const { studentUserId, courseId } = req.body;
        if (!studentUserId || !courseId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "studentUserId and courseId are required"
            });
        }

        const scores = await getStudentScoresInCourse(studentUserId, courseId);
        const average = calculateAverage(scores);
        const formattedAverage = Number(average.toFixed(2));

        const updateResult = await updateStudentAverageInUserService(studentUserId, formattedAverage);
        if (!updateResult) {
            return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to update student average"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            studentUserId,
            courseId,
            formattedAverage
        });

    } catch (err) {
        console.error("updateCourseAverageForStudent Controller Error:", err);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error updating student average"
        });
    }
};

module.exports = { updateCourseAverageForStudent };