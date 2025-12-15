const constants = require('../constants.js');
//.
module.exports = async function get_record_fillable_fields(req, res) {

    try {
         const { collection_name } = req.params;

         const collection = await InstalledDB
         .collection(constants.collection_to_hold_attributes_for_other_collections.name)
         .findOne({
            collection_name: collection_name
         });

         if(!collection) {
            return res.json({
                status: false,
                type: 'warning',
                message: "RecordBook not found!"
            });
         }

         const {fields} = collection;

         return res.json({
            status: true,
            type: 'success',
            data: {
                collection_name: collection_name,
                fields: fields
            }
         })

    } catch(e) {
        console.error('An error occured while executing get fillbale fields', e);
        return res.json({
            status: false,
            warning: 'error', 
            message: "Something got wrong try again later!"
        })
    }

}