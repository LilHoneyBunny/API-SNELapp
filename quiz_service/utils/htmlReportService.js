const fs = require("fs");
const path = require("path");

const logoPath = path.join(__dirname, "templates/minao_logo.png");
const base64Logo = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString("base64") : "";

function compileTemplate(templateName, data) {
  const templatePath = path.join(__dirname, "../utils/templates/", templateName);
  let html = fs.readFileSync(templatePath, "utf8");
  for (const key in data) {
    const value = data[key] ?? "";
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}

function generateQuizRows(list = []) {
  return list.map(q => `
    <tr>
      <td>${q.title ?? "—"}</td>
      <td>${q.score ?? "—"}</td>
      <td>${q.date ?? "—"}</td>
      <td>${q.attempts ?? 0}</td>
    </tr>
  `).join("");
}

function ensureDataImagePrefix(base64) {
  if (!base64) return "";
  if (base64.startsWith("data:")) return base64;
  return `data:image/png;base64,${base64}`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  });
}

function generateStudentCourseHTML(data) {
  const quizRowsHtml = generateQuizRows(data.course?.quizzes || []);
  const performanceChart = ensureDataImagePrefix(data.performanceChart);
  const correctIncorrectChart = ensureDataImagePrefix(data.correctIncorrectChart);

  return compileTemplate("studentCourseTemplate.html", {
    logoBase64: base64Logo ? `data:image/png;base64,${base64Logo}` : "",
    generatedAt: data.generatedAt || new Date().toLocaleString(),
    studentName: data.student?.fullName || "Desconocido",
    studentAverage: data.student?.average ?? "N/A",
    courseName: data.course?.name || "Desconocido",
    courseCategory: data.course?.category || "N/A",
    courseStart: formatDate(data.course?.startDate) || "N/A",
    courseEnd: formatDate(data.course?.endDate) || "N/A",
    courseInstructor: data.course?.instructorName || "Desconocido",
    quizRows: quizRowsHtml,
    performanceChart,
    correctIncorrectChart,
    year: new Date().getFullYear()
  });
}

module.exports = { generateStudentCourseHTML };