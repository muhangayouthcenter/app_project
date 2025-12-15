# Account Management - Complete Documentation

Complete list of all account management related controllers, endpoints, and methods.

---

## Table of Contents
1. [Standard User Login](#1-standard-user-login)
2. [Admin/Sudo Login](#2-adminsudo-login)
3. [Standard User Forgot Password](#3-standard-user-forgot-password)
4. [Admin Forgot Password](#4-admin-forgot-password)
5. [Get Account Form Fields (Validation Link)](#5-get-account-form-fields-validation-link)
6. [Register Using Account Link](#6-register-using-account-link)
7. [Get Own Account Fields (Standard User)](#7-get-own-account-fields-standard-user)

---

## 1. Standard User Login

**Endpoint:** `POST /api/standard/login`

**File:** `controllers/stdul.js`

**Description:** Standard user login. Validates credentials and returns JWT token.

**Authentication:** Not required

### Request Body
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "type": "success",
  "message": "Hello {username} You've Logged-in",
  "access_token": "jwt_token_here",
  "username": "john",
  "role": "standard"
}
```

**Errors:**
```json
// Missing fields
{
  "status": false,
  "type": "warning",
  "message": "All fields are required!"
}

// Account not found
{
  "status": false,
  "type": "warning",
  "message": "Invalid credentials or account wos deleted!"
}

// Account not activated
{
  "status": false,
  "type": "warning",
  "message": "Account not activated, contact Adminstrator to activate your account!"
}

// Wrong password
{
  "status": false,
  "type": "warning",
  "message": "Invalid credentials."
}
```

### Controller Code
```javascript
const PasswordMNGT = require("../utilities/password_mngt.js");
const constants = require("../constants.js");
const jwt = require("../utilities/jwt.js");

module.exports = async function standard_user_login(req, res) {
    try {

        const username = req.body.username;
        const password = req.body.password;
        if(!username || !password) {
            return res.json({status: false, type: 'warning', message: "All fields are required!"});
        }

        const user = await InstalledDB
        .collection(constants.collections.standard)
        .findOne({ username: username });

        if(!user) {
            return res.json({status: false, type: 'warning', message: "Invalid credentials or account wos deleted!"});
        }
        

        if(!user.is_activated) {
            return res.json({status: false, type: 'warning', message: "Account not activated, contact Adminstrator to activate your account!"});
        }

        const passMatch = await new PasswordMNGT().decrypt(password, user.password);
        if(!passMatch.status || !passMatch.match) {
             return res.json({status: false, type: 'warning', message: "Invalid credentials."});
        }

        const jwtToken = await jwt.sign({
            username: user.username,
            role: 'standard'
        });

        return res.json({
            status: true,
            type: 'success',
            message: `Hello ${user.username} You've Logged-in`,
            access_token: jwtToken.data,
            username: user.username,
            role: 'standard'
        })

    } catch(e) {
        console.error("Error while standard user login", e);
        return res.json({status: false, type: 'error', message: `Something got wrong try later \n\nERROR MESSAGE\n\n ${e.message}`});
    }
}
```

---

## 2. Admin/Sudo Login

**Endpoint:** `POST /api/sudo/login`

**File:** `controllers/sl.js`

**Description:** Admin/Sudo user login. Validates admin credentials and returns JWT token.

**Authentication:** Not required

### Request Body
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "type": "success",
  "message": "Hello {username} You've Logged-in",
  "username": "mycdars",
  "access_token": "jwt_token_here",
  "role": "sudo"
}
```

**Errors:**
```json
// Missing fields
{
  "status": false,
  "type": "warning",
  "message": "All fields are required!"
}

// Account not found
{
  "status": false,
  "type": "warning",
  "message": "Invalid credentials!"
}

// Wrong password
{
  "status": false,
  "type": "warning",
  "message": "Invalid credentials."
}
```

### Controller Code
```javascript
const PasswordMNGT = require("../utilities/password_mngt.js");
const constants = require("../constants.js");
const jwt = require("../utilities/jwt.js");

module.exports = async function sudo_login(req, res) {
      try {

        const username = req.body.username;
        const password = req.body.password;
        if(!username || !password) {
            return res.json({status: false, type: 'warning', message: "All fields are required!"});
        }

        const user = await InstalledDB
        .collection(constants.collections.administrator)
        .findOne({ username: username });

        
        if(!user) {
            return res.json({status: false, type: 'warning', message: "Invalid credentials!"});
        }

        const passMatch = await new PasswordMNGT().decrypt(password, user.password);
      
        if(!passMatch.status || !passMatch.match) {
             return res.json({status: false, type: 'warning', message: "Invalid credentials."});
        }

        const jwtToken = await jwt.sign({
            username: user.username,
            role: 'sudo'
        });

        return res.json({
            status: true,
            type: 'success',
            message: `Hello ${user.username} You've Logged-in`,
            username: user.username,
            access_token: jwtToken.data,
            role: 'sudo'
        })

    } catch(e) {
        console.error("Error while sudo login", e);
        return res.json({status: false, type: 'error', message: `Something got wrong try later \n\nERROR MESSAGE\n\n${e.message}`});
    }
}
```

---

## 3. Standard User Forgot Password

**Endpoint:** `POST /api/std/reset`

**File:** `controllers/stdfp.js`

**Description:** Request password reset for standard user. Generates random password and sends email or admin notification.

**Authentication:** Not required

### Request Body
```json
{
  "username": "string (required)"
}
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "message": "New password sent to your email test@example.com, go and check it."
}

// OR (if no email on file)
{
  "status": true,
  "message": "It looks like you haven't any email, we've sent your password to admin contact administrator for it."
}
```

**Errors:**
```json
// Missing username
{
  "status": false,
  "message": "username is required"
}

// User not found
{
  "status": false,
  "message": "Invalid username!"
}

// Email send failed
{
  "status": false,
  "message": "Something got wrong retry later!"
}
```

### Controller Code
```javascript
const constants = require("../constants.js");
const send_email = require("../utilities/send_email.js");
const schema = require("../utilities/reset_password_email_schema.js");
const crypto = require("crypto");
const PasswordMNGT = require("../utilities/password_mngt.js");

module.exports = async function standard_forgot_password(req, res) {
    try {

        const username = req.body.username;

        if (!username) {
            return res.json({ status: false, message: "username is required" });
        }

        const user = await InstalledDB.collection(constants.collections.standard)
            .findOne({ username: username });

        if (!user) {
            return res.json({ status: false, message: "Invalid username!" });
        }
        

        const email = user.email;
        const message = email ? `New password sent to your email ${email}, go and check it.`
            :
            `It looks like you haven't any email, we've sent your password to admin contact administrator for it.`;

        const newPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await new PasswordMNGT().encrypt(newPassword);
        const Schema = await schema(
            constants.logo_pin,
            email ? `Password Changed`  : `${username} requested for password reset`,
             email ? `Hello 👋🏼 ${username} your new password: <b><i>${newPassword}</i></b>` : `Hello Admin new password for ${username} is <b><i>${newPassword}</i></b> provide it to her/him.`
        );

        const send = await send_email(
            email ? email : constants.Google.username,
            '🔑Password Reset',
            Schema
        );

        if (!send.status) {
            return res.json({ status: false, message: "Something got wrong retry later!" });
        }
        const updateResult = await InstalledDB
            .collection(constants.collections.standard)
            .updateOne({ username: username }, {
                $set: {
                    password: hashedPassword.hash
                }
            });

        return res.json({ status: true, message: message })

    } catch (e) {
        console.error("Error while executing standard forgot password", e);
        return res.json({
            status: false,
            message: "Something got wrong try again later!"
        })
    }
}
```

---

## 4. Admin Forgot Password

**Endpoint:** `POST /api/sudo/reset`

**File:** `controllers/sfp.js`

**Description:** Request password reset for admin user. Generates random password and sends to configured Gmail.

**Authentication:** Not required

### Request Body
```json
{
  "username": "string (required)"
}
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "message": "New password sent to muha***@gmail.com"
}
```

**Errors:**
```json
// Missing username
{
  "status": false,
  "message": "username is required"
}

