const constants = require('../constants');
const crypto = require('crypto');

// Standard user password change (self-service)
module.exports = async function standard_change_password(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            return res.json({ status: false, message: 'All password fields are required' });
        }
        if (new_password !== confirm_password) {
            return res.json({ status: false, message: 'New password and confirmation do not match' });
        }
        if (typeof new_password !== 'string' || new_password.length < 8) {
            return res.json({ status: false, message: 'New password must be at least 8 characters' });
        }

        const userCol = InstalledDB.collection(constants.collections.standard);
        const userDoc = await userCol.findOne({ username: this_user });
        if (!userDoc) return res.json({ status: false, message: 'User not found' });

        // verify current password
        const storedAlgo = userDoc.password_algo || 'plain';
        const storedSalt = userDoc.password_salt || null;
        let currentMatches = false;

        if (storedAlgo === 'scrypt' && storedSalt) {
            try {
                const derived = crypto.scryptSync(current_password, storedSalt, 64).toString('hex');
                currentMatches = derived === userDoc.password;
            } catch (e) {
                currentMatches = false;
            }
        } else {
            // legacy plain-text fallback
            currentMatches = current_password === userDoc.password;
        }

        
        if (!currentMatches) return res.json({ status: false, message: 'Current password is incorrect' });

        // ensure new password isn't same as old
        let newIsSame = false;
        if (storedAlgo === 'scrypt' && storedSalt) {
            const newDerived = crypto.scryptSync(new_password, storedSalt, 64).toString('hex');
            newIsSame = newDerived === userDoc.password;
        } else {
            newIsSame = new_password === userDoc.password;
        }
        if (newIsSame) return res.json({ status: false, message: 'New password must be different from the current password' });

        // create new salt and hash
        const newSalt = crypto.randomBytes(16).toString('hex');
        const newHash = crypto.scryptSync(new_password, newSalt, 64).toString('hex');

        const updateResult = await userCol.updateOne({ username: this_user }, { $set: { password: newHash, password_salt: newSalt, password_algo: 'scrypt', password_changed_at: new Date() } });

        if (updateResult.acknowledged) {
            return res.json({ status: true, message: 'Password updated successfully' });
        }
        return res.json({ status: false, message: 'Failed to update password, try again later' });

    } catch (error) {
        console.error('Error changing standard user password:', error);
        return res.json({ status: false, message: 'Something Got Wrong try again later' });
    }
};
