const constants = require('../constants');

// update a record in a collection by its _id
module.exports = async function update_data_in_collection(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const this_user_role = req.user?.role || 'standard';
        const { collection_name } = req.params;
        const { record_id, updated_fields } = req.body;

        if (!collection_name || typeof collection_name !== 'string' || !record_id || typeof record_id !== 'string' || !updated_fields || typeof updated_fields !== 'object' || Array.isArray(updated_fields)) {
            return res.json({ status: false, type: 'warning', message: "Invalid data Retry again" });
        }
        const existingCollections = await InstalledDB.listCollections({ name: collection_name }).toArray();
        if (existingCollections.length === 0) {
            return res.json({ status: false, type: 'error', message: "RecordBook not found" });
        }

        if (this_user_role !== 'sudo') {
            const userDoc = await InstalledDB
                .collection(constants.collections.standard)
                .findOne({ username: this_user });
            const accessible_collections = userDoc?.accessible_collections || [];
            if (!accessible_collections.includes(collection_name)) {
                const collectionDoc = await InstalledDB
                    .collection(constants.collection_to_hold_attributes_for_other_collections.name)
                    .findOne({ collection_name: collection_name });
                if (collectionDoc?.created_by !== this_user) {
                    return res.json({ status: false, type: 'warning', message: "You don't have permission to insert data in this RecordBook! Contact admin for help." });
                }
            }
        }


        const { ObjectId } = require('mongodb');
        const recordObjectId = new ObjectId(record_id);
        const updateResult = await InstalledDB
            .collection(collection_name)
            .updateOne({ _id: recordObjectId }, { $set: updated_fields });
        if (updateResult.matchedCount === 0) {
            return res.json({ status: false, type: 'warning', message: "everything is uptodate" });
        }
        if (updateResult.modifiedCount === 1) {
            return res.json({ status: true, type: 'success', message: "Record updated successfully" });
        }
        return res.json({ status: false, type: 'warning', message: "No changes made to the record" });
    } catch (error) {
        console.error('Error updating data in collection:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong while updating \n\nERROR MESSAGE\n\n ${error.message}` });
    }
}
