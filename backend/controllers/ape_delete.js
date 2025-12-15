module.exports = async function delete_admin_power_email(req, res) {
    try {

        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Email is required and must be a string'
            });
        }

        
        let query = { email: email };
        
        
        const deleteResult = await InstalledDB
            .collection('admin_power_emails')
            .deleteOne(query);

        if (deleteResult.deletedCount === 1) {
            return res.json({
                status: true,
                type: 'success',
                message: `Email deleted successfully from admin power emails`
            });
        } else {
            return res.json({
                status: false,
                type: 'warning',
                message: 'Email not found in admin power emails list'
            });
        }

    } catch (error) {
        console.error('Error deleting admin power email:', error);
        return res.json({
            status: false,
            type: 'error',
            message: `Something went wrong \n\nERROR MESSAGE\n\n${error.message}`
        });
    }
}
