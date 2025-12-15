// courseDAO.js
const connection = require("../pool");

/**
 * DAO — Curso
 * Compatible con la estructura SQL de minao_courses proporcionada por Lilly
 */

/* -------------------------
   Utilities
--------------------------*/
const validStates = ["Activo", "Inactivo"];

const parseIntSafe = (v) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

/* -------------------------
   Create Course
--------------------------*/
const createCourse = async (course) => {
  const db = await connection.getConnection();
  try {
    await db.beginTransaction();

    const [result] = await db.execute(
      `INSERT INTO Curso (name, description, category, startDate, endDate, state, instructorUserId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        course.name,
        course.description || null,
        course.category || null,
        course.startDate || null,
        course.endDate || null,
        validStates.includes(course.state) ? course.state : "Activo",
        course.instructorUserId
      ]
    );

    await db.commit();
    return { success: true, cursoId: result.insertId };
  } catch (error) {
    await db.rollback();
    console.error("createCourse error:", error);
    throw error;
  } finally {
    db.release();
  }
};

/* -------------------------
   Get Course by Id
--------------------------*/
const getCourseById = async (cursoId) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state, instructorUserId
       FROM Curso WHERE cursoId = ?`,
      [cursoId]
    );
    return rows[0] || null;
  } finally {
    db.release();
  }
};

/* -------------------------
   Get all courses by instructor
--------------------------*/
const getAllCoursesByInstructor = async (instructorUserId) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state
       FROM Curso WHERE instructorUserId = ?`,
      [instructorUserId]
    );
    return rows;
  } finally {
    db.release();
  }
};
/* -------------------------
   Get all courses available
--------------------------*/

const getAllCourses = async () => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT 
                cursoId,
                name,
                description,
                category,
                startDate,
                endDate,
                state
             FROM Curso
             WHERE state = 'Activo'`
        );

        return rows;

    } finally {
        dbConnection.release();
    }
};




/* -------------------------
   Update course details
--------------------------*/
const updateCourseDetails = async (cursoId, details) => {
  const db = await connection.getConnection();
  try {
    const course = await getCourseById(cursoId);
    if (!course) return { found: false };

    const { name, description, category, endDate } = details;

    const fields = [];
    const values = [];

    if (name && name !== course.name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (description && description !== course.description) {
      fields.push("description = ?");
      values.push(description);
    }
    if (category && category !== course.category) {
      fields.push("category = ?");
      values.push(category);
    }
    if (endDate && endDate !== course.endDate) {
      fields.push("endDate = ?");
      values.push(endDate);
    }

    if (fields.length === 0) {
      return { found: true, updated: false, reason: "no_changes", previous: course };
    }

    values.push(cursoId);
    const query = `UPDATE Curso SET ${fields.join(", ")} WHERE cursoId = ?`;

    const [result] = await db.execute(query, values);

    const updated = await getCourseById(cursoId);

    return {
      found: true,
      updated: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      previous: course,
      current: updated,
      updatedFields: fields.map((f) => f.split(" = ")[0])
    };
  } catch (error) {
    console.error("updateCourseDetails error:", error);
    throw error;
  } finally {
    db.release();
  }
};

/* -------------------------
   Update course state
--------------------------*/
const updateCourseState = async (cursoId, newState) => {
  const db = await connection.getConnection();
  try {
    const course = await getCourseById(cursoId);
    if (!course) return { found: false };

    if (!validStates.includes(newState)) {
      return { found: true, updated: false, reason: "invalid_state", previousState: course.state };
    }

    if (course.state === newState) {
      return { found: true, updated: false, reason: "same_state", previousState: course.state };
    }

    const [result] = await db.execute(
      `UPDATE Curso SET state = ? WHERE cursoId = ?`,
      [newState, cursoId]
    );

    return {
      found: true,
      updated: result.affectedRows > 0,
      previousState: course.state,
      newState,
      affectedRows: result.affectedRows
    };
  } finally {
    db.release();
  }
};

/* -------------------------
   Get courses by student
--------------------------*/
const getCoursesByStudent = async (studentUserId) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT c.cursoId, c.name, c.description, c.category, c.startDate, c.endDate, c.state
       FROM Curso c
       INNER JOIN Curso_Student cs ON c.cursoId = cs.cursoId
       WHERE cs.studentUserId = ?`,
      [studentUserId]
    );
    return rows;
  } finally {
    db.release();
  }
};

/* -------------------------
   Filters
--------------------------*/
const getCoursesByName = async (name) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state 
       FROM Curso WHERE name LIKE ?`,
      [`%${name}%`]
    );
    return rows;
  } finally {
    db.release();
  }
};

