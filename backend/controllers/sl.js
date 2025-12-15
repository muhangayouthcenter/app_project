const jwt = require("../utilities/jwt.js");

module.exports = async function sudo_login(req, res) {
      try {

        const username = req.body.username;
        const password = req.body.password;

        const name = "muHanga";
        const pass = "2025";

        if(!username || !password) {
            return res.json({status: false, type: 'warning', message: "All fields are required!"});
        }

        if(username !== name || password !== pass) {
            return res.json({status: false, type: 'warning', message: "Invalid username or password!"});
        }

        const jwtToken = await jwt.sign({
            username: username,
            role: 'sudo'
        });

        return res.json({
            status: true,
            type: 'success',
            message: `You have successfully logged in as administrator.`,
            username: username,
            access_token: jwtToken.data,
            role: 'sudo'
        })




    } catch(e) {
        console.error("Error while sudo login", e);
        return res.json({status: false, type: 'error', message: `Something got wrong try later \n\nERROR MESSAGE\n\n${e.message}`});
    }
}