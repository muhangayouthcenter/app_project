const constants = require('../constants');

// create a standard user to access the system.
module.exports = async function create_standard_user(req, res) {
    try {

        const allFieldsToJSON = req.body.user;
        if (!allFieldsToJSON || typeof allFieldsToJSON !== 'object' || Array.isArray(allFieldsToJSON)) {
            return res.json({ status: false, type: 'warning', message: "Invalid data Retry again" });
        }

        const saveUser = await InstalledDB
            .collection(constants.collections.standard)
            .insertOne(allFieldsToJSON);

        if (saveUser.acknowledged) {
            return res.json({ status: true, type: 'success', message: "User created successfully" });
        } else {
            console.error('Failed to create standard user:', saveUser);
            return res.json({ status: false,type: 'warning', message: "Failed to create user, try again later" });
        }

    } catch (error) {
        console.error('Error creating standard user:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong while creating user \n\nERROR MESSAGE\n\n ${error.message}` });
    }
}