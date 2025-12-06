const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const {createQuiz} = require ("../database/dao/quizDAO");

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

module.exports = {createQuestionnaire};