
const constants = require('../constants');
const crypto = require('crypto');


// Method to create a self account creation link for admin only no need to check user role here
module.exports = async function sudo_create_self_account_creation_link(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const { accessible_collections, fields_to_be_filled, validity_in_hours } = req.body;
        if (!Array.isArray(accessible_collections) || accessible_collections.length === 0 || !Array.isArray(fields_to_be_filled) || fields_to_be_filled.length === 0) {
            return res.json({ status: false, type: 'warning', message: "Invalid RecordBooks, inputs for filling or other, please recheck again." });
        }
        for (let field of fields_to_be_filled) {

            if (!field.field_name || typeof field.field_name !== 'string' || !field.input_type || typeof field.input_type !== 'string') {
                return res.json({ status: false, type: 'warning', message: "Invalid field schema in fields_to_be_filled" });
            }
            if (!constants.input_box_types.includes(field.input_type)) {
                return res.json({ status: false, type: 'warning', message: `Invalid input_type for field ${field.field_name}` });
            }
            if (typeof field.required !== 'boolean' || typeof field.unique !== 'boolean' || !Array.isArray(field.data_if_isselect)) {
                return res.json({ status: false, type: 'warning', message: `Invalid properties for field ${field.field_name}` });
            }

        }
        for (let col of accessible_collections) {
            const existingCollections = await InstalledDB.listCollections({ name: col }).toArray();
            if (existingCollections.length === 0) {
                return res.json({ status: false, type: 'warning', message: `This RecordBook ${col} does not exist` });
            }
        }

        // check if username and password fields are present in fields_to_be_filled and are all required
        const usernameField = fields_to_be_filled.find(f => f.field_name === 'username');
        const passwordField = fields_to_be_filled.find(f => f.field_name === 'password');

        if (!usernameField || !passwordField || !usernameField.required || !passwordField.required) {
            return res.json({ status: false, type: 'warning', message: "Both username and password fields must be present and required in fields to be filled" });
        }

        const link = crypto.randomBytes(constants.account_creation_link_length).toString('hex');
        const created_at = new Date();
        const expires_at = new Date(created_at.getTime() + ((validity_in_hours && typeof validity_in_hours === 'number' && validity_in_hours > 0 ? validity_in_hours : constants.account_creation_link_validity_in_hours) * 60 * 60 * 1000));

        const insertResult = await InstalledDB
            .collection(constants.account_creation_collection_name)
            .insertOne({
                link: link,
                accessible_collections: accessible_collections,
                fields_to_be_filled: fields_to_be_filled,
                fields_schema: fields_to_be_filled,
                created_by: this_user,
                created_at: created_at,
                expires_at: expires_at,
                used: false
            });
        if (insertResult.acknowledged) {
            return res.json({ status: true, type: 'success', message: "Account creation link generated successfully", link: link, expires_at: expires_at });
        } else {
            console.error('Failed to create account creation link:', insertResult);
            return res.json({ status: false, type: 'warning', message: "Failed to create account creation link, try again later" });
        }
    } catch (error) {
        console.error('Error creating account creation link:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n ${error.message}` });
    }
}
//.