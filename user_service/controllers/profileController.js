const { response } = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const HttpStatusCodes = require("../utils/enums");
const { updateUserProfileBasic } = require("../database/dao/userDAO");
const { updateInstructorProfile } = require("../database/dao/instructorDAO");
const { updateStudentProfile } = require("../database/dao/studentDAO");

// misma regex que usas en userController
const validateName = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,69}$/;

// Títulos mapeados a Title.titleId según tu inserción inicial
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

    // "480p": usamos 854x480 (16:9) y recortamos
    await sharp(file.path)
        .resize({ width: 854, height: 480, fit: "cover" })
        .jpeg({ quality: 90 })
        .toFile(outputPath);

    // eliminación del archivo temporal
    fs.unlink(file.path, () => {});

    // ruta pública que verá el front
    return `/avatars/${outputFileName}`;
};

/**
 * PUT /users/:id
 * - Actualiza nombre, apellidos y foto de perfil (Instructor o Student)
 */
const updateUserProfileController = async (req, res = response) => {
    const { id } = req.params;
    const { userName, paternalSurname, maternalSurname } = req.body;

    if (!userName || !validateName.test(userName)) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid name. Please provide a valid name (1-69 chars, Spanish alphabet and spaces)."
        });
    }

    if (!paternalSurname || !validateName.test(paternalSurname)) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid paternal surname."
        });
    }

    if (!maternalSurname || !validateName.test(maternalSurname)) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid maternal surname."
        });
    }

    try {
        const profileImageUrl = await processProfileImage(req.file);

        await updateUserProfileBasic(id, {
            userName,
            paternalSurname,
            maternalSurname,
            profileImageUrl
        });

        return res.status(HttpStatusCodes.OK).json({
            message: "User profile updated successfully",
            profileImageUrl
        });
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error updating user profile"
        });
    }
};

const updateUserBasicProfile = async (userId, { userName, paternalSurname, maternalSurname, profileImageUrl }) => {
    const dbConnection = await connection.getConnection();
    try {
        const [result] = await dbConnection.execute(
            `UPDATE User 
             SET userName = ?, paternalSurname = ?, maternalSurname = ?, profileImageUrl = ?
             WHERE userId = ?`,
            [userName, paternalSurname, maternalSurname, profileImageUrl, userId]
        );

        if (result.affectedRows === 0) {
            throw new Error("No se pudo actualizar el perfil, asegúrate de que el usuario exista.");
        }

        return { success: true, message: "Perfil actualizado correctamente." };
    } catch (error) {
        console.error("Error al actualizar el perfil del usuario:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

/**
 * PUT /instructors/:id
 * - Actualiza título profesional y biografía (biografía solo instructores)
 * - La foto se edita por /users/:id, así no duplicamos campo
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
 * - Actualiza nivel educativo (Student.levelId)
 * - La foto de perfil se edita por /users/:id
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
    updateStudentProfileController,
    updateUserBasicProfile
};
