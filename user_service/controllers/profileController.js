const { response } = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const HttpStatusCodes = require("../utils/enums");

// ✔ Importación CORRECTA según tu DAO
const { updateUserBasicProfile } = require("../database/dao/userDAO");
const { updateInstructorProfile } = require("../database/dao/instructorDAO");
const { updateStudentProfile } = require("../database/dao/studentDAO");

// misma regex que usas en userController
const validateName = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,69}$/;

// Títulos mapeados a Title.titleId
const TITLE_MAP = {
    "Dr.": 1,
    "Mtro.": 2,
    "Lic.": 3,
    "Ing.": 4,
    "Prof.": 5
};

const processProfileImage = async (file) => {
    if (!file) return null;

    const publicDir = path.join(__dirname, "..", "public");
    const avatarsDir = path.join(publicDir, "avatars");

    if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true });
    }

    const fileNameWithoutExt = path.parse(file.filename).name;
    const outputFileName = `${fileNameWithoutExt}.jpg`;
    const outputPath = path.join(avatarsDir, outputFileName);

    await sharp(file.path)
        .resize({ width: 854, height: 480, fit: "cover" })
        .jpeg({ quality: 90 })
        .toFile(outputPath);

    fs.unlink(file.path, () => {});

    return `/avatars/${outputFileName}`;
};

/**
 * PUT /users/:id
 * Actualiza nombre, apellidos y foto (Instructor o Student)
 */
const updateUserProfileController = async (req, res) => {
    try {
        const { userID } = req.params;

        // 🛡️ Protección absoluta
        const {
            userName,
            paternalSurname,
            maternalSurname
        } = req.body || {};

        if (!userName && !paternalSurname && !maternalSurname) {
            return res.status(400).json({
                success: false,
                message: "No se enviaron datos para actualizar"
            });
        }

        // 👉 aquí tu lógica de BD
        const updatedUser = await updateUserInDB(
            userID,
            userName,
            paternalSurname,
            maternalSurname
        );

        return res.json({
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.error("❌ Error updateUserProfileController:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

/**
 * PUT /instructors/:id
 */
const updateInstructorProfileController = async (req, res = response) => {
    const { id } = req.params;
    const { titleName, biography } = req.body;

    const titleId = TITLE_MAP[titleName];
    if (!titleId) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid professional title."
        });
    }

    if (biography && biography.length > 500) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Biography too long. Max 500 characters."
        });
    }

    try {
        await updateInstructorProfile(id, { titleId, biography });

        return res.status(HttpStatusCodes.OK).json({
            message: "Instructor profile updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error updating instructor profile"
        });
    }
};

/**
 * PUT /students/:id
 */
const updateStudentProfileController = async (req, res = response) => {
    const { id } = req.params;
    const { levelId } = req.body;

    if (!levelId || isNaN(Number(levelId))) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid educational level id."
        });
    }

    try {
        await updateStudentProfile(id, { levelId });

        return res.status(HttpStatusCodes.OK).json({
            message: "Student profile updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error updating student profile"
        });
    }
};

module.exports = {
    updateUserProfileController,
    updateInstructorProfileController,
    updateStudentProfileController
};
