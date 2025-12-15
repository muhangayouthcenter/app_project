const constants = require('../constants');

// first send a request to get the fields to be filled for the user

module.exports = async function standard_send_modify_own_account_fields(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const userDoc = await InstalledDB
            .collection(constants.collections.standard)
            .findOne({ username: this_user });
        if (!userDoc) {
            return res.json({ status: false, type: 'warning', message: "Account not found!" });
        }
        const fields_to_be_filled = Object.keys(userDoc).filter(key => key !== 'username' && key !== 'accessible_collections' && key !== '_id' && key !== '__v');
        return res.json({ status: true, type: 'success', message: "Fields to be filled", fields_to_be_filled: fields_to_be_filled });
    } catch (error) {
        console.error('Error fetching fields to be filled for own account modification:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n ${error.message}` });
    }
    
}