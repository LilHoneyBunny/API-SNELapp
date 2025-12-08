const nodemailer = require("nodemailer");

async function sendReportEmail(toEmail, subject, text, attachmentPath) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: `"MINAO Systems" <${process.env.EMAIL_APP}>`,
        to: toEmail,
        subject: subject,
        text: text,
        attachments: [
            {
                filename: "StudentReport.pdf",
                path: attachmentPath
            }
        ]
    });

    console.log("Email sent:", info.messageId);
}

module.exports = { sendReportEmail };