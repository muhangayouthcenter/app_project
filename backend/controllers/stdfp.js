const constants = require("../constants.js");
const send_email = require("../utilities/send_email.js");
const schema = require("../utilities/reset_password_email_schema.js");
const crypto = require("crypto");
const PasswordMNGT = require("../utilities/password_mngt.js");

module.exports = async function standard_forgot_password(req, res) {
    try {

        const username = req.body.username;

        if (!username) {
            return res.json({ status: false, message: "username is required" });
        }

        const user = await InstalledDB.collection(constants.collections.standard)
            .findOne({ username: username });

        if (!user) {
            return res.json({ status: false, message: "Invalid username!" });
        }
        

        const email = user.email;
        const message = email ? `New password sent to your email ${email}, go and check it.`
            :
            `It looks like you haven't any email, we've sent your password to admin contact administrator for it.`;

        const newPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await new PasswordMNGT().encrypt(newPassword);
        const Schema = await schema(
            constants.logo_pin,
            email ? `Password Changed`  : `${username} requested for password reset`,
             email ? `Hello 👋🏼 ${username} your new password: <b><i>${newPassword}</i></b>` : `Hello Admin new password for ${username} is <b><i>${newPassword}</i></b> provide it to her/him.`
        );

        const send = await send_email(
            email ? email : constants.Google.username,
            '🔑Password Reset',
            Schema
        );

        if (!send.status) {
            return res.json({ status: false, message: "Something got wrong retry later!" });
        }
        const updateResult = await InstalledDB
            .collection(constants.collections.standard)
            .updateOne({ username: username }, {
                $set: {
                    password: hashedPassword.hash
                }
            });


        return res.json({ status: true, message: message })



    } catch (e) {
        console.error("Error while executing standard forgot password", e);
        return res.json({
            status: false,
            message: "Something got wrong try again later!"
        })
    }

}