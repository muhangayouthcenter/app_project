const constants = require('../constants');
const { ObjectId } = require('mongodb');

// delete a record from a collection by its _id.
module.exports = async function delete_data_from_collection(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const this_user_role = req.user?.role || 'standard';
        const { collection_name } = req.params;
        const { record_id } = req.params;
        if (!collection_name || typeof collection_name !== 'string' || !record_id || typeof record_id !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Invalid collection name or collection id" });


        }

       
        const existingCollections = await InstalledDB.listCollections({ name: collection_name }).toArray();
        if (existingCollections.length === 0) {
            return res.json({ status: false, type: 'warning', message: "RecordBook not found" });
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
                    return res.json({ status: false, type: 'warning', message: "You are not allowed to delete from this RecordBook" });
                }
            }
        }
        const recordObjectId = new ObjectId(record_id);
        const deleteResult = await InstalledDB
            .collection(collection_name)
            .deleteOne({ _id: recordObjectId });
        if (deleteResult.deletedCount === 1) {
            return res.json({ status: true, type: 'success', message: "Record deleted successfully" });
        }
        return res.json({ status: false, type: 'warning', message: "data to delete doesn't exists" });
    } catch (error) {
        console.error('Error deleting data from collection:', error);
        return res.json({ status: false, message: `Something Got Wrong while deleting data \n\nERROR MESSAGE\n\n${error.message}` });
    }
}