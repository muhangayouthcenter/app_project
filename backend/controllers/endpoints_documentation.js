
module.exports = async function endpoints_documentation(req, res) {
    try {
        const endpoints = [
            // ============= HEALTH & INFO =============
            {
                id: 1,
                name: "Health Check",
                method: "GET",
                path: "/api/healthy",
                description: "Check if API is running",
                auth: false,
                body_parameters: [],
                query_parameters: [],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Muhanga record managment system."
                }
            },

            // ============= AUTHENTICATION =============
            {
                id: 2,
                name: "Standard User Login",
                method: "POST",
                path: "/api/standard/login",
                description: "Login as standard user and get JWT token",
                auth: false,
                body_parameters: [
                    { name: "username", type: "string", required: true, description: "User's username" },
                    { name: "password", type: "string", required: true, description: "User's password" }
                ],
                query_parameters: [],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Hello {username} You've Logged-in",
                    access_token: "jwt_token_here",
                    username: "john",
                    role: "standard"
                }
            },

            {
                id: 3,
                name: "Admin/Sudo Login",
                method: "POST",
                path: "/api/sudo/login",
                description: "Login as admin/sudo user and get JWT token",
                auth: false,
                body_parameters: [
                    { name: "username", type: "string", required: true, description: "Admin's username" },
                    { name: "password", type: "string", required: true, description: "Admin's password" }
                ],
                query_parameters: [],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Hello {username} You've Logged-in",
                    access_token: "jwt_token_here",
                    username: "mycdars",
                    role: "sudo"
                }
            },

            {
                id: 4,
                name: "Get User Info",
                method: "GET",
                path: "/api/userinfo",
                description: "Fetch logged-in user information from JWT token",
                auth: true,
                body_parameters: [],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {access_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Hello {username}",
                    user: {
                        username: "john",
                        role: "standard"
                    }
                }
            },

            // ============= PASSWORD MANAGEMENT =============
            {
                id: 5,
                name: "Standard User Forgot Password",
                method: "POST",
                path: "/api/std/reset",
                description: "Request password reset for standard user. New password sent to email or admin.",
                auth: false,
                body_parameters: [
                    { name: "username", type: "string", required: true, description: "Username of the account" }
                ],
                query_parameters: [],
                response_example: {
                    status: true,
                    message: "New password sent to your email or admin"
                }
            },

            {
                id: 6,
                name: "Admin Forgot Password",
                method: "POST",
                path: "/api/sudo/reset",
                description: "Request password reset for admin user. New password sent to configured Gmail.",
                auth: false,
                body_parameters: [
                    { name: "username", type: "string", required: true, description: "Admin username" }
                ],
                query_parameters: [],
                response_example: {
                    status: true,
                    message: "New password sent to muha***@gmail.com"
                }
            },

            {
                id: 7,
                name: "Admin Change User Password",
                method: "POST",
                path: "/api/sudo/account/password",
                description: "Admin changes password for any user (standard or admin)",
                auth: true,
                body_parameters: [
                    { name: "target_username", type: "string", required: true, description: "Username of target user" },
                    { name: "new_password", type: "string", required: true, description: "New password (min 4 chars)" },
                    { name: "confirm_password", type: "string", required: true, description: "Confirm new password (must match)" }
                ],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {admin_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Password updated successfully"
                }
            },

            // ============= USER ACCOUNT MANAGEMENT =============
            {
                id: 8,
                name: "Create Standard User (by Admin)",
                method: "POST",
                path: "/api/sudo/csu",
                description: "Admin creates a new standard user directly",
                auth: true,
                body_parameters: [
                    { 
                        name: "user", 
                        type: "object", 
                        required: true, 
                        description: "User object containing: username (string, required), password (string, required), email (string, optional), is_activated (boolean, optional), accessible_collections (array, optional), and any other fields"
                    }
                ],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {admin_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "User created successfully"
                }
            },

            {
                id: 9,
                name: "Create Account Creation Link (by Admin)",
                method: "POST",
                path: "/api/sudo/accl",
                description: "Admin generates a shareable link for users to self-register",
                auth: true,
                body_parameters: [
                    { name: "accessible_collections", type: "array", required: true, description: "Array of collection names user can access" },
                    { name: "fields_to_be_filled", type: "array", required: true, description: "Array of field objects to fill during registration (must include username and password as required)" },
                    { name: "validity_in_hours", type: "number", required: false, description: "How many hours link is valid (default: 24)" }
                ],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {admin_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Account creation link generated successfully",
                    link: "random_hex_string",
                    expires_at: "2025-12-09T12:34:56.789Z"
                }
            },

            {
                id: 10,
                name: "Get Account Creation Form Fields",
                method: "GET",
                path: "/api/standard/accl/:create_account_link",
                description: "Validate link and fetch fields needed for registration",
                auth: false,
                body_parameters: [],
                query_parameters: [],
                path_parameters: [
                    { name: "create_account_link", type: "string", required: true, description: "The registration link from admin" }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Link is valid",
                    fields_to_be_filled: [
                        { field_name: "username", input_type: "text", required: true, unique: true },
                        { field_name: "password", input_type: "password", required: true }
                    ]
                }
            },

            {
                id: 11,
                name: "Register Using Account Link",
                method: "POST",
                path: "/api/standard/:create_account_link",
                description: "User self-registers using the provided link",
                auth: false,
                body_parameters: [
                    { name: "username", type: "string", required: true, description: "Desired username" },
                    { name: "password", type: "string", required: true, description: "Password" },
                    { name: "{other_fields}", type: "any", required: "depends on form", description: "Any other fields specified in the link" }
                ],
                query_parameters: [],
                path_parameters: [
                    { name: "create_account_link", type: "string", required: true, description: "The registration link" }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Hello {username} your account saved, Go and Login"
                }
            },

            {
                id: 12,
                name: "Get Own Account Fields (Standard User)",
                method: "GET",
                path: "/api/standard/account/fields",
                description: "Standard user fetches list of fields in their account that can be modified",
                auth: true,
                body_parameters: [],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Fields to be filled",
                    fields_to_be_filled: ["email", "phone", "full_name"]
                }
            },

            {
                id: 13,
                name: "Update Own Account (Standard User)",
                method: "PUT",
                path: "/api/standard/account",
                description: "Standard user modifies their own profile (except username and accessible_collections)",
                auth: true,
                body_parameters: [
                    { name: "email", type: "string", required: false, description: "Email address" },
                    { name: "phone", type: "string", required: false, description: "Phone number" },
                    { name: "full_name", type: "string", required: false, description: "Full name" },
                    { name: "{any_other_fields}", type: "any", required: false, description: "Any updatable field from account" }
                ],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "your account updated successfully"
                }
            },

            // ============= RECORDBOOK MANAGEMENT =============
            {
                id: 14,
                name: "Create RecordBook (Collection)",
                method: "POST",
                path: "/api/recordbook",
                description: "Create a new recordbook/collection with specified fields",
                auth: true,
                body_parameters: [
                    { 
                        name: "collection_name", 
                        type: "string", 
                        required: true, 
                        description: "Name of the new recordbook (must be unique)" 
                    },
                    { 
                        name: "fields", 
                        type: "array", 
                        required: true, 
                        description: "Array of field objects with properties: field_name, input_type, required, unique, data_if_isselect"
                    }
                ],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "RecordBook {collection_name} created successfully"
                }
            },

            {
                id: 15,
                name: "Get All RecordBooks (User's Accessible)",
                method: "GET",
                path: "/api/recordbook",
                description: "Fetch all recordbooks user has access to with their attributes",
                auth: true,
                body_parameters: [],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    collections: [
                        {
                            _id: "mongodb_id",
                            collection_name: "students",
                            created_by: "admin",
                            type: "dailyrecord",
                            fields: []
                        }
                    ]
                }
            },

            {
                id: 16,
                name: "Get All RecordBooks (Admin Only)",
                method: "GET",
                path: "/api/recordbooks",
                description: "Admin fetches all recordbooks in the system",
                auth: true,
                body_parameters: [],
                query_parameters: [],
                headers: [
                    { name: "Authorization", value: "Bearer {admin_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    collections: ["students", "teachers", "attendance"]
                }
            },

            {
                id: 17,
                name: "Get RecordBook Fields",
                method: "GET",
                path: "/api/recordbook/fields/:collection_name",
                description: "Get the field schema for a specific recordbook",
                auth: true,
                body_parameters: [],
                query_parameters: [],
                path_parameters: [
                    { name: "collection_name", type: "string", required: true, description: "Name of the recordbook" }
                ],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    data: {
                        collection_name: "students",
                        fields: [
                            { field_name: "name", input_type: "text", required: true }
                        ]
                    }
                }
            },

            // ============= RECORD CRUD OPERATIONS =============
            {
                id: 18,
                name: "Fetch Records from RecordBook",
                method: "GET",
                path: "/api/recordbook/:collection_name",
                description: "Fetch paginated records from a recordbook with sorting options",
                auth: true,
                body_parameters: [],
                query_parameters: [
                    { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
                    { name: "limit", type: "number", required: false, description: "Records per page (default: 20)" },
                    { name: "sort_by", type: "string", required: false, description: "Field to sort by (default: createdAt)" },
                    { name: "sort_order", type: "string", required: false, description: "asc or desc (default: asc)" }
                ],
                path_parameters: [
                    { name: "collection_name", type: "string", required: true, description: "Name of the recordbook" }
                ],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    records: [
                        { _id: "id1", name: "John" },
                        { _id: "id2", name: "Jane" }
                    ],
                    pagination: {
                        total: 50,
                        page: 1,
                        limit: 20,
                        totalPages: 3
                    }
                }
            },

            {
                id: 19,
                name: "Insert Record into RecordBook",
                method: "POST",
                path: "/api/recordbook/:collection_name",
                description: "Insert a new record into a recordbook",
                auth: true,
                body_parameters: [
                    { name: "record", type: "object", required: true, description: "Record object matching the collection schema" },
                    { name: "from_app", type: "boolean", required: false, description: "Internal flag (optional)" }
                ],
                query_parameters: [],
                path_parameters: [
                    { name: "collection_name", type: "string", required: true, description: "Name of the recordbook" }
                ],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "data save successfully."
                }
            },

            {
                id: 20,
                name: "Update Record in RecordBook",
                method: "PUT",
                path: "/api/recordbook/:collection_name",
                description: "Update an existing record by ID",
                auth: true,
                body_parameters: [
                    { name: "record_id", type: "string", required: true, description: "MongoDB ObjectId of the record" },
                    { name: "updated_fields", type: "object", required: true, description: "Object with fields to update" }
                ],
                query_parameters: [],
                path_parameters: [
                    { name: "collection_name", type: "string", required: true, description: "Name of the recordbook" }
                ],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Record updated successfully"
                }
            },

            {
                id: 21,
                name: "Delete Record from RecordBook",
                method: "DELETE",
                path: "/api/recordbook/:collection_name/:record_id",
                description: "Delete a record by ID",
                auth: true,
                body_parameters: [],
                query_parameters: [],
                path_parameters: [
                    { name: "collection_name", type: "string", required: true, description: "Name of the recordbook" },
                    { name: "record_id", type: "string", required: true, description: "MongoDB ObjectId of the record" }
                ],
                headers: [
                    { name: "Authorization", value: "Bearer {user_token}", required: true }
                ],
                response_example: {
                    status: true,
                    type: "success",
                    message: "Record deleted successfully"
                }
            }
        ];

        return res.json({
            status: true,
            type: "success",
            message: "Complete API endpoints documentation",
            total_endpoints: endpoints.length,
            base_url: "http://localhost:2025",
            auth_format: "Authorization: Bearer {access_token}",
            endpoints: endpoints
        });

    } catch (error) {
        console.error('Error fetching endpoints documentation:', error);
        return res.json({
            status: false,
            type: "error",
            message: "Failed to fetch documentation"
        });
    }
}
