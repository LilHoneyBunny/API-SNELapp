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

// Formatea fecha a DD/MM/YYYY
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
  const performanceChart = ensureDataImagePrefix(data.performanceChart);
  const correctIncorrectChart = ensureDataImagePrefix(data.correctIncorrectChart);

  let quizSectionHtml = '';
  if (data.hasQuizzes && (data.quizResults || []).length > 0) {
    const quizRowsHtml = generateQuizRows(data.course?.quizzes || []);
    quizSectionHtml = `
      <div class="section">
        <h2>Pruebas Realizadas</h2>
        <table class="quiz-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Puntos obtenidos</th>
              <th>Fecha</th>
              <th>Intentos</th>
            </tr>
          </thead>
          <tbody>
            ${quizRowsHtml}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Evolución del Desempeño</h2>
        <p><strong>Correctas vs Incorrectas</strong></p>
        <img class="chart" src="${correctIncorrectChart}" />
        <p><strong>Desempeño en el tiempo</strong></p>
        <img class="chart" src="${performanceChart}" />
      </div>
    `;
  } else {
    quizSectionHtml = `
      <div class="section">
        <h2>Pruebas Realizadas</h2>
        <p>No hay cuestionarios registrados para este curso.</p>
      </div>
    `;
  }

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
    quizSection: quizSectionHtml, 
    year: new Date().getFullYear()
  });
}

module.exports = { generateStudentCourseHTML };
