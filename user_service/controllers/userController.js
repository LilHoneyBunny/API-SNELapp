const { request, response } = require("express");
const { generateJWT } = require('../utils/createJWT');
const HttpStatusCodes = require('../utils/enums');
const e = require("express");
const path = require('path');
const { sendEmail, loadTemplate, generateVerificationCode } = require("../utils/sendEmail");
const { 
    createUser, 
    findUserByEmail, 
    login, 
    findUser, 
    updateUserVerification, 
    getStudentsByIds, 
    findUserByEmailJSON
} = require("../database/dao/userDAO");

// ✅ Necesario para actualización de perfil
const { updateUserBasicProfile } = require("../database/dao/userDAO");

/* ----------------------- REGISTER USER ----------------------- */

const registerUser = async (req, res = response) => {
    const { userName, paternalSurname, maternalSurname, email, userPassword, userType } = req.body;
    
    const nameValidation = validateRegisterInput(req.body);
    if (!nameValidation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: nameValidation.message
        });
    }

    const loginValidation = validateLoginInput(email, userPassword);
    if (!loginValidation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: loginValidation.message
        });
    }

    if (!userName || !paternalSurname || !maternalSurname || !email || !userPassword || !userType) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid data, please resubmit your request."
        });
    }

    try {
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "The email has already been registered"
            });
        }

        const verificationCode = generateVerificationCode();

        const newUser = {
            userName, paternalSurname, maternalSurname, email, userPassword, userType, verificationCode,
            isVerified: false
        };

        const result = await createUser(newUser);

        const templatePath = path.join(__dirname, '../templates/verification_email.html');
        const htmlContent = loadTemplate(templatePath, {
            name: userName,
            code: verificationCode
        });

        await sendEmail(email, 'Verify your account', htmlContent);

        return res.status(HttpStatusCodes.CREATED).json({
            message: "The user has registered successfully",
            email: result.email
        });

    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new user. Try again later"
        });
    }
};

/* ----------------------- VALIDATORS ----------------------- */

const validateName = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,69}$/;

const validateRegisterInput = (data) => {
    const { userName, paternalSurname, maternalSurname, userType } = data;
    if (!userName || !userName.match(validateName)) {
        return { valid: false, message: "Invalid name. Please provide a valid name." };
    }
    if (!paternalSurname || !paternalSurname.match(validateName)) {
        return { valid: false, message: "Invalid paternal surname." };
    }
    if (!maternalSurname || !maternalSurname.match(validateName)) {
        return { valid: false, message: "Invalid maternal surname." };
    }
    if (userType !== 'Student' && userType !== 'Instructor') {
        return { valid: false, message: "Invalid role. Must be Student or Instructor." };
    }
    return { valid: true };
};

const validateMail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const validateLoginInput = (email, userPassword) => {
    if (!email || !email.match(validateMail)) {
        return { valid: false, message: "Invalid email." };
    }
    if (!userPassword || typeof userPassword !== 'string' || userPassword.trim() === '') {
        return { valid: false, message: "Invalid password." };
    }
    return { valid: true };
};

/* ----------------------- LOGIN ----------------------- */

const userLogin = async (req, res = response) => {
    const { email, userPassword } = req.body;
    const validation = validateLoginInput(email, userPassword);

    if (!validation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: validation.message
        });
    }

    try {
        const user = await login(email, userPassword);
        if (user == null) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Invalid credentials"
            });
        }

        const token = await generateJWT({userId: user.userId, email: user.email, role: user.role});
        return res.status(HttpStatusCodes.CREATED).json({ token, ...user });

    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error logging in"
        });
    }
};

/* ----------------------- VERIFY USER ----------------------- */

const verifyUser = async (req, res = response) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ error: true, message: "Email and code required" });
    }

    try {
        const user = await findUser(email);
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: true, message: "Already verified" });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ error: true, message: "Invalid verification code" });
        }

        await updateUserVerification(email);

        return res.status(200).json({ message: "Account verified successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: "Error verifying account" });
    }
};

/* ----------------------- UPLOAD PROFILE IMAGE ----------------------- */

const uploadProfileImage = async (req, res = response) => {
    const { userId } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: true, message: "No file uploaded" });
    }

    const profileImageUrl = `/uploads/profile_images/${req.file.filename}`;

    try {
        const result = await updateUserBasicProfile(userId, { profileImageUrl });

        if (result.affectedRows > 0) {
            return res.status(200).json({
                message: "Profile image updated successfully",
                profileImageUrl
            });
        }

        return res.status(500).json({ error: true, message: "Error updating profile image" });

    } catch (error) {
        console.error("Error updating profile image:", error);
        return res.status(500).json({ error: true, message: "Error processing the image update" });
    }
};

/* ----------------------- GET STUDENTS ----------------------- */

const fetchStudents = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ success: false, message: "Missing ids parameter" });

        const studentIds = ids.split(',').map(id => parseInt(id));
        const students = await getStudentsByIds(studentIds);

        res.status(200).json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error obtaining students" });
    }
};

/* ----------------------- GET USER BY EMAIL JSON ----------------------- */

const findUserByEmailJSONController = async (req, res = response) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }

    try {
        const user = await findUserByEmailJSON(email);

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("Error getting user JSON:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error"
        });
    }
};

/* ----------------------- UPDATE BASIC PROFILE ----------------------- */

const updateUserBasicProfileController = async (req, res) => {
    const { userId } = req.params;
    const { userName, paternalSurname, maternalSurname, profileImageUrl } = req.body;

    console.log("🔥 LLEGÓ AL CONTROLLER updateUserBasicProfileController");
    console.log("userId:", req.params.userId);
    console.log("body:", req.body);

    try {
        const result = await updateUserBasicProfile(userId, {
            userName,
            paternalSurname,
            maternalSurname,
            profileImageUrl
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ----------------------- EXPORTS ----------------------- */

module.exports = { 
    registerUser, 
    userLogin, 
    verifyUser, 
    uploadProfileImage, 
    fetchStudents, 
    findUserByEmailJSONController,
    updateUserBasicProfileController
};