// Admin not found
{
  "status": false,
  "message": "Invalid username!"
}

// Email send failed
{
  "status": false,
  "message": "Something got wrong retry later!"
}
```

### Controller Code
```javascript
const constants = require("../constants.js");
const send_email = require("../utilities/send_email.js");
const schema = require("../utilities/reset_password_email_schema.js");
const crypto = require("crypto");
const PasswordMNGT = require("../utilities/password_mngt.js");

module.exports = async function sudo_forgot_password(req, res) {
    try {

        const username = req.body.username;

        if (!username) {
            return res.json({ status: false, message: "username is required" });
        }

        const user = await InstalledDB.collection(constants.collections.administrator)
            .findOne({ username: username });

        if (!user) {
            return res.json({ status: false, message: "Invalid username!" });
        }

        const newPassword = crypto.randomBytes(6).toString('hex');
        const hashedPassword = await new PasswordMNGT().encrypt(newPassword);
        const Schema = await schema(
            constants.logo_pin,
            "Password Changed",
            `Hello 👋🏼 ${username} your new password: <b><i>${newPassword}</i></b>`
        );

        const send = await send_email(
            constants.Google.username,
            '🔑Password Reset',
            Schema
        );
        

        if (!send.status) {
            return res.json({ status: false, message: "Something got wrong retry later!" });
        }
        const updateResult = await InstalledDB
            .collection(constants.collections.administrator)
            .updateOne({ username: username }, {
                $set: {
                    password: hashedPassword.hash
                }
            });

        return res.json({ status: true, message: `New password sent to ${constants.Google.username.slice(0, 4)}***@gmail.com` })

    } catch (e) {
        console.error("Error while executing sudo forgot password", e);
        return res.json({
            status: false,
            message: "Something got wrong try again later!"
        })
    }
}
```

---

## 5. Get Account Form Fields (Validation Link)

**Endpoint:** `GET /api/standard/accl/:create_account_link`

**File:** `controllers/sacdwftf.js`

**Description:** Validate registration link and fetch form fields needed for account creation.

**Authentication:** Not required

### Path Parameters
```
:create_account_link (string, required) - The registration link provided by admin
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "type": "success",
  "message": "Link is valid",
  "fields_to_be_filled": [
    {
      "field_name": "username",
      "input_type": "text",
      "required": true,
      "unique": true,
      "data_if_isselect": []
    },
    {
      "field_name": "password",
      "input_type": "password",
      "required": true,
      "unique": false,
      "data_if_isselect": []
    },
    {
      "field_name": "email",
      "input_type": "email",
      "required": false,
      "unique": false,
      "data_if_isselect": []
    }
  ]
}
```

**Errors:**
```json
// Invalid or missing link
{
  "status": false,
  "type": "warning",
  "message": "Invalid Link!"
}

