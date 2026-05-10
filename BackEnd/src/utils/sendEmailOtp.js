const nodemailer = require("nodemailer")

const sendEmailOtp = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP verification",
        text: `Your OTP is ${otp}`
    })
}

module.exports = sendEmailOtp;