
module.exports = async function check_admin_power_email(req, res) {
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
                status: true,
                type: 'success',
                message: 'Administrator Access Granted.',
                exists: true,
                email: email
            });
        } else {
            return res.json({
                status: true,
                type: 'warning',
                message: 'This email isn\'t listed contact system administrator for help.',
                exists: false,
                email: email
            });
        }

    } catch (error) {
        console.error('Error checking admin power email:', error);
        return res.json({
            status: false,
            type: 'error',
            message: `Something went wrong \n\nERROR MESSAGE\n\n${error.message}`
        });
    }
}
