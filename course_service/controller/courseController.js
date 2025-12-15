// courseController.js
const { request, response } = require("express");
const axios = require("axios");
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

const {
  createCourse,
  updateCourseState,
  updateCourseDetails,
  getAllCoursesByInstructor,
  getAllCourses,
  getCourseById,
  joinCourse,
  deleteStudentFromCourse,
  getCoursesByStudent,
  getCoursesByName,
  getCoursesByCategory,
  getCoursesByMonth,
  getCoursesByState,
  getCourseCategory,
  updateCourseCategory,
  getCourseReportInfoDAO
} = require("../database/dao/courseDAO");

const HttpStatusCodes = require("../utils/enums");

/* -------------------------------------
   Create course
--------------------------------------*/
const createCurso = async (req, res = response) => {
  const { name, description, category, startDate, endDate, state, instructorUserId } = req.body;

  if (!name || !startDate || !endDate || !instructorUserId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Missing required fields: name, startDate, endDate, instructorUserId"
    });
  }

  try {
    const result = await createCourse({
      name,
      description,
      category,
      startDate,
      endDate,
      state,
      instructorUserId
    });

    return res.status(HttpStatusCodes.CREATED).json({
      message: "The course has been registered successfully",
      cursoId: result.cursoId
    });
  } catch (error) {
    console.error("createCurso controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Error creating new course. Try again later"
    });
  }
};

/* -------------------------------------
   Update course
--------------------------------------*/
const updateCourse = async (req, res = response) => {
  const { cursoId, name, description, category, endDate } = req.body;

  if (!cursoId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      statusCode: HttpStatusCodes.BAD_REQUEST,
      details: "Course ID is required"
    });
  }

  try {
    const result = await updateCourseDetails(cursoId, { name, description, category, endDate });

    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        statusCode: HttpStatusCodes.NOT_FOUND,
        details: "Course not found"
      });
    }

    if (!result.updated) {
      return res.status(HttpStatusCodes.OK).json({
        statusCode: HttpStatusCodes.OK,
        message: "No changes were applied",
        previous: result.previous
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      statusCode: HttpStatusCodes.OK,
      message: "Course updated successfully",
      updatedFields: result.updatedFields,
      current: result.current
    });
  } catch (error) {
    console.error("updateCourse controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      details: "Server error. Could not update course"
    });
  }
};

/* -------------------------------------
   Set Course State
--------------------------------------*/
const setCourseState = async (req, res = response) => {
  const { cursoId, state } = req.body;

  if (!cursoId || typeof state !== "string") {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing cursoId or state"
    });
  }

  try {
    const result = await updateCourseState(cursoId, state);

    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        details: "Course not found"
      });
    }

    if (!result.updated) {
      if (result.reason === "invalid_state") {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          error: true,
          details: "Invalid state. Allowed: Activo, Inactivo"
        });
      }

      if (result.reason === "same_state") {
        return res.status(HttpStatusCodes.OK).json({
          message: `Course already has state '${result.previousState}'`
        });
      }

      return res.status(HttpStatusCodes.OK).json({
        message: "No change in state"
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      message: `Course state updated to ${result.newState}`
    });
  } catch (error) {
    console.error("setCourseState controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

/* -------------------------------------
   Get Course by ID
--------------------------------------*/
const getCourseDetailById = async (req, res = response) => {
  const { courseId } = req.params;
  const id = parseInt(courseId, 10);

  if (!id) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Invalid courseId"
    });
  }

  try {
    const result = await getCourseById(id);

    if (!result) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        details: "Course not found"
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      count: 1,
      message: "Query executed successfully",
      result
    });
  } catch (error) {
    console.error("getCourseDetailById controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

const getAllCoursesController = async (req, res = response) => {
  try {
    const courses = await getAllCourses();

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      count: courses.length,
      data: courses
    });

  } catch (error) {
    console.error("getAllCoursesController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};


/* -------------------------------------
   Get Courses by Instructor
--------------------------------------*/
const getCoursesByInstructorJSON = async (req, res = response) => {
  const { instructorId } = req.params;
  const id = parseInt(instructorId, 10);

  if (!id) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Invalid instructorId"
    });
  }

  try {
    const result = await getAllCoursesByInstructor(id);
    return res.status(HttpStatusCodes.OK).json({
      count: result.length,
      message: "Query executed successfully",
      result
    });
  } catch (error) {
    console.error("getCoursesByInstructor controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

const getCoursesByInstructor = async (req, res = response) => {
    const { instructorId } = req.params;

    try {
        const result = await getAllCoursesByInstructor(instructorId);

        return res.status(HttpStatusCodes.OK).json({
            count: result.length,
            message: "Query executed successfully",
            result
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR, 
            details: "Server error. Could not fetch courses"
        });
    }
};

/* -------------------------------------
   Join Course
--------------------------------------*/
const joinCurso = async (req, res = response) => {
  const { studentUserId, cursoId } = req.body;

  if (!studentUserId || !cursoId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing studentUserId or cursoId"
    });
  }

  try {
    const result = await joinCourse(studentUserId, cursoId);

    if (!result.success) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: true,
        details: result.message
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      message: result.message
    });
  } catch (error) {
    console.error("joinCurso controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

/* -------------------------------------
   Remove Student From Course
--------------------------------------*/
const unenrollStudentFromCourse = async (req, res = response) => {
  const { courseId, studentId } = req.params;

  const cId = parseInt(courseId, 10);
  const sId = parseInt(studentId, 10);

  if (!cId || !sId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Invalid params"
    });
  }

  try {
    const result = await deleteStudentFromCourse(sId, cId);

    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        error: true,
        details: "Enrollment not found"
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      message: "Student removed successfully"
    });
  } catch (error) {
    console.error("unenrollStudentFromCourse controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};




/* -------------------------------------
   Queries
--------------------------------------*/
const getCoursesByStudentController = async (req, res = response) => {
  const { studentId } = req.params;

  const sId = parseInt(studentId, 10);

  if (!sId) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Invalid studentId"
    });
  }

  try {
    const courses = await getCoursesByStudent(sId);

    // Aquí aseguramos que la respuesta esté en el formato correcto
    return res.status(HttpStatusCodes.OK).json({
      success: true,        // Aseguramos que incluimos "success" como indicador
      data: courses         // Cambiamos "courses" a "data" para que coincida con lo que espera el frontend
    });
  } catch (error) {
    console.error("getCoursesByStudentController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};


const getCoursesByNameController = async (req, res = response) => {
  const { name } = req.query;

  if (!name) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing 'name' parameter"
    });
  }

  try {
    const courses = await getCoursesByName(name);
    return res.status(HttpStatusCodes.OK).json({ courses });
  } catch (error) {
    console.error("getCoursesByNameController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

const getCoursesByCategoryController = async (req, res = response) => {
  const { category } = req.query;

  if (!category) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing 'category' parameter"
    });
  }

  try {
    const courses = await getCoursesByCategory(category);
    return res.status(HttpStatusCodes.OK).json({ courses });
  } catch (error) {
    console.error("getCoursesByCategoryController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

const getCoursesByMonthController = async (req, res = response) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing 'year' or 'month'"
    });
  }

  try {
    const result = await getCoursesByMonth(year, month);

    if (result.error) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: true,
        details: "Invalid year or month"
      });
    }

    return res.status(HttpStatusCodes.OK).json({ courses: result.rows });
  } catch (error) {
    console.error("getCoursesByMonthController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

const getCoursesByStateController = async (req, res = response) => {
  const { state } = req.query;

  if (!state) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: true,
      details: "Missing 'state'"
    });
  }

  try {
    const result = await getCoursesByState(state);

    if (result.error) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: true,
        details: "Invalid state"
      });
    }

    return res.status(HttpStatusCodes.OK).json({ courses: result.rows });
  } catch (error) {
    console.error("getCoursesByStateController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: true,
      details: "Server error"
    });
  }
};

