const Router = require('express').Router();
const { Handler } = require('../controllers/main.js');


Router.get('/healthy', Handler.index); //ok
Router.get('/endpoints', Handler.endpoints_documentation); // endpoints documentation
Router.post('/sudo/csu', Handler.create_standard_user); //ok

Router.post('/recordbook', Handler.create_collection_as_recordBook); //ok
Router.get('/recordbooks', Handler.fetch_all_collections_with_attributes); //ok
Router.get('/recordbooks', Handler.fetch_all_collections_with_attributes); //ok

Router.get('/recordbook/:collection_name', Handler.fetch_data_from_collection); // priority ====
Router.post('/recordbook/:collection_name', Handler.insert_record_into_recordbook); //ok
Router.put('/recordbook/:collection_name', Handler.update_data_in_collection); //ok
Router.delete('/recordbook/:collection_name/:record_id', Handler.delete_data_from_collection); //ok
Router.get('/recordbook/fields/:collection_name', Handler.get_record_fillable_fields); // priority ===

// Standard user self account creation and modification management routes
// create a link to allow account creation from admin panel
Router.post('/sudo/accl', Handler.sudo_create_self_account_creation_link); //ok
Router.get('/standard/accl/:create_account_link', Handler.send_account_creation_data_with_fields_to_fill); //ok
// use the link to create own account



Router.post('/standard/:create_account_link', Handler.standard_create_own_account_using_link); //ok
Router.put('/standard/account', Handler.standard_modify_own_account); //ok
Router.get('/standard/account/fields', Handler.standard_send_modify_own_account_fields); //ok

// Password change endpoints
// Standard user changes own password
// Router.put('/standard/account/password', Handler.standard_change_password); //ommitted
// Sudo/admin changes a user's password
Router.post('/sudo/account/password', Handler.sudo_change_password); // ok but password managment not used here

Router.post("/standard/login", Handler.standard_user_login); // ok

Router.post("/sudo/login", Handler.sudo_login);
Router.post("/sudo/reset", Handler.sudo_forgot_password)
Router.post("/std/reset", Handler.standard_forgot_password)
Router.get("/userinfo", Handler.user_info)

// Admin Power Emails Management Routes
Router.post("/admin/emails/add", Handler.add_admin_power_email); // add email
Router.put("/admin/emails/update", Handler.update_admin_power_email); // update email
Router.get("/admin/emails/list", Handler.list_admin_power_emails); // list all emails
Router.delete("/admin/emails/delete", Handler.delete_admin_power_email); // delete email
Router.post("/admin/emails/check", Handler.check_admin_power_email); // check if email exists
Router.post("/admin/emails/send-credentials", Handler.send_credentials_to_admin_emails); // send credentials to all admin emails
Router.get('/token/validate', Handler.validate_token);

module.exports = Router