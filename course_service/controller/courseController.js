// courseController.js
const { request, response } = require("express");
const HttpStatusCodes = require("../utils/enums");

const {
  createCourse,
  getCourseById,
  getAllCoursesByInstructor,
  updateCourseDetails,
  updateCourseState,
  getCoursesByStudent,
  getCoursesByName,
  getCoursesByCategory,
  getCoursesByMonth,
  getCoursesByState,
  joinCourse,
  deleteStudentFromCourse,
  getCourseCategory,
  updateCourseCategory,
} = require("../database/dao/courseDAO");

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * Create course
 */
const createCurso = async (req, res = response) => {
  const { name, description, category, startDate, endDate, state, instructorUserId } = req.body;

  if (!name || !startDate || !endDate || !instructorUserId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Missing required fields: name, startDate, endDate, instructorUserId",
    });
  }

  try {
    const result = await createCourse({ name, description, category, startDate, endDate, state, instructorUserId });
    return res.status(HttpStatusCodes.CREATED).json({
      message: "The course has been registered successfully",
      cursoId: result.cursoId,
    });
  } catch (error) {
    console.error("createCurso controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Error creating new course. Try again later",
    });
  }
};

/**
 * Update course details
 */
const updateCourse = async (req, res = response) => {
  const { cursoId, name, description, category, endDate } = req.body;

  if (!cursoId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Course ID is required",
    });
  }

  try {
    const result = await updateCourseDetails(cursoId, { name, description, category, endDate });

    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        statusCode: HttpStatusCodes.NOT_FOUND,
        details: "Course not found",
      });
    }

    if (!result.updated) {
      // reason could be no_changes
      if (result.reason === "no_changes" || result.updated === false) {
        return res.status(HttpStatusCodes.OK).json({
          statusCode: HttpStatusCodes.OK,
          message: "No changes were applied to the course",
          previous: result.previous,
        });
      }
    }

    return res.status(HttpStatusCodes.OK).json({
      statusCode: HttpStatusCodes.OK,
      message: "Course updated successfully",
      updatedFields: result.updatedFields,
      current: result.current,
    });
  } catch (error) {
    console.error("updateCourse controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Server error. Could not update course",
    });
  }
};

/**
 * Set course state
 */
const setCourseState = async (req, res = response) => {
  const { cursoId, state } = req.body;

  if (!cursoId || typeof state !== "string") {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Course ID and state are required",
    });
  }

  try {
    const result = await updateCourseState(cursoId, state);

    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        statusCode: HttpStatusCodes.NOT_FOUND,
        details: "Course not found",
      });
    }

    if (!result.updated) {
      if (result.reason === "invalid_state") {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          error: true,
          statusCode: HttpStatusCodes.BAD_REQUEST,
          details: "Invalid state. Allowed: Activo, Inactivo",
        });
      } else if (result.reason === "same_state") {
        return res.status(HttpStatusCodes.OK).json({
          statusCode: HttpStatusCodes.OK,
          message: `Course already has state '${result.previousState}'`,
        });
      } else {
        return res.status(HttpStatusCodes.OK).json({
          statusCode: HttpStatusCodes.OK,
          message: "No state change applied",
        });
      }
    }

    return res.status(HttpStatusCodes.OK).json({
      statusCode: HttpStatusCodes.OK,
      message: `Course state updated to ${result.newState}`,
      previousState: result.previousState,
      newState: result.newState,
    });
  } catch (error) {
    console.error("setCourseState controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Server error. Could not update course state",
    });
  }
};

/**
 * Get course detail by id
 */
const getCourseDetailById = async (req, res = response) => {
  const { courseId } = req.params;

  const id = parseInt(courseId, 10);
  if (!id) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Invalid courseId",
    });
  }

  try {
    const result = await getCourseById(id);
    if (!result) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        statusCode: HttpStatusCodes.NOT_FOUND,
        details: "Course not found",
      });
    }
    return res.status(HttpStatusCodes.OK).json({
      count: 1,
      message: "Query executed successfully",
      result,
    });
  } catch (error) {
    console.error("getCourseDetailById controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Server error. Could not fetch course",
    });
  }
};

/**
 * Get courses by instructor
 */
const getCoursesByInstructor = async (req, res = response) => {
  const { instructorId } = req.params;

  const id = parseInt(instructorId, 10);
  if (!id) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Invalid instructorId",
    });
  }

  try {
    const result = await getAllCoursesByInstructor(id);
    return res.status(HttpStatusCodes.OK).json({
      count: result.length,
      message: "Query executed successfully",
      result,
    });
  } catch (error) {
    console.error("getCoursesByInstructor controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Server error. Could not fetch courses",
    });
  }
};

/**
 * Join course (by cursoId)
 * Body: { studentUserId, cursoId }
 */
const joinCurso = async (req, res = response) => {
  const { studentUserId, cursoId } = req.body;
  if (!studentUserId || !cursoId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing studentUserId or cursoId",
    });
  }

  const sId = parseInt(studentUserId, 10);
  const cId = parseInt(cursoId, 10);
  if (!sId || !cId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Invalid studentUserId or cursoId",
    });
  }

  try {
    const result = await joinCourse(sId, cId);
    if (!result.success) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: true,
        details: result.message,
      });
    }
    return res.status(HttpStatusCodes.OK).json({
      message: result.message,
    });
  } catch (error) {
    console.error("joinCurso controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Error joining the course. Try again later",
    });
  }
};

/**
 * Unenroll student from course (two endpoints supported)
 * - unenrollStudentFromCourse: params courseId, studentId
 * - deleteStudentFromCourse: params studentId, courseId (keeps naming from prior)
 */
