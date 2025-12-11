const jwt = require('jsonwebtoken');

// payload: { userId, email, role }
const generateJWT = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    reject(new Error('Unable to generate token'));
                } else {
                    resolve(token);
                }
            }
        );
    });
};

module.exports = { generateJWT };
