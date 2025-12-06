const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const {createQuiz, updateQuiz, deleteQuiz, getAllQuiz, getQuizByTitle, getQuizByDateCreation} = require ("../database/dao/quizDAO");

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
module.exports = {createQuestionnaire, updateQuestionnaire, deleteQuestionnaire, getQuizzesByCourse, 
    searchQuizByTitle, searchQuizByDate};