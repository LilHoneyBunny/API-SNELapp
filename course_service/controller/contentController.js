const { request, response } = require("express");
const HttpStatusCodes = require('../utils/enums');
const {createContent, updateContentDetails, deleteContentById, getContentsByCourse} = require("../database/dao/contentDAO");

const createNewContent = async(req = request, res = response) => {
    try {
        const {title, type, descripcion, cursoId} = req.body;

        if (!title || !cursoId) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                message: "Title and courseId are required"
            });
        }
        const result = await createContent({ title, type, descripcion, cursoId });

        return res.status(HttpStatusCodes.CREATED).json({
            message: "Content created correctly",
            contentId: result.contentId
        });
    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Error creating content"
        });
    }
};

const updateContent = async (req = request, res = response) => {
    try {
        const { contentId } = req.params;
        const details = req.body;

        const result = await updateContentDetails(contentId, details);

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                message: "Content not found"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            message: "Content updated correctly"
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Error updating content"
        });
    }
};

const deleteContent = async (req = request, res = response) => {
    try {
        const { contentId } = req.params;

        const result = await deleteContentById(contentId);

        if (result.affectedRows === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                message: "Content not found"
            });
        }

        return res.status(HttpStatusCodes.OK).json({
            message: "Content successfully removed"
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Error deleting content"
        });
    }
};

const getContentByCourse = async (req = request, res = response) => {
    try {
        const { cursoId } = req.params;

        const result = await getContentsByCourse(cursoId);

        return res.status(HttpStatusCodes.OK).json({
            message: "Content obtained successfully",
            results: result
        });

    } catch (error) {
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Error retrieving content"
        });
    }
};


module.exports = {createNewContent, updateContent, deleteContent, getContentByCourse};