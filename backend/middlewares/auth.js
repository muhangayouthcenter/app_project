
module.exports = function auth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader) return next();
        console.log(authHeader)
        const parts = String(authHeader).split(' ');
        if (parts.length < 2) return next();
        const scheme = parts[0];
        const token = parts.slice(1).join(' ');
        if (!/^Bearer$/i.test(scheme) || !token) return next();

        const [name, role] = token.split('|');
        if (name) {
            req.user = { name: name, role: role || 'standard' };
        }
        return next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return next();
    }
};

