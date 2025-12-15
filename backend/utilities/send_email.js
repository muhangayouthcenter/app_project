const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    secure: true,
    service: "gmail",
    auth: {
        user: 'muhangayouthcenter@gmail.com',
        pass: 'ixny kqoo rjcq itnn'
    }
});


module.exports = async function SendEmail(to, sub, html) {

    const mailOptions = {
        from: "Muhanga Library & computer Lab",
        to: to,
        subject: sub,
        html: html
    }

    
    return await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return resolve(
                    {
                        status: false,
                        message: "Failed"
                    }
                )
            } else {
                return resolve(
                    {
                        status: true,
                        message: "Email sent."
                    }
                )
            }
        });
    })



}
