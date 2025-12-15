const jwt = require("../utilities/jwt.js");
const constants = require("../constants.js");

module.exports = async function user_info(req, res) {
    try {
        
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ 
                status: false, 
                type: 'warning',
                message: "Access token is required" 
            });
        }

        const token = authHeader.split(' ')[1];
        
        
        if (!token) {
            return res.json({ 
                status: false, 
                type: 'error',
                message: "Invalid token format" 
            });
        }

       
        const tokenVerification = await jwt.verify(token);
        
        if (!tokenVerification.status) {
            return res.json({ 
                status: false,
                type: 'warning',
                message: "Invalid or expired token" 
            });
        }

        const decoded = tokenVerification?.data;
        
       
        const collectionName = decoded.role === 'sudo' 
            ? constants.collections.administrator 
            : constants.collections.standard;

     
        const user = await InstalledDB
            .collection(collectionName)
            .findOne({ 
                username: decoded.username 
            }, {
                projection: {
                    password: 0,
                    _id: 0,
                }
            });

        if (!user) {
            return res.json({ 
                status: false,
                type: 'warning',
                message: "User with provided creadentials not found" 
            });
        }

      
        const userData = {
            username: user.username,
            role: decoded.role,
        };

        return res.json({
            status: true,
            type: 'success',
            message: `Hello ${decoded.username}`,
            user: userData
        });

    } catch (e) {
        console.error("Error while fetching user info:", e);
        return res.json({
            status: false,
            type: 'error',
            message: "Something went wrong while fetching user information"
        });
    }
}