const nodemailer = require('nodemailer');
const fs = require('fs');
const crypto = require('crypto');

const loadTemplate = (filePath, replacements) => {
    const template = fs.readFileSync(filePath, 'utf8');
    return Object.keys(replacements).reduce((template, key) => {
        return template.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
    }, template);
};

const sendEmail = async (to, subject, htmlContent = {}) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:process.env.EMAIL_APP,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: `"MINAO Systems" <${process.env.EMAIL_APP}>`, 
        to,
        subject,
        html: htmlContent
    }

    try{
        await transporter.sendMail(mailOptions);
        console.log(`Verification code sent to ${to}`);
    }catch(error){
        console.log(`The verification email could not be sent.`, error);
        throw error;
    }
};

const generateVerificationCode = () => {
    return crypto.randomInt(10000, 99999).toString();
};

module.exports={sendEmail, generateVerificationCode, loadTemplate};