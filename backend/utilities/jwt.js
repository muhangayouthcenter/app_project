const constants = require("../constants.js");
const jwt = require("jsonwebtoken");

module.exports = {
    sign: async (payload) => {
        try {

            return {
                status: true,
                data: jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                    data: payload
                }, constants.jwt_secret)

            }

        } catch (e) {
            console.error("Error in jwt sign", e)
            return {
                status: false
            }
        }
        
    },

    verify: async (payload) => {
        try {

            return {
                status: true,
                data: jwt.verify(payload, constants.jwt_secret, function (err, decoded) {
                    if (err) throw err;
                    return decoded.data
                })
            }

        } catch (e) {
            return {
                status: false
            }
        }
    }
}