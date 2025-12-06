const { request, response } = require("express");
const { generateJWT } = require('../utils/createJWT');
const HttpStatusCodes = require('../utils/enums');
const e = require("express");
const path = require('path');
const { sendEmail, loadTemplate, generateVerificationCode } = require("../utils/sendEmail");
const { createUser, findUserByEmail, login, findUser, updateUserVerification, getStudentsByIds } = require("../database/dao/userDAO");
const { updateUserBasicProfile } = require("../controllers/profileController");

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

const validateName = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,69}$/;
const validateRegisterInput = (data) => {
    const { userName, paternalSurname, maternalSurname, userType } = data;
    if (!userName || !userName.match(validateName)) {
        return { valid: false, message: "Invalid name. Please provide a valid name (must contain at least 1 to 69 characters, only Spanish alphabet characters and spaces)." };
    }
    if (!paternalSurname || !paternalSurname.match(validateName)) {
        return { valid: false, message: "Invalid name. Please provide a valid paternal surname (must contain at least 1 to 69 characters, only Spanish alphabet characters and spaces)." };
    }
    if (!maternalSurname || !maternalSurname.match(validateName)) {
        return { valid: false, message: "Invalid name. Please provide a valid maternal surname (must contain at least 1 to 69 characters, only Spanish alphabet characters and spaces)." };
    }
    if (userType !== 'Student' && userType !== 'Instructor') {
        return { valid: false, message: "Invalid role. Role must be either 'Student' or 'Instructor'." };
    }
    return { valid: true };
};

const validateMail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const validateLoginInput = (email, userPassword) => {
    if (!email || !email.match(validateMail)) {
        return { valid: false, message: "Invalid email. Please provide a new email address." };
    }
    if (!userPassword || typeof userPassword !== 'string' || userPassword.trim() === '') {
        return { valid: false, message: "Invalid password. Please provide a valid password." };
    }
    return { valid: true };
};

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
                details: "Invalid credentials, please check your username and password and try again"
            });
        }
        const token = await generateJWT({userId: user.userId, email:user.email, role: user.role});
        return res.status(HttpStatusCodes.CREATED)
            .json({
                token,
                ...user
            });
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error logging in. Try again later"
        });
    }
};

const verifyUser = async (req, res = response) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({
            error: true,
            message: "Email and verification code are required"
        });
    }

    try {
        const user = await findUser(email);
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                error: true,
                message: "Account is already verified"
            });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({
                error: true,
                message: "Invalid verification code"
            });
        }

        await updateUserVerification(email);

        return res.status(200).json({
            message: "Account verified successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Error verifying account"
        });
    }
};

const uploadProfileImage = async (req, res = response) => {
    const { userId } = req.params;

    if (!req.file) {
        return res.status(400).json({
            error: true,
            message: "No file uploaded"
        });
    }

    const profileImageUrl = `/uploads/profile_images/${req.file.filename}`;

    try {
        const result = await updateUserProfileBasic(userId, { profileImageUrl });

        if (result.success) {
            return res.status(200).json({
                message: "Profile image updated successfully",
                profileImageUrl
            });
        }

        return res.status(500).json({
            error: true,
            message: "Error updating profile image"
        });
    } catch (error) {
        console.error("Error updating profile image:", error);
        return res.status(500).json({
            error: true,
            message: "Error processing the image update"
        });
    }
};

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

module.exports = { registerUser, userLogin, verifyUser, uploadProfileImage, fetchStudents };
