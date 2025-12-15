const bcrypt = require('bcryptjs');

class PasswordMNGT {
    constructor() { }

    async encrypt(password) {
        try {

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            return {
                status: true,
                hash: hash
            }

        } catch (e) {
            console.error("Error while hashing password", e)
            return {
                status: false,
                hash: null
            }
        }
        
    }

    async decrypt(password, hash) {
        try {
            return {
                status: true,
                match: bcrypt.compareSync(password, hash)
            }
        } catch (e) {
            console.error("Error occured while comparing passwords", e)
            return {
                status: false,
                match: null
            }
        }
    }
}

module.exports = PasswordMNGT;