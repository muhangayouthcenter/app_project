
module.exports = async function add_admin_power_email(req, res) {
    try {
       
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Email is required and must be a string'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Invalid email format'
            });
        }

        const existingEmail = await InstalledDB
            .collection('admin_power_emails')
            .findOne({ email: email });

        if (existingEmail) {
            return res.json({
                status: false,
                type: 'warning',
                message: 'This email is already in the admin power emails list'
            });
        }

        
        const insertResult = await InstalledDB
            .collection('admin_power_emails')
            .insertOne({
                email: email,
            });

        if (insertResult.acknowledged) {
            return res.json({
                status: true,
                type: 'success',
                message: `Email ${email} added to admin power emails.`
            });
        } else {
            return res.json({
                status: false,
                type: 'error',
                message: 'Failed to add email, try again later'
            });
        }

    } catch (error) {
        console.error('Error adding admin power email:', error);
        return res.json({
            status: false,
            type: 'error',
            message: `Something went wrong \n\nERROR MESSAGE\n\n${error.message}`
        });
    }
}
