const constants = require('../constants');

// fetch all available collections
module.exports = async function sudo_fetch_collections(req, res) {
    try {
        let collections = await InstalledDB.listCollections({}).toArray();
        collections = collections.map(col => col.name);
        collections = collections.filter(name => name !== constants.collections.administrator && name !== constants.collections.standard);
        return res.json({ status: true, type: 'success', collections: collections });
    } catch (error) {

        console.error('Error fetching collections:', error);
        return res.json({ status: false, type: 'error', message: `Something Got while retrieving RecordBooks \n\n ERROR MESSAGE \n\n ${error.message}` });
    }
}
//.