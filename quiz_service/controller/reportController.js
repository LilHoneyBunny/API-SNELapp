const {buildStudentCourseReportData} = require("../utils/reportService");
const {generateStudentCourseHTML} = require("../utils/htmlReportService");
const { generateStudentReportPDF } = require("../utils/pdfService");
const { sendReportEmail } = require("../utils/emailService");
const path = require("path");

async function getStudentCourseReport(req, res) {
  try {
    const { studentUserId, cursoId } = req.params;

    const data = await buildStudentCourseReportData(studentUserId, cursoId);
    console.log("DEBUG final report data:", {
        student: data.student,
        course: data.course,
        quizResultsLength: data.quizResults.length,
        perfChartStart: (data.performanceChart || "").slice(0,20),
        corrChartStart: (data.correctIncorrectChart || "").slice(0,20),
        instructorEmail: data.course.instructorEmail
    });
    const html = generateStudentCourseHTML(data);

    const pdfPath = path.join(__dirname, "../reports/studentReport.pdf");
        await generateStudentReportPDF(html, pdfPath);

     await sendReportEmail(
            data.course.instructorEmail,
            `Reporte del estudiante ${data.student.fullName}`,
            "Se adjunta el reporte del estudiante en PDF",
            pdfPath
    );

        
    return res.status(200).send(html);
  } catch (err) {
    console.error("getStudentCourseReport error:", err.message);

    if (err.message?.startsWith("STUDENT_SERVICE_ERROR")) {
      return res.status(502).json({ error: "Student service error", detail: err.message });
    }
    if (err.message?.startsWith("COURSE_SERVICE_ERROR")) {
      return res.status(502).json({ error: "Course service error", detail: err.message });
    }
    if (err.message?.startsWith("QUIZ_SERVICE_ERROR")) {
      return res.status(502).json({ error: "Quiz service error", detail: err.message });
    }
    return res.status(500).json({ error: "Error generating student report", detail: err.message });
  }
}


module.exports = {getStudentCourseReport};

