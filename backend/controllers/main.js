const index = require('./index.js');
const sudo_fetch_collections = require("./sfc.js");
const create_standard_user = require("./csu.js");
const create_collection_as_recordBook = require('./ccar.js');
const fetch_all_collections_with_attributes = require("./facwa.js");
const fetch_data_from_collection = require("./fdfc.js");
const insert_record_into_recordbook = require("./irir.js");
const update_data_in_collection = require("./udic.js");
const delete_data_from_collection = require("./ddfc.js");
const sudo_create_self_account_creation_link = require("./scsacl.js");
const send_account_creation_data_with_fields_to_fill = require("./sacdwftf.js");
const standard_create_own_account_using_link = require("./scoaul.js");
const standard_send_modify_own_account_fields = require("./ssmoaf.js");
const standard_modify_own_account = require("./smoa.js");
const standard_change_password = require('./standard_change_password.js');
const sudo_change_password = require('./sudo_change_password.js');
const standard_user_login = require("./stdul.js");
const sudo_login = require("./sl.js")
const sudo_forgot_password = require("./sfp.js");
const standard_forgot_password = require("./stdfp.js");
const get_record_fillable_fields = require("./grf.js");
const user_info = require("./userinfo.js");
const endpoints_documentation = require("./endpoints_documentation.js");
const add_admin_power_email = require("./ape_add.js");
const update_admin_power_email = require("./ape_update.js");
const list_admin_power_emails = require("./ape_list.js");
const delete_admin_power_email = require("./ape_delete.js");
const check_admin_power_email = require("./ape_check.js");
const send_credentials_to_admin_emails = require("./ape_send_credentials.js");
const validate_token = require("./check_token.js");

exports.Handler = {
    index,
    sudo_fetch_collections,
    create_standard_user,
    create_collection_as_recordBook,
    fetch_all_collections_with_attributes,
    fetch_data_from_collection,
    insert_record_into_recordbook,
    update_data_in_collection,
    delete_data_from_collection,
    sudo_create_self_account_creation_link,
    send_account_creation_data_with_fields_to_fill,
    standard_create_own_account_using_link,
    standard_send_modify_own_account_fields,
    standard_modify_own_account,
    standard_change_password,
    sudo_change_password,
    standard_user_login,
    sudo_login,
    sudo_forgot_password,
    standard_forgot_password,
    get_record_fillable_fields,
    user_info,
    endpoints_documentation,
    add_admin_power_email,
    update_admin_power_email,
    list_admin_power_emails,
    delete_admin_power_email,
    check_admin_power_email,
    send_credentials_to_admin_emails,
    validate_token
};