const getCoursesByCategory = async (category) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state 
       FROM Curso WHERE category = ?`,
      [category]
    );
    return rows;
  } finally {
    db.release();
  }
};

const getCoursesByMonth = async (year, month) => {
  const db = await connection.getConnection();
  try {
    const y = parseIntSafe(year);
    const m = parseIntSafe(month);

    if (!y || !m || m < 1 || m > 12) {
      return { error: "invalid_year_or_month", rows: [] };
    }

    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state
       FROM Curso WHERE YEAR(startDate) = ? AND MONTH(startDate) = ?`,
      [y, m]
    );

    return { rows };
  } finally {
    db.release();
  }
};

const getCoursesByState = async (state) => {
  const db = await connection.getConnection();
  try {
    if (!validStates.includes(state)) {
      return { error: "invalid_state", rows: [] };
    }

    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state
       FROM Curso WHERE state = ?`,
      [state]
    );

    return { rows };
  } finally {
    db.release();
  }
};

/* -------------------------
   Join Course
--------------------------*/
const joinCourse = async (studentUserId, cursoId) => {
  const db = await connection.getConnection();
  try {
    await db.beginTransaction();

    const course = await getCourseById(cursoId);
    if (!course) return { success: false, message: "Course not found" };
    if (course.state !== "Activo") return { success: false, message: "Course is inactive" };

    const [exists] = await db.execute(
      `SELECT 1 FROM Curso_Student WHERE cursoId = ? AND studentUserId = ?`,
      [cursoId, studentUserId]
    );

    if (exists.length > 0) {
      return { success: false, message: "Student already enrolled" };
    }

    const [result] = await db.execute(
      `INSERT INTO Curso_Student (cursoId, studentUserId) VALUES (?, ?)`,
      [cursoId, studentUserId]
    );

    await db.commit();

    return {
      success: true,
      message: "Student joined successfully",
      affectedRows: result.affectedRows
    };
  } catch (error) {
    await db.rollback();
    console.error("joinCourse error:", error);
    throw error;
  } finally {
    db.release();
  }
};

/* -------------------------
   Remove student from course
--------------------------*/
const deleteStudentFromCourse = async (studentUserId, cursoId) => {
  const db = await connection.getConnection();
  try {
    const [exists] = await db.execute(
      `SELECT 1 FROM Curso_Student WHERE studentUserId = ? AND cursoId = ?`,
      [studentUserId, cursoId]
    );

    if (exists.length === 0) {
      return { found: false, deleted: false, affectedRows: 0 };
    }

    const [result] = await db.execute(
      `DELETE FROM Curso_Student WHERE studentUserId = ? AND cursoId = ?`,
      [studentUserId, cursoId]
    );

    return {
      found: true,
      deleted: result.affectedRows > 0,
      affectedRows: result.affectedRows
    };
  } finally {
    db.release();
  }
};

/* -------------------------
   Category helpers
--------------------------*/
const getCourseCategory = async (cursoId) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT category FROM Curso WHERE cursoId = ?`,
      [cursoId]
    );
    return rows[0] || null;
  } finally {
    db.release();
  }
};

const updateCourseCategory = async (cursoId, newCategory) => {
  const db = await connection.getConnection();
  try {
    const course = await getCourseById(cursoId);

    if (!course) {
      return { found: false, updated: false, reason: "not_found" };
    }

    if (!newCategory || newCategory === course.category) {
      return {
        found: true,
        updated: false,
        reason: "no_change",
        previous: course.category
      };
    }

    const [result] = await db.execute(
      `UPDATE Curso SET category = ? WHERE cursoId = ?`,
      [newCategory, cursoId]
    );

    return {
      found: true,
      updated: result.affectedRows > 0,
      affectedRows: result.affectedRows
    };
  } finally {
    db.release();
  }
};

/* -------------------------
   Report: basic course info
--------------------------*/
const getCourseReportInfoDAO = async (courseId) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT cursoId, name, category, startDate, endDate, instructorUserId
       FROM Curso WHERE cursoId = ?`,
      [courseId]
    );
    return rows[0] || null;
  } finally {
    db.release();
  }
};

/* -------------------------
   Exports
--------------------------*/
module.exports = {
  createCourse,
  getCourseById,
  getAllCoursesByInstructor,
  getAllCourses,
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
  getCourseReportInfoDAO
};
