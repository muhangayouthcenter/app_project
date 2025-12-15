const constants = require('../constants');

// modify own standard user account but first check if all fields are provided as were described before
module.exports = async function standard_modify_own_account(req, res) {

    try {
        const this_user = req.user?.name || 'testing';
        const updateData = req.body;

        if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
            return res.json({ status: false, type: 'warning', message: 'Invalid data. Retry again' });
        }

        // Do not allow updating the _id field from client
        if ('_id' in updateData) delete updateData._id;

        // Fetch current user document
        const userDoc = await InstalledDB
            .collection(constants.collections.standard)
            .findOne({ username: this_user });

        if (!userDoc) {
            return res.json({ status: false, type: 'warning', message: 'This account does not exists!' });
        }

        // username can't be changed.
        if ('username' in updateData) {
            return res.json({ status: false, type: 'warning', message: `Username can't be changed once created!` });
        }

        // If accessible_collections provided, it is progibited
        if ('accessible_collections' in updateData) {
            return res.json({ status: false, type: 'warning', message: 'You are updating something your are not allowed!' });
        }

        // Build $set payload with provided keys only
        const setPayload = {};
        for (let key of Object.keys(updateData)) {
            // avoid writing undefined
            if (typeof updateData[key] !== 'undefined') {
                setPayload[key] = updateData[key];
            }
        }

        if (Object.keys(setPayload).length === 0) {
            return res.json({ status: false, type: 'warning', message: 'No valid data to update' });
        }

        const updateResult = await InstalledDB
            .collection(constants.collections.standard)
            .updateOne({ username: this_user }, { $set: setPayload });

        if (updateResult.acknowledged && updateResult.modifiedCount > 0) {
            return res.json({ status: true, type: 'success', message: 'your account updated successfully' });
        } else if (updateResult.acknowledged && updateResult.matchedCount > 0 && updateResult.modifiedCount === 0) {
            return res.json({ status: true, type: 'warning', message: 'No changes were made (data may be identical to existing values)' });
        } else {
            console.error('Failed to update user account:', updateResult);
            return res.json({ status: false, type: 'warning', message: 'Failed to update account, try again later' });
        }
        

    } catch (error) {
        console.error('Error modifying own account:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n ${error.message}` });
    }

}