const constants = require("../constants.js");
const send_email = require("../utilities/send_email.js");
const schema = require("../utilities/reset_password_email_schema.js");
const crypto = require("crypto");
const PasswordMNGT = require("../utilities/password_mngt.js");

module.exports = async function sudo_forgot_password(req, res) {
    try {

        const username = req.body.username;

        if (!username) {
            return res.json({ status: false, message: "username is required" });
        }

        const user = await InstalledDB.collection(constants.collections.administrator)
            .findOne({ username: username });

        if (!user) {
            return res.json({ status: false, message: "Invalid username!" });
        }

        const newPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await new PasswordMNGT().encrypt(newPassword);
        const Schema = await schema(
            constants.logo_pin,
            "Password Changed",
            `Hello 👋🏼 ${username} your new password: <b><i>${newPassword}</i></b>`
        );

        const send = await send_email(
            constants.Google.username,
            '🔑Password Reset',
            Schema
        );
        

        if (!send.status) {
            return res.json({ status: false, message: "Something got wrong retry later!" });
        }
        const updateResult = await InstalledDB
            .collection(constants.collections.administrator)
            .updateOne({ username: username }, {
                $set: {
                    password: hashedPassword.hash
                }
            });


        return res.json({ status: true, message: `New password sent to ${constants.Google.username.slice(0, 4)}***@gmail.com` })



    } catch (e) {
        console.error("Error while executing sudo forgot password", e);
        return res.json({
            status: false,
            message: "Something got wrong try again later!"
        })
    }

}