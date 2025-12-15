const constants = require('../constants');
const PasswordMNGT = require("../utilities/password_mngt.js");


// Method to create own account using the link.
module.exports = async function standard_create_own_account_using_link(req, res) {
    try {
        const { create_account_link } = req.params;
        const accountData = req.body;
        if (!create_account_link || typeof create_account_link !== 'string' || !accountData || typeof accountData !== 'object' || Array.isArray(accountData)) {
            return res.json({ status: false, type: 'warning', message: "Invalid data Recheck and try again later." });
        }
        const linkDoc = await InstalledDB
            .collection(constants.account_creation_collection_name)
            .findOne({ link: create_account_link });


        const currentTime = new Date();
        if (linkDoc.expires_at < currentTime) {
            return res.json({ status: false, type: 'warning', message: "This Link has expired contact adminstrator for new Link" });
        }



        if (!linkDoc) {
            return res.json({ status: false, type: 'warning', message: "Invalid Link or has expired contact adminstrator for new Link" });
        }
        if (linkDoc.used) {
            return res.json({ status: false, type: 'warning', message: "This Link has already been used to create an account" });
        }


        const username = accountData.username;
        if (!username || typeof username !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Username is required!" });
        }

        const password = accountData.password;
        if (!password || typeof password !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Password is required1" });
        }

        const isnameTaken = await InstalledDB
            .collection(constants.collections.standard)
            .findOne({ username: username });
        if (isnameTaken) {
            return res.json({ status: false, type: 'warning', message: "Username already exists. Please choose a different username." });
        }


        const fieldsSchema = linkDoc.fields_schema || [];
        for (let field of fieldsSchema) {
            if (field.required && !(field.field_name in accountData)) {
                return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} is required` });
            }
            if (field.field_name in accountData) {
                const value = accountData[field.field_name];
                switch (field.input_type) {
                    case 'text':
                    case 'email':
                    case 'password':
                    case 'date':
                    case 'textarea':
                        if (typeof value !== 'string') {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be a string` });
                        }
                        break;
                    case 'number':
                        if (typeof value !== 'number') {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be a number` });
                        }
                        break;
                    case 'checkbox':
                        if (typeof value !== 'boolean') {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be a boolean` });
                        }
                        break;
                    case 'radio':
                    case 'select':
                        if (typeof value !== 'string' || (field.data_if_isselect && field.data_if_isselect.length > 0 && !field.data_if_isselect.includes(value))) {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be one of the predefined options` });
                        }
                        break;
                    default:
                        return res.json({ status: false, type: 'warning', message: `Unknown input type for field ${field.field_name}` });
                }
            }
        }

        const PM = new PasswordMNGT();
        const hashedPassword = await PM.encrypt(password);

        if (!hashedPassword.status) {
            return res.json({ status: false, type: 'error', message: "Something got wrong try later!" });
        }

        accountData.password = hashedPassword.hash;
        accountData.is_activated = true;
        const insertResult = await InstalledDB
            .collection(constants.collections.standard)
            .insertOne({
                ...accountData,
                accessible_collections: linkDoc.accessible_collections || []
            });
        if (insertResult.acknowledged) {
            await InstalledDB
                .collection(constants.account_creation_collection_name)
                .updateOne({ link: create_account_link }, { $set: { used: true } });
            return res.json({ status: true, type: 'success', message: `Hello ${username || ''} your account saved, Go and Login` });
        } else {
            console.error('Failed to create account:', insertResult);
            return res.json({ status: false, type: 'warning', message: "Failed to create account, try again later" });
        }
    } catch (error) {
        console.error('Error creating account using link:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n${error.message}` });
    }
}