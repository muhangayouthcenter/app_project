const constants = require('../constants');
const crypto = require('crypto');
const PasswordMNGT = require('../utilities/password_mngt.js');

// Admin (sudo) password change — requires the requester to be sudo role
module.exports = async function sudo_change_password(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const this_role = req.user?.role || 'standard';
        if (this_role !== 'sudo') return res.json({ status: false, type: 'warning', message: 'Unauthorized' });

        const { target_username, new_password, confirm_password } = req.body;
        if (!target_username || !new_password || !confirm_password) {
            return res.json({ status: false, type: 'warning', message: 'Missing fields' });
        }
        if (new_password !== confirm_password) return res.json({ status: false, type: 'warning', message: 'Passwords do not match' });
        if (typeof new_password !== 'string' || new_password.length < 4) return res.json({ status: false, type: 'warning', message: 'Password must be at least 4 characters' });

        const adminCol = InstalledDB.collection(constants.collections.administrator);
        const userCol = InstalledDB.collection(constants.collections.standard);

        // Allow changing either admin or standard user's password depending on target_username.

        let targetDoc = await adminCol.findOne({ username: target_username });
        let targetCollection = adminCol;
        

        if (!targetDoc) {
            targetDoc = await userCol.findOne({ username: target_username });
            targetCollection = userCol;
        }
        if (!targetDoc) return res.json({ status: false, type: 'warning', message: 'This user account not found' });

        const newSalt = crypto.randomBytes(16).toString('hex');
        const newHash = crypto.scryptSync(new_password, newSalt, 64).toString('hex');

        const updateResult = await targetCollection.updateOne({ username: target_username }, { $set: { password: newHash, password_salt: newSalt, password_algo: 'scrypt', password_changed_at: new Date() } });

        if (updateResult.acknowledged) return res.json({ status: true, type: 'success', message: 'Password updated successfully' });
        return res.json({ status: false, type: 'warning', message: 'Failed to update password try again later' });

    } catch (error) {
        console.error('Error changing sudo password:', error);
        return res.json({ status: false, type: 'warning', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n${error.message}` });
    }
};
