const jwt = require('jsonwebtoken');
const HttpStatusCodes = require('../utils/enums');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            error: true,
            statusCode: HttpStatusCodes.UNAUTHORIZED,
            details: "Authorization header is missing"
        });
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            error: true,
            statusCode: HttpStatusCodes.UNAUTHORIZED,
            details: "Invalid Authorization header format"
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded => { userId, email, role, iat, exp }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
            error: true,
            statusCode: HttpStatusCodes.UNAUTHORIZED,
            details: "Invalid or expired token"
        });
    }
};

const requireRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            // Por seguridad, por si se usa sin verifyToken antes
            return res.status(401).json({
                error: true,
                statusCode: 401,
                details: "User not authenticated"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: true,
                statusCode: 403,
                details: "You do not have permission to perform this action"
            });
        }

        next();
    };
};

const requireInstructor = requireRole(['Instructor']);
const requireStudent   = requireRole(['Student']);

module.exports = { verifyToken, requireRole, requireInstructor, requireStudent };

