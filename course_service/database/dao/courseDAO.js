// courseDAO.js
const connection = require("../pool");

/**
 * DAO — Curso
 * Todas las validaciones de negocio (existencia, estado, duplicados) se hacen aquí.
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
        course.instructorUserId,
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
   returns single row or null
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
   Update course details
   - Validates course exists
   - If category provided, checks whether it is same as current (returns info)
   - Allows partial updates
   Returns: { affectedRows, updatedFields: [..], previous: {..}, current: {..} }
--------------------------*/
const updateCourseDetails = async (cursoId, details) => {
  const db = await connection.getConnection();
  try {
    // 1) ensure course exists
    const course = await getCourseById(cursoId);
    if (!course) {
      return { found: false };
    }

    const { name, description, category, endDate } = details;

    // check there is something to update
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
      // NOTE: category is free text in schema — we only check it's different
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

    // fetch updated row
    const updated = await getCourseById(cursoId);

    return {
      found: true,
      updated: result.affectedRows > 0,
      affectedRows: result.affectedRows,
      previous: course,
      current: updated,
      updatedFields: fields.map(f => f.split(" = ")[0]),
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
   - Validates course exists
   - Validates provided state is permitted
   Returns: { found, updated, previousState, newState, affectedRows }
--------------------------*/
const updateCourseState = async (cursoId, newState) => {
  const db = await connection.getConnection();
  try {
    const course = await getCourseById(cursoId);
    if (!course) {
      return { found: false };
    }

    const state = validStates.includes(newState) ? newState : null;
    if (!state) {
      return { found: true, updated: false, reason: "invalid_state", previousState: course.state };
    }

    if (course.state === state) {
      return { found: true, updated: false, reason: "same_state", previousState: course.state };
    }

    const [result] = await db.execute(
      `UPDATE Curso SET state = ? WHERE cursoId = ?`,
      [state, cursoId]
    );

    return {
      found: true,
      updated: result.affectedRows > 0,
      previousState: course.state,
      newState: state,
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error("updateCourseState error:", error);
    throw error;
  } finally {
    db.release();
  }
};

/* -------------------------
   Get courses by student
   - returns list (could be empty)
--------------------------*/
const getCoursesByStudent = async (studentId) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT c.cursoId, c.name, c.description, c.category, c.startDate, c.endDate, c.state
       FROM Curso c
       INNER JOIN Curso_Student cs ON c.cursoId = cs.cursoId
       WHERE cs.studentUserId = ?`,
      [studentId]
    );
    return rows;
  } finally {
    db.release();
  }
};

/* -------------------------
   Get courses by name/category/month/state
   - Basic parameter validation is left to controller, but DAO assumes proper types
--------------------------*/
const getCoursesByName = async (name) => {
  const db = await connection.getConnection();
  try {
    const [rows] = await db.execute(
      `SELECT cursoId, name, description, category, startDate, endDate, state FROM Curso WHERE name LIKE ?`,
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
      `SELECT cursoId, name, description, category, startDate, endDate, state FROM Curso WHERE category = ?`,
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
    // DAO-level validation: ensure integers and realistic month/year
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
      `SELECT cursoId, name, description, category, startDate, endDate, state FROM Curso WHERE state = ?`,
      [state]
    );
    return { rows };
  } finally {
    db.release();
  }
};

/* -------------------------
   Join course
   - New behavior: join by cursoId (schema doesn't include joinCode)
   - Validates course exists and is 'Activo'
   - Validates student not already enrolled
   - Inserts into Curso_Student
   Returns: { success: boolean, message, affectedRows }
--------------------------*/
const joinCourse = async (studentUserId, cursoId) => {
  const db = await connection.getConnection();
  try {
    await db.beginTransaction();

    // 1) course exists and is active
    const course = await getCourseById(cursoId);
    if (!course) {
      await db.rollback();
      return { success: false, message: "Course not found" };
    }
    if (course.state !== "Activo") {
      await db.rollback();
      return { success: false, message: "Course is inactive" };
    }

    // 2) not already enrolled
    const [exists] = await db.execute(
      `SELECT 1 FROM Curso_Student WHERE cursoId = ? AND studentUserId = ?`,
      [cursoId, studentUserId]
    );
    if (exists.length > 0) {
      await db.rollback();
      return { success: false, message: "Student already enrolled in this course" };
    }

    // 3) insert
    const [result] = await db.execute(
      `INSERT INTO Curso_Student (cursoId, studentUserId) VALUES (?, ?)`,
      [cursoId, studentUserId]
    );

    await db.commit();
    return { success: true, message: "Student successfully joined the course", affectedRows: result.affectedRows };
  } catch (error) {
    await db.rollback();
    console.error("joinCourse error:", error);
    throw error;
  } finally {
    db.release();
  }
};

/* -------------------------
   deleteStudentFromCourse (consolidated)
   - Validates enrollment exists
   - Deletes and returns affectedRows
   Returns: { found: boolean, deleted: boolean, affectedRows }
--------------------------*/
const deleteStudentFromCourse = async (studentUserId, cursoId) => {
  const db = await connection.getConnection();
  try {
    // verify enrollment exists
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

    return { found: true, deleted: result.affectedRows > 0, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("deleteStudentFromCourse error:", error);
    throw error;
  } finally {
    db.release();
  }
};

/* -------------------------
   getCourseCategory & updateCourseCategory
   - updateCourseCategory ensures course exists and returns boolean
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
      return { found: true, updated: false, reason: "no_change", previous: course.category };
    }
    const [result] = await db.execute(
      `UPDATE Curso SET category = ? WHERE cursoId = ?`,
      [newCategory, cursoId]
    );
    return { found: true, updated: result.affectedRows > 0, affectedRows: result.affectedRows };
  } finally {
    db.release();
  }
};

module.exports = {
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
};
