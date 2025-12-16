// quiz_service/tests/unit/controller/reportController.test.js
const { makeRes } = require("../utils/mockRes");

jest.mock("../../../utils/enums", () => ({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502
}));

jest.mock("../../../utils/reportService", () => ({
  buildStudentCourseReportData: jest.fn()
}));

jest.mock("../../../utils/htmlReportService", () => ({
  generateStudentCourseHTML: jest.fn()
}));

jest.mock("../../../utils/pdfService", () => ({
  generateStudentReportPDF: jest.fn()
}));

jest.mock("../../../utils/emailService", () => ({
  sendReportEmail: jest.fn()
}));

jest.mock("../../../database/dao/reportDAO", () => ({
  fetchStudentQuizResults: jest.fn()
}));

const { buildStudentCourseReportData } = require("../../../utils/reportService");
const { generateStudentCourseHTML } = require("../../../utils/htmlReportService");
const { generateStudentReportPDF } = require("../../../utils/pdfService");
const { sendReportEmail } = require("../../../utils/emailService");
const { fetchStudentQuizResults } = require("../../../database/dao/reportDAO");

const reportController = require("../../../controller/reportController");

describe("quiz_service | controller | reportController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("getStudentCourseReport", () => {
    test("success => genera html/pdf + manda email + responde html", async () => {
      buildStudentCourseReportData.mockResolvedValueOnce({
        student: { fullName: "Juan Pérez" },
        course: { instructorEmail: "profe@minao.com" }
      });

      generateStudentCourseHTML.mockReturnValueOnce("<html>OK</html>");
      generateStudentReportPDF.mockResolvedValueOnce(true);
      sendReportEmail.mockResolvedValueOnce(true);

      const req = { params: { studentUserId: 7, cursoId: 3 } };
      const res = makeRes();

      await reportController.getStudentCourseReport(req, res);

      expect(buildStudentCourseReportData).toHaveBeenCalledWith(7, 3);
      expect(generateStudentCourseHTML).toHaveBeenCalled();
      expect(generateStudentReportPDF).toHaveBeenCalledWith("<html>OK</html>", expect.stringContaining("studentReport.pdf"));
      expect(sendReportEmail).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("<html>OK</html>");
    });

    test("si error STUDENT_SERVICE_ERROR => 502", async () => {
      buildStudentCourseReportData.mockRejectedValueOnce(new Error("STUDENT_SERVICE_ERROR: down"));

      const req = { params: { studentUserId: 7, cursoId: 3 } };
      const res = makeRes();

      await reportController.getStudentCourseReport(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Student service error" })
      );
    });
  });

  describe("getStudentQuizResults", () => {
    test("faltan params => 400", async () => {
      const req = { params: { quizId: 1 } };
      const res = makeRes();

      await reportController.getStudentQuizResults(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("sin resultados => 404", async () => {
      fetchStudentQuizResults.mockResolvedValueOnce(null);

      const req = { params: { quizId: 1, studentUserId: 2 } };
      const res = makeRes();

      await reportController.getStudentQuizResults(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Quiz results not found" })
      );
    });

    test("success => 200 con data", async () => {
      fetchStudentQuizResults.mockResolvedValueOnce({ quizId: 1, score: 90 });

      const req = { params: { quizId: 1, studentUserId: 2 } };
      const res = makeRes();

      await reportController.getStudentQuizResults(req, res);

      expect(fetchStudentQuizResults).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: { quizId: 1, score: 90 } })
      );
    });

    test("si truena => 500", async () => {
      fetchStudentQuizResults.mockRejectedValueOnce(new Error("DB fail"));

      const req = { params: { quizId: 1, studentUserId: 2 } };
      const res = makeRes();

      await reportController.getStudentQuizResults(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Error getting quiz results" })
      );
    });
  });
});