// Link not found or expired
{
  "status": false,
  "type": "warning",
  "message": "Invalid Link or has expired contact adminstrator for new Link"
}

// Link already used
{
  "status": false,
  "type": "warning",
  "message": "This Link has already been used to create an account"
}

// Link expired
{
  "status": false,
  "type": "warning",
  "message": "This Link has expired contact adminstrator for new Link"
}
```

### Controller Code
```javascript
const constants = require('../constants');

// Method to send account creation data with fields to fill if link is valid.
module.exports = async function send_account_creation_data_with_fields_to_fill(req, res) {
    try {
        const { create_account_link } = req.params;
        if (!create_account_link || typeof create_account_link !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Invalid Link!" });
        }
        const linkDoc = await InstalledDB
            .collection(constants.account_creation_collection_name)
            .findOne({ link: create_account_link });
        if (!linkDoc) {
            return res.json({ status: false, type: 'warning', message: "Invalid Link or has expired contact adminstrator for new Link" });
        }
        if (linkDoc.used) {
            return res.json({ status: false, type: 'warning', message: "This Link has already been used to create an account" });
        }
        const currentTime = new Date();
        if (linkDoc.expires_at < currentTime) {
            return res.json({ status: false, type: 'warning', message: "This Link has expired contact adminstrator for new Link" });
        }
        return res.json({ status: true, type: 'success', message: "Link is valid", fields_to_be_filled: linkDoc.fields_to_be_filled });
    } catch (error) {
        console.error('Error validating account creation link:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n ${error.message}` });
    }
}
```

---

## 6. Register Using Account Link

**Endpoint:** `POST /api/standard/:create_account_link`

**File:** `controllers/scoaul.js`

**Description:** User self-registers using the provided account creation link.

**Authentication:** Not required

### Path Parameters
```
:create_account_link (string, required) - The registration link provided by admin
```

### Request Body
```json
{
  "username": "string (required)",
  "password": "string (required)",
  "email": "string (optional, depends on form)",
  "{other_fields}": "any (depends on form schema)"
}
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "type": "success",
  "message": "Hello john your account saved, Go and Login"
}
```

**Errors:**
```json
// Invalid data
{
  "status": false,
  "type": "warning",
  "message": "Invalid data Recheck and try again later."
}

