const { request, response } = require("express");
const {resetTokens} = require('../controllers/userController');
const HttpStatusCodes = require('../utils/enums');

const verifyResetCode = async (req, res, next) => {
    const { email } = req.params;
    const { token } = req.body;
    const record = resetTokens[email];
    if (!record || record.token !== token || record.expiry < Date.now()) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            error: true,
            statusCode: HttpStatusCodes.UNAUTHORIZED,
            details: "Invalid or expired reset code."
        });
    }
    next();
};

module.exports = verifyResetCode;