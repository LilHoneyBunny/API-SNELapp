const { request, response } = require("express");
const { generateJWT } = require('../utils/createJWT');
const bcrypt = require("bcryptjs");
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
    findUserByEmailJSON,
    updateUserPasswordById,
    softDeleteUserById,  
    getUserByIdForDelete
} = require("../database/dao/userDAO");


const { updateUserBasicProfile } = require("../database/dao/userDAO");



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



const updateUserBasicProfileController = async (req, res) => {
    const { userId } = req.params;
    console.log("🧪 update profile params:", req.params);
    const { userName, paternalSurname, maternalSurname, profileImageUrl } = req.body;

    const updatedData = {
        userName,
        paternalSurname,
        maternalSurname,
        profileImageUrl
    };
    console.log("🧪 update profile body:", req.body);
    try {
        const result = await updateUserBasicProfile(userId, updatedData);

        if (result.affectedRows > 0) {
            return res.status(200).json({
                success: true,
                message: "Perfil actualizado correctamente",
                profileImageUrl: profileImageUrl || null
            });
        }

        return res.status(400).json({
            success: false,
            message: "No se realizaron cambios"
        });

    } catch (error) {
        console.error("❌ Error updateUserBasicProfileController:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};

const changePasswordController = async (req, res = response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body || {};

    // Validaciones básicas
    if (!userId || !currentPassword || !newPassword) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId, currentPassword y newPassword son obligatorios."
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 8 caracteres."
      });
    }

    // Seguridad extra: userId del body debe coincidir con el del token
    // generateJWT mete {userId,email,role}. :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4}
    const tokenUserId = req.user?.userId;
    const tokenEmail = req.user?.email;

    if (!tokenUserId || !tokenEmail) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Token inválido."
      });
    }

    if (Number(tokenUserId) !== Number(userId)) {
      return res.status(HttpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tienes permiso para cambiar la contraseña de otro usuario."
      });
    }

    // Reusa tu lógica de login(email, password) (ahí ya haces bcrypt.compare)
    const okUser = await login(tokenEmail, currentPassword);
    if (!okUser) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Contraseña actual incorrecta."
      });
    }

    // Hashear nueva
    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    const result = await updateUserPasswordById(userId, newHash);

    if (!result || result.affectedRows <= 0) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No se pudo actualizar la contraseña."
      });
    }

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: "Contraseña actualizada. Vuelve a iniciar sesión."
    });

  } catch (error) {
    console.error("❌ changePasswordController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error interno del servidor."
    });
  }
};


const deleteUserController = async (req, res = response) => {
  try {
    const { userId } = req.params;
    const idParam = parseInt(userId, 10);

    if (!idParam || Number.isNaN(idParam)) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId inválido"
      });
    }

    // ✅ solo puede borrar su propia cuenta
    const tokenUserId = req.user?.userId;
    if (!tokenUserId || Number(tokenUserId) !== idParam) {
      return res.status(HttpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tienes permiso para eliminar esta cuenta."
      });
    }

    // Verifica existencia / estado
    const user = await getUserByIdForDelete(idParam);
    if (!user) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Usuario no encontrado."
      });
    }

    if (user.isActive === 0) {
      return res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "La cuenta ya estaba eliminada."
      });
    }

    const result = await softDeleteUserById(idParam);

    if (!result || result.affectedRows <= 0) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No fue posible eliminar la cuenta."
      });
    }

    /**
     * ✅ HOOK (courses)
     * Si tu microservicio de cursos está separado, aquí NO tenemos su DAO.
     * Cuando lo conectes, aquí llamarías:
     * - courseDAO.updateCoursesStateByInstructor(idParam, "Inactivo")
     */

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: "Cuenta eliminada correctamente."
    });

  } catch (error) {
    console.error("❌ deleteUserController:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

const uploadProfileImageController = async (req, res) => {
  const { userId } = req.params;

  try {
    // ✅ solo su propia cuenta
    const tokenUserId = req.user?.userId;
    if (!tokenUserId || Number(tokenUserId) !== Number(userId)) {
      return res.status(HttpStatusCodes.FORBIDDEN).json({
        success: false,
        message: "No tienes permiso para actualizar la imagen de otro usuario.",
      });
    }

    if (!req.file) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No se recibió ninguna imagen (profileImage).",
      });
    }

    // ✅ path relativo (NO depende del host interno docker)
    const relativePath = `/uploads/profile_images/${req.file.filename}`;

    // ✅ guarda el path relativo en DB
    const result = await updateUserBasicProfile(userId, {
      profileImageUrl: relativePath,
    });

    if (!result || result.affectedRows <= 0) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({
        success: false,
        message: "Usuario no encontrado o no se realizaron cambios",
      });
    }

    // ✅ si quieres devolver también URL absoluta, usa base pública
    // Configúralo en .env del users_service:
    // PUBLIC_BASE_URL=http://10.0.2.2:8080   (local android)
    // o en prod: https://api.tudominio.com
    const publicBase = process.env.PUBLIC_BASE_URL;
    const absoluteUrl = publicBase ? `${publicBase}${relativePath}` : null;

    return res.status(HttpStatusCodes.OK).json({
      success: true,
      message: "Imagen de perfil actualizada correctamente",
      profileImageUrl: absoluteUrl ?? relativePath, // compat: si no hay base, manda path
      profileImagePath: relativePath,               // recomendado para android
    });
  } catch (error) {
    console.error("❌ uploadProfileImageController error:", error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};



module.exports = {
  registerUser,
  userLogin,
  verifyUser,
  fetchStudents,
  findUserByEmailJSONController,
  updateUserBasicProfileController,
  changePasswordController,
  deleteUserController,
  uploadProfileImageController
};