// Link expired
{
  "status": false,
  "type": "warning",
  "message": "This Link has expired contact adminstrator for new Link"
}

// Link not found
{
  "status": false,
  "type": "warning",
  "message": "Invalid Link or has expired contact adminstrator for new Link"
}

// Link already used
{
  "status": false,
  "type": "warning",
  "message": "This Link has already been used to create an account"
}

// Missing required field
{
  "status": false,
  "type": "warning",
  "message": "Username is required!"
}

// Username exists
{
  "status": false,
  "type": "warning",
  "message": "Username already exists. Please choose a different username."
}

// Invalid field type
{
  "status": false,
  "type": "warning",
  "message": "Field {field_name} must be a {type}"
}
```

### Controller Code
```javascript
const constants = require('../constants');
const PasswordMNGT = require("../utilities/password_mngt.js");

// Method to create own account using the link.
module.exports = async function standard_create_own_account_using_link(req, res) {
    try {
        const { create_account_link } = req.params;
        const accountData = req.body;
        if (!create_account_link || typeof create_account_link !== 'string' || !accountData || typeof accountData !== 'object' || Array.isArray(accountData)) {
            return res.json({ status: false, type: 'warning', message: "Invalid data Recheck and try again later." });
        }
        const linkDoc = await InstalledDB
            .collection(constants.account_creation_collection_name)
            .findOne({ link: create_account_link });

        const currentTime = new Date();
        if (linkDoc.expires_at < currentTime) {
            return res.json({ status: false, type: 'warning', message: "This Link has expired contact adminstrator for new Link" });
        }

        if (!linkDoc) {
            return res.json({ status: false, type: 'warning', message: "Invalid Link or has expired contact adminstrator for new Link" });
        }
        if (linkDoc.used) {
            return res.json({ status: false, type: 'warning', message: "This Link has already been used to create an account" });
        }

        const username = accountData.username;
        if (!username || typeof username !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Username is required!" });
        }

        const password = accountData.password;
        if (!password || typeof password !== 'string') {
            return res.json({ status: false, type: 'warning', message: "Password is required1" });
        }

        const isnameTaken = await InstalledDB
            .collection(constants.collections.standard)
            .findOne({ username: username });
        if (isnameTaken) {
            return res.json({ status: false, type: 'warning', message: "Username already exists. Please choose a different username." });
        }

        const fieldsSchema = linkDoc.fields_schema || [];
        for (let field of fieldsSchema) {
            if (field.required && !(field.field_name in accountData)) {
                return res.json({ status: false, type: 'warning', message: `Field ${field.field_name} is required` });
            }
            if (field.field_name in accountData) {
                const value = accountData[field.field_name];
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

        const PM = new PasswordMNGT();
        const hashedPassword = await PM.encrypt(password);

        if (!hashedPassword.status) {
            return res.json({ status: false, type: 'error', message: "Something got wrong try later!" });
        }

        accountData.password = hashedPassword.hash;
        accountData.is_activated = true;
        const insertResult = await InstalledDB
            .collection(constants.collections.standard)
            .insertOne({
                ...accountData,
                accessible_collections: linkDoc.accessible_collections || []
            });
        if (insertResult.acknowledged) {
            await InstalledDB
                .collection(constants.account_creation_collection_name)
                .updateOne({ link: create_account_link }, { $set: { used: true } });
            return res.json({ status: true, type: 'success', message: `Hello ${username || ''} your account saved, Go and Login` });
        } else {
            console.error('Failed to create account:', insertResult);
            return res.json({ status: false, type: 'warning', message: "Failed to create account, try again later" });
        }
    } catch (error) {
        console.error('Error creating account using link:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n${error.message}` });
    }
}
```

---

## 7. Get Own Account Fields (Standard User)

**Endpoint:** `GET /api/standard/account/fields`

**File:** `controllers/ssmoaf.js`

**Description:** Standard user fetches list of fields in their account that can be modified.

**Authentication:** Required (Bearer token)

### Headers
```
Authorization: Bearer {access_token}
```

### Response Examples

**Success (200):**
```json
{
  "status": true,
  "type": "success",
  "message": "Fields to be filled",
  "fields_to_be_filled": [
    "password",
    "email",
    "phone",
    "full_name",
    "is_activated"
  ]
}
```

**Errors:**
```json
// Account not found
{
  "status": false,
  "type": "warning",
  "message": "Account not found!"
}

// Server error
{
  "status": false,
  "type": "error",
  "message": "Something Got Wrong try again later \n\nERROR MESSAGE\n\n {error_details}"
}
```

### Controller Code
```javascript
const constants = require('../constants');

// first send a request to get the fields to be filled for the user

module.exports = async function standard_send_modify_own_account_fields(req, res) {
    try {
        const this_user = req.user?.name || 'testing';
        const userDoc = await InstalledDB
            .collection(constants.collections.standard)
            .findOne({ username: this_user });
        if (!userDoc) {
            return res.json({ status: false, type: 'warning', message: "Account not found!" });
        }
        const fields_to_be_filled = Object.keys(userDoc).filter(key => key !== 'username' && key !== 'accessible_collections' && key !== '_id' && key !== '__v');
        return res.json({ status: true, type: 'success', message: "Fields to be filled", fields_to_be_filled: fields_to_be_filled });
    } catch (error) {
        console.error('Error fetching fields to be filled for own account modification:', error);
        return res.json({ status: false, type: 'error', message: `Something Got Wrong try again later \n\nERROR MESSAGE\n\n ${error.message}` });
    }
}
```

---

## Summary Table

| # | Endpoint | Method | Auth | Purpose |
|---|----------|--------|------|---------|
| 1 | `/api/standard/login` | POST | ❌ | Standard user login |
| 2 | `/api/sudo/login` | POST | ❌ | Admin login |
| 3 | `/api/std/reset` | POST | ❌ | Standard user forgot password |
| 4 | `/api/sudo/reset` | POST | ❌ | Admin forgot password |
| 5 | `/api/standard/accl/:link` | GET | ❌ | Get registration form fields |
| 6 | `/api/standard/:link` | POST | ❌ | Register with link |
| 7 | `/api/standard/account/fields` | GET | ✅ | Get account fields to edit |

---

## Key Features

- ✅ Secure password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Email notifications for password resets
- ✅ Link-based account registration with expiration
- ✅ Field validation for all inputs
- ✅ Account activation status checking
- ✅ Comprehensive error handling
