const jwtUtil = require('../utilities/jwt.js');

module.exports = async function validate_bearer_token(req, res) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ status: false, type: 'warning', message: 'Authorization header missing or invalid', goto_login: true, show_alert: false });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.json({ status: false, type: 'warning', message: 'Bearer token not provided', goto_login: true, show_alert: false });
        }

        const verification = await jwtUtil.verify(token);
        if (!verification.status) {
            return res.json({ status: false, type: 'warning', message: 'Your Login session was exipred', goto_login: true, show_alert: true });
        }

        
        return res.json({ status: true, type: 'success', message: 'Token is valid', data: verification.data, goto_login: false, show_alert: false });

    } catch (error) {
        console.error('Error validating token:', error);
        return res.json({ status: false, type: 'error', message: `Error validating token: ${error.message}`, goto_login: true, show_alert: true });
    }
}