/* -------------------------------------
   Category Endpoints
--------------------------------------*/
const getCategory = async (req, res) => {
  const { cursoId } = req.params;
  const id = parseInt(cursoId, 10);

  if (!id) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      message: "Invalid cursoId"
    });
  }

  try {
    const categoryRow = await getCourseCategory(id);

    if (!categoryRow) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        message: "Course not found"
      });
    }

    return res.json({ cursoId: id, category: categoryRow.category });
  } catch (error) {
    console.error("getCategory controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

const modifyCategory = async (req, res) => {
  const { cursoId } = req.params;
  const { category } = req.body;
  const id = parseInt(cursoId, 10);

  if (!id || !category) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      message: "Invalid params"
    });
  }

  try {
    const result = await updateCourseCategory(id, category);

    if (!result.found) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        message: "Course not found"
      });
    }

    if (!result.updated) {
      return res.status(HttpStatusCodes.OK).json({
        message: "No change",
        previous: result.previous
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      message: "Category updated successfully",
      cursoId: id,
      category
    });
  } catch (error) {
    console.error("modifyCategory controller error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error"
    });
  }
};

/* -------------------------------------
   Course Report (from dev branch)
--------------------------------------*/
const getCourseReportInfo = async (req, res) => {
  const { courseId } = req.params;

  try {
    const courseData = await getCourseReportInfoDAO(courseId);

    if (!courseData) {
      return res.status(404).json({ error: "Course not found" });
    }

    let instructorData = {};

    if (courseData.instructorUserId) {
      try {
        const response = await axios.get(`${USERS_SERVICE_URL}/${courseData.instructorUserId}`);
        instructorData = response.data.result[0];
      } catch (err) {
        console.error("Error fetching instructor info:", err.message);
        instructorData = {
          userName: "Unknown",
          paternalSurname: "",
          maternalSurname: "",
          biography: "",
          titleName: ""
        };
      }
    }

    const fullCourseReport = {
      ...courseData,
      instructor: instructorData
    };

    return res.json(fullCourseReport);
  } catch (error) {
    console.error("getCourseReportInfo error:", error);
    return res.status(500).json({
      error: "COURSE_SERVICE_ERROR",
      detail: error.message
    });
  }
};

/* -------------------------------------
   Deactivate course wrapper
--------------------------------------*/
const deactivateCourse = async (req, res) => {
  req.body = req.body || {};
  req.body.cursoId = req.params.id || req.body.cursoId;
  req.body.state = "Inactivo";
  return setCourseState(req, res);
};

/* -------------------------------------
   Exports
--------------------------------------*/
module.exports = {
  createCurso,
  updateCourse,
  setCourseState,
  getCourseDetailById,
  getCoursesByInstructor,
  getCoursesByInstructorJSON,
  joinCurso,
  getCoursesByStudentController,
  getCoursesByNameController,
  getCoursesByCategoryController,
  getCoursesByMonthController,
  getCoursesByStateController,
  deleteStudentFromCourse: unenrollStudentFromCourse,
  deactivateCourse,
  unenrollStudentFromCourse,
  getCategory,
  modifyCategory,
  getAllCoursesController,
  getCourseReportInfo
};
