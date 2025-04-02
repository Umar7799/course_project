const jwt = require('jsonwebtoken');

// Middleware to check authentication and role
const authMiddleware = (requiredRole) => {
    return (req, res, next) => {
        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Ensure the token starts with "Bearer " and remove it
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trim();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Attach user data to the request object

            // If a required role is specified, check if the user has the role
            if (requiredRole && req.user.role !== requiredRole) {
                return res.status(403).json({ error: 'Forbidden. You do not have the required role.' });
            }

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Session expired. Please log in again.' });
            }
            return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
        }
    };
};

module.exports = authMiddleware;
