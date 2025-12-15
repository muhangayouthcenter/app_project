const { MongoClient } = require('mongodb');
const constants = require('../constants.js');

const uri = process.env.NODE_ENV === 'production' ? constants.mongodb.online_uri : constants.mongodb.local_uri
const databaseName = constants.maindb
const client = new MongoClient(`${uri}`, { useNewUrlParser: true, useUnifiedTopology: true });


async function createAttributesCollectionIfNotExists() {

    try {
        const collections = await InstalledDB.listCollections({ name: constants.collection_to_hold_attributes_for_other_collections.name }).toArray();
        if (collections.length === 0) {
            await InstalledDB.createCollection(constants.collection_to_hold_attributes_for_other_collections.name);
            console.log(`Collection '${constants.collection_to_hold_attributes_for_other_collections.name}' created successfully.`);
        } else {
            console.log(`Collection '${constants.collection_to_hold_attributes_for_other_collections.name}' already exists.`);
        }
        return 1;
    } catch (error) {
        console.error('Error creating attributes collection:', error);
        process.exit(1);
    }
}


// check if account creation link collection exists, if not create it
async function createAccountCreationLinkCollectionIfNotExists() {

    try {
        const collections = await InstalledDB.listCollections({ name: constants.account_creation_collection_name }).toArray();
        if (collections.length === 0) {
            await InstalledDB.createCollection(constants.account_creation_collection_name);
            console.log(`Collection '${constants.account_creation_collection_name}' created successfully.`);
        } else {
            console.log(`Collection '${constants.account_creation_collection_name}' already exists.`);
        }
        return 1;
    } catch (error) {
        console.error('Error creating account creation link collection:', error);
        process.exit(1);
    }
}

// create collection to store admin_power emails if not exists

async function createAdminPowerEmailsCollectionIfNotExists() {

    try {
        const collections = await InstalledDB.listCollections({ name: 'admin_power_emails' }).toArray();
        if (collections.length === 0) {
            await InstalledDB.createCollection('admin_power_emails');

            // insert initial document muhangayouthcenter@gmail.com
            await InstalledDB.collection('admin_power_emails').insertOne({
                email: 'muhangayouthcenter@gmail.com'
            });
            
            console.log(`Collection 'admin_power_emails' created successfully.`);
        } else {
            console.log(`Collection 'admin_power_emails' already exists.`);
        }
        return 1;
    } catch (error) {
        console.error('Error creating admin_power_emails collection:', error);
        process.exit(1);
    }
}

// Check if admin user exists, if not create one

async function checkAdminAvailability() {

    try {

        let notAvailableAndUnmodified = true;
        const isAdminAvailable = await InstalledDB
            .collection(constants.collections.administrator)
            .findOne({
                username: constants.sudo_credentials.username,
                password: constants.sudo_credentials.password,
                is_modified: constants.sudo_credentials.is_modified
            });

            if(!isAdminAvailable){ 
                const isAdminModified = await InstalledDB
                .collection(constants.collections.administrator)
                .findOne({
                    is_modified: true
                });

                notAvailableAndUnmodified = isAdminModified ? false : true;
             } else {
                notAvailableAndUnmodified = false;
             }

             if(notAvailableAndUnmodified) {
                await InstalledDB
                .collection(constants.collections.administrator)
                .insertOne({
                    username: constants.sudo_credentials.username,
                    password: constants.sudo_credentials.password,
                    is_modified: constants.sudo_credentials.is_modified
                });
                console.log('Default admin user created');
             } else {
                console.log('Admin user already exists');
             }
             
            return 1;
    } catch (error) {
        console.error('Error checking admin availability:', error);
        process.exit(1);
    }

}

module.exports = async function connectToDatabase() {

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        global.InstalledDB = client.db(databaseName);
        console.log("checking admin availability");
        await checkAdminAvailability();
        await createAttributesCollectionIfNotExists();
        await createAccountCreationLinkCollectionIfNotExists();
        await createAdminPowerEmailsCollectionIfNotExists();
        return client;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}