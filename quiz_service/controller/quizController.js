const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const jwt = require('jsonwebtoken');
const { getStudentNames } = require("../service/userService");
const {createQuiz, getQuizForUpdate, updateQuiz, deleteQuiz, getAllQuiz, getQuizByTitle, getQuizByDateCreation,
    getQuizById, submitQuizAnswers, getQuizResult, getQuizResponsesList, getQuizForStudent, getStudentsAttempts } = require ("../database/dao/quizDAO");

const createQuestionnaire = async (req, res) => {
    try {
        const { title, description, cursoId, questions, status } = req.body;

        if (!title || !cursoId || !questions) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Title, course ID and questions are required."
            });
        }

        const result = await createQuiz({
            title,
            description,
            cursoId,
            questions,
            status  
        });

        return res.status(HttpStatusCodes.CREATED).json({
            success: true,
            message: "Questionnaire successfully created.",
            quizId: result.quizId,
            totalWeighing: result.totalWeighing
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating questionnaire. Try again later."
        });
    }
};

const getQuizForUpdateController = async (req, res = response) => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "quizId is required in params."
            });
        }

        const result = await getQuizForUpdate(quizId);

        if (!result) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Quiz not found."
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            message: "Quiz retrieved successfully.",
            result
        });

    } catch (error) {
        console.error("Error fetching quiz for update:", error);

        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error fetching quiz information. Try again later."
        });
    }
};


const updateQuestionnaire = async (req, res = response) => {
    try {
        const { quizId } = req.params;
        const details = req.body;

        if (!quizId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "quizId is required in params."
            });
        }

        const result = await updateQuiz(quizId, details);

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            message: "Quiz updated successfully.",
            result
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error updating quiz. Try again later."
        });
    }
};

const deleteQuestionnaire = async (req, res = response) => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "quizId is required in params."
            });
        }

        const result = await deleteQuiz(quizId);

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Quiz not found."
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            message: "Quiz deleted successfully."
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error deleting quiz. Try again later."
        });
    }
};

const getQuizzesByCourse = async (req, res = response) => {
    try {
        const { cursoId } = req.params;

        if (!cursoId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "cursoId is required in params."
            });
        }

        const quizzes = await getAllQuiz(cursoId);

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error fetching quizzes. Try again later."
        });
    }
};

const searchQuizByTitle = async (req, res = response) => {
    try {
        const { title } = req.query;
        if (!title) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Title query param is required."
            });
        }

        const quizzes = await getQuizByTitle(title);

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error searching quizzes by title."
        });
    }
};

const searchQuizByDate = async (req, res = response) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Date query param is required."
            });
        }

        const quizzes = await getQuizByDateCreation(date);

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error searching quizzes by date."
        });
    }
};

function getRoleFromToken(req) {
  const header = req.headers.authorization;

  if (!header) {
    throw new Error("No Authorization header provided");
  }

  const token = header.split(" ")[1];
  if (!token) {
    throw new Error("JWT token not provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded.role) {
    throw new Error("Role not found in token");
  }

  return decoded.role;
}

const getQuizDetailForUser = async (req, res) => {
    try {
        const { quizId } = req.params;
        let userRole;

        try {
            userRole = getRoleFromToken(req); 
        } catch (tokenError) {
            return res.status(HttpStatusCodes.UNAUTHORIZED).json({
                success: false,
                message: tokenError.message
            });
        }

        const quiz = await getQuizById(quizId);
        if (!quiz) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                success: false,
                message: "Quiz not found"
            });
        }

          if (userRole.toLowerCase() === 'student') {
            quiz.questions.forEach(q => {
                q.options.forEach(o => {
                    delete o.isCorrect;
                });
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            data: quiz
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const answerQuiz = async (req, res) => {
   try {
        const { studentUserId, quizId, answers } = req.body;

        if (!studentUserId || !quizId || !Array.isArray(answers) || answers.length === 0) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "studentUserId, quizId and answers are required"
            });
        }

        const result = await submitQuizAnswers(answers, quizId, studentUserId);

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            message: `Quiz answered correctly. Attempt #${result.attemptNumber}`,
            score: result.score,
            attemptNumber: result.attemptNumber
        });

    } catch (err) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error registering quiz answers"
        });
    }
};

const viewQuizResult = async (req, res) => {
    try {
        const { quizId, studentUserId, attemptNumber } = req.query;
        if (!quizId || !studentUserId || !attemptNumber) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "quizId, studentUserId and attemptNumber are required"
            });
        }

        const result = await getQuizResult(quizId, studentUserId, parseInt(attemptNumber));

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            result
        });

    } catch (err) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error obtaining quiz result"
        });
    }
};

const listQuizResponses = async (req, res) => {
    try {
        const { quizId } = req.params;
        if (!quizId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "quizId are required"
            });
        }

        const responses = await getQuizResponsesList(quizId);
        const studentIds = responses.map(r => r.studentUserId);
        const users = await getStudentNames(studentIds);

        const combined = responses.map(r => ({
            ...r,
            name: users.find(u => u.studentId === r.studentUserId)?.name || "Desconocido"
        }));

        res.status(HttpStatusCodes.OK).json({
            success: true,
            quizId,
            responses: combined
        });

    } catch (err) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error obtaining quiz result"
        });
    }
};

const getQuizForStudentController = async (req, res = response) => {
    try {
        const { quizId } = req.params;

        if (!quizId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "quizId is required in params."
            });
        }

        const result = await getQuizForStudent(quizId);

        if (!result) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Quiz not found."
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            message: "Quiz retrieved successfully for student.",
            result
        });

    } catch (error) {
        console.error("Error fetching quiz for student:", error);

        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error retrieving quiz. Try again later."
        });
    }
};

const getStudentsAttemptsController = async (req, res = response) => {
    try {
        const { quizId, studentUserId } = req.params;

        if (!quizId || !studentUserId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                success: false,
                message: "quizId and studentUserId are required"
            });
        }

        const attempts = await getStudentsAttempts(quizId, studentUserId);

        return res.status(HttpStatusCodes.OK).json({
            success: true,
            quizId,
            studentUserId,
            attempts
        });

    } catch (error) {
        console.error("Error obtaining student attempts:", error);

        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error obtaining student attempts"
        });
    }
};


module.exports = {createQuestionnaire, getQuizForUpdateController, updateQuestionnaire, deleteQuestionnaire, getQuizzesByCourse, 
    searchQuizByTitle, searchQuizByDate, getQuizDetailForUser, answerQuiz, viewQuizResult, listQuizResponses, getQuizForStudentController, getStudentsAttemptsController };