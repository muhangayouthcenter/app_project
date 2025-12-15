const constants = require('../constants');

// fetch all collections with their attributes.
module.exports = async function fetch_all_collections_with_attributes(req, res) {

    try {

        let collections = [];

        collections = await InstalledDB
            .collection(constants.collection_to_hold_attributes_for_other_collections.name)
            .find({})
            .toArray();

        // For each collection attribute entry, add a `total` property
        // which is the number of documents in the named collection.
        collections = await Promise.all(collections.map(async (c) => {
            try {
                const name = c.collection_name || c.name || c.collection;
                if (!name) return { ...c, total: 0 };
                const total = await InstalledDB.collection(name).countDocuments();
                return { ...c, total };
            } catch (e) {
                console.error('Error counting collection', c.collection_name, e);
                return { ...c, total: 0 };
            }
        }));

        return res.json({ status: true, type: 'success', collections: collections });

    } catch (error) {
        console.error('Error fetching collections with attributes:', error);

        return res.json({ status: false, type: 'error', message: `Something got wrong while retrieving RecordBooks \n\nERROR MESSAGE \n\n ${error.message}` });
    }
}