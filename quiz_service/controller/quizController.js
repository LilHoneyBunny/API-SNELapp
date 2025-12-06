const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const jwt = require('jsonwebtoken');
const {createQuiz, updateQuiz, deleteQuiz, getAllQuiz, getQuizByTitle, getQuizByDateCreation,
    getQuizById} = require ("../database/dao/quizDAO");

const createQuestionnaire = async (req, res) => {
    try {
        const { title, description, creationDate, weighing, cursoId, questions } = req.body;

        if (!title || !cursoId || !questions) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Title, course ID, and questionnaire are required."
            });
        }

        const result = await createQuiz({
            title,
            description,
            creationDate,
            weighing,
            cursoId,
            questions
        });

        return res.status(HttpStatusCodes.CREATED).json({
            success: true,
            message: "questionnaire successfully created.",
            quizId: result.quizId
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating questionnaire. Try again later"
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
        console.error("Error updating quiz:", error);
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
            console.log("ROLE OBTENIDO:", userRole);
        } catch (tokenError) {
            console.error("ERROR OBTENIENDO EL ROL:", tokenError.message);
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
        console.error("Error in getQuizDetailForUser:", error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = {createQuestionnaire, updateQuestionnaire, deleteQuestionnaire, getQuizzesByCourse, 
    searchQuizByTitle, searchQuizByDate, getQuizDetailForUser};