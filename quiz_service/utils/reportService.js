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
    console.log("DEBUG studentInfoRaw:", studentInfoRaw);

    const studentObj = Array.isArray(studentInfoRaw)
      ? studentInfoRaw[0]
      : (studentInfoRaw || {});

    const student = {
      fullName: studentObj?.name || studentObj?.fullName || "Desconocido",
      average: studentObj?.average ?? studentObj?.avg ?? "N/A"
    };

    const courseInfoRaw = await fetchCourseInfo(courseId);
    console.log("DEBUG courseInfoRaw:", courseInfoRaw);

    let courseData = null;

    if (courseInfoRaw?.result && Array.isArray(courseInfoRaw.result)) {
      courseData = courseInfoRaw.result[0];
    } else if (courseInfoRaw?.course && Array.isArray(courseInfoRaw.course)) {
      courseData = courseInfoRaw.course[0];
    } else if (Array.isArray(courseInfoRaw)) {
      courseData = courseInfoRaw[0];
    } else if (typeof courseInfoRaw === "object") {
      courseData = courseInfoRaw;
    }

    const instructorArr = ensureArray(courseInfoRaw?.instructor || courseInfoRaw?.instructors);

    const course = {
      name: courseData?.name || "Desconocido",
      category: courseData?.category || "N/A",
      startDate: courseData?.startDate || null,
      endDate: courseData?.endDate || null,
      instructorName:
        instructorArr?.[0]?.name ||
        courseData?.instructorName ||
        "Desconocido",
      instructorEmail:
        instructorArr?.[0]?.email ||
        courseData?.instructorEmail ||
        null,
      quizzes: ensureArray(courseData?.quizzes || courseInfoRaw?.quizzes)
    };

    const quizResults = [];
    const hasQuizzes = quizResults.length > 0;

    for (const quiz of course.quizzes) {
      const res = await fetchStudentQuizResults(quiz.quizId, studentId);
      if (res) quizResults.push(res);
    }

    console.log("DEBUG quizResults length:", quizResults.length);

    const performanceDataUrl = await createPerformanceChart(quizResults);
    const correctIncorrectDataUrl = await createCorrectIncorrectChart(quizResults);

    function normalizeDataUrl(dataUrl) {
      if (!dataUrl) return "";
      if (dataUrl.startsWith("data:")) {
        return dataUrl.slice(dataUrl.indexOf(",") + 1);
      }
      return dataUrl;
    }

    const performanceChart = normalizeDataUrl(performanceDataUrl);
    const correctIncorrectChart = normalizeDataUrl(correctIncorrectDataUrl);

    return {
      student,
      course: {
        ...course,
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
