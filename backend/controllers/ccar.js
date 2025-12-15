const constants = require('../constants');

// create new collection with fields.
module.exports = async function create_collection_as_recordBook(req, res) {
    try {

        let { collection_name = null, fields = null } = req.body;

        if (!collection_name || typeof collection_name !== 'string' || !fields || !Array.isArray(fields) || fields.length === 0) {
            return res.json({ status: false, type: 'warning', message: "Invalid data, check and Retry again" });
        }

        const existingCollections = await InstalledDB.listCollections({ name: collection_name }).toArray();
        if (existingCollections.length > 0) {
            return res.json({ status: false, type: 'warning', message: `RecordBook  with NAME(${collection_name}) already exists. Please choose a different name.` });
        }
        const createCol = await InstalledDB.createCollection(collection_name);
        if (createCol) {

            await InstalledDB
                .collection(constants.collection_to_hold_attributes_for_other_collections.name)
                .insertOne({
                    collection_name: collection_name,
                    fields: fields
                });
            return res.json({ status: true, type: 'success', message: `RecordBook ${collection_name} created successfully` });
        } else {
            console.error('Failed to create collection:', createCol);
            return res.json({ status: false, type: 'error', message: `Failed to create RecordBook, try again later. \n\n ERROR MESSAGE: \n\n"""${createCol}"""` });
        }

    } catch (error) {
        console.error('Error creating RecordBook:', error);
        return res.json({ status: false, type: 'error', message: "Something Got Wrong try again later" });
    }

}