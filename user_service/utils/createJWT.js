const jwt = require('jsonwebtoken');

const generateJWT = (username = '' )=>{

    return new Promise((resolve, reject)=>{

        const payload = {username};

        jwt.sign(payload, process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err,token)=>{
                if(err){
                    reject(new Error('Unable to generate token'));
                } else {
                    resolve(token);
            }
        })
    })
}

module.exports = { generateJWT };