const constants = require('../constants');

// fetch records from a collection 
// allow sorting by name or date and fetch a records with limit of 20 at a time
// and allow pagination with page number
// and check if the user has access to the collection.
module.exports = async function fetch_data_from_collection(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const this_user_role = req.user?.role || 'standard';
        const { collection_name } = req.params;
        let { page, limit, sort_by, sort_order } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        sort_by = sort_by || 'createdAt';
        sort_order = sort_order === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;

        if (!collection_name || typeof collection_name !== 'string') {
            return res.json({ status: false, message: "Invalid data Retry again" });
        }
        const existingCollections = await InstalledDB.listCollections({ name: collection_name }).toArray();
        if (existingCollections.length === 0) {
            return res.json({ status: false, message: "RecordBook not found" });
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
                    return res.json({ status: false, message: "You are not allowed to access this RecordBook" });
                }
            }
        }
        const totalRecords = await InstalledDB
            .collection(collection_name)
            .countDocuments();
        const records = await InstalledDB
            .collection(collection_name)
            .find({})
            .sort({ [sort_by]: sort_order })
            .skip(skip)
            .limit(limit)
            .toArray();

        return res.json({
            status: true,
            records: records,
            pagination: {
                total: totalRecords,
                page: page,
                limit: limit,
                totalPages: Math.ceil(totalRecords / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching data from collection:', error);
        return res.json({ status: false, message: "Something Got Wrong try again later" });
    }
}