const jwt = require('jsonwebtoken');

// Middleware for authenticating users and checking roles (optional)
const authMiddleware = (requiredRole) => (req, res, next) => {
    // Check if authorization header exists
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let token = req.headers.authorization;
    if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();  // Remove 'Bearer ' part
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach decoded info to request

        // ✅ Allow either USER or ADMIN if role is USER
        if (requiredRole === 'USER' && !['USER', 'ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. You do not have the required role.' });
        }

        // 🔒 Strict check for ADMIN-only routes
        if (requiredRole === 'ADMIN' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden. Admins only.' });
        }

        console.log("User authorized:", req.user); // Debug
        next(); // Proceed
    } catch (error) {
        console.error("JWT Error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
    }
};

module.exports = authMiddleware;
