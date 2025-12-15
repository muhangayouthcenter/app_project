const { ObjectId } = require('mongodb');

module.exports = async function update_admin_power_email(req, res) {
    try {

        const { email_id, new_email } = req.body;


        if (!email_id || typeof email_id !== 'string') {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Email ID is required and must be a string'
            });
        }

        if (!new_email || typeof new_email !== 'string') {
            return res.json({
                status: false,
                type: 'warning',
                message: 'New email is required and must be a string'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(new_email)) {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Invalid email format'
            });
        }

        const existingEmail = await InstalledDB
            .collection('admin_power_emails')
            .findOne({ email: new_email });

        if (existingEmail) {
            return res.json({
                status: false,
                type: 'warning',
                message: 'This new email is already in the admin power emails list'
            });
        }

        let query = { email: email_id };

        try {
            query = { _id: new ObjectId(email_id) };
        } catch (e) {
            query = { email: email_id };
        }

        const updateResult = await InstalledDB
            .collection('admin_power_emails')
            .updateOne(query, {
                $set: {
                    email: new_email
                }
            });

        if (updateResult.matchedCount === 0) {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Email not found in admin power emails list'
            });
        }

        if (updateResult.modifiedCount === 1) {
            return res.json({
                status: true,
                type: 'success',
                message: `Email updated successfully from ${email_id} to ${new_email}`
            });
        } else {
            return res.json({
                status: false,
                type: 'warning',
                message: 'No changes were made'
            });
        }

    } catch (error) {
        console.error('Error updating admin power email:', error);
        return res.json({
            status: false,
            type: 'error',
            message: `Something went wrong \n\nERROR MESSAGE\n\n${error.message}`
        });
    }
}