const unenrollStudentFromCourse = async (req, res = response) => {
  const { courseId, studentId } = req.params;
  const cId = parseInt(courseId, 10);
  const sId = parseInt(studentId, 10);

  if (!cId || !sId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Course and student are required",
    });
  }

  try {
    const result = await deleteStudentFromCourse(sId, cId);
    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        statusCode: HttpStatusCodes.NOT_FOUND,
        details: "Enrollment not found for this course and student",
      });
    }
    return res.status(HttpStatusCodes.OK).json({
      statusCode: HttpStatusCodes.OK,
      message: "Student removed from course successfully",
    });
  } catch (error) {
    console.error("unenrollStudentFromCourse controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Server error. Could not remove student from course",
    });
  }
};

const deleteStudentFromCourseController = async (req, res = response) => {
  const { studentId, courseId } = req.params;
  const sId = parseInt(studentId, 10);
  const cId = parseInt(courseId, 10);

  if (!sId || !cId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: "Invalid params" });
  }

  try {
    const result = await deleteStudentFromCourse(sId, cId);
    if (!result.found) {
      return res.status(404).json({ message: "Student is not enrolled in this course." });
    }
    return res.status(200).json({ message: "Student successfully removed from the course." });
  } catch (error) {
    console.error("deleteStudentFromCourseController error:", error);
    return res.status(500).json({ message: "Error removing student from the course" });
  }
};

/**
 * Get courses by name/category/month/state
 */
const getCoursesByNameController = async (req, res = response) => {
  const { name } = req.query;
  if (!name) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Missing 'name' query parameter" });
  }
  try {
    const courses = await getCoursesByName(name);
    return res.status(HttpStatusCodes.OK).json({ courses });
  } catch (error) {
    console.error("getCoursesByNameController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, details: "Error fetching courses by name" });
  }
};

const getCoursesByCategoryController = async (req, res = response) => {
  const { category } = req.query;
  if (!category) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Missing 'category' query parameter" });
  }
  try {
    const courses = await getCoursesByCategory(category);
    return res.status(HttpStatusCodes.OK).json({ courses });
  } catch (error) {
    console.error("getCoursesByCategoryController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, details: "Error fetching courses by category" });
  }
};

const getCoursesByStudentController = async (req, res = response) => {
  const { studentId } = req.params;
  const sId = parseInt(studentId, 10);
  if (!sId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Missing or invalid studentId" });
  }
  try {
    const courses = await getCoursesByStudent(sId);
    // Return 200 with possibly empty array — better UX for clients
    return res.status(HttpStatusCodes.OK).json({ courses });
  } catch (error) {
    console.error("getCoursesByStudentController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, details: "Error fetching courses. Try again later" });
  }
};

const getCoursesByMonthController = async (req, res = response) => {
  const { year, month } = req.query;
  if (!year || !month) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Missing 'year' or 'month' query parameter" });
  }
  try {
    const { error, rows } = await getCoursesByMonth(year, month);
    if (error) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Invalid year or month" });
    }
    return res.status(HttpStatusCodes.OK).json({ courses: rows });
  } catch (error) {
    console.error("getCoursesByMonthController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, details: "Error fetching courses by month" });
  }
};

const getCoursesByStateController = async (req, res = response) => {
  const { state } = req.query;
  if (!state) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Missing 'state' query parameter" });
  }
  try {
    const { error, rows } = await getCoursesByState(state);
    if (error) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ error: true, details: "Invalid state. Allowed: Activo, Inactivo" });
    }
    return res.status(HttpStatusCodes.OK).json({ courses: rows });
  } catch (error) {
    console.error("getCoursesByStateController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, details: "Error fetching courses by state" });
  }
};

/**
 * Category endpoints
 */
const getCategory = async (req, res) => {
  const { cursoId } = req.params;
  const id = parseInt(cursoId, 10);
  if (!id) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: "Invalid cursoId" });
  }

  try {
    const categoryRow = await getCourseCategory(id);
    if (!categoryRow) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({ message: "Course not found" });
    }
    res.json({ cursoId: id, category: categoryRow.category });
  } catch (error) {
    console.error("getCategory controller error:", error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

const modifyCategory = async (req, res) => {
  const { cursoId } = req.params;
  const { category } = req.body;
  const id = parseInt(cursoId, 10);
  if (!id || !category) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({ message: "Invalid params" });
  }

  try {
    const result = await updateCourseCategory(id, category);
    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({ message: "Course not found" });
    }
    if (!result.updated) {
      return res.status(HttpStatusCodes.OK).json({ message: "No change: same category or invalid", previous: result.previous });
    }
    return res.json({ message: "Category updated successfully", cursoId: id, category });
  } catch (error) {
    console.error("modifyCategory controller error:", error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

module.exports = {
  createCurso,
  updateCourse,
  setCourseState,
  getCourseDetailById,
  getCoursesByInstructor,
  joinCurso,
  getCoursesByStudentController,
  getCoursesByNameController,
  getCoursesByCategoryController,
  getCoursesByMonthController,
  getCoursesByStateController,
  deleteStudentFromCourse: deleteStudentFromCourseController,
  deactivateCourse: async (req, res) => {
    // Small wrapper that reuses setCourseState to set Inactivo
    req.body = req.body || {};
    req.body.cursoId = req.params.id || req.body.cursoId;
    req.body.state = "Inactivo";
    return setCourseState(req, res);
  },
  unenrollStudentFromCourse,
  getCategory,
  modifyCategory,
};
