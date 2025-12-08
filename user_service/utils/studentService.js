const { getStudentReportInfoDAO } = require("../database/dao/studentDAO");

async function getStudentReportInfo(studentId) {
    try {
        const student = await getStudentReportInfoDAO(studentId);
        return student;
    } catch (error) {
        console.error("Error in studentService:", error);
        throw error; 
    }
}

module.exports = { getStudentReportInfo };