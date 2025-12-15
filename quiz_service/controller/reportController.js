const {buildStudentCourseReportData} = require("../utils/reportService");
const {generateStudentCourseHTML} = require("../utils/htmlReportService");
const { generateStudentReportPDF } = require("../utils/pdfService");
const { sendReportEmail } = require("../utils/emailService");
const { fetchStudentQuizResults } = require('../database/dao/reportDAO');
const HttpStatusCodes = require ("../utils/enums");
const path = require("path");

async function getStudentCourseReport(req, res) {
  try {
    const { studentUserId, cursoId } = req.params;

    const data = await buildStudentCourseReportData(studentUserId, cursoId);
    const html = generateStudentCourseHTML(data);

    const pdfPath = path.join(__dirname, "../reports/studentReport.pdf");
        await generateStudentReportPDF(html, pdfPath);

     await sendReportEmail(
            data.course.instructorEmail,
            `Reporte del estudiante ${data.student.fullName}`,
            "Se adjunta el reporte del estudiante en PDF",
            pdfPath
    );

    return res.status(HttpStatusCodes.OK).send(html);
  } catch (err) {
    console.error("getStudentCourseReport error:", err.message);

    if (err.message?.startsWith("STUDENT_SERVICE_ERROR")) {
      return res.status(HttpStatusCodes.BAD_GATEWAY).json({ error: "Student service error", detail: err.message });
    }
    if (err.message?.startsWith("COURSE_SERVICE_ERROR")) {
      return res.status(HttpStatusCodes.BAD_GATEWAY).json({ error: "Course service error", detail: err.message });
    }
    if (err.message?.startsWith("QUIZ_SERVICE_ERROR")) {
      return res.status(HttpStatusCodes.BAD_GATEWAY).json({ error: "Quiz service error", detail: err.message });
    }
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error generating student report", detail: err.message });
  }
}

const getStudentQuizResults = async (req, res) => {
    try {
        const { quizId, studentUserId } = req.params;

        if (!quizId || !studentUserId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "quizId and studentUserId are required"
            });
        }

        const result = await fetchStudentQuizResults(quizId, studentUserId);

        if (!result) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                success: false,
                message: "Quiz results not found"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error("getStudentQuizResults Controller Error:", err);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error getting quiz results"
        });
    }
};

const viewReportStudent = async (req, res) => {
  try {
    const { studentUserId, cursoId } = req.params;

    const data = await buildStudentCourseReportData(studentUserId, cursoId);
    const html = generateStudentCourseHTML(data);

    return res
      .status(HttpStatusCodes.OK)
      .set("Content-Type", "text/html")
      .send(html);
      
  } catch (error) {
    console.error("viewStudentCourseReport error:", err.message);
    return res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        error: "Error visualizing student report",
        detail: err.message
      });

  }

};
module.exports = {getStudentCourseReport, getStudentQuizResults, viewReportStudent};

