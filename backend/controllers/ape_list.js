

module.exports = async function list_admin_power_emails(req, res) {
    try {

        const emails = await InstalledDB
            .collection('admin_power_emails')
            .find({})
            .project({
                _id: 1,
                email: 1,
            })
            .toArray();

        if (!emails || emails.length === 0) {
            return res.json({
                status: true,
                type: 'success',
                message: 'No admin power emails found',
                total: 0,
                emails: []
            });
        }

        return res.json({
            status: true,
            type: 'success',
            message: 'Admin power emails retrieved successfully',
            total: emails.length,
            emails: emails
        });

    } catch (error) {
        console.error('Error listing admin power emails:', error);
        return res.json({
            status: false,
            type: 'error',
            message: `Something went wrong \n\nERROR MESSAGE\n\n${error.message}`
        });
    }
}
