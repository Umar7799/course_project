const jwt = require('jsonwebtoken');

// Middleware for authenticating users and checking roles (optional)
// Updated authMiddleware to support multiple roles
const authMiddleware = (...requiredRoles) => (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let token = req.headers.authorization;
    if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check role access
        if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient privileges.' });
        }

        next();
    } catch (error) {
        console.error("JWT Error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
    }
};


module.exports = authMiddleware;
