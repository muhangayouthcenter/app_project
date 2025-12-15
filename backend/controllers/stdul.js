const PasswordMNGT = require("../utilities/password_mngt.js");
const constants = require("../constants.js");
const jwt = require("../utilities/jwt.js");

module.exports = async function standard_user_login(req, res) {
    try {

        const username = req.body.username;
        const password = req.body.password;
        if(!username || !password) {
            return res.json({status: false, type: 'warning', message: "All fields are required!"});
        }

        const user = await InstalledDB
        .collection(constants.collections.standard)
        .findOne({ username: username });

        if(!user) {
            return res.json({status: false, type: 'warning', message: "Invalid credentials or account wos deleted!"});
        }
        

        if(!user.is_activated) {
            return res.json({status: false, type: 'warning', message: "Account not activated, contact Adminstrator to activate your account!"});
        }

        const passMatch = await new PasswordMNGT().decrypt(password, user.password);
        if(!passMatch.status || !passMatch.match) {
             return res.json({status: false, type: 'warning', message: "Invalid credentials."});
        }

        const jwtToken = await jwt.sign({
            username: user.username,
            role: 'standard'
        });

        return res.json({
            status: true,
            type: 'success',
            message: `Hello ${user.username} You've Logged-in`,
            access_token: jwtToken.data,
            username: user.username,
            role: 'standard'
        })




    } catch(e) {
        console.error("Error while standard user login", e);
        return res.json({status: false, type: 'error', message: `Something got wrong try later \n\nERROR MESSAGE\n\n ${e.message}`});
    }
}