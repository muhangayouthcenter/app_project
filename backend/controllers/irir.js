const constants = require('../constants');

// insert a record into a recordbook
module.exports = async function insert_record_into_recordbook(req, res) {
    try {
        const this_user = req.user?.name || 'testing';

        const { record } = req.body;
        const { collection_name } = req.params;
        if (!collection_name || typeof collection_name !== 'string' || !record || typeof record !== 'object' || Array.isArray(record)) {
            return res.json({ status: false, type: 'warning', message: "Invalid data Retry again" });
        }

        const existingCollections = await InstalledDB.listCollections({ name: collection_name }).toArray();
        if (existingCollections.length === 0) {
            return res.json({ status: false, type: 'error', message: "RecordBook not found" });
        }

        const this_user_role = req.user?.role || 'standard';
        if (this_user_role !== 'sudo' && req.body.from_app !== true) {
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

        const collectionAttributes = await InstalledDB
            .collection(constants.collection_to_hold_attributes_for_other_collections.name)
            .findOne({ collection_name: collection_name });
        if (!collectionAttributes) {
            return res.json({ status: false, type: 'error', message: "RecordBook not found" });
        }
        const fields = collectionAttributes.fields || [];
        for (let field of fields) {
            if (field.required && !(field.field_name in record)) {
                return res.json({ status: false, message: `Field ${field.field_name} is required` });
            }
            if (field.field_name in record) {
                const value = record[field.field_name];
                switch (field.input_type) {
                    case 'text':
                    case 'email':
                    case 'password':
                    case 'date':
                    case 'textarea':
                        if (typeof value !== 'string') {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be a string` });
                        }
                        break;
                    case 'number':
                        if (typeof value !== 'number') {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be a number` });
                        }
                        break;
                    case 'checkbox':
                        if (typeof value !== 'boolean') {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be a boolean` });
                        }
                        break;
                    case 'radio':
                    case 'select':
                        if (typeof value !== 'string' || (field.data_if_isselect && field.data_if_isselect.length > 0 && !field.data_if_isselect.includes(value))) {
                            return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} must be one of the predefined options` });
                        }
                        break;
                    default:
                        return res.json({ status: false, type: 'warning', message: `Unknown input type for field ${field.field_name}` });
                }
            }
        }

        const insertResult = await InstalledDB
            .collection(collection_name)
            .insertOne(record);
        if (insertResult.acknowledged) {
            return res.json({ status: true, type: 'success', message: "data save successfully." });
        } else {
            console.error('Failed to insert record:', insertResult);
            return res.json({ status: false, type: 'error', message: "Failed to save data, try again later" });
        }
    } catch (error) {
        console.error('Error inserting record into RecordBook:', error);

        return res.json({ status: false, type: 'error', message: `Something Got Wrong while inserting record into RecordBook \n\nERROR MESSAGE \n\n${error.message}` });
    }
}
//.