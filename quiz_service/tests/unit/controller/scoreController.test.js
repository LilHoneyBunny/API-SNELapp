// quiz_service/tests/unit/controller/scoreController.test.js
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

jest.mock("../../../database/dao/scoreDAO", () => ({
  getStudentScoresInCourse: jest.fn()
}));

jest.mock("../../../service/userService", () => ({
  updateStudentAverageInUserService: jest.fn()
}));

const { getStudentScoresInCourse } = require("../../../database/dao/scoreDAO");
const { updateStudentAverageInUserService } = require("../../../service/userService");
const scoreController = require("../../../controller/scoreController");

describe("quiz_service | controller | scoreController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("updateCourseAverageForStudent", () => {
    test("faltan campos => 400", async () => {
      const req = { body: { studentUserId: 1 } };
      const res = makeRes();

      await scoreController.updateCourseAverageForStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    test("success => 200 con formattedAverage", async () => {
      getStudentScoresInCourse.mockResolvedValueOnce([10, 20]); // avg=15
      updateStudentAverageInUserService.mockResolvedValueOnce(true);

      const req = { body: { studentUserId: 7, courseId: 3 } };
      const res = makeRes();

      await scoreController.updateCourseAverageForStudent(req, res);

      expect(getStudentScoresInCourse).toHaveBeenCalledWith(7, 3);
      expect(updateStudentAverageInUserService).toHaveBeenCalledWith(7, 15);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          studentUserId: 7,
          courseId: 3,
          formattedAverage: 15
        })
      );
    });

    test("si userService no actualiza => 500", async () => {
      getStudentScoresInCourse.mockResolvedValueOnce([100]);
      updateStudentAverageInUserService.mockResolvedValueOnce(null);

      const req = { body: { studentUserId: 7, courseId: 3 } };
      const res = makeRes();

      await scoreController.updateCourseAverageForStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Failed to update student average" })
      );
    });

    test("si truena => 500", async () => {
      getStudentScoresInCourse.mockRejectedValueOnce(new Error("DB fail"));

      const req = { body: { studentUserId: 7, courseId: 3 } };
      const res = makeRes();

      await scoreController.updateCourseAverageForStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Error updating student average" })
      );
    });
  });
});
