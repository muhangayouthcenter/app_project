const constants = require('../constants');


// Method to send account creation data with fields to fill if link is valid.
module.exports = async function send_account_creation_data_with_fields_to_fill(req, res) {
    try {
        const { create_account_link } = req.params;
        if (!create_account_link || typeof create_account_link !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Invalid Link!" });
        }
        const linkDoc = await InstalledDB
            .collection(constants.account_creation_collection_name)
            .findOne({ link: create_account_link });
        if (!linkDoc) {
            return res.json({ status: false, type: 'warning', message: "Invalid Link or has expired contact adminstrator for new Link" });
        }
        if (linkDoc.used) {
            return res.json({ status: false, type: 'warning', message: "This Link has already been used to create an account" });
        }
        const currentTime = new Date();
        if (linkDoc.expires_at < currentTime) {
            return res.json({ status: false, type: 'warning', message: "This Link has expired contact adminstrator for new Link" });
        }
        return res.json({ status: true, type: 'success', message: "Link is valid", fields_to_be_filled: linkDoc.fields_to_be_filled });
    } catch (error) {
        console.error('Error validating account creation link:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n ${error.message}` });
    }
}
