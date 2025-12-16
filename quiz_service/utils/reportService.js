const { fetchStudentInfo, fetchCourseInfo, fetchStudentQuizResults } = require("../database/dao/reportDAO");
const { createPerformanceChart, createCorrectIncorrectChart } = require('./reportCharts');

function ensureArray(x) { return Array.isArray(x) ? x : (x ? [x] : []); }

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  });
}

async function buildStudentCourseReportData(studentId, courseId) {
  try {
    const studentInfoRaw = await fetchStudentInfo(studentId);
    console.log("studentInfoRaw:", studentInfoRaw);
    const studentObj = Array.isArray(studentInfoRaw) ? studentInfoRaw[0] : (studentInfoRaw || {});
    const student = {
      fullName: studentObj?.name || studentObj?.fullName || "Desconocido",
      average: studentObj?.average ?? studentObj?.avg ?? "N/A"
    };

   const courseInfoRaw = await fetchCourseInfo(courseId);
   const courseData = courseInfoRaw?.course || courseInfoRaw || {};

    const instructorArr = ensureArray(courseInfoRaw?.instructor || courseInfoRaw?.instructors);
    const course = {
      name: courseData?.name || "Desconocido",
      category: courseData?.category || "N/A",
      startDate: courseData?.startDate || null,
      endDate: courseData?.endDate || null,
      instructorName: instructorArr?.[0]?.name || courseData?.instructorName || "Desconocido",
      instructorEmail: instructorArr?.[0]?.email || courseData?.instructorEmail || null
    };

    const quizResults = await fetchStudentQuizResults(courseId, studentId);

    const normalizedQuizResults = quizResults.map(res => ({
      title: res.title || "Cuestionario",
      score: parseFloat(res.scoreObtained || 0),
      correct: res.questions?.filter(q => q.earnedPoints === q.points).length || 0,
      incorrect: res.questions?.filter(q => q.earnedPoints < q.points).length || 0,
      date: formatDate(res.creationDate),
      attempts: res.attemptNumber || 0
    }));


    const performanceChart = await createPerformanceChart(normalizedQuizResults);
    const correctIncorrectChart = await createCorrectIncorrectChart(normalizedQuizResults);

    const hasQuizzes = quizResults.length > 0;

    return {
      student,
      course: {
        ...course,
        quizzes: normalizedQuizResults,
        startDateFormatted: formatDate(course.startDate),
        endDateFormatted: formatDate(course.endDate)
      },
      quizResults, 
      performanceChart,
      correctIncorrectChart,
      generatedAt: new Date().toLocaleString(),
      courseStart: formatDate(course.startDate),
      courseEnd: formatDate(course.endDate),
      hasQuizzes
    };

  } catch (err) {
    console.error("buildStudentCourseReportData error:", err);
    throw err;
  }
}

module.exports = { buildStudentCourseReportData };