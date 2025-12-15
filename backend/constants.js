module.exports = {
    "logo_pin": "https://i.pinimg.com/736x/25/88/1f/25881f9b9b4472759e725e848f23a9bf.jpg",
    "maindb": "mycdars",
    "mongodb": {
        "username": "muhangayouthcenter_db_user",
        "password": "CqczvPHlaqH3IKLz",
        "local_uri": "mongodb://localhost:27017/mycdars",
        "online_uri": "mongodb+srv://muhangayouthcenter_db_user:CqczvPHlaqH3IKLz@recordmanagment.dc2ptwt.mongodb.net/mycdars?appName=RecordManagment&retryWrites=true&w=majority"
    },
    "collections": {
        "administrator": "sudo",
        "standard": "users"
    },
    "record_collection_schema": {
        "type": "collection_name",
        "fields": [
            {
                "field_name": "name",
                "input_type": "text",
                "required": [true | false],
                "default_value": "",
                "unique": [true, false],
                "data_if_isselect": []
            }
        ]
    },
    "collection_to_hold_attributes_for_other_collections": {
        "name": "collection_attributes",
        "schema": {
            "collection_name": "string",
            "type": ["dailyrecord", "onetimeentry"],
            "created_by": "string",
            "fields": {}
        }
    },
    "sudo_credentials": {
        "username": "mycdars",
        "plain_password": "mycdars1011",
        "password": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjI1MTI2NjksImRhdGEiOiJteWNkYXJzMTAxMSIsImlhdCI6MTc1OTkyMDY2OX0.ujbTHjc-5KSuzgBm_UgOeYs_vHHSHVxNCyVVf3O1LyQ",
        "is_modified": false
    },
    "account_creation_link_validity_in_hours": 24,
    "account_creation_link_length": 32,
    "account_creation_collection_name": "account_creation_links",
    "account_creation_collection_name_schema": {
        "link": "string",
        "accessible_collections": "array",
        "fields_to_be_filled": "array",
        // fields to be filled schema
        "fields_schema": {
            "field_name": "string",
            "input_type": "string",
            "required": "boolean",
            "default_value": "string",
            "unique": "boolean",
            "data_if_isselect": "array"
        },
        "created_by": "string",
        "created_at": "date",
        "expires_at": "date",
        "used": "boolean"
    },
    "input_box_types": [
        "text",
        "email",
        "number",
        "password",
        "date",
        "checkbox",
        "radio",
        "textarea",
        "select"
    ],
    "Google": {
        "username": "muhangayouthcenter@gmail.com",
        "password": "ixny kqoo rjcq itnn"
    },
    "jwt_secret": "ffacd0b85a97d-4255d8ab960sm29089682f8f",
    "jwt_expire_in": "",
    "Gmail": {
        "Account": {
            "email": "muhangayouthcenter@gmail.com",
            "password": 'muHanga2025',
            "backup_codes": `
            
                                             6. 9803 0940
            2. 2333 7921		             7. 0075 0114
            3. 8384 4133		             8. 5009 9582
            4. 1717 6179		             9. 4786 5367
            5. 9928 4923		             10. 3464 1822

            `
        }
    }
